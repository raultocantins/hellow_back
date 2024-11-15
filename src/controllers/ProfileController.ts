import { Request, Response } from "express";
import ListService from "../services/ProfileServices/ListService";
import CreateService from "../services/ProfileServices/CreateService";
import ShowService from "../services/ProfileServices/ShowService";
import DeleteService from "../services/ProfileServices/DeleteService";
import AppError from "../errors/AppError";
import UpdateService from "../services/ProfileServices/UpdateService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const { profiles } = await ListService({
    companyId
  });

  return res.json({ profiles });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description, permissions } = req.body;
  const { companyId } = req.user;

  const profile = await CreateService({
    name,
    description,
    permissions,
    companyId
  });

  return res.status(200).json(profile);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { profileId } = req.params;
  const { companyId } = req.user;

  const profile = await ShowService(profileId, companyId);

  return res.status(200).json(profile);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { profileId } = req.params;
  const profileData = req.body;
  const { companyId } = req.user;

  const profile = await UpdateService({
    profileData,
    id: profileId,
    companyId
  });

  return res.status(200).json(profile);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { profileId } = req.params;
  const { companyId } = req.user;

  await DeleteService(profileId, companyId);

  return res.status(200).json({ message: "profile deleted" });
};
