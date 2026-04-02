import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  Sale,
  Transaction,
  Product,
  Payment,
  Returnable,
  ReturnableTransaction,
} from "../database/schema";
import { Types } from "mongoose";

const saleItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
});

const initialPaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be positive"),
  paymentMethod: z.enum(["Cash", "Bank", "Mobile"]),
  paymentAccount: z.string().optional(),
  reference: z.string().optional(),
});

const returnedReturnableSchema = z.object({
  returnableId: z.string().min(1, "Returnable ID required"),
  quantity: z.number().int().positive("Returned quantity must be positive"),
});

const createSaleSchema = z.object({
  customer: z.string().optional(),
  store: z.string().optional(),
  remarks: z.string().optional(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  dueDate: z.iso.datetime().optional(),
  items: z.array(saleItemInputSchema).min(1, "At least one item required"),
  initialPayment: initialPaymentSchema.optional(),
  returnedDuringSale: z.array(returnedReturnableSchema).optional(),
});

const addPaymentSchema = z.object({
  saleId: z.string().min(1, "Sale ID required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["Cash", "Bank", "Mobile"]),
  paymentAccount: z.string().optional(),
  reference: z.string().optional(),
});

const recordReturnablesSchema = z.object({
  saleId: z.string().min(1, "Sale ID required"),
  returns: z
    .array(
      z.object({
        returnableId: z.string().min(1, "Returnable ID required"),
        quantity: z.number().int().positive("Return quantity must be positive"),
      })
    )
    .min(1),
});

type PendingTransaction = {
  transactionType: "OUT";
  business: Types.ObjectId;
  sale: Types.ObjectId | null;
  product: Types.ObjectId;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  totalAmount: number;
};

type pendingReturnableTransactions = {
  product: Types.ObjectId;
  returnable: Types.ObjectId;
  quantityOwed: number;
  type: "sale" | "customer_return" | "purchase" | "adjustment" | "transfer";
  quantityReturned: number;
  business: Types.ObjectId;
};

export const saleRouter = router({
  createSale: protectedProcedure
    .input(createSaleSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No business associated",
        });
      }

      const businessId = new Types.ObjectId(ctx.user.business);
      const issuedById = new Types.ObjectId(ctx.user._id);

      let subtotal = 0;
      const pendingStockTransactions: PendingTransaction[] = [];

      const pendingReturnableTransactions: pendingReturnableTransactions[] = [];

      for (const item of input.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product not found: ${item.productId}`,
          });
        }

        if (product.availableQuantity < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock: ${product.productName} (Available: ${product.availableQuantity})`,
          });
        }

        const lineTotal = item.quantity * item.sellingPrice;
        subtotal += lineTotal;

        product.availableQuantity -= item.quantity;
        product.isLowInStock =
          product.availableQuantity <= product.lowInStockLimit;
        await product.save();

        pendingStockTransactions.push({
          transactionType: "OUT",
          business: businessId,
          sale: null,
          product: product._id,
          quantity: item.quantity,
          buyingPrice: product.buyingPrice,
          sellingPrice: item.sellingPrice,
          totalAmount: lineTotal,
        });

        if (product.returnableGroup) {
          const returnable = await Returnable.findById(product.returnableGroup);
          if (returnable) {
            returnable.totalPendingReturns += item.quantity;
            await returnable.save();
          }

          pendingReturnableTransactions.push({
            product: product._id,
            returnable: product.returnableGroup,
            quantityOwed: item.quantity,
            quantityReturned: 0,
            type: "sale",
            business: businessId,
          });
        }
      }

      if (input.returnedDuringSale?.length) {
        for (const ret of input.returnedDuringSale) {
          const returnable = await Returnable.findOne({
            _id: new Types.ObjectId(ret.returnableId),
            business: businessId,
          });

          if (!returnable) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Returnable not found: ${ret.returnableId}`,
            });
          }

          returnable.totalEmpty += ret.quantity;
          returnable.totalPendingReturns -= ret.quantity;

          await returnable.save();

          const idx = pendingReturnableTransactions.findIndex((prt) =>
            prt.returnable.equals(returnable._id)
          );
          if (idx !== -1) {
            pendingReturnableTransactions[idx].quantityReturned += ret.quantity;
            pendingReturnableTransactions[idx].quantityOwed -= ret.quantity;
          }
        }
      }

      let totalAmount = subtotal;
      if (input.tax) totalAmount *= 1 + input.tax / 100;
      if (input.discount) totalAmount -= input.discount;
      totalAmount = Math.round(totalAmount * 100) / 100;

      const initialPaid = input.initialPayment?.amount || 0;

      const paymentStatus: "paid" | "partial" | "credit" | "overdue" =
        initialPaid >= totalAmount
          ? "paid"
          : initialPaid > 0
            ? "partial"
            : "credit";

      const sale = await Sale.create({
        customer: input.customer
          ? new Types.ObjectId(input.customer)
          : undefined,
        issuedBy: issuedById,
        store: input.store ? new Types.ObjectId(input.store) : undefined,
        remarks: input.remarks,
        totalAmount,
        totalAmountPaid: initialPaid,
        tax: input.tax,
        discount: input.discount,
        paymentStatus,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        business: businessId,
      });

      await Transaction.insertMany(
        pendingStockTransactions.map((t) => ({
          ...t,
          sale: sale._id,
        }))
      );

      if (pendingReturnableTransactions.length > 0) {
        await ReturnableTransaction.insertMany(
          pendingReturnableTransactions.map((rt) => ({
            ...rt,
            sale: sale._id,
          }))
        );
      }

      if (input.initialPayment && initialPaid > 0) {
        await Payment.create({
          sale: sale._id,
          business: businessId,
          amount: initialPaid,
          paymentMethod: input.initialPayment.paymentMethod,
          paymentAccount: input.initialPayment.paymentAccount
            ? new Types.ObjectId(input.initialPayment.paymentAccount)
            : undefined,
          reference: input.initialPayment.reference,
          receivedBy: issuedById,
        });
      }

      const populatedSale = await Sale.findById(sale._id)
        .populate("customer", "name phone")
        .populate("issuedBy", "firstName lastName")
        .populate("store", "storeName");

      const items = await Transaction.find({ sale: sale._id }).populate(
        "product",
        "productName code measurementUnit returnableGroup"
      );

      const payments = await Payment.find({ sale: sale._id });

      return {
        success: true,
        message: "Sale created successfully",
        sale: populatedSale,
        items,
        payments,
        returnedDuringSale: input.returnedDuringSale || [],
        balanceDue: totalAmount - initialPaid,
      };
    }),

  addPayment: protectedProcedure
    .input(addPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business)
        throw new TRPCError({ code: "BAD_REQUEST", message: "No business" });

      const businessId = new Types.ObjectId(ctx.user.business);
      const saleId = new Types.ObjectId(input.saleId);

      const sale = await Sale.findOne({ _id: saleId, business: businessId });
      if (!sale)
        throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

      const newPaidTotal = sale.totalAmountPaid + input.amount;
      if (newPaidTotal > sale.totalAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment exceeds due amount",
        });
      }

      await Payment.create({
        sale: sale._id,
        business: businessId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        paymentAccount: input.paymentAccount
          ? new Types.ObjectId(input.paymentAccount)
          : undefined,
        reference: input.reference,
        receivedBy: new Types.ObjectId(ctx.user._id),
      });

      sale.totalAmountPaid = newPaidTotal;
      sale.paymentStatus =
        newPaidTotal >= sale.totalAmount
          ? "paid"
          : newPaidTotal > 0
            ? "partial"
            : sale.dueDate && new Date(sale.dueDate) < new Date()
              ? "overdue"
              : "credit";

      await sale.save();

      return {
        success: true,
        message: "Payment recorded",
        sale,
        newBalance: sale.totalAmount - newPaidTotal,
      };
    }),

  recordReturnables: protectedProcedure
    .input(recordReturnablesSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business)
        throw new TRPCError({ code: "BAD_REQUEST", message: "No business" });

      const businessId = new Types.ObjectId(ctx.user.business);
      const saleId = new Types.ObjectId(input.saleId);

      const sale = await Sale.findOne({ _id: saleId, business: businessId });
      if (!sale)
        throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

      for (const ret of input.returns) {
        const returnable = await Returnable.findOne({
          _id: new Types.ObjectId(ret.returnableId),
          business: businessId,
        });

        if (!returnable)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Returnable not found",
          });
        if (ret.quantity > returnable.totalPendingReturns) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot return more than pending: ${returnable.name}`,
          });
        }

        returnable.totalPendingReturns -= ret.quantity;
        returnable.totalEmpty += ret.quantity;
        await returnable.save();

        // Update per-sale tracking
        await ReturnableTransaction.updateMany(
          {
            sale: sale._id,
            returnableGroup: returnable._id,
            business: businessId,
          },
          { $inc: { quantityReturned: ret.quantity } }
        );
      }

      return { success: true, message: "Returnables recorded successfully" };
    }),

  // ==================== GET SALE WITH FULL DETAILS ====================
  getSaleById: protectedProcedure
    .input(z.object({ saleId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.business)
        throw new TRPCError({ code: "BAD_REQUEST", message: "No business" });

      const sale = await Sale.findOne({
        _id: new Types.ObjectId(input.saleId),
        business: new Types.ObjectId(ctx.user.business),
      }).populate("customer issuedBy store");

      if (!sale)
        throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

      const items = await Transaction.find({
        sale: sale._id,
        transactionType: "OUT",
      }).populate("product");

      const payments = await Payment.find({ sale: sale._id }).populate(
        "receivedBy paymentAccount"
      );

      const pendingReturnables = await Returnable.find({
        business: new Types.ObjectId(ctx.user.business),
        totalPendingReturns: { $gt: 0 },
      });

      return {
        success: true,
        sale,
        items,
        payments,
        balanceDue: sale.totalAmount - sale.totalAmountPaid,
        pendingReturnables,
      };
    }),

  // ==================== GET ALL SALES ====================
  getSales: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.business)
      throw new TRPCError({ code: "BAD_REQUEST", message: "No business" });

    const sales = await Sale.find({
      business: new Types.ObjectId(ctx.user.business),
    })
      .populate("customer", "name phone")
      .populate("issuedBy", "firstName lastName")
      .populate("store", "storeName")
      .sort({ createdAt: -1 });

    return { success: true, sales };
  }),
});
