import { Types } from "mongoose";

export interface IReturnableTransaction {
  _id?: Types.ObjectId;
  returnable: Types.ObjectId;
  business: Types.ObjectId;
  sale?: Types.ObjectId;
  quantityReturned: number;
  quantityOwed: number;
  type: "sale" | "customer_return" | "purchase" | "adjustment" | "transfer";
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
