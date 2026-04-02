import { Types } from "mongoose";

export interface IPermission {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  product: boolean;
  customer: boolean;
  supplier: boolean;
  purchase: boolean;
  sale: boolean;
  collaborator: boolean;
  report: boolean;
  store: boolean;
  quotation: boolean;
  setting: boolean;
  dashboard: boolean;
  expense: boolean;
  returnable: boolean;
  payment: boolean;
  expenseCategory: boolean;
  active: boolean;
  user: Types.ObjectId;
}
