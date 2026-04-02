import { Types } from "mongoose";

export interface IBusinessCategory {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  categoryName: string;
  description?: string;
}
