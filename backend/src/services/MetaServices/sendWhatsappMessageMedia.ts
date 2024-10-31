import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import { sendMediaFromUrl } from "./graphAPI";

interface Media {
  id?: string;
  filename?: string;
  type?: string;
  filetype?: string;
}
interface Request {
  ticket: Ticket;
  mediaData?: Media;
  body?: string;
  url?: string;
}
interface MessageInterface {
  id: string;
  messaging_product: string;
  mediaType: string;
}

export const sendWhatsappMessageMedia = async ({
  mediaData,
  ticket,
  body
}: Request): Promise<MessageInterface> => {
  try {
    const sendMessage = await sendMediaFromUrl(
      ticket.contact.number,
      mediaData.id,
      mediaData.type,
      ticket.whatsapp.facebookUserToken,
      ticket?.whatsapp.phone,
      body
    );

    await ticket.update({ lastMessage: mediaData.filename });

    return {
      id: sendMessage["messages"][0].id,
      messaging_product: sendMessage["messaging_product"],
      mediaType:sendMessage["mediaType"]
    };
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};
