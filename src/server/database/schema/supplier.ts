import { Schema, model } from "mongoose";
import { ISupplier } from "../model";

const supplierSchema = new Schema<ISupplier>(
  {
    supplierName: { type: String, required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    category: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String },
  },
  { timestamps: true }
);

export const Supplier = model<ISupplier>("Supplier", supplierSchema);
