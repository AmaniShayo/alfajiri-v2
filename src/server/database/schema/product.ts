import { Schema, model } from "mongoose"
import { IProduct } from "../model"

const productSchema = new Schema<IProduct>(
  {
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    description: { type: String },
    code: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store" },
    productName: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    buyingPrice: { type: Number, required: true },
    initialQuantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },
    lowInStockLimit: { type: Number, required: true },
    measurementUnit: {
      type: String,
      required: true,
    },
    isLowInStock: { type: Boolean, required: true, default: false },
    returnableGroup: { type: Schema.Types.ObjectId, ref: "Returnable" },
    barcode: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true }
)

export const Product = model<IProduct>("Product", productSchema)
