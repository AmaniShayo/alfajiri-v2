import { Schema, model } from "mongoose";
import { IQuotation } from "../model";

const quotationSchema = new Schema<IQuotation>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
    },
    notes: { type: String },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  },
  { timestamps: true }
);

export const Quotation = model<IQuotation>("Quotation", quotationSchema);
