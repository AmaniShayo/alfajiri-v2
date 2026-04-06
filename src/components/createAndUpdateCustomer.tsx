/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const customerSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  emailAddress: z.email("Invalid email format").optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface Customer {
  _id: string;
  customerName: string;
  phoneNumber: string;
  address?: string;
  emailAddress?: string;
}

interface CustomerDialogProps {
  trigger: ReactNode;
  customer?: Customer | null;
  onSuccess?: (customer: any) => void;
}

export function CustomerDialog({
  trigger,
  customer = null,
  onSuccess,
}: CustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!customer;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      emailAddress: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && customer) {
        form.reset({
          customerName: customer.customerName || "",
          phoneNumber: customer.phoneNumber || "",
          address: customer.address || "",
          emailAddress: customer.emailAddress || "",
        });
      } else {
        form.reset({
          customerName: "",
          phoneNumber: "",
          address: "",
          emailAddress: "",
        });
      }
    }
  }, [open, customer, isEditMode, form]);

  const createMutation = trpc.customer.createCustomer.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.customer);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const updateMutation = trpc.customer.updateCustomer.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.customer);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const handleSuccess = (resultCustomer: any) => {
    setIsLoading(false);
    toast.success(
      isEditMode
        ? "Customer updated successfully!"
        : "Customer created successfully!"
    );
    form.reset();
    setOpen(false);
    onSuccess?.(resultCustomer);
  };

  const handleError = (message: string) => {
    setIsLoading(false);
    toast.error(`Operation failed: ${message}`);
  };

  const onSubmit = (values: CustomerFormValues) => {
    setIsLoading(true);

    if (isEditMode && customer) {
      updateMutation.mutate({
        customerId: customer._id,
        ...values,
        emailAddress: values.emailAddress || undefined,
      });
    } else {
      createMutation.mutate({
        ...values,
        emailAddress: values.emailAddress || undefined,
      });
    }
  };

  const title = isEditMode ? "Edit Customer" : "Create New Customer";
  const description = isEditMode
    ? "Update customer information."
    : "Add a new customer to your records.";
  const buttonText = isEditMode ? "Save Changes" : "Create Customer";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Temba" {...field} />
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
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+255 712 345 678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Plot 45, Samora Avenue, Dar es Salaam"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-600/90">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
