import { Schema, model } from "mongoose";
import { IPaymentAccount } from "../model";

const paymentAccountSchema = new Schema<IPaymentAccount>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["cash", "mobile_money", "bank"],
      required: true,
    },
    provider: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PaymentAccount = model<IPaymentAccount>(
  "PaymentAccount",
  paymentAccountSchema
);
