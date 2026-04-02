import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  business?: Types.ObjectId;
  password: string;
  salt: string;
  otp?: string;
  role: "owner" | "employee";
  isVerified: boolean;
}
