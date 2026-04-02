import { Schema, model } from "mongoose";
import { IStore } from "../model";

const storeSchema = new Schema<IStore>(
  {
    storeName: { type: String, required: true },
    business: { type: Schema.Types.ObjectId, ref: "business", required: true },
    address: { type: String },
    about: { type: String },
  },
  { timestamps: true }
);

export const Store = model<IStore>("Store", storeSchema);
