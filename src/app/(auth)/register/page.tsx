"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { icons } from "@/constants/icons";

const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.email({ message: "Please enter a valid email address." }),
    phoneNumber: z
      .string()
      .regex(/^\d{10,15}$/, { message: "Phone number must be 10-15 digits." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = trpc.user.signup.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      console.log("Registration successful:", data);

      form.reset();
      toast.success("Welcome aboard!", {
        description:
          "Your account has been created. Check your email for the verification code.",
      });

      localStorage.setItem("tempEmail", data.user.email);
      localStorage.setItem("tempToken", data.token);
      localStorage.setItem("tempId", data.user._id);

      router.push(`/verify-email`);
    },
    onError: (error) => {
      toast.error("Registration failed", {
        description:
          error.message || "Please check your details and try again.",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    signupMutation.mutate({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      phoneNumber: data.phoneNumber.replace(/\D/g, ""), // Remove non-digits
      password: data.password,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Create an Account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Join us and get started in minutes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John"
                      autoComplete="given-name"
                      disabled={loading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Doe"
                      autoComplete="family-name"
                      disabled={loading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="255712345678"
                    autoComplete="tel"
                    disabled={loading}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }>
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <a
              href="/login"
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}>
              Sign in
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading || signupMutation.isPending}
            className="w-full h-11 bg-yellow-600 hover:bg-yellow-600/90 text-white font-medium transition-all">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="stroke-white animate-spin">{icons.loading}</div>
                <span>Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-center text-xs text-gray-500 mt-6">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-700">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </Form>
    </div>
  );
}

export default RegisterForm;
