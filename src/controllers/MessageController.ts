import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Queue from "../models/Queue";
import User from "../models/User";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/MetaServices/DeleteWhatsAppMessage";
import EditWhatsAppMessage from "../services/MetaServices/EditWhatsAppMessage";

import { sendWhatsappMessageMedia } from "../services/MetaServices/sendWhatsappMessageMedia";
import SendWhatsAppMessage from "../services/MetaServices/sendWhatsappMessage";
import { logger } from "../utils/logger";
import {
  verifyMessage,
  verifyMessageMedia
} from "../services/MetaServices/graphMessageListener";
import { uploadToWhatsApp } from "../libs/graphAPI";

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
  logger.info("CONTROLLER -> obtendo mensagens", {
    payload: {
      params: req.params,
      query: req.query,
      user: req.user
    }
  });
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

  if (ticket.channel === "facebook" && markAsRead === "true") {
    SetTicketMessagesAsRead(ticket);
  }

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  logger.info("CONTROLLER -> enviando mensagem", {
    payload: {
      params: req.params,
      body: req.body,
      user: req.user
    }
  });
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

          const msg = await sendWhatsappMessageMedia({
            mediaData,
            ticket,
            body,
            quotedMsg
          });

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
      var msg = await SendWhatsAppMessage({ body, ticket, quotedMsg });
      await verifyMessage(
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
  logger.info("CONTROLLER -> editando mensagem", {
    payload: {
      params: req.params,
      body: req.body,
      user: req.user
    }
  });
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
  logger.info("CONTROLLER -> removendo mensagem", {
    payload: {
      params: req.params,
      user: req.user
    }
  });
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
