// expense.ts
import { Types } from "mongoose";

export interface IExpense {
  _id?: Types.ObjectId;
  amount: number;
  description?: string;
  category:
    | "Transport & Fuel"
    | "Staff Food"
    | "Professional Fees"
    | "Phone & Internet"
    | "Rent"
    | "Salaries"
    | "Taxes & Licenses"
    | "Insurance"
    | "Office Supplies"
    | "Marketing"
    | "Repairs"
    | "Bank Charges"
    | "Utilities"
    | "Other";
  business: Types.ObjectId;
  store?: Types.ObjectId;
  issuedBy: Types.ObjectId;
  attachment?: string;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
