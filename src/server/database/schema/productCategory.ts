import { Schema, model } from "mongoose";
import { IProductCategory } from "../model";

const productCategorySchema = new Schema<IProductCategory>(
  {
    categoryName: { type: String, required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const ProductCategory = model<IProductCategory>(
  "ProductCategory",
  productCategorySchema
);
