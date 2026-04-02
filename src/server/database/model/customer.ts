import { Types } from "mongoose";

export interface ICustomer {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  customerName: string;
  business: Types.ObjectId;
  address: string;
  phoneNumber: string;
  emailAddress?: string;
}
