"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"
import { useState } from "react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
})

function ForgotPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const forgotPasswordMutation = trpc.user.forgotPassword.useMutation({
    onSuccess: (data) => {
      setLoading(false)
      form.reset()
      toast.success("Password reset initiated!", {
        description: data.message || "Check your email for the reset code.",
      })
      router.push("/login")
    },
    onError: (error) => {
      setLoading(false)
      toast.error("Password reset failed", {
        description: error.message,
      })
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    forgotPasswordMutation.mutate({
      email: values.email,
    })
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Back Button */}
        <div>
          <a
            href="/login"
            className="flex items-center text-sm text-blue-950 hover:underline"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back
          </a>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-bold">Forgot Password</h1>
          <p className="text-sm text-gray-600">
            Enter your registered email address. We&apos;ll send you a code to
            reset your password.
          </p>
        </div>

        {/* Email Field */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Reset Password"}
        </Button>
      </form>
    </div>
  )
}

export default ForgotPasswordForm
