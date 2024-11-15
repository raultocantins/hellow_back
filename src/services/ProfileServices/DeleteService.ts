import AppError from "../../errors/AppError";
import Profile from "../../models/Profile";

const DeleteService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const profile = await Profile.findOne({
    where: { id, companyId }
  });

  if (!profile) {
    throw new AppError("ERR_NO_PROFILE_FOUND", 404);
  }

  await profile.destroy();
};

export default DeleteService;
