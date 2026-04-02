import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Product } from "../database/schema";
import { Types } from "mongoose";

const createProductSchema = z.object({
  supplier: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  category: z.string().optional(),
  store: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  buyingPrice: z.number().positive("Buying price must be positive"),
  initialQuantity: z.number().int().min(0),
  lowInStockLimit: z.number().int().min(0),
  measurementUnit: z.string().min(1, "Measurement unit is required"),
  returnableGroup: z.string().optional(),
});

const updateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  supplier: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  category: z.string().optional(),
  store: z.string().optional(),
  productName: z.string().optional(),
  sellingPrice: z.number().positive().optional(),
  buyingPrice: z.number().positive().optional(),
  lowInStockLimit: z.number().int().min(0).optional(),
  measurementUnit: z.string().optional(),
  returnableGroup: z.string().optional(),
});

export const productRouter = router({
  createProduct: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const product = new Product({
        ...input,
        business: new Types.ObjectId(ctx.user.business),
        availableQuantity: input.initialQuantity,
        isLowInStock: input.initialQuantity <= input.lowInStockLimit,
        supplier: input.supplier
          ? new Types.ObjectId(input.supplier)
          : undefined,
        category: input.category
          ? new Types.ObjectId(input.category)
          : undefined,
        store: input.store ? new Types.ObjectId(input.store) : undefined,
        returnableGroup: input.returnableGroup
          ? new Types.ObjectId(input.returnableGroup)
          : undefined,
      });

      await product.save();

      const populatedProduct = await Product.findById(product._id)
        .populate("supplier", "name")
        .populate("category", "name")
        .populate("store", "name")
        .populate("returnableGroup", "name")
        .exec();

      return {
        success: true,
        message: "Product created successfully",
        product: populatedProduct,
      };
    }),

  updateProduct: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const { productId, ...updates } = input;

      const product = await Product.findOne({
        _id: new Types.ObjectId(productId),
        business: new Types.ObjectId(ctx.user.business),
      }).exec();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or does not belong to your business",
        });
      }

      // Apply updates
      if (updates.supplier !== undefined)
        product.supplier = updates.supplier
          ? new Types.ObjectId(updates.supplier)
          : undefined;
      if (updates.description !== undefined)
        product.description = updates.description;
      if (updates.code !== undefined) product.code = updates.code;
      if (updates.category !== undefined)
        product.category = updates.category
          ? new Types.ObjectId(updates.category)
          : undefined;
      if (updates.store !== undefined)
        product.store = updates.store
          ? new Types.ObjectId(updates.store)
          : undefined;
      if (updates.productName) product.productName = updates.productName;
      if (updates.sellingPrice) product.sellingPrice = updates.sellingPrice;
      if (updates.buyingPrice) product.buyingPrice = updates.buyingPrice;
      if (updates.lowInStockLimit !== undefined) {
        product.lowInStockLimit = updates.lowInStockLimit;
        product.isLowInStock =
          product.availableQuantity <= updates.lowInStockLimit;
      }
      if (updates.measurementUnit)
        product.measurementUnit = updates.measurementUnit;
      if (updates.returnableGroup !== undefined)
        product.returnableGroup = updates.returnableGroup
          ? new Types.ObjectId(updates.returnableGroup)
          : undefined;

      await product.save();

      const populatedProduct = await Product.findById(product._id)
        .populate("supplier", "name")
        .populate("category", "name")
        .populate("store", "name")
        .populate("returnableGroup", "name")
        .exec();

      return {
        success: true,
        message: "Product updated successfully",
        product: populatedProduct,
      };
    }),

  getMyProducts: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.business) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has no associated business",
      });
    }

    const products = await Product.find({
      business: new Types.ObjectId(ctx.user.business),
    })
      .populate("supplier", "name")
      .populate("category", "name")
      .populate("store", "name")
      .populate("returnableGroup", "name")
      .sort({ createdAt: -1 })
      .exec();

    const productsList = products as unknown as Array<{
      _id: string;
      supplier: { _id: string; name?: string } | null;
      description?: string;
      code?: string;
      category: { _id: string; name?: string } | null;
      business: string;
      store: { _id: string; name?: string } | null;
      productName: string;
      sellingPrice: number;
      buyingPrice: number;
      initialQuantity: number;
      availableQuantity: number;
      lowInStockLimit: number;
      measurementUnit: string;
      isLowInStock: boolean;
      returnableGroup: { _id: string; name?: string } | null;
      createdAt: Date;
      updatedAt: Date;
    }>;

    return {
      success: true,
      products: productsList,
    };
  }),
  deleteProduct: protectedProcedure
    .input(z.object({ productId: z.string().min(1, "Product ID is required") }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const product = await Product.findOne({
        _id: new Types.ObjectId(input.productId),
        business: new Types.ObjectId(ctx.user.business),
      }).exec();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or does not belong to your business",
        });
      }

      await product.deleteOne();

      return {
        success: true,
        message: "Product deleted successfully",
        productId: input.productId,
      };
    }),
});
