import mongoose from "mongoose";
import { MONGODB_URI, DATABASE_NAME } from "@/server/config";

export const connectDB = async () => {
  await mongoose
    .connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    })
    .then(() => {
      console.log("Connected to Database");
      process.stdout.write("\n");
    })
    .catch((error) => {
      process.stdout.write("\n");
      console.log("\x1b[31mConnection Error\x1b[0m");
      console.dir(error, { depth: null, colors: true });
      process.exit(1);
    });
};
