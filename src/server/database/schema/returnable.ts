import { Schema, model } from "mongoose";
import { IReturnable } from "../model";

const returnableSchema = new Schema<IReturnable>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true },
    totalEmpty: { type: Number, required: true, default: 0 },
    totalFilled: { type: Number, required: true, default: 0 },
    priceEmpty: { type: Number, required: true, default: 0 },
    totalPendingReturns: { type: Number, required: true, default: 0 },
    unit: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Returnable = model<IReturnable>("Returnable", returnableSchema);
