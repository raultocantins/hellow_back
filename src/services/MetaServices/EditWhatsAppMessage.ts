import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import OldMessage from "../../models/OldMessage";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";
import { sendText } from "../../libs/graphAPI";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

interface Request {
  messageId: string;
  companyId: number;
  body: string;
}

const EditWhatsAppMessage = async ({
  messageId,
  companyId,
  body
}: Request): Promise<{ ticketId: number; message: Message }> => {
  const message = await Message.findOne({
    where: {
      id: messageId,
      companyId
    },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["whatsapp", "user"]
      },
      {
        model: Contact,
        as: "contact",
        attributes: ["number"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;
  const formattedBody = formatBody(body, ticket.contact);
  const userName = ticket.user.name;

  try {
    await sendText(
      message.contact.number,
      `⚠️ *MENSAGEM EDITADA:* \n${body.replace(`*${userName}:*`, "").trim()}`,
      ticket.whatsapp.facebookUserToken,
      ticket.whatsapp.phone,
      messageId
    );
    const oldMessage = {
      messageId,
      body: message.body,
      ticketId: message.ticketId
    };

    await OldMessage.upsert(oldMessage);

    await message.update({ body: formattedBody, isEdited: true });

    const savedMessage = await Message.findOne({
      where: {
        id: messageId,
        companyId
      },
      include: [
        {
          model: Ticket,
          as: "ticket",
          include: ["contact"]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
          where: {
            companyId
          },
          required: false
        },
        {
          model: OldMessage,
          as: "oldMessages",
          where: {
            ticketId: message.ticketId
          },
          required: false
        }
      ]
    });

    return { ticketId: savedMessage.ticketId, message: savedMessage };
  } catch (err) {
    logger.error(err)
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }
};

export default EditWhatsAppMessage;
