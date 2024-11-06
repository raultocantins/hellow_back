import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { sendText } from "../../libs/graphAPI";
import formatBody from "../../helpers/Mustache";
import { logger } from "../../utils/logger";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

interface MessageInterface {
  id: string;
  messaging_product: string;
  context?: any;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<MessageInterface> => {
  const { number } = ticket.contact;
  try {
    var sendMessage = await sendText(
      number,
      formatBody(body, ticket.contact),
      ticket.whatsapp.facebookUserToken,
      ticket?.whatsapp.phone,
      quotedMsg?.id
    );
    await ticket.update({ lastMessage: body });
    return {
      id: sendMessage["messages"][0].id,
      messaging_product: sendMessage["messaging_product"],
      context: {
        id: quotedMsg?.id
      }
    };
  } catch (err) {
    logger.error("SERVICE -> erro ao enviar mensagem de texto",err)
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export default SendWhatsAppMessage;
