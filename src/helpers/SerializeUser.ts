import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  company: Company | null;
  super: boolean;
  queues: Queue[];
  profileId: number;
  permissions: string[];
  isActive: boolean;
  accessWeekdays: string[];
  accessWeekend: string[];
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company: user.company,
    super: user.super,
    queues: user.queues,
    profileId: user.profileId,
    permissions: user?.profilePermission?.permissions??[],
    isActive: user.isActive,
    accessWeekdays: user.accessWeekdays,
    accessWeekend: user.accessWeekend
  };
};
