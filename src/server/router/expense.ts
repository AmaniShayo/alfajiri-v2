import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Expense } from "../database/schema";
import { Types } from "mongoose";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfYear,
  subMonths,
} from "date-fns";

const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  category: z.enum([
    "Transport & Fuel",
    "Staff Food",
    "Professional Fees",
    "Phone & Internet",
    "Rent",
    "Salaries",
    "Taxes & Licenses",
    "Insurance",
    "Office Supplies",
    "Marketing",
    "Repairs",
    "Bank Charges",
    "Utilities",
    "Other",
  ]),
  store: z.string().optional(),
  attachment: z.string().optional(),
  remarks: z.string().optional(),
});

const updateExpenseSchema = z.object({
  expenseId: z.string().min(1, "Expense ID is required"),
  amount: z.number().positive("Amount must be positive").optional(),
  description: z.string().optional(),
  category: z
    .enum([
      "Transport & Fuel",
      "Staff Food",
      "Professional Fees",
      "Phone & Internet",
      "Rent",
      "Salaries",
      "Taxes & Licenses",
      "Insurance",
      "Office Supplies",
      "Marketing",
      "Repairs",
      "Bank Charges",
      "Utilities",
      "Other",
    ])
    .optional(),
  store: z.string().optional(),
  attachment: z.string().optional(),
  remarks: z.string().optional(),
});

export const expenseRouter = router({
  createExpense: protectedProcedure
    .input(createExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const expense = new Expense({
        ...input,
        business: new Types.ObjectId(ctx.user.business),
        issuedBy: new Types.ObjectId(ctx.user._id),
        store: input.store ? new Types.ObjectId(input.store) : undefined,
      });

      await expense.save();

      return {
        success: true,
        message: "Expense created successfully",
        expense,
      };
    }),

  updateExpense: protectedProcedure
    .input(updateExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const { expenseId, ...updates } = input;

      const expense = await Expense.findOne({
        _id: new Types.ObjectId(expenseId),
        business: new Types.ObjectId(ctx.user.business),
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found or does not belong to your business",
        });
      }

      if (updates.amount !== undefined) expense.amount = updates.amount;
      if (updates.description !== undefined)
        expense.description = updates.description;
      if (updates.category !== undefined) expense.category = updates.category;
      if (updates.store !== undefined)
        expense.store = updates.store
          ? new Types.ObjectId(updates.store)
          : undefined;
      if (updates.attachment !== undefined)
        expense.attachment = updates.attachment;
      if (updates.remarks !== undefined) expense.remarks = updates.remarks;

      await expense.save();

      return {
        success: true,
        message: "Expense updated successfully",
        expense,
      };
    }),

  getMyExpenses: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          category: z.string().optional(),
          period: z.enum(["week", "month", "3months", "year"]).optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          page: z.number().int().min(1).optional().default(1),
          limit: z.number().int().min(1).max(100).optional().default(20),
        })
        .optional()
    )
    .query(async ({ input = {}, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const {
        search,
        category,
        period,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
      } = input;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {
        business: new Types.ObjectId(ctx.user.business),
      };

      if (search) {
        query.$or = [
          { description: { $regex: search, $options: "i" } },
          { remarks: { $regex: search, $options: "i" } },
        ];
      }

      if (category) {
        query.category = category;
      }

      // Date filtering
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (dateFrom) {
        startDate = new Date(dateFrom);
      }
      if (dateTo) {
        endDate = new Date(dateTo);
      }

      if (period) {
        const now = new Date();
        switch (period) {
          case "week":
            startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
            endDate = endOfWeek(now, { weekStartsOn: 1 });
            break;
          case "month":
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
          case "3months":
            startDate = startOfMonth(subMonths(now, 2));
            endDate = endOfMonth(now);
            break;
          case "year":
            startDate = startOfYear(now);
            endDate = endOfYear(now);
            break;
        }
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      const skip = (page - 1) * limit;

      const expenses = await Expense.find(query)
        .populate("issuedBy", "name")
        .populate("store", "storeName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const totalCount = await Expense.countDocuments(query);

      // Calculate totals
      const allExpenses = await Expense.find(query).lean().exec();
      const totalSum = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categorySums: Record<string, number> = {};
      allExpenses.forEach((exp) => {
        categorySums[exp.category] =
          (categorySums[exp.category] || 0) + exp.amount;
      });

      return {
        success: true,
        expenses,
        totals: {
          totalSum,
          categorySums,
        },
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      };
    }),

  getExpenseById: protectedProcedure
    .input(z.object({ expenseId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const expense = await Expense.findOne({
        _id: new Types.ObjectId(input.expenseId),
        business: new Types.ObjectId(ctx.user.business),
      })
        .populate("issuedBy", "name")
        .populate("store", "storeName")
        .lean();

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found or does not belong to your business",
        });
      }

      return {
        success: true,
        expense,
      };
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ expenseId: z.string().min(1, "Expense ID is required") }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const expense = await Expense.findOne({
        _id: new Types.ObjectId(input.expenseId),
        business: new Types.ObjectId(ctx.user.business),
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found or does not belong to your business",
        });
      }

      await expense.deleteOne();

      return {
        success: true,
        message: "Expense deleted successfully",
        expenseId: input.expenseId,
      };
    }),

  // lightweight version useful for dropdowns/autocomplete
  getExpenseOptions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.business) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has no associated business",
      });
    }

    const expenses = await Expense.find({ business: ctx.user.business })
      .select("description amount category")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      options: expenses,
    };
  }),
});
