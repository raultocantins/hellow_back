import Campaign from "../../models/Campaign";
import CampaignSetting from "../../models/CampaignSetting";

interface Request {
  companyId: number | string;
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  records: Campaign[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId
}: Request): Promise<CampaignSetting[]> => {
  let whereCondition: any = {
    companyId
  };

  const records = await CampaignSetting.findAll({
    where: whereCondition
  });

  return records;
};

export default ListService;
