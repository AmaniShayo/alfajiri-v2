import { Types } from "mongoose";

export interface IPaymentAccount {
  _id?: Types.ObjectId;
  business: Types.ObjectId;
  name: string;
  type: "cash" | "mobile_money" | "bank";
  provider?: string;
  accountNumber?: string;
  accountHolderName?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
