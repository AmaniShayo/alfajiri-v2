import { Schema, model } from "mongoose";
import { IReturnableTransaction } from "../model";

const returnableTransactionSchema = new Schema<IReturnableTransaction>(
  {
    returnable: {
      type: Schema.Types.ObjectId,
      ref: "Returnable",
      required: true,
    },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    sale: { type: Schema.Types.ObjectId, ref: "Sale" },
    quantityReturned: { type: Number, required: true },
    quantityOwed: { type: Number, required: true },
    type: {
      type: String,
      enum: ["sale", "customer_return", "purchase", "adjustment", "transfer"],
      required: true,
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const ReturnableTransaction = model<IReturnableTransaction>(
  "ReturnableTransaction",
  returnableTransactionSchema
);
