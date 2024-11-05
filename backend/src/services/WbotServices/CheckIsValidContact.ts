import AppError from "../../errors/AppError";
const CheckIsValidContact = async (
  number: string,
  companyId: number
): Promise<void> => {
  try {
    console.log(`VERIFICANDO SE O CONTATO É VALIDO: ${number} - ${companyId}`);
    return;
  } catch (err) {
    throw new AppError("");
  }
};

export default CheckIsValidContact;
