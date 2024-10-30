import * as Sentry from "@sentry/node";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";

export const StartAllWhatsAppsSessions = async (
  companyId: number
): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId });

    await Promise.all(
      whatsapps.map(whatsapp => whatsapp.update({ status: "CONNECTED" }))
    );
  } catch (e) {
    Sentry.captureException(e);
  }
};
