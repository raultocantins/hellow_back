import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
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
  quotedMsg?: Message;
}
interface MessageInterface {
  id: string;
  messaging_product: string;
  mediaType: string;
  context?: any;
}

export const sendWhatsappMessageMedia = async ({
  mediaData,
  ticket,
  body,
  quotedMsg
}: Request): Promise<MessageInterface> => {
  try {
    const sendMessage = await sendMediaFromUrl(
      ticket.contact.number,
      mediaData.id,
      mediaData.type,
      ticket.whatsapp.facebookUserToken,
      ticket?.whatsapp.phone,
      body,
      quotedMsg?.id
    );

    await ticket.update({ lastMessage: mediaData.filename });

    return {
      id: sendMessage["messages"][0].id,
      messaging_product: sendMessage["messaging_product"],
      mediaType: sendMessage["mediaType"],
      context: {
        id: quotedMsg?.id
      }
    };
  } catch (err) {
    logger.error(err)
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};
