"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"

const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
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
  })

type RegisterFormData = z.infer<typeof RegisterSchema>

function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
  })

  const signupMutation = trpc.user.signup.useMutation({
    onSuccess: (data) => {
      form.reset()
      toast.success("Welcome aboard!", {
        description:
          "Your account has been created. Check your email for the verification code.",
      })

      localStorage.setItem("tempEmail", data.user.email)
      localStorage.setItem("tempToken", data.token)
      localStorage.setItem("tempId", data.user._id)

      router.push(`/verify-email`)
    },
    onError: (error) => {
      toast.error("Registration failed", {
        description:
          error.message || "Please check your details and try again.",
      })
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setLoading(true)
    signupMutation.mutate({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      phoneNumber: data.phoneNumber.replace(/\D/g, ""),
      password: data.password,
    })
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us and get started in minutes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              placeholder="John"
              autoComplete="given-name"
              {...form.register("firstName")}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              placeholder="Doe"
              autoComplete="family-name"
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="255712345678"
            autoComplete="tel"
            {...form.register("phoneNumber")}
          />
          {form.formState.errors.phoneNumber && (
            <p className="text-sm text-destructive">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={showPassword ? EyeOff : EyeIcon} size={20} />
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="pr-10"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showConfirmPassword ? EyeOff : EyeIcon}
                size={20}
              />
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <a
            href="/login"
            className="ml-1 font-medium text-blue-950 hover:text-blue-800"
            onClick={(e) => {
              e.preventDefault()
              router.push("/login")
            }}
          >
            Sign in
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Create Account"}
        </Button>

        <p className="mt-6 text-center text-xs text-gray-500">
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
    </div>
  )
}

export default RegisterForm
