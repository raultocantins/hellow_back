import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

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
    let message;
    const chatId = `${messageData.number}@s.whatsapp.net`;
    const body = `${messageData.body}`;

    if (messageData.mediaPath) {
      // message = await sendFacebookMessage(chatId);
    } else {
      // message = await sendFacebookMessage(chatId, { text: body });
    }

    return message;
  } catch (err: any) {
    logger.error(err);
    throw new Error(err);
  }
};
