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
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { icons } from "@/constants/icons";

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
});

function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: (data) => {
      setLoading(false);
      form.reset();
      toast.success("Password changed successfully!", {
        description: `${data.message}!`,
      });
      router.back();
    },
    onError: (error) => {
      setLoading(false);
      toast.error("Password change failed", {
        description: error.message,
      });
    },
  });

  function onSubmit(data: z.infer<typeof ChangePasswordSchema>) {
    setLoading(true);
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  }

  return (
    <div className="max-w-110 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div
            className="flex hover:text-blue-500 w-fit"
            onClick={() => {
              router.back();
            }}>
            <ChevronLeft className="w-5 h-5" />
            <p className="hover:underline w-fit cursor-pointer text-sm whitespace-nowrap">
              Back
            </p>
          </div>
          <div className="flex">
            <div className="">
              <p className="text-2xl font-bold">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Enter your current and new password to update your credentials.
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500">
                      {showOldPassword ? (
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
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500">
                      {showNewPassword ? (
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
          <div className="p-1"></div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-600/90">
            {loading ? (
              <div className="stroke-white">{icons.loading}</div>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ChangePasswordForm;
