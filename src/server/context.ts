import jwt from "jsonwebtoken";
import { APP_TOKEN } from "@/server/config";
import { IUserAuth } from "@/server/database/model";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { User } from "./database/schema";

export async function createContext({ req }: FetchCreateContextFnOptions) {
  async function getUserFromHeader() {
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, APP_TOKEN);
        const decodedToken: IUserAuth = decoded as IUserAuth;
        const user = await User.findById(decodedToken._id);
        if (!user) {
          return null;
        }
        return {
          _id: user._id.toHexString(),
          email: user.email,
          role: user.role,
          business: user.business,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified,
          purpose: decodedToken.purpose,
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  const user = await getUserFromHeader();
  return { user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
