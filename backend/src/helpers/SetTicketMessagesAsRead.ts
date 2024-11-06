import { cacheLayer } from "../libs/cache";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import { markSeen } from "../services/MetaServices/graphAPI";
import { logger } from "../utils/logger";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  await ticket.update({ unreadMessages: 0 });
  await cacheLayer.set(`contacts:${ticket.contactId}:unreads`, "0");
  let companyId: number;
  try {
    const messages = await Message.findAll({
      include: [{ model: Ticket, as: "ticket", attributes: ["whatsappId"] }],
      attributes: ["id", "companyId"],
      where: {
        ticketId: ticket.id,
        fromMe: false,
        read: false
      },
      order: [["createdAt", "DESC"]]
    });

    if (messages.length === 0) return;

    companyId = messages[0]?.companyId;
    const whatsapp = await Whatsapp.findOne({
      where: {
        id: messages[0].ticket.whatsappId
      }
    });

    await Promise.all(
      messages.map(message =>
        markSeen(whatsapp.phone, whatsapp.facebookUserToken, message.id)
      )
    );

    await Message.update(
      { read: true },
      {
        where: {
          ticketId: ticket.id,
          read: false
        }
      }
    );
  } catch (err) {
    logger.error(
      `Could not mark messages as read. Err: ${err?.message}`
    );
  }

  const io = getIO();
  if (companyId) {
    io.to(ticket.id.toString())
      .to(`company-${companyId}-${ticket.status}`)
      .to(`queue-${ticket.queueId}-${ticket.status}`)
      .emit(`company-${companyId}-ticket`, {
        action: "updateUnread",
        ticketId: ticket.id
      });
  }
};

export default SetTicketMessagesAsRead;
