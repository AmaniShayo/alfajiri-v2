import { Types } from "mongoose";

export interface IPayment {
  _id?: Types.ObjectId;
  sale: Types.ObjectId;
  business: Types.ObjectId;
  amount: number;
  paymentMethod: "Cash" | "Bank" | "Mobile";
  paymentAccount?: Types.ObjectId;
  receivedBy: Types.ObjectId;
  reference?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
