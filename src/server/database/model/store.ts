import { Types } from "mongoose";

export interface IStore {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  storeName: string;
  address?: string;
  business: Types.ObjectId;
  about?: string;
}
