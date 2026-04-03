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
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { icons } from "@/constants/icons";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

function ForgetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = trpc.user.forgotPassword.useMutation({
    onSuccess: (data) => {
      setLoading(false);
      form.reset();
      toast.success("Password reset initiated!", {
        description: `${data.message}!`,
      });
      router.push("/login");
    },
    onError: (error) => {
      setLoading(false);
      toast.error("Password reset failed", {
        description: error.message,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.email.length < 10) {
      toast.error("Invalid phone number", {
        description: "Phone number must be 10 digits.",
      });
    } else {
      setLoading(true);
      forgotPasswordMutation.mutate({
        email: values.email,
      });
    }
  }

  return (
    <div className="max-w-110 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="mb-2">
            <a
              href="/login"
              className="hover:underline flex items-center text-sm text-blue-500">
              <ChevronLeft className="w-5 h-5" /> Back
            </a>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-2xl">Forgot Password</p>
            <p className="text-sm text-muted-foreground">
              Enter your registered phone number. We&apos;ll send you a code to
              reset your password.
            </p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
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
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ForgetPasswordForm;
