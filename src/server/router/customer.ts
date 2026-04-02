import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Customer } from "../database/schema";
import { Types } from "mongoose";

const createCustomerSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  emailAddress: z.email("Invalid email format").optional(),
});

const updateCustomerSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  customerName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  emailAddress: z.email("Invalid email format").optional().nullable(),
});

export const customerRouter = router({
  createCustomer: protectedProcedure
    .input(createCustomerSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const existing = await Customer.findOne({
        business: new Types.ObjectId(ctx.user.business),
        phoneNumber: input.phoneNumber,
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "A customer with this phone number already exists in your business",
        });
      }

      const customer = new Customer({
        ...input,
        business: new Types.ObjectId(ctx.user.business),
      });

      await customer.save();

      return {
        success: true,
        message: "Customer created successfully",
        customer,
      };
    }),

  updateCustomer: protectedProcedure
    .input(updateCustomerSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const { customerId, ...updates } = input;

      const customer = await Customer.findOne({
        _id: new Types.ObjectId(customerId),
        business: new Types.ObjectId(ctx.user.business),
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found or does not belong to your business",
        });
      }

      if (updates.customerName !== undefined)
        customer.customerName = updates.customerName;
      if (updates.address !== undefined) customer.address = updates.address;
      if (updates.phoneNumber !== undefined)
        customer.phoneNumber = updates.phoneNumber;
      if (updates.emailAddress !== undefined) {
        customer.emailAddress = updates.emailAddress ?? undefined;
      }

      await customer.save();

      return {
        success: true,
        message: "Customer updated successfully",
        customer,
      };
    }),

  getMyCustomers: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
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

      const { search, page = 1, limit = 20 } = input;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {
        business: new Types.ObjectId(ctx.user.business),
      };

      if (search) {
        query.$or = [
          { customerName: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
          { emailAddress: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const customers = await Customer.find(query)
        .sort({ customerName: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const total = await Customer.countDocuments(query);

      return {
        success: true,
        customers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }),

  getCustomerById: protectedProcedure
    .input(z.object({ customerId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const customer = await Customer.findOne({
        _id: new Types.ObjectId(input.customerId),
        business: new Types.ObjectId(ctx.user.business),
      }).lean();

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found or does not belong to your business",
        });
      }

      return {
        success: true,
        customer,
      };
    }),

  deleteCustomer: protectedProcedure
    .input(
      z.object({ customerId: z.string().min(1, "Customer ID is required") })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.business) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no associated business",
        });
      }

      const customer = await Customer.findOne({
        _id: new Types.ObjectId(input.customerId),
        business: new Types.ObjectId(ctx.user.business),
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found or does not belong to your business",
        });
      }

      // Optional: add check if customer has any sales/quotations
      // await checkIfCustomerHasTransactions(input.customerId);

      await customer.deleteOne();

      return {
        success: true,
        message: "Customer deleted successfully",
        customerId: input.customerId,
      };
    }),

  // lightweight version useful for dropdowns/autocomplete
  getCustomerOptions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.business) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has no associated business",
      });
    }

    const customers = await Customer.find({ business: ctx.user.business })
      .select("customerName phoneNumber emailAddress address")
      .sort({ customerName: 1 })
      .lean();

    return {
      success: true,
      options: customers,
    };
  }),
});
