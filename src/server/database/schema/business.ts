import { Schema, model } from "mongoose";
import { IBusiness } from "../model";

const businessSchema = new Schema<IBusiness>(
  {
    businessName: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    about: { type: String },
    TINNumber: { type: String },
    address: { type: String, required: true },
    currency: { type: String, required: true },
    productKey: {
      type: Schema.Types.ObjectId,
      ref: "ProductKey",
      required: true,
    },
  },
  { timestamps: true }
);

export const Business = model<IBusiness>("Business", businessSchema);
