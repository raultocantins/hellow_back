import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Invoices from "../models/Invoices";

import FindAllInvoiceService from "../services/InvoicesService/FindAllInvoiceService";
import ListInvoicesServices from "../services/InvoicesService/ListInvoicesServices";
import ShowInvoceService from "../services/InvoicesService/ShowInvoiceService";
import UpdateInvoiceService from "../services/InvoicesService/UpdateInvoiceService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type UpdateInvoiceData = {
  status: string;
  id?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { invoices, count, hasMore } = await ListInvoicesServices({
    searchParam,
    pageNumber
  });

  return res.json({ invoices, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { Invoiceid } = req.params;

  const invoice = await ShowInvoceService(Invoiceid);

  return res.status(200).json(invoice);
};


export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const invoice: Invoices[] = await FindAllInvoiceService(companyId);

  return res.status(200).json(invoice);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const InvoiceData: UpdateInvoiceData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(InvoiceData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id, status } = InvoiceData;

  const plan = await UpdateInvoiceService({
    id,
    status,

  });

  return res.status(200).json(plan);
};
