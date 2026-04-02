import mongoose, { Schema } from "mongoose";
import { IUser } from "../model";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    business: { type: Schema.Types.ObjectId, ref: "Business" },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    otp: { type: String },
    role: { type: String, enum: ["owner", "collaborator"], required: true },
    isVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
