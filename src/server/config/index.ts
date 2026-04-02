import dotenv from "dotenv";

dotenv.config();

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017";
export const APP_TOKEN =
  process.env.APP_TOKEN || "f229de5012bb7b8b264d6c4218160c";
export const NOTIFY_BASE_URL = process.env.NOTIFY_BASE_URL;
export const NOTIFY_API_TOKEN = process.env.NOTIFY_API_TOKEN;
export const NOTIFY_SENDER_ID = process.env.NOTIFY_SENDER_ID || 40;
export const MODE = process.env.NEXT_PUBLIC_MODE;
export const DATABASE_NAME = process.env.DATABASE_NAME;
export const PORT = process.env.PORT || 3000;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
