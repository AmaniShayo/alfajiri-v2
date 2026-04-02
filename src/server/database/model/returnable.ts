import { Types } from "mongoose";

export interface IReturnable {
  _id?: Types.ObjectId;
  business: Types.ObjectId;
  name: string;
  totalEmpty: number;
  totalFilled: number;
  priceEmpty: number;
  totalPendingReturns: number;
  unit?: string;
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
