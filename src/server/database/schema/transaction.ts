import { Schema, model } from "mongoose";
import { ITransaction } from "../model";

const transactionSchema = new Schema<ITransaction>(
  {
    transactionType: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    sale: { type: Schema.Types.ObjectId, ref: "Sale" },
    purchase: { type: Schema.Types.ObjectId, ref: "Purchase" },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
