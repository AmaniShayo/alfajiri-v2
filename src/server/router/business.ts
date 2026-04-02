import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Business, ProductKey, User } from "../database/schema";
import { Types } from "mongoose";

const createBusinessSchema = z.object({
  key: z.string().trim().min(1, "Product key is required"),
  businessName: z.string().min(1, "Business name is required"),
  currency: z.string().min(1, "Currency is required"),
  address: z.string().min(1, "Address is required"),
  TINNumber: z.string().optional(),
  about: z.string().optional(),
});

const updateBusinessSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  businessName: z.string().min(1).optional(),
  currency: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  TINNumber: z.string().optional(),
  about: z.string().optional(),
});

export const businessRouter = router({
  createBusiness: protectedProcedure
    .input(createBusinessSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const productKey = await ProductKey.findOne({ key: input.key }).exec();

      if (!productKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid product key",
        });
      }

      if (productKey.status !== "unused") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product key is already used",
        });
      }

      if (productKey.expiresAt && productKey.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product key has expired",
        });
      }

      const newBusiness = new Business({
        businessName: input.businessName,
        TINNumber: input.TINNumber,
        owner: new Types.ObjectId(ctx.user._id),
        about: input.about,
        currency: input.currency,
        address: input.address,
        productKey: productKey._id,
      });

      await newBusiness.save();

      productKey.status = "redeemed";
      productKey.redeemedBy = new Types.ObjectId(ctx.user._id);
      productKey.redeemedForBusiness = newBusiness._id;
      productKey.redeemedAt = new Date();
      await productKey.save();

      await User.findByIdAndUpdate(ctx.user._id, {
        business: newBusiness._id,
      }).exec();

      const populatedBusiness = await Business.findById(newBusiness._id)
        .populate("productKey", "key generatedAt notes")
        .exec();

      return {
        success: true,
        message: "Business created successfully with product key",
        business: populatedBusiness,
      };
    }),

  updateBusiness: protectedProcedure
    .input(updateBusinessSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { businessId, ...updates } = input;

      const business = await Business.findOne({
        _id: new Types.ObjectId(businessId),
        owner: new Types.ObjectId(ctx.user._id),
      }).exec();

      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business not found or you do not own it",
        });
      }

      if (updates.businessName) business.businessName = updates.businessName;
      if (updates.TINNumber !== undefined)
        business.TINNumber = updates.TINNumber;
      if (updates.about) business.about = updates.about;
      if (updates.currency) business.currency = updates.currency;
      if (updates.address) business.address = updates.address;

      await business.save();

      const populatedBusiness = await Business.findById(business._id)
        .populate("productKey", "key generatedAt notes")
        .exec();

      return {
        success: true,
        message: "Business updated successfully",
        business: populatedBusiness,
      };
    }),
  getMyBusinesses: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const businesses = await Business.find({
      owner: new Types.ObjectId(ctx.user._id),
    })
      .populate("productKey", "key generatedAt notes")
      .sort({ createdAt: -1 })
      .exec();
    const businessesList = businesses as unknown as Array<{
      _id: string;
      businessName: string;
      TINNumber?: string;
      owner: string;
      about?: string;
      currency: string;
      address: string;
      productKey: {
        _id: string;
        key: string;
        generatedAt: Date;
        notes?: string;
      };
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    return {
      success: true,
      businesses: businessesList,
    };
  }),
});
