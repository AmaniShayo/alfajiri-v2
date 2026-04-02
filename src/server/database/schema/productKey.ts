import { Schema, model } from "mongoose";
import { IProductKey } from "../model";

const productKeySchema = new Schema<IProductKey>(
  {
    key: { type: String, required: true, unique: true },
    status: { type: String, enum: ["unused", "redeemed"], required: true },
    keyType: { type: String, enum: ["royalty", "standard"], required: true },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "User" },
    redeemedForBusiness: { type: Schema.Types.ObjectId, ref: "Business" },
    redeemedAt: { type: Date },
    generatedAt: { type: Date, required: true },
    expiresAt: { type: Date },
    notes: { type: String },
    batchId: { type: String },
  },
  { timestamps: true }
);

export const ProductKey = model<IProductKey>("ProductKey", productKeySchema);
