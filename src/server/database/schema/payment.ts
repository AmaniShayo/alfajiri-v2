import { Schema, model } from "mongoose";
import { IPayment } from "../model";

const paymentSchema = new Schema<IPayment>(
  {
    sale: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank", "Mobile"],
      required: true,
    },
    paymentAccount: { type: Schema.Types.ObjectId, ref: "PaymentAccount" },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
