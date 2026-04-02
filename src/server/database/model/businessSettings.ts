import { Types } from "mongoose";

export interface IBusinessSettings {
  _id?: Types.ObjectId;
  business: Types.ObjectId;
  businessContacts?: string;
  emailAddress?: string;
  businessAddress?: string;
  businessSlogan?: string;
  receiptFooterText?: string;
  taxRate?: number;
  discountRate?: number;
  longitude?: number;
  latitude?: number;
  timeZone?: string;
  currency?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
