import { Schema, model } from "mongoose";
import { ISale } from "../model";

const SaleSchema = new Schema<ISale>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store" },
    remarks: { type: String },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    totalAmount: { type: Number },
    tax: { type: Number },
    discount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "credit", "overdue"],
      required: true,
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export const Sale = model<ISale>("Sale", SaleSchema);
