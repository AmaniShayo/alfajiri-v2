import { Types } from "mongoose";

export interface IQuotation {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  customer: Types.ObjectId;
  issuedBy: Types.ObjectId;
  totalAmount: number;
  expirationDate: Date;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  business: Types.ObjectId;
  store: Types.ObjectId;
}
