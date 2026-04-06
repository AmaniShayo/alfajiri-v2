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

const returnableSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  totalEmpty: z.number().int().min(0, "Must be 0 or more"),
  totalFilled: z.number().int().min(0, "Must be 0 or more"),
  priceEmpty: z.number().min(0, "Price cannot be negative"),
  unit: z.string().min(1, "Unit is required").trim(),
  notes: z.string().trim(),
});

type ReturnableFormValues = z.infer<typeof returnableSchema>;

interface Returnable {
  _id: string;
  name: string;
  totalEmpty: number;
  totalFilled: number;
  priceEmpty: number;
  unit: string;
  notes?: string;
  isActive?: boolean;
}

interface ReturnableDialogProps {
  trigger: ReactNode;
  returnable?: Returnable | null;
  onSuccess?: (returnable: any) => void;
}

export function ReturnableDialog({
  trigger,
  returnable = null,
  onSuccess,
}: ReturnableDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!returnable;

  const form = useForm<ReturnableFormValues>({
    resolver: zodResolver(returnableSchema),
    defaultValues: {
      name: "",
      totalEmpty: 0,
      totalFilled: 0,
      priceEmpty: 0,
      unit: "piece",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && returnable) {
        form.reset({
          name: returnable.name || "",
          totalEmpty: returnable.totalEmpty ?? 0,
          totalFilled: returnable.totalFilled ?? 0,
          priceEmpty: returnable.priceEmpty ?? 0,
          unit: returnable.unit || "piece",
          notes: returnable.notes || "",
        });
      } else {
        form.reset({
          name: "",
          totalEmpty: 0,
          totalFilled: 0,
          priceEmpty: 0,
          unit: "piece",
          notes: "",
        });
      }
    }
  }, [open, returnable, isEditMode, form]);

  const createMutation = trpc.returnable.createReturnable.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.returnable);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const updateMutation = trpc.returnable.updateReturnable.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.returnable);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const handleSuccess = (result: any) => {
    setIsLoading(false);
    toast.success(
      isEditMode
        ? "Returnable updated successfully!"
        : "Returnable created successfully!"
    );
    form.reset();
    setOpen(false);
    onSuccess?.(result);
  };

  const handleError = (message: string) => {
    setIsLoading(false);
    toast.error(`Operation failed: ${message}`);
  };

  const onSubmit = (values: ReturnableFormValues) => {
    setIsLoading(true);

    if (isEditMode && returnable) {
      updateMutation.mutate({
        returnableId: returnable._id,
        ...values,
        notes: values.notes || undefined,
      });
    } else {
      createMutation.mutate({
        ...values,
        notes: values.notes || undefined,
      });
    }
  };

  const title = isEditMode ? "Edit Returnable Item" : "Create New Returnable";
  const description = isEditMode
    ? "Update returnable item information."
    : "Add a new returnable item (crates, bottles, cylinders, etc.)";
  const buttonText = isEditMode ? "Save Changes" : "Create Returnable";

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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 500ml Bottle, 50kg Cylinder"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className={`grid grid-cols-2 gap-4 ${isEditMode ? "hidden" : ""}`}>
              <FormField
                control={form.control}
                name="totalEmpty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Empty</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalFilled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Filled</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priceEmpty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Empty Unit (TZS) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. piece, crate, bottle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Any additional information..."
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
