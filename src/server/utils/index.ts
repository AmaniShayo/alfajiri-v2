import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IUserAuth } from "../database/model";
import { APP_TOKEN } from "../config";

export const getToken = (user: IUserAuth) => {
  return jwt.sign(user, APP_TOKEN, {
    expiresIn: "1y",
  });
};

export const GetSalt = async () => {
  return await bcrypt.genSalt();
};

export const GetHashedPassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GetHashedPassword(enteredPassword, salt)) == savedPassword;
};

export const generateOTP = (length: number): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phoneNumber);
};

export * from "./email";
