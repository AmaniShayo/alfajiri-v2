import { Types } from "mongoose";

export interface IBusiness {
  _id?: Types.ObjectId;
  businessName: string;
  TINNumber?: string;
  owner: Types.ObjectId;
  about?: string;
  currency: string;
  address: string;
  productKey: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
