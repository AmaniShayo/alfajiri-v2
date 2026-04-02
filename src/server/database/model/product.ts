import { Types } from "mongoose";

export interface IProduct {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  supplier?: Types.ObjectId;
  code?: string;
  description?: string;
  category?: Types.ObjectId;
  business: Types.ObjectId;
  store?: Types.ObjectId;
  productName: string;
  sellingPrice: number;
  buyingPrice: number;
  initialQuantity: number;
  availableQuantity: number;
  lowInStockLimit: number;
  measurementUnit: string;
  isLowInStock: boolean;
  returnableGroup?: Types.ObjectId;
}
