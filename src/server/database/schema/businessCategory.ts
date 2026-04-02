import { Schema, model } from "mongoose";
import { IBusinessCategory } from "../model";

const businessCategorySchema = new Schema<IBusinessCategory>(
  {
    categoryName: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const BusinessCategory = model<IBusinessCategory>(
  "BusinessCategory",
  businessCategorySchema
);
