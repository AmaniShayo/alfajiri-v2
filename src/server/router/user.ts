import jwt from "jsonwebtoken";
import {
  router,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { User, Permission, Business } from "../database/schema";
import {
  GetSalt,
  GetHashedPassword,
  ValidatePassword,
  generateOTP,
  getToken,
  sendVerificationEmail,
  sendInvitationEmail,
  sendPasswordResetEmail,
  validatePhoneNumber,
} from "../utils";
import validator from "validator";
import { APP_TOKEN } from "../config";
import { IUserAuth } from "../database/model";

const userAuthSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.email(),
});

const updateUserSchema = z.object({
  _id: z.string().min(1),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().min(10).optional(),
  email: z.email().optional(),
  role: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export const userRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.email(),
        phoneNumber: z.string().min(10),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { email, phoneNumber, password } = input;

      if (!validator.isEmail(email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email address",
        });
      }

      if (!validatePhoneNumber(phoneNumber)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid phone number",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists with this email",
        });
      }

      const otp = generateOTP(6);
      const salt = await GetSalt();
      const hashedPassword = await GetHashedPassword(password, salt);

      const newUser = new User({
        ...input,
        role: "owner",
        salt,
        otp,
        isVerified: false,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      const permission = new Permission({ user: savedUser._id });
      await permission.save();

      const token = getToken({
        _id: savedUser._id.toHexString(),
        role: savedUser.role,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        phoneNumber: savedUser.phoneNumber,
        email: savedUser.email,
        isVerified: savedUser.isVerified,
        purpose: "verify_email",
      });

      await sendVerificationEmail(savedUser.email, otp);
      const res = {
        success: true,
        token,
        user: {
          _id: savedUser._id.toString(),
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          phoneNumber: savedUser.phoneNumber,
          role: savedUser.role,
          isVerified: savedUser.isVerified,
        },
        message: "User created successfully",
      };
      return res;
    }),

  login: publicProcedure.input(userAuthSchema).mutation(async ({ input }) => {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const valid = await ValidatePassword(
      input.password,
      user.password,
      user.salt
    );
    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password",
      });
    }

    const token = getToken({
      _id: user._id.toHexString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      business: user.business ? user.business.toHexString() : undefined,
      email: user.email,
      isVerified: user.isVerified,
      purpose: "login",
    });
    return { success: true, token, user, message: "Login successful" };
  }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        otp: z.string().min(1),
        token: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, APP_TOKEN) as IUserAuth;

        if (!decoded) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const user = await User.findById(decoded._id);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (input.otp !== user.otp) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid OTP code",
          });
        }

        user.isVerified = true;
        await user.save();

        return { success: true, message: "Email verified successfully" };
      } catch (error) {
        console.error("Error verifying token:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }
    }),

  resendVerificationEmail: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const user = await User.findById(input.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const otp = generateOTP(6);
      user.otp = otp;
      await user.save();

      await sendVerificationEmail(user.email, otp);

      return {
        success: true,
        message: "Verification email resent successfully",
      };
    }),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const otp = generateOTP(6);
      user.password = await GetHashedPassword(otp, user.salt);
      await user.save();

      await sendPasswordResetEmail(input.email, otp);

      return {
        success: true,
        message:
          "Password reset OTP sent to your email, use it to login and change your password",
      };
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await User.findById(ctx.user._id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const valid = await ValidatePassword(
        input.oldPassword,
        user.password,
        user.salt
      );
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid old password",
        });
      }

      user.password = await GetHashedPassword(input.newPassword, user.salt);
      await user.save();

      return { success: true, message: "Password changed successfully" };
    }),

  updateProfile: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await User.findByIdAndUpdate(ctx.user._id, input, {
        new: true,
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { success: true, user, message: "Profile updated successfully" };
    }),

  addCollaborator: adminProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phoneNumber: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const userPermissions = await Permission.findOne({ user: ctx.user._id });
      if (!userPermissions || !userPermissions.collaborator) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: Collaborator permission required",
        });
      }

      const { email, phoneNumber } = input;

      if (!validator.isEmail(email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email address",
        });
      }

      if (!validatePhoneNumber(phoneNumber)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid phone number",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists with this email",
        });
      }

      const salt = await GetSalt();
      const password = generateOTP(6);
      const hashedPassword = await GetHashedPassword(password, salt);
      const admin = await User.findById(ctx.user._id);
      if (!admin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Admin user not found",
        });
      }

      const newUser = new User({
        ...input,
        password: hashedPassword,
        salt,
        business: admin.business,
        role: "collaborator",
        isVerified: true,
        verificationToken: generateOTP(6),
      });

      const savedUser = await newUser.save();
      const permission = new Permission({ user: savedUser._id });
      await permission.save();

      const business = await Business.findById(admin.business);
      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business not found",
        });
      }

      await sendInvitationEmail(
        savedUser.email,
        password,
        business.businessName
      );

      return {
        success: true,
        user: savedUser,
        message: "Collaborator added successfully",
      };
    }),

  verifyCollaborator: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let decoded: any;
      try {
        decoded = jwt.verify(input.token, process.env.APP_TOKEN || "");
      } catch (error) {
        console.error("Token verification failed:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });
      }

      const collaborator = await User.findById(decoded.userId);
      if (!collaborator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      collaborator.isVerified = true;
      await collaborator.save();

      const sessionToken = getToken({
        _id: collaborator._id.toHexString(),
        role: collaborator.role,
        firstName: collaborator.firstName,
        lastName: collaborator.lastName,
        phoneNumber: collaborator.phoneNumber,
        business: collaborator.business
          ? collaborator.business.toHexString()
          : undefined,
        email: collaborator.email,
        isVerified: collaborator.isVerified,
        purpose: "login",
      });
      return {
        success: true,
        sessionToken,
        user: collaborator,
        message: "Collaborator verified successfully",
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await User.findById(ctx.user._id)
      .select(
        "_id firstName lastName phoneNumber email role isVerified createdAt updatedAt business"
      )
      .populate("business")
      .select("-password -salt -otp -owner -productKey");

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const permission = await Permission.findOne({ user: user._id });
    return { ...user.toObject(), permission };
  }),

  users: protectedProcedure.query(async () => {
    const users = await User.find({}).select(
      "_id firstName lastName phoneNumber email role isVerified createdAt updatedAt"
    );

    if (!users || users.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No users found",
      });
    }

    return users;
  }),

  user: protectedProcedure
    .input(z.object({ _id: z.string().min(1) }))
    .query(async ({ input }) => {
      const user = await User.findById(input._id).select(
        "_id firstName lastName phoneNumber email role isVerified createdAt updatedAt"
      );

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const permission = await Permission.findOne({ user: user._id });
      return { ...user.toObject(), permission };
    }),

  switchBusiness: protectedProcedure
    .input(z.object({ businessId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const business = await Business.findById(input.businessId);
      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business not found",
        });
      }

      await User.findByIdAndUpdate(ctx.user._id, {
        business: business._id,
      }).exec();

      return {
        success: true,
        message: "Switched business successfully",
        business,
      };
    }),
});
