"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useState, useEffect } from "react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

const OTPSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
})

type OTPFormData = z.infer<typeof OTPSchema>

const RESEND_COUNTDOWN = 3 * 60 // 3 minutes

export default function VerifyOTPForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [isChecking, setIsChecking] = useState(true)

  const form = useForm<OTPFormData>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: "" },
  })

  const otpValue = useWatch({
    control: form.control,
    name: "otp",
    defaultValue: "",
  })

  const tempEmail =
    typeof window !== "undefined" ? localStorage.getItem("tempEmail") : null
  const tempToken =
    typeof window !== "undefined" ? localStorage.getItem("tempToken") : null
  const tempId =
    typeof window !== "undefined" ? localStorage.getItem("tempId") : null

  // Session validation
  useEffect(() => {
    if (!tempEmail || !tempToken || !tempId) {
      toast.error("Session expired", {
        description: "Please register again.",
      })
      localStorage.removeItem("tempEmail")
      localStorage.removeItem("tempToken")
      localStorage.removeItem("tempId")
      router.replace("/register")
    } else {
      const timer = setTimeout(() => setIsChecking(false), 10)
      return () => clearTimeout(timer)
    }
  }, [tempEmail, tempToken, tempId, router])

  // Load saved resend countdown
  useEffect(() => {
    const saved = localStorage.getItem("otpResendCountdown")
    if (!saved) return

    try {
      const { timestamp } = JSON.parse(saved)
      const elapsed = Math.floor((Date.now() - timestamp) / 1000)
      const remaining = RESEND_COUNTDOWN - elapsed

      if (remaining > 0) {
        // Use setTimeout to avoid direct setState in effect
        const timer = setTimeout(() => setResendCountdown(remaining), 0)
        return () => clearTimeout(timer)
      } else {
        localStorage.removeItem("otpResendCountdown")
      }
    } catch (e) {
      console.log(e)

      localStorage.removeItem("otpResendCountdown")
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("otpResendCountdown")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCountdown])

  const verifyMutation = trpc.user.verifyEmail.useMutation({
    onSuccess: () => {
      toast.success("Email verified!", {
        description: "Your account is now active. Please log in to continue.",
      })
      localStorage.removeItem("tempEmail")
      localStorage.removeItem("tempToken")
      localStorage.removeItem("tempId")
      localStorage.removeItem("otpResendCountdown")
      router.push("/login")
    },
    onError: (error) => {
      toast.error("Verification failed", {
        description: error.message || "Invalid or expired code.",
      })
      form.reset()
    },
    onSettled: () => setLoading(false),
  })

  const resendMutation = trpc.user.resendVerificationEmail.useMutation({
    onSuccess: () => {
      toast.success("OTP sent!", {
        description: "Check your email for the new code.",
      })
      setResendCountdown(RESEND_COUNTDOWN)
      localStorage.setItem(
        "otpResendCountdown",
        JSON.stringify({ timestamp: Date.now() })
      )
    },
    onError: () => {
      toast.error("Failed to resend", {
        description: "Please try again later.",
      })
    },
  })

  const onSubmit = (data: OTPFormData) => {
    if (!tempToken) return
    setLoading(true)
    verifyMutation.mutate({ otp: data.otp, token: tempToken })
  }

  const handleResend = () => {
    if (!tempId) return
    resendMutation.mutate({ id: tempId })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isChecking) {
    return (
      <div className="mx-auto flex w-full max-w-md justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!tempEmail || !tempToken || !tempId) {
    return null
  }

  const isResendDisabled =
    resendCountdown > 0 || resendMutation.isPending || loading

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Verify Your Email</h1>
        <p className="mt-2 text-sm text-gray-600">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-primary">{tempEmail}</span>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-center text-sm font-medium">
            Enter Verification Code
          </label>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => {
                form.setValue("otp", value, { shouldValidate: true })
              }}
              disabled={loading}
              autoFocus
            >
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

          {form.formState.errors.otp && (
            <p className="text-center text-sm text-destructive">
              {form.formState.errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={loading || verifyMutation.isPending}
        >
          {loading ? <Spinner /> : "Verify Email"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResendDisabled}
            className={`font-medium transition-colors ${
              isResendDisabled
                ? "cursor-not-allowed text-gray-400"
                : "text-blue-950 hover:text-blue-800"
            }`}
          >
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
  )
}
