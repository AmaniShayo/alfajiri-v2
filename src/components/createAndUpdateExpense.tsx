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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  category: z.enum([
    "Transport & Fuel",
    "Staff Food",
    "Professional Fees",
    "Phone & Internet",
    "Rent",
    "Salaries",
    "Taxes & Licenses",
    "Insurance",
    "Office Supplies",
    "Marketing",
    "Repairs",
    "Bank Charges",
    "Utilities",
    "Other",
  ]),
  store: z.string().optional(),
  attachment: z.string().optional(),
  remarks: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Expense {
  _id: string;
  amount: number;
  description?: string;
  category: string;
  store?: string;
  attachment?: string;
  remarks?: string;
}

interface ExpenseDialogProps {
  trigger: ReactNode;
  expense?: Expense | null;
  onSuccess?: (expense: any) => void;
}

export function ExpenseDialog({
  trigger,
  expense = null,
  onSuccess,
}: ExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!expense;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      category: "Other",
      store: "",
      attachment: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && expense) {
        form.reset({
          amount: expense.amount || 0,
          description: expense.description || "",
          category: expense.category as any,
          store: expense.store || "",
          attachment: expense.attachment || "",
          remarks: expense.remarks || "",
        });
      } else {
        form.reset({
          amount: 0,
          description: "",
          category: "Other",
          store: "",
          attachment: "",
          remarks: "",
        });
      }
    }
  }, [open, expense, isEditMode, form]);

  const createMutation = trpc.expense.createExpense.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.expense);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const updateMutation = trpc.expense.updateExpense.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.expense);
    },
    onError: (error) => {
      handleError(error.message);
    },
  });

  const handleSuccess = (resultExpense: any) => {
    setIsLoading(false);
    toast.success(
      isEditMode
        ? "Expense updated successfully!"
        : "Expense created successfully!"
    );
    form.reset();
    setOpen(false);
    onSuccess?.(resultExpense);
  };

  const handleError = (message: string) => {
    setIsLoading(false);
    toast.error(`Operation failed: ${message}`);
  };

  const onSubmit = (values: ExpenseFormValues) => {
    setIsLoading(true);

    if (isEditMode && expense) {
      updateMutation.mutate({
        expenseId: expense._id,
        ...values,
        store: values.store || undefined,
        attachment: values.attachment || undefined,
        remarks: values.remarks || undefined,
      });
    } else {
      createMutation.mutate({
        ...values,
        store: values.store || undefined,
        attachment: values.attachment || undefined,
        remarks: values.remarks || undefined,
      });
    }
  };

  const title = isEditMode ? "Edit Expense" : "Create New Expense";
  const description = isEditMode
    ? "Update expense information."
    : "Add a new expense to your records.";
  const buttonText = isEditMode ? "Save Changes" : "Create Expense";

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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full max-h-[300px] overflow-y-auto">
                      <SelectItem value="Transport & Fuel">
                        Transport & Fuel
                      </SelectItem>
                      <SelectItem value="Staff Food">Staff Food</SelectItem>
                      <SelectItem value="Professional Fees">
                        Professional Fees
                      </SelectItem>
                      <SelectItem value="Phone & Internet">
                        Phone & Internet
                      </SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Salaries">Salaries</SelectItem>
                      <SelectItem value="Taxes & Licenses">
                        Taxes & Licenses
                      </SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Office Supplies">
                        Office Supplies
                      </SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Repairs">Repairs</SelectItem>
                      <SelectItem value="Bank Charges">Bank Charges</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the expense"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or remarks"
                      {...field}
                      rows={3}
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
