import { Schema, model } from "mongoose";
import { IBusinessSettings } from "../model";

const businessSettingsSchema = new Schema<IBusinessSettings>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    businessSlogan: { type: String },
    receiptFooterText: { type: String },
    businessContacts: { type: String },
    emailAddress: { type: String },
    businessAddress: { type: String },
    taxRate: { type: Number },
    discountRate: { type: Number },
    longitude: { type: Number },
    latitude: { type: Number },
    timeZone: { type: String },
    currency: { type: String },
  },
  { timestamps: true }
);

export const BusinessSettings = model<IBusinessSettings>(
  "BusinessSettings",
  businessSettingsSchema
);
