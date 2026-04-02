import { Types } from "mongoose";

export interface ITransaction {
  _id?: Types.ObjectId;
  transactionType: "IN" | "OUT";
  business: Types.ObjectId;
  sale?: Types.ObjectId;
  purchase?: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
