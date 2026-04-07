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

const customerSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  emailAddress: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface Customer {
  _id: string
  customerName: string
  phoneNumber: string
  address?: string
  emailAddress?: string
}

interface CustomerDialogProps {
  trigger: ReactNode
  customer?: Customer | null
  onSuccess?: (customer: any) => void
}

export function CustomerDialog({
  trigger,
  customer = null,
  onSuccess,
}: CustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = !!customer

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      emailAddress: "",
    },
  })

  // Reset form when dialog opens or customer changes
  useEffect(() => {
    if (open) {
      if (isEditMode && customer) {
        form.reset({
          customerName: customer.customerName || "",
          phoneNumber: customer.phoneNumber || "",
          address: customer.address || "",
          emailAddress: customer.emailAddress || "",
        })
      } else {
        form.reset({
          customerName: "",
          phoneNumber: "",
          address: "",
          emailAddress: "",
        })
      }
    }
  }, [open, customer, isEditMode, form])

  const createMutation = trpc.customer.createCustomer.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.customer)
    },
    onError: (error) => {
      handleError(error.message)
    },
  })

  const updateMutation = trpc.customer.updateCustomer.useMutation({
    onSuccess: (data) => {
      handleSuccess(data.customer)
    },
    onError: (error) => {
      handleError(error.message)
    },
  })

  const handleSuccess = (resultCustomer: any) => {
    setIsLoading(false)
    toast.success(
      isEditMode
        ? "Customer updated successfully!"
        : "Customer created successfully!"
    )
    form.reset()
    setOpen(false)
    onSuccess?.(resultCustomer)
  }

  const handleError = (message: string) => {
    setIsLoading(false)
    toast.error(`Operation failed: ${message}`)
  }

  const onSubmit = (values: CustomerFormValues) => {
    setIsLoading(true)

    if (isEditMode && customer) {
      updateMutation.mutate({
        customerId: customer._id,
        ...values,
        emailAddress: values.emailAddress || undefined,
      })
    } else {
      createMutation.mutate({
        ...values,
        emailAddress: values.emailAddress || undefined,
      })
    }
  }

  const title = isEditMode ? "Edit Customer" : "Create New Customer"
  const description = isEditMode
    ? "Update customer information."
    : "Add a new customer to your records."
  const buttonText = isEditMode ? "Save Changes" : "Create Customer"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Name *</label>
            <Input
              placeholder="e.g. John Temba"
              {...form.register("customerName")}
            />
            {form.formState.errors.customerName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.customerName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number *</label>
            <Input
              placeholder="+255 712 345 678"
              {...form.register("phoneNumber")}
            />
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Address *</label>
            <Input
              placeholder="e.g. Plot 45, Samora Avenue, Dar es Salaam"
              {...form.register("address")}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email (Optional)</label>
            <Input
              type="email"
              placeholder="customer@example.com"
              {...form.register("emailAddress")}
            />
            {form.formState.errors.emailAddress && (
              <p className="text-sm text-destructive">
                {form.formState.errors.emailAddress.message}
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
            <Button type="submit" disabled={isLoading} className="">
              {isLoading ? <Spinner /> : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
