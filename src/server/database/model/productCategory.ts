import { Types } from "mongoose";

export interface IProductCategory {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  categoryName: string;
  business: Types.ObjectId;
  description?: string;
}
