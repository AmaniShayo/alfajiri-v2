import { Types } from "mongoose";

export interface ISupplier {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  supplierName: string;
  business: Types.ObjectId;
  category: string;
  phoneNumber: string;
  emailAddress?: string;
}
