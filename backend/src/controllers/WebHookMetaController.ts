import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { handleMessage, handleStatusMessage } from "../services/MetaServices/graphMessageListener";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { body } = req;
    if (body.object === "whatsapp_business_account") {
      const channel = "facebook";

      body.entry?.forEach(async (entry: any) => {
        const whatsapp = await Whatsapp.findOne({
          where: {
            facebookPageUserId: entry.id,
            channel
          }
        });

        if (whatsapp) {
          entry.changes?.forEach((data: any) => {
            if (data.value.messages) {
              handleMessage(whatsapp, data, channel, whatsapp.companyId);
            }
            if (data.value.statuses) {
              handleStatusMessage(data);
            }
          });
        }
      });

      return res.status(200).json({
        message: "EVENT_RECEIVED"
      });
    }

    return res.status(404).json({
      message: body
    });
  } catch (error) {
    return res.status(500).json({
      message: error
    });
  }
};
