import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ShowUserService from "./ShowUserService";
import Company from "../../models/Company";
import User from "../../models/User";
import { logger } from "../../utils/logger";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  companyId?: number;
  queueIds?: number[];
  profileId: number;
  isActive?: boolean;
  accessWeekdays?: string[];
  accessWeekend?: string[];
}

interface Request {
  userData: UserData;
  userId: string | number;
  requestUserId: number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserService = async ({
  userData,
  userId,
  requestUserId
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId, requestUserId);

  const requestUser = await User.findByPk(requestUserId);

  if (
    !requestUser.super &&
    +userId !== requestUser.id &&
    (user.companyId !== requestUser.companyId ||
      requestUser.profile !== "admin")
  ) {
    throw new AppError("ERR_FORBIDDEN", 403);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const {
    email,
    password,
    profile,
    name,
    queueIds = [],
    profileId,
    isActive,
    accessWeekdays,
    accessWeekend
  } = userData;

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: unknown) {
    logger.error(err);
    throw new AppError((err as Error).message);
  }

  if (requestUser.profile === "admin") {
    await user.update({
      email,
      password,
      profile,
      name,
      profileId,
      isActive,
      accessWeekdays,
      accessWeekend
    });
    await user.$set("queues", queueIds);
  } else {
    await user.update({
      email,
      password,
      name,
      profileId,
      isActive,
      accessWeekdays,
      accessWeekend
    });
  }

  await user.reload();

  const company = await Company.findByPk(user.companyId);

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company,
    queues: user.queues
  };

  return serializedUser;
};

export default UpdateUserService;
