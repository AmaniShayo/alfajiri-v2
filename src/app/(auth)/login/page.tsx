"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import useAuth from "@/context/authContext"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"

const LoginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginFormValues = z.infer<typeof LoginSchema>

function LoginForm() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const loginMutation = trpc.user.login.useMutation({
    onSuccess: (data) => {
      login(data.token!)
      setLoading(false)
      form.reset()
      toast.success("Login successful!", {
        description: data.message || "Welcome back!",
      })
    },
    onError: (error) => {
      setLoading(false)
      toast.error("Login failed", {
        description: error.message,
      })
    },
  })

  function onSubmit(data: LoginFormValues) {
    setLoading(true)
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    })
  }

  return (
    <div className="w-full max-w-110">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="font-heading text-4xl font-bold">Login</h1>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
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
              placeholder="Enter your password"
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

        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-blue-950 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Login"}
        </Button>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-blue-950 underline hover:text-blue-800"
          >
            Sign Up
          </a>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
