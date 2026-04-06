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

import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons"

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
})

function ChangePasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  })

  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: (data) => {
      setLoading(false)
      form.reset()
      toast.success("Password changed successfully!", {
        description: data.message || "Your password has been updated.",
      })
      router.back()
    },
    onError: (error) => {
      setLoading(false)
      toast.error("Password change failed", {
        description: error.message,
      })
    },
  })

  function onSubmit(data: z.infer<typeof ChangePasswordSchema>) {
    setLoading(true)
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center text-sm text-blue-950 hover:underline"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-bold">Change Password</h1>
          <p className="text-sm text-gray-600">
            Enter your current and new password to update your credentials.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="oldPassword" className="text-sm font-medium">
            Current Password
          </label>
          <div className="relative">
            <Input
              id="oldPassword"
              type={showOldPassword ? "text" : "password"}
              placeholder="Enter current password"
              className="pr-10"
              {...form.register("oldPassword")}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showOldPassword ? EyeOff : EyeIcon}
                size={20}
              />
            </button>
          </div>
          {form.formState.errors.oldPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.oldPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="pr-10"
              {...form.register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showNewPassword ? EyeOff : EyeIcon}
                size={20}
              />
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-yellow-600 hover:bg-yellow-600/90"
          disabled={loading}
        >
          {loading ? <Spinner /> : "Change Password"}
        </Button>
      </form>
    </div>
  )
}

export default ChangePasswordForm
