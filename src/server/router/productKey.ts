import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ProductKey } from "../database/schema";

const generateKeySchema = z.object({
  amount: z.number().int().min(1, "Amount must be at least 1"),
  keyType: z.enum(["standard", "royalty"]).default("standard"),
  expiresAt: z.date().optional(),
  notes: z.string().optional(),
  batchId: z.string().optional(),
});

const singleKeySchema = z.object({
  key: z.string().min(1),
  expiresAt: z.date().optional(),
  keyType: z.enum(["standard", "royalty"]).default("standard"),
  notes: z.string().optional(),
});

const updateKeySchema = z.object({
  keyId: z.string().min(1),
  expiresAt: z.date().optional(),
  keyType: z.enum(["standard", "royalty"]).default("standard"),
  notes: z.string().optional(),
});

const deleteKeySchema = z.object({
  keyId: z.string().min(1),
});

const getKeySchema = z.object({
  keyId: z.string().min(1).optional(),
  status: z.enum(["unused", "redeemed"]).optional(),
  batchId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

function generateRandomKey(): string {
  const segments = 4;
  const charsPerSegment = 5;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = `ALFAJR-${new Date().getFullYear()}`;

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < charsPerSegment; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key += `-${segment}`;
  }

  return key;
}

export const productKeyRouter = router({
  generateKeys: protectedProcedure
    .input(generateKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "owner") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only owners can generate product keys",
        });
      }

      const keys = [];
      const batchId = input.batchId || `batch-${Date.now()}`;

      for (let i = 0; i < input.amount; i++) {
        let keyString: string;
        let exists = true;

        do {
          keyString = generateRandomKey();
          const found = await ProductKey.findOne({ key: keyString }).lean();
          exists = !!found;
        } while (exists);

        const newKey = new ProductKey({
          key: keyString,
          status: "unused",
          generatedAt: new Date(),
          expiresAt: input.expiresAt || null,
          keyType: input.keyType,
          notes: input.notes || `Generated batch of ${input.amount}`,
          batchId,
        });

        await newKey.save();
        keys.push(newKey);
      }

      return {
        success: true,
        message: `Successfully generated ${input.amount} product key(s)`,
        keys,
        batchId,
      };
    }),

  generateSingleKey: protectedProcedure
    .input(singleKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "owner") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let keyString = input.key;
      if (!keyString) {
        keyString = generateRandomKey();
      }

      const exists = await ProductKey.findOne({ key: keyString });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This key already exists",
        });
      }

      const newKey = new ProductKey({
        key: keyString,
        status: "unused",
        expiresAt: input.expiresAt || null,
        generatedAt: new Date(),
        keyType: input.keyType,
        notes: input.notes || "Manually generated single key",
      });

      await newKey.save();

      return {
        success: true,
        message: "Product key generated successfully",
        key: newKey,
      };
    }),

  getKeys: protectedProcedure
    .input(getKeySchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "owner") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = {};
      if (input.status) filter.status = input.status;
      if (input.batchId) filter.batchId = input.batchId;

      const skip = (input.page - 1) * input.limit;

      const [keys, total] = await Promise.all([
        ProductKey.find(filter)
          .sort({ generatedAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .populate("redeemedBy", "firstName lastName email")
          .populate("redeemedForBusiness", "businessName")
          .lean(),
        ProductKey.countDocuments(filter),
      ]);

      return {
        success: true,
        keys,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  updateKey: protectedProcedure
    .input(updateKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "owner") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const key = await ProductKey.findById(input.keyId);
      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product key not found",
        });
      }

      if (input.expiresAt !== undefined) key.expiresAt = input.expiresAt;
      if (input.notes !== undefined) key.notes = input.notes;
      if (input.keyType !== undefined) key.keyType = input.keyType;

      await key.save();

      return {
        success: true,
        message: "Product key updated successfully",
        key,
      };
    }),

  deleteKey: protectedProcedure
    .input(deleteKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "owner") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const key = await ProductKey.findById(input.keyId);
      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product key not found",
        });
      }

      if (key.status === "redeemed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a redeemed product key",
        });
      }

      await ProductKey.deleteOne({ _id: input.keyId });

      return {
        success: true,
        message: "Product key deleted successfully",
      };
    }),
});
