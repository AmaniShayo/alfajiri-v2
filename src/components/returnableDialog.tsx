/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ReactNode, useEffect, useState } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"
import { Spinner } from "@/components/ui/spinner"

const returnableSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  totalEmpty: z.number().int().min(0, "Must be 0 or more"),
  totalFilled: z.number().int().min(0, "Must be 0 or more"),
  priceEmpty: z.number().min(0, "Price cannot be negative"),
  unit: z.string().min(1, "Unit is required").trim(),
  notes: z.string().trim(),
})

type ReturnableFormValues = z.infer<typeof returnableSchema>

interface Returnable {
  _id: string
  name: string
  totalEmpty: number
  totalFilled: number
  priceEmpty: number
  unit: string
  notes?: string
  isActive?: boolean
}

interface ReturnableDialogProps {
  trigger: ReactNode
  returnable?: Returnable | null
  onSuccess?: (returnable: any) => void
}

export function ReturnableDialog({
  trigger,
  returnable = null,
  onSuccess,
}: ReturnableDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = !!returnable

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
  })

  // Reset form when dialog opens or returnable changes
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
        })
      } else {
        form.reset({
          name: "",
          totalEmpty: 0,
          totalFilled: 0,
          priceEmpty: 0,
          unit: "piece",
          notes: "",
        })
      }
    }
  }, [open, returnable, isEditMode, form])

  const createMutation = trpc.returnable.createReturnable.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.returnable)
    },
    onError: (error) => {
      handleError(error.message)
    },
  })

  const updateMutation = trpc.returnable.updateReturnable.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.returnable)
    },
    onError: (error) => {
      handleError(error.message)
    },
  })

  const handleSuccess = (result: any) => {
    setIsLoading(false)
    toast.success(
      isEditMode
        ? "Returnable updated successfully!"
        : "Returnable created successfully!"
    )
    form.reset()
    setOpen(false)
    onSuccess?.(result)
  }

  const handleError = (message: string) => {
    setIsLoading(false)
    toast.error(`Operation failed: ${message}`)
  }

  const onSubmit = (values: ReturnableFormValues) => {
    setIsLoading(true)

    if (isEditMode && returnable) {
      updateMutation.mutate({
        returnableId: returnable._id,
        ...values,
        notes: values.notes || undefined,
      })
    } else {
      createMutation.mutate({
        ...values,
        notes: values.notes || undefined,
      })
    }
  }

  const title = isEditMode ? "Edit Returnable Item" : "Create New Returnable"
  const description = isEditMode
    ? "Update returnable item information."
    : "Add a new returnable item (crates, bottles, cylinders, etc.)"
  const buttonText = isEditMode ? "Save Changes" : "Create Returnable"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="e.g. 500ml Bottle, 50kg Cylinder"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Total Empty + Total Filled (Hidden in Edit Mode) */}
          {!isEditMode && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Empty</label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("totalEmpty", { valueAsNumber: true })}
                />
                {form.formState.errors.totalEmpty && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.totalEmpty.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Total Filled</label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("totalFilled", { valueAsNumber: true })}
                />
                {form.formState.errors.totalFilled && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.totalFilled.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price per Empty Unit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Price per Empty Unit (TZS) *
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...form.register("priceEmpty", { valueAsNumber: true })}
            />
            {form.formState.errors.priceEmpty && (
              <p className="text-sm text-destructive">
                {form.formState.errors.priceEmpty.message}
              </p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Unit *</label>
            <Input
              placeholder="e.g. piece, crate, bottle"
              {...form.register("unit")}
            />
            {form.formState.errors.unit && (
              <p className="text-sm text-destructive">
                {form.formState.errors.unit.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              placeholder="Any additional information..."
              {...form.register("notes")}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-600/90"
            >
              {isLoading ? <Spinner /> : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
