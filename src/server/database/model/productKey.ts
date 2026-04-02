import { Types } from "mongoose";

export interface IProductKey {
  _id?: Types.ObjectId;
  key: string;
  status: "unused" | "redeemed";
  keyType: "royalty" | "standard";
  redeemedBy?: Types.ObjectId;
  redeemedForBusiness?: Types.ObjectId;
  redeemedAt?: Date;
  generatedAt: Date;
  expiresAt?: Date;
  notes?: string;
  batchId?: string;
}
