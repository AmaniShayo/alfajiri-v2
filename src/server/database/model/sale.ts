import { Types } from "mongoose";

export interface ISale {
  _id?: Types.ObjectId;
  customer?: Types.ObjectId;
  issuedBy: Types.ObjectId;
  store?: Types.ObjectId;
  remarks?: string;
  business: Types.ObjectId;
  totalAmount: number;
  totalAmountPaid: number;
  tax?: number;
  discount?: number;
  paymentStatus: "paid" | "partial" | "credit" | "overdue";
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
