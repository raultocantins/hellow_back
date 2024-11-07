import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Whatsapp from "../models/Whatsapp";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";

interface WhatsappData {
  name: string;
  queueIds: number[];
  companyId: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  transferMessage?: string;
  status?: string;
  isDefault?: boolean;
  token?: string;
  phone?: string;
}

interface QueryParams {
  session?: number | string;
}



export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListWhatsAppsService({ companyId, session });

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    transferMessage,
    queueIds,
    token,
    phone
  }: WhatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    transferMessage,
    queueIds,
    companyId,
    token,
    phone
  });

  const io = getIO();
  io.emit(`company-${companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { session } = req.query;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, session);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;
  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.emit(`company-${companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const io = getIO();

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
    const { facebookUserToken } = whatsapp;

    const getAllSameToken = await Whatsapp.findAll({
      where: {
        facebookUserToken
      }
    });

    await Whatsapp.destroy({
      where: {
        facebookUserToken
      }
    });

    getAllSameToken.forEach(w => {
      io.emit(`company-${companyId}-whatsapp`, {
        action: "delete",
        whatsappId: w.id
      });
    });
  }

  return res.status(200).json({ message: "Session disconnected." });
};
