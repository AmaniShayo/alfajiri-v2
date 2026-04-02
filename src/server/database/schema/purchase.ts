import { Schema, model } from "mongoose";
import { IPurchase } from "../model";

const purchaseSchema = new Schema<IPurchase>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store" },
    paymentMethod: { type: String, enum: ["Cash", "Bank", "Mobile"] },
    totalAmount: { type: Number, required: true },
    tax: { type: Number },
    discount: { type: Number },
    remarks: { type: String },
    purchaseDate: { type: Date },
    invoiceNumber: { type: String },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled", "returned"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Purchase = model<IPurchase>("Purchase", purchaseSchema);
