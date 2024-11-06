import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import { sendText } from "../../libs/graphAPI";

const DeleteWhatsAppMessage = async (messageId: string): Promise<Message> => {
  const message = await Message.findByPk(messageId, {
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
  const userName = ticket.user.name;
  try {
    await sendText(
      message.contact.number,
      `🔺 *MENSAGEM REMOVIDA:* \n~${message.body
        .replace(`*${userName}:*`, "")
        .trim()}~`,
      ticket.whatsapp.facebookUserToken,
      ticket.whatsapp.phone,
      message.id
    );
  } catch (err) {
    logger.error(err)
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }
  await message.update({ isDeleted: true });

  return message;
};

export default DeleteWhatsAppMessage;
