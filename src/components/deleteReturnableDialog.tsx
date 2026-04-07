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

interface DeleteReturnableDialogProps {
  returnable: {
    _id: string
    name: string
  }
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function DeleteReturnableDialog({
  returnable,
  trigger,
  onSuccess,
}: DeleteReturnableDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const deleteMutation = trpc.returnable.deleteReturnable.useMutation({
    onSuccess: () => {
      toast.success("Returnable item deleted successfully")
      onSuccess?.()
      setOpen(false)
      setConfirmText("")
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete returnable item")
    },
  })

  const isConfirmed = confirmText.trim() === returnable.name

  const handleDelete = () => {
    if (isConfirmed) {
      deleteMutation.mutate({ returnableId: returnable._id })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
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
            returnable item{" "}
            <span className="font-semibold text-foreground">
              {returnable.name}
            </span>{" "}
            from your Alfajiri records.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="mb-2 text-sm text-muted-foreground">
            To confirm, please type{" "}
            <span className="font-bold text-foreground">{returnable.name}</span>{" "}
            below:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={returnable.name}
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Returnable"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
