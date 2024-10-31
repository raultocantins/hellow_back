import Whatsapp from "../models/Whatsapp";
import fs from "fs";
import sendWhatsappMessage from "../services/MetaServices/sendWhatsappMessage";
import { sendWhatsappMessageMedia } from "../services/MetaServices/sendWhatsappMessageMedia";

export type MessageData = {
  number: number | string;
  body: string;
  mediaPath?: string;
};

export const SendMessage = async (
  whatsapp: Whatsapp,
  messageData: MessageData
): Promise<any> => {
  try {
    const chatId = `${messageData.number}@s.whatsapp.net`;

    let message;

    const body = `${messageData.body}`;

    if (messageData.mediaPath) {

      // message = await sendFacebookMessage(chatId);

    } else {
      // message = await sendFacebookMessage(chatId, { text: body });
    }

    return message;
  } catch (err: any) {
    throw new Error(err);
  }
};
