import { Schema, model } from "mongoose";
import { IQuotationItem } from "../model";

const quotationItemSchema = new Schema<IQuotationItem>(
  {
    quotation: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

export const QuotationItem = model<IQuotationItem>(
  "QuotationItem",
  quotationItemSchema
);
