import * as Sentry from "@sentry/node";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { logger } from "../../utils/logger";

export const StartAllWhatsAppsSessions = async (
  companyId: number
): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId });

    await Promise.all(
      whatsapps.map(whatsapp => whatsapp.update({ status: "CONNECTED" }))
    );
  } catch (err) {
    logger.error("SERVICE -> erro ao inicializar as conexões de whatsapp", err);
    Sentry.captureException(err);
  }
};
