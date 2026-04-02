import { Schema, model } from "mongoose";
import { IExpense } from "../model";

const expenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        "Transport & Fuel",
        "Staff Food",
        "Professional Fees",
        "Phone & Internet",
        "Rent",
        "Salaries",
        "Taxes & Licenses",
        "Insurance",
        "Office Supplies",
        "Marketing",
        "Repairs",
        "Bank Charges",
        "Utilities",
        "Other",
      ],
      required: true,
    },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store" },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachment: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const Expense = model<IExpense>("Expense", expenseSchema);
