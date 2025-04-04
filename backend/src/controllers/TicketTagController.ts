import { Request, Response } from "express";
import TicketTag from '../models/TicketTag';
import Tag from '../models/Tag'

export const store = async (req: Request, res: Response): Promise<Response> => {
  const ticketId = parseInt(req.params.ticketId, 10);
  const tagId = parseInt(req.params.tagId, 10);

  // Check if the parsed values are valid numbers
  if (Number.isNaN(ticketId) || Number.isNaN(tagId)) {
    return res.status(400).json({ error: "Invalid ticketId or tagId." });
  }

  try {
    const ticketTag = await TicketTag.create({ ticketId, tagId });
    return res.status(201).json(ticketTag);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to store ticket tag.' });
  }
};


export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  try {
    // Retrieve tagIds associated with the provided ticketId from TicketTags
    const ticketTags = await TicketTag.findAll({ where: { ticketId } });
    const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

    // Find the tagIds with kanban = 1 in the Tags table
    const tagsWithKanbanOne = await Tag.findAll({
      where: {
        id: tagIds,
        kanban: 1,
      },
    });

    // Remove the tagIds with kanban = 1 from TicketTags
    const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
    await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });

    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};