import AppError from "../../errors/AppError";
import Profile from "../../models/Profile";

const ShowService = async (
  id: string | number,
  companyId: number
): Promise<Profile> => {
  const profile = await Profile.findByPk(id);

  if (!profile) {
    throw new AppError("ERR_NO_PROFILE_FOUND", 404);
  }

  if (profile?.companyId !== companyId) {
    throw new AppError("Não é possível mostrar registros de outra empresa");
  }

  return profile;
};

export default ShowService;
