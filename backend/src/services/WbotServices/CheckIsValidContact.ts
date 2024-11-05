import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
const CheckIsValidContact = async (
  number: string,
  companyId: number
): Promise<void> => {
  try {
    logger.info(`VERIFICANDO SE O CONTATO É VALIDO: ${number} - ${companyId}`);
    return;
  } catch (err) {
    logger.error(err)
    throw new AppError("");
  }
};

export default CheckIsValidContact;
