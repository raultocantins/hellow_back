import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { sendText } from "./graphAPI";
import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

interface MessageInterface {
  id: string;
  messaging_product: string;
}

const SendWhatsAppMessage = async ({
  body,
  ticket
}: Request): Promise<MessageInterface> => {
  const { number } = ticket.contact;
  try {
    var r = await sendText(
      number,
      formatBody(body, ticket.contact),
      ticket.whatsapp.facebookUserToken,
      ticket?.whatsapp.phone
    );
    await ticket.update({ lastMessage: body });
    return {
      id: r["messages"][0].id,
      messaging_product: r["messaging_product"]
    };
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export default SendWhatsAppMessage;
