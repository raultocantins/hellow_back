import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import Profile from "../../models/Profile";

interface Request {
  name: string;
  description: string;
  permissions?: string[];
  companyId: number;
}

const CreateService = async ({
  name,
  description,
  permissions,
  companyId
}: Request): Promise<Profile> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(5),
    description: Yup.string().required(),
    companyId: Yup.number().required()
  });

  try {
    await schema.validate({ name, description, companyId });
  } catch (err) {
    logger.error(err);
    throw new AppError(err.message);
  }

  const profile = await Profile.create(
    {
      name,
      description,
      permissions,
      companyId
    },
    { include: ["company"] }
  );

  return profile;
};

export default CreateService;
