"use client"

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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Trash } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

interface DeleteCustomerDialogProps {
  customer: {
    _id: string
    customerName: string
  }
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function DeleteCustomerDialog({
  customer,
  trigger,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const deleteMutation = trpc.customer.deleteCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer deleted successfully")
      onSuccess?.()
      setOpen(false)
      setConfirmText("")
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete customer")
    },
  })

  const isConfirmed = confirmText.trim() === customer.customerName

  const handleDelete = () => {
    if (isConfirmed) {
      deleteMutation.mutate({ customerId: customer._id })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <HugeiconsIcon icon={Trash} className="h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            customer{" "}
            <span className="font-semibold text-foreground">
              {customer.customerName}
            </span>{" "}
            and remove it from your records.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="mb-2 text-sm text-muted-foreground">
            To confirm, please type{" "}
            <span className="font-bold text-foreground">
              {customer.customerName}
            </span>{" "}
            below:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={customer.customerName}
            autoFocus
          />
          {!isConfirmed && confirmText.length > 0 && (
            <p className="mt-2 text-sm text-destructive">Name does not match</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Customer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
