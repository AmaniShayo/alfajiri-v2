import { Schema, model } from "mongoose";
import { IPermission } from "../model";

const permissionSchema = new Schema<IPermission>(
  {
    product: { type: Boolean, default: true },
    customer: { type: Boolean, default: true },
    supplier: { type: Boolean, default: true },
    purchase: { type: Boolean, default: true },
    setting: { type: Boolean, default: true },
    sale: { type: Boolean, default: true },
    store: { type: Boolean, default: true },
    collaborator: { type: Boolean, default: true },
    report: { type: Boolean, default: true },
    quotation: { type: Boolean, default: true },
    dashboard: { type: Boolean, default: true },
    expense: { type: Boolean, default: true },
    returnable: { type: Boolean, default: true },
    payment: { type: Boolean, default: true },
    expenseCategory: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Permission = model<IPermission>("Permission", permissionSchema);
