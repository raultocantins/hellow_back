import { Request, Response } from "express";
import AppError from "../errors/AppError";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";

import { sendWhatsappMessageMedia } from "../services/MetaServices/sendWhatsappMessageMedia";
import sendFaceMessage from "../services/MetaServices/sendWhatsappMessage";
import { logger } from "../utils/logger";
import {
  verifyMessage,
  verifyMessageMedia
} from "../services/MetaServices/graphMessageListener";
import { uploadToWhatsApp } from "../services/MetaServices/graphAPI";

type IndexQuery = {
  pageNumber: string;
  markAsRead: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber, markAsRead } = req.query as IndexQuery;
  const { companyId, profile } = req.user;
  const queues: number[] = [];

  if (profile !== "admin") {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Queue, as: "queues" }]
    });
    user.queues.forEach(queue => {
      queues.push(queue.id);
    });
  }

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId,
    queues
  });

  if (ticket.channel === "whatsapp" && markAsRead === "true") {
    SetTicketMessagesAsRead(ticket);
  }

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);
  const { channel } = ticket;

  if (medias) {
    if (["facebook", "instagram"].includes(channel)) {
      await Promise.all(
        medias.map(async media => {
          const mediaData = await uploadToWhatsApp(
            media.buffer,
            media.originalname,
            media.mimetype,
            ticket
          );
          var msg = await sendWhatsappMessageMedia({ mediaData, ticket, body });
          await verifyMessageMedia(
            msg,
            body,
            ticket,
            ticket.contact,
            companyId,
            channel,
            true,
            mediaData.mediaUrl
          );
        })
      );
    }
  } else {
    if (["facebook", "instagram"].includes(channel)) {
      console.log(
        `Checking if ${ticket.contact.number} is a valid ${channel} contact`
      );
      var msg = await sendFaceMessage({ body, ticket, quotedMsg });
      verifyMessage(
        msg,
        body,
        ticket,
        ticket.contact,
        companyId,
        channel,
        true
      );
    }
  }

  return res.send();
};

export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;
  const { body }: MessageData = req.body;

  const { ticketId, message } = await EditWhatsAppMessage({
    messageId,
    companyId,
    body
  });

  const io = getIO();
  io.to(ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  if (messageData.number === undefined) {
    throw new AppError("ERR_SYNTAX", 400);
  }
  const whatsapp = await Whatsapp.findByPk(whatsappId);

  if (!whatsapp) {
    throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
  }

  try {
    const numberToTest = messageData.number;
    const { body } = messageData;

    const { companyId } = whatsapp;

    const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
    const number = CheckValidNumber.jid.replace(/\D/g, "");

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await req.app.get("queues").messageQueue.add(
            "SendMessage",
            {
              whatsappId,
              data: {
                number,
                body: media.originalname,
                mediaPath: media.path
              }
            },
            { removeOnComplete: true, attempts: 3 }
          );
        })
      );
    } else {
      req.app.get("queues").messageQueue.add(
        "SendMessage",
        {
          whatsappId,
          data: {
            number,
            body
          }
        },

        { removeOnComplete: false, attempts: 3 }
      );
    }

    return res.send({ mensagem: "Message added to queue" });
  } catch (err) {
    const error = { errType: typeof err, serialized: JSON.stringify(err), err };
    if (err?.message) {
      console.error(error, `MessageController.send: ${err.message}`);
    } else {
      logger.error(
        error,
        "MessageController.send: Failed to put message on queue"
      );
    }
    throw new AppError("ERR_INTERNAL_ERROR", 500);
  }
};
