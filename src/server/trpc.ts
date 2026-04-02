import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { IUserAuth } from "@/server/database/model/userAuth";
import superjson from "superjson";
import { Context } from "./context";

const t = initTRPC.context<Context>().create({ transformer: superjson });

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      user: ctx.user as IUserAuth,
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({
    ctx: {
      user: ctx.user as IUserAuth,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
