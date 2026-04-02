import { Types } from "mongoose";

export interface IPurchase {
  _id?: Types.ObjectId;
  business: Types.ObjectId;
  acceptedBy: Types.ObjectId;
  supplier?: Types.ObjectId;
  store?: Types.ObjectId;
  totalAmount: number;
  paymentMethod?: "Cash" | "Bank" | "Mobile";
  tax?: number;
  discount?: number;
  remarks?: string;
  purchaseDate?: Date;
  invoiceNumber?: string;
  status?: "pending" | "received" | "cancelled" | "returned";
  createdAt?: Date;
  updatedAt?: Date;
}
