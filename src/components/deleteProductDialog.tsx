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

interface DeleteProductDialogProps {
  product: {
    _id: string;
    productName: string;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteProductDialog({
  product,
  trigger,
  onSuccess,
}: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = trpc.product.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      onSuccess?.();
      setOpen(false);
      setConfirmText("");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product");
    },
  });

  const isConfirmed = confirmText.trim() === product.productName;

  const handleDelete = () => {
    if (isConfirmed) {
      deleteMutation.mutate({ productId: product._id });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive">
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
            product{" "}
            <span className="font-semibold text-foreground">
              {product.productName}
            </span>{" "}
            and remove it from your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Please type{" "}
            <span className="font-bold text-foreground">
              {product.productName}
            </span>{" "}
            to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={product.productName}
            autoFocus
          />
          {!isConfirmed && confirmText.length > 0 && (
            <p className="text-sm text-destructive mt-2">
              Product name does not match
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white">
            {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
