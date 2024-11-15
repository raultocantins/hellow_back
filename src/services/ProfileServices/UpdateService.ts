import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ShowService from "./ShowService";
import { logger } from "../../utils/logger";
import Profile from "../../models/Profile";

interface ProfileData {
  name: string;
  description: string;
  permissions?: string[];
  companyId: number;
}

interface Request {
  profileData: ProfileData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  profileData,
  id,
  companyId
}: Request): Promise<Profile | undefined> => {
  const profile = await ShowService(id, companyId);

  if (profile?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  const schema = Yup.object().shape({
    name: Yup.string().required().min(5),
    description: Yup.string().required(),
    companyId: Yup.number().required()
  });

  const { name, description, permissions } = profileData;

  try {
    await schema.validate({ name, description, companyId });
  } catch (err: any) {
    logger.error(err);
    throw new AppError(err.message);
  }

  await profile.update({
    name,
    description,
    permissions,
    companyId
  });

  await profile.reload();
  return profile;
};

export default UpdateService;
