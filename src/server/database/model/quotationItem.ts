import { Types } from "mongoose";

export interface IQuotationItem {
  _id?: Types.ObjectId;
  quotation: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  price: number;
  subTotal: number;
}
