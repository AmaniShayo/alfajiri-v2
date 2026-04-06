"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DeleteExpenseDialogProps {
  expense: {
    _id: string;
    description?: string;
    amount: number;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteExpenseDialog({
  expense,
  trigger,
  onSuccess,
}: DeleteExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = trpc.expense.deleteExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      onSuccess?.();
      setOpen(false);
      setConfirmText("");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete expense");
    },
  });

  const expenseIdentifier =
    expense.description || `Expense of ${expense.amount}`;
  const isConfirmed = confirmText.trim() === expenseIdentifier;

  const handleDelete = () => {
    if (isConfirmed) {
      deleteMutation.mutate({ expenseId: expense._id });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            expense{" "}
            <span className="font-semibold text-foreground">
              {expenseIdentifier}
            </span>{" "}
            and remove it from your records.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            To confirm, please type{" "}
            <span className="font-bold text-foreground">
              {expenseIdentifier}
            </span>{" "}
            below:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expenseIdentifier}
            autoFocus
          />
          {!isConfirmed && confirmText.length > 0 && (
            <p className="text-sm text-destructive mt-2">Text does not match</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90">
            {deleteMutation.isPending ? "Deleting..." : "Delete Expense"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
