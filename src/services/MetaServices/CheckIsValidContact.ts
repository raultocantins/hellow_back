import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
const CheckIsValidContact = async (
  number: string,
  companyId: number
): Promise<void> => {
  try {
    logger.info(`SERVICE -> verificando se o contato é válido: ${number} - ${companyId}`);
    return;
  } catch (err) {
    logger.error("SERVICE -> erro ao verificar se contato é válido",err)
    throw new AppError("");
  }
};

export default CheckIsValidContact;
