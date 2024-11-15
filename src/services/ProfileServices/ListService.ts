import { Op } from "sequelize";
import Profile from "../../models/Profile";

interface Request {
  companyId?: number;
}

interface Response {
  profiles: Profile[];
}

const ListService = async ({ companyId }: Request): Promise<Response> => {
  let whereCondition = {};

  whereCondition = {
    ...whereCondition,
    companyId: {
      [Op.eq]: companyId
    }
  };

  const profiles = await Profile.findAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]]
  });

  return {
    profiles
  };
};

export default ListService;
