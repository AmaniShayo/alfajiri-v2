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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { icons } from "@/constants/icons";

const OTPSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

type OTPFormData = z.infer<typeof OTPSchema>;

const RESEND_COUNTDOWN = 3 * 60;

export default function VerifyOTPForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const tempEmail =
    typeof window !== "undefined" ? localStorage.getItem("tempEmail") : null;
  const tempToken =
    typeof window !== "undefined" ? localStorage.getItem("tempToken") : null;
  const tempId =
    typeof window !== "undefined" ? localStorage.getItem("tempId") : null;

  useEffect(() => {
    const email = localStorage.getItem("tempEmail");
    const token = localStorage.getItem("tempToken");
    const id = localStorage.getItem("tempId");

    if (!email || !token || !id) {
      toast.error("Session expired", {
        description: "Please register again.",
      });
      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempToken");
      localStorage.removeItem("tempId");
      router.replace("/register");
    }
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("otpResendCountdown");
    if (saved) {
      const { timestamp } = JSON.parse(saved);
      const elapsed = Math.floor((Date.now() - timestamp) / 1000);
      const remaining = RESEND_COUNTDOWN - elapsed;

      if (remaining > 0) {
        setResendCountdown(remaining);
      } else {
        localStorage.removeItem("otpResendCountdown");
      }
    }
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("otpResendCountdown");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: "" },
  });

  const verifyMutation = trpc.user.verifyEmail.useMutation({
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success("Email verified!", {
        description: "Your account is now active. Please log in to continue.",
      });

      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempToken");
      localStorage.removeItem("tempId");
      localStorage.removeItem("otpResendCountdown");

      router.push("/login");
    },
    onError: (error) => {
      toast.error("Verification failed", {
        description: error.message || "Invalid or expired code.",
      });
      form.reset();
    },
    onSettled: () => setLoading(false),
  });

  const resendMutation = trpc.user.resendVerificationEmail.useMutation({
    onSuccess: () => {
      toast.success("OTP sent!", {
        description: "Check your email for the new code.",
      });

      setResendCountdown(RESEND_COUNTDOWN);
      localStorage.setItem(
        "otpResendCountdown",
        JSON.stringify({ timestamp: Date.now() })
      );
    },
    onError: () => {
      toast.error("Failed to resend", {
        description: "Please try again later.",
      });
    },
  });

  const onSubmit = (data: OTPFormData) => {
    verifyMutation.mutate({ otp: data.otp, token: tempToken! });
  };

  const handleResend = () => {
    if (!tempId) return;
    resendMutation.mutate({ id: tempId });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!tempEmail || !tempToken || !tempId) {
    return null;
  }

  const isResendDisabled =
    resendCountdown > 0 || resendMutation.isPending || loading;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Verify Your Email
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We sent a 6-digit code to{" "}
          <span className="text-primary font-bold">{tempEmail}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center block">
                  Enter Verification Code
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      {...field}
                      disabled={loading}
                      autoFocus>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading || verifyMutation.isPending}
            className="w-full h-11 bg-yellow-600 hover:bg-yellow-600/90 text-white font-medium transition-all">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="stroke-white animate-spin">{icons.loading}</div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResendDisabled}
            className={`
              font-medium transition-colors
              ${
                isResendDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-500"
              }
            `}>
            {resendMutation.isPending
              ? "Sending..."
              : resendCountdown > 0
                ? `Resend in ${formatTime(resendCountdown)}`
                : "Resend OTP"}
          </button>
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        Check your spam folder if you don’t see the email.
      </p>
    </div>
  );
}
