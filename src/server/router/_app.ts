import { connectDB } from "../database/client";
import { router } from "../trpc";
import { userRouter } from "./user";
import { businessRouter } from "./business";
import { productKeyRouter } from "./productKey";
import { productRouter } from "./product";
import { customerRouter } from "./customer";
import { expenseRouter } from "./expense";
import { saleRouter } from "./sale";
import { returnableRouter } from "./returnable";

const systemInit = async () => {
  await connectDB();
};

systemInit().catch((error) => {
  console.error("Error during system initialization:", error);
  process.exit(1);
});

export const appRouter = router({
  user: userRouter,
  business: businessRouter,
  productKey: productKeyRouter,
  product: productRouter,
  customer: customerRouter,
  expense: expenseRouter,
  sale: saleRouter,
  returnable: returnableRouter,
});

export type AppRouter = typeof appRouter;
