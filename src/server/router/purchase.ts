// src/server/routers/purchase.ts
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Types } from "mongoose";
import { Purchase, Transaction, Product, Returnable } from "../database/schema";


const purchaseItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  buyingPrice: z.number().positive("Buying price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
});

const createPurchaseSchema = z.object({
  supplier: z.string().optional(),
  store: z.string().optional(),
  remarks: z.string().optional(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  purchaseDate: z.string().datetime().optional(),
  invoiceNumber: z.string().optional(),
  items: z.array(purchaseItemInputSchema).min(1, "At least one item required"),
});


type PendingTransaction = {
  transactionType: "IN";
  business: Types.ObjectId;
  purchase: Types.ObjectId | null;
  product: Types.ObjectId;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  totalAmount: number;
};


export const purchaseRouter = router({
  createPurchase: protectedProcedure
    .input(createPurchaseSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No business associated",
        });
      }

      const businessId = new Types.ObjectId(ctx.user.business);
      const acceptedById = new Types.ObjectId(ctx.user._id);

      let subtotal = 0;
      const pendingStockTransactions: PendingTransaction[] = [];

      for (const item of input.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product not found: ${item.productId}`,
          });
        }

        product.availableQuantity += item.quantity;
        product.buyingPrice = item.buyingPrice;
        product.sellingPrice = item.sellingPrice;

        product.isLowInStock =
          product.availableQuantity <= (product.lowInStockLimit ?? 0);

        await product.save();

        const lineTotal = item.quantity * item.buyingPrice;
        subtotal += lineTotal;

        pendingStockTransactions.push({
          transactionType: "IN",
          business: businessId,
          purchase: null,
          product: product._id,
          quantity: item.quantity,
          buyingPrice: item.buyingPrice,
          sellingPrice: item.sellingPrice,
          totalAmount: lineTotal,
        });

        if (product.returnableGroup) {
          const returnable = await Returnable.findById(product.returnableGroup);
          if (returnable) {
            returnable.totalEmpty = Math.max(
              0,
              returnable.totalEmpty - item.quantity
            );
            returnable.totalFilled =
              (returnable.totalFilled || 0) + item.quantity;
            await returnable.save();
          }
        }
      }

      let totalAmount = subtotal;
      if (input.tax) totalAmount *= 1 + input.tax / 100;
      if (input.discount) totalAmount -= input.discount;
      totalAmount = Math.round(totalAmount * 100) / 100;

      const purchase = await Purchase.create({
        supplier: input.supplier
          ? new Types.ObjectId(input.supplier)
          : undefined,
        acceptedBy: acceptedById,
        store: input.store ? new Types.ObjectId(input.store) : undefined,
        remarks: input.remarks,
        totalAmount,
        status: "received",
        tax: input.tax,
        discount: input.discount,
        purchaseDate: input.purchaseDate
          ? new Date(input.purchaseDate)
          : new Date(),
        invoiceNumber: input.invoiceNumber,
        business: businessId,
      });

      await Transaction.insertMany(
        pendingStockTransactions.map((t) => ({
          ...t,
          purchase: purchase._id,
        }))
      );

      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate("supplier", "name phone email")
        .populate("acceptedBy", "firstName lastName")
        .populate("store", "storeName");

      const items = await Transaction.find({ purchase: purchase._id }).populate(
        "product",
        "productName code measurementUnit buyingPrice sellingPrice"
      );

      return {
        success: true,
        message: "Purchase recorded successfully",
        purchase: populatedPurchase,
        items,
        balanceDue: totalAmount,
      };
    }),
});

export default purchaseRouter;
