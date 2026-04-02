import { Schema, model } from "mongoose";
import { ICustomer } from "../model";

const customerSchema = new Schema<ICustomer>(
  {
    customerName: { type: String, required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String },
  },
  { timestamps: true }
);

export const Customer = model<ICustomer>("Customer", customerSchema);
