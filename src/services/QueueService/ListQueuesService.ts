import Queue from "../../models/Queue";
import User from "../../models/User";

interface Request {
  companyId: number;
}

const ListQueuesService = async ({ companyId }: Request): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    where: {
      companyId
    },
    order: [["name", "ASC"]],
    include: [{ model: User, as: "supervisors",attributes: ["id","name","email","isActive","online"]  }]
  });
  return queues;
};

export default ListQueuesService;
