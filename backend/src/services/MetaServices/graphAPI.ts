import axios from "axios";
import FormData from "form-data";
import Ticket from "../../models/Ticket";

const apiBase = (token: string) =>
  axios.create({
    baseURL: "https://graph.facebook.com/v21.0/",
    params: {
      access_token: token
    }
  });

export const markSeen = async (
  id: string,
  token: string,
  messageId: string
): Promise<void> => {
  try {
    await apiBase(token).post(`${id}/messages`, {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendText = async (
  id: string | number,
  text: string,
  token: string,
  whatsappNumber: string,
  quotedMsgId?: string
): Promise<void> => {
  try {
    var requestData: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: id,
      type: "text",
      text: {
        preview_url: true,
        body: text
      }
    };

    if (quotedMsgId) {
      requestData.context = {
        message_id: quotedMsgId
      };
    }
    const { data } = await apiBase(token).post(
      `${whatsappNumber}/messages`,
      requestData
    );

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
  text?: string,
  quotedMsgId?: string
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

    if (quotedMsgId) {
      messageData.context = {
        message_id: quotedMsgId
      };
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

export const getProfile = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(id);

    return data;
  } catch (error) {
    throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
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
    const mediaData = await getMediaData(
      data.id,
      ticket.whatsapp.facebookUserToken
    );

    return {
      id: data.id, // media_id da API do WhatsApp
      filename: originalname,
      type: mimetype.split("/")[0],
      filetype: mimetype.split("/")[1],
      mediaUrl: mediaData.url // url da media na API do WhatsApp
    };
  } catch (error) {
    console.error("Erro ao fazer upload para o WhatsApp:", error);
    throw error;
  }
}

export async function getMediaData(id: string, token: string) {
  try {
    const { data } = await apiBase(token).get(id);
    return {
      ...data,
      type: data.mime_type.split("/")[0],
      filetype: data.mime_type.split("/")[1]
    };
  } catch (error) {
    console.error("Erro ao buscar os dados da media:", error);
    throw error;
  }
}
