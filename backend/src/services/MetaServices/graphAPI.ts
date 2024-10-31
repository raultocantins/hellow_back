import axios from "axios";
import FormData from "form-data";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket";

const formData: FormData = new FormData();

const apiBase = (token: string) =>
  axios.create({
    baseURL: "https://graph.facebook.com/v21.0/",
    params: {
      access_token: token
    }
  });

export const getAccessToken = async (): Promise<string> => {
  const { data } = await axios.get(
    "https://graph.facebook.com/v21.0/oauth/access_token",
    {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        grant_type: "client_credentials"
      }
    }
  );

  return data.access_token;
};

export const markSeen = async (id: string, token: string): Promise<void> => {
  await apiBase(token).post(`${id}/messages`, {
    recipient: {
      id
    },
    sender_action: "mark_seen"
  });
};

export const sendText = async (
  id: string | number,
  text: string,
  token: string,
  whatsappNumber: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post(`${whatsappNumber}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: id,
      type: "text",
      text: {
        preview_url: true,
        body: text
      }
    });

    return data;
  } catch (error) {
    console.log(error);
    //
  }
};

export const sendMediaFromUrl = async (
  id: string,
  mediaId: string,
  type: string,
  token: string,
  whatsappNumber: string,
  text?: string
): Promise<void> => {
  try {
    const messageData: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: id
    };
    switch (type) {
      case "image":
        messageData.type = type;
        messageData.image = {
          id: mediaId,
          caption: text
        };
        break;
      case "video":
        messageData.type = "video";
        messageData.video = {
          id: mediaId,
          caption: text
        };
        break;
      case "audio":
        messageData.type = "audio";
        messageData.audio = {
          id: mediaId
        };
        break;
      case "application":
        messageData.type = "document";
        messageData.document = {
          id: mediaId,
          filename: text
        };
        break;
      default:
        throw new Error("Tipo de arquivo não suportado");
    }

    const { data } = await apiBase(token).post(
      `${whatsappNumber}/messages`,
      messageData
    );

    return { ...data, mediaType: messageData.type };
  } catch (error) {
    console.log(error);
  }
};

export const genText = (text: string): any => {
  const response = {
    text
  };

  return response;
};

export const getProfile = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(id);

    return data;
  } catch (error) {
    throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
  }
};

export const getPageProfile = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(
      `${id}/accounts?fields=name,access_token,instagram_business_account{id,username,profile_picture_url,name}`
    );
    return data;
  } catch (error) {
    throw new Error("ERR_FETCHING_FB_PAGES");
  }
};

export const profilePsid = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v21.0/${id}?access_token=${token}`
    );
    return data;
  } catch (error) {
    await getProfile(id, token);
  }
};

export const subscribeApp = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await axios.post(
      `https://graph.facebook.com/v21.0/${id}/subscribed_apps?access_token=${token}`,
      {
        subscribed_fields: [
          "messages",
          "messaging_postbacks",
          "message_deliveries",
          "message_reads",
          "message_echoes"
        ]
      }
    );
    return data;
  } catch (error) {
    throw new Error("ERR_SUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const unsubscribeApp = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await axios.delete(
      `https://graph.facebook.com/v21.0/${id}/subscribed_apps?access_token=${token}`
    );
    return data;
  } catch (error) {
    throw new Error("ERR_UNSUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const getSubscribedApps = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(`${id}/subscribed_apps`);
    return data;
  } catch (error) {
    throw new Error("ERR_GETTING_SUBSCRIBED_APPS");
  }
};

export const getAccessTokenFromPage = async (
  token: string
): Promise<string> => {
  try {
    if (!token) throw new Error("ERR_FETCHING_FB_USER_TOKEN");

    const data = await axios.get(
      "https://graph.facebook.com/v21.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          grant_type: "fb_exchange_token",
          fb_exchange_token: token
        }
      }
    );

    return data.data.access_token;
  } catch (error) {
    throw new Error("ERR_FETCHING_FB_USER_TOKEN");
  }
};

export const removeApplcation = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(`https://graph.facebook.com/v21.0/${id}/permissions`, {
      params: {
        access_token: token
      }
    });
  } catch (error) {
    logger.error("ERR_REMOVING_APP_FROM_PAGE");
  }
};

// Função para fazer upload de arquivos em memória para a API do WhatsApp
export async function uploadToWhatsApp(
  buffer: Buffer,
  originalname: string,
  mimetype: string,
  ticket: Ticket
) {
  try {
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("file", buffer, originalname);
    formData.append("type", mimetype);

    const { data } = await apiBase(ticket.whatsapp.facebookUserToken).post(
      `${ticket.whatsapp.phone}/media`,
      formData
    );
    const mediaData = await apiBase(ticket.whatsapp.facebookUserToken).get(
      data.id
    );

    return {
      id: data.id, // media_id da API do WhatsApp
      filename: originalname,
      type: mimetype.split("/")[0],
      filetype: mimetype.split("/")[1],
      mediaUrl: mediaData.data.url // url da media na API do WhatsApp
    };
  } catch (error) {
    console.error("Erro ao fazer upload para o WhatsApp:", error);
    throw error;
  }
}
