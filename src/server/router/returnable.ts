import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Returnable } from "../database/schema";
import { Types } from "mongoose";

const createReturnableSchema = z.object({
  name: z.string().min(1, "Name is required"),
  totalEmpty: z.number().int().min(0, "Total empty cannot be negative"),
  totalFilled: z.number().int().min(0, "Total filled cannot be negative"),
  priceEmpty: z.number().min(0, "Price per empty unit cannot be negative"),
  unit: z.string().min(1, "Unit is required").default("piece"),
  notes: z.string().optional().nullable(),
});

const updateReturnableSchema = z.object({
  returnableId: z.string().min(1, "Returnable ID is required"),
  name: z.string().trim().optional(),
  totalEmpty: z.number().int().min(0).optional(),
  totalFilled: z.number().int().min(0).optional(),
  priceEmpty: z.number().min(0).optional(),
  unit: z.string().trim().optional(),
  notes: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const returnableRouter = router({
  createReturnable: protectedProcedure
    .input(createReturnableSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const returnable = new Returnable({
        ...input,
        business: new Types.ObjectId(ctx.user.business),
        totalPendingReturns: 0,
      });

      await returnable.save();

      const populated = await Returnable.findById(returnable._id)
        .populate("business", "businessName")
        .lean()
        .exec();

      return {
        success: true,
        message: "Returnable group created successfully",
        returnable: populated,
      };
    }),

  updateReturnable: protectedProcedure
    .input(updateReturnableSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const { returnableId, ...updates } = input;

      const returnable = await Returnable.findOne({
        _id: new Types.ObjectId(returnableId),
        business: new Types.ObjectId(ctx.user.business),
      });

      if (!returnable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Returnable not found or does not belong to your business",
        });
      }

      Object.assign(returnable, updates);

      await returnable.save();

      const updated = await Returnable.findById(returnable._id)
        .populate("business", "businessName")
        .lean()
        .exec();

      return {
        success: true,
        message: "Returnable updated successfully",
        returnable: updated,
      };
    }),

  getMyReturnables: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.business) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has no associated business",
      });
    }

    const returnables = await Returnable.find({
      business: new Types.ObjectId(ctx.user.business),
    });

    return {
      success: true,
      returnables,
    };
  }),

  getReturnableById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No business found",
        });
      }

      const returnable = await Returnable.findOne({
        _id: new Types.ObjectId(input.id),
        business: new Types.ObjectId(ctx.user.business),
      })
        .populate("business", "businessName")
        .lean()
        .exec();

      if (!returnable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Returnable not found or access denied",
        });
      }

      return {
        success: true,
        returnable,
      };
    }),

  deleteReturnable: protectedProcedure
    .input(z.object({ returnableId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const returnable = await Returnable.findOne({
        _id: new Types.ObjectId(input.returnableId),
        business: new Types.ObjectId(ctx.user.business),
      });

      if (!returnable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Returnable not found or does not belong to your business",
        });
      }

      if (returnable.totalPendingReturns > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete returnable with pending returns",
        });
      }

      await returnable.deleteOne();

      return {
        success: true,
        message: "Returnable deleted successfully",
        returnableId: input.returnableId,
      };
    }),
});
