import { sign } from "jsonwebtoken";
import authConfig from "../config/auth";
import User from "../models/User";

export const createAccessToken = (user: User): string => {
  const { secret, expiresIn } = authConfig;

  return sign(
    {
      username: user.name,
      profile: user.profile,
      super: user.super,
      id: user.id,
      companyId: user.companyId,
      permissions: user?.profilePermission?.permissions??[],
      isActive: user.isActive,
      accessWeekdays: user.accessWeekdays,
      accessWeekend: user.accessWeekend
    },
    secret,
    {
      expiresIn
    }
  );
};

export const createRefreshToken = (user: User): string => {
  const { refreshSecret, refreshExpiresIn } = authConfig;

  return sign(
    { id: user.id, tokenVersion: user.tokenVersion, companyId: user.companyId },
    refreshSecret,
    {
      expiresIn: refreshExpiresIn
    }
  );
};
