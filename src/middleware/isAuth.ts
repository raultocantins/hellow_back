import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import { logger } from "../utils/logger";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  super: boolean;
  companyId: number;
  permissions: string[];
  isActive: boolean;
  accessWeekdays: string[];
  accessWeekend: string[];
  iat: number;
  exp: number;
}

const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req?.user) {
    // previous middleware already authorized
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    req.tokenData = verify(token, authConfig.secret) as TokenPayload;

    if (!req.tokenData.isActive) {
      throw new AppError("ERR_UNAUTHORIZED", 401);
    }

    const currentDay = new Date().getDay(); // 0 = domingo, 6 = sábado
    const currentTime = new Date().toTimeString().split(" ")[0]; // Formato HH:mm:ss

    const allowedHours =
      currentDay === 0 || currentDay === 6
        ? req.tokenData.accessWeekend
        : req.tokenData.accessWeekdays;

    const [startTime, endTime] = allowedHours;
    if (currentTime < startTime || currentTime > endTime) {
      throw new AppError("NOT_ALLOWEWD_THIS_TIME", 401);
    }

    req.user = {
      id: req.tokenData.id,
      profile: req.tokenData.profile,
      isSuper: req.tokenData.super,
      companyId: req.tokenData.companyId,
      permissions: req.tokenData.permissions
    };
  } catch (err) {
    logger.warn(err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  return next();
};

export default isAuth;
