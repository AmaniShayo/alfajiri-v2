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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ReactNode, useEffect, useState } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"
import { Spinner } from "@/components/ui/spinner"
import { useReturnables } from "@/context/returnableProvider"

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  store: z.string().optional(),
  returnableGroup: z.string().nullable().optional(),
  buyingPrice: z.string().min(1, "Buying price is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
  initialQuantity: z.string().min(1, "Initial quantity is required"),
  lowInStockLimit: z.string().min(1, "Low stock limit is required"),
  measurementUnit: z.string().min(1, "Measurement unit is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Product {
  _id: string
  productName: string
  code?: string
  description?: string
  category?: { _id: string; name?: string } | null
  supplier?: { _id: string; name?: string } | null
  store?: { _id: string; name?: string } | null
  returnableGroup?: { _id: string; name?: string } | null
  buyingPrice: number
  sellingPrice: number
  initialQuantity: number
  lowInStockLimit: number
  measurementUnit: string
}

interface ProductDialogProps {
  trigger: ReactNode
  product?: Product | null
  onSuccess?: (product: any) => void
}

export function ProductDialog({
  trigger,
  product = null,
  onSuccess,
}: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = !!product

  const { returnables } = useReturnables()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      code: "",
      description: "",
      category: "",
      supplier: "",
      store: "",
      returnableGroup: null,
      buyingPrice: "",
      sellingPrice: "",
      initialQuantity: "0",
      lowInStockLimit: "5",
      measurementUnit: "",
    },
  })

  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (open) {
      if (isEditMode && product) {
        form.reset({
          productName: product.productName || "",
          code: product.code || "",
          description: product.description || "",
          category: product.category?._id || "",
          supplier: product.supplier?._id || "",
          store: product.store?._id || "",
          returnableGroup: product.returnableGroup?._id || null,
          buyingPrice: product.buyingPrice?.toString() || "",
          sellingPrice: product.sellingPrice?.toString() || "",
          initialQuantity: product.initialQuantity?.toString() || "0",
          lowInStockLimit: product.lowInStockLimit?.toString() || "5",
          measurementUnit: product.measurementUnit || "",
        })
      } else {
        form.reset({
          productName: "",
          code: "",
          description: "",
          category: "",
          supplier: "",
          store: "",
          returnableGroup: null,
          buyingPrice: "",
          sellingPrice: "",
          initialQuantity: "0",
          lowInStockLimit: "5",
          measurementUnit: "",
        })
      }
    }
  }, [open, product, isEditMode, form])

  const createMutation = trpc.product.createProduct.useMutation({
    onSuccess: (data) => handleSuccess(data.product, "created"),
    onError: (err) => handleError(err.message),
  })

  const updateMutation = trpc.product.updateProduct.useMutation({
    onSuccess: (data) => handleSuccess(data.product, "updated"),
    onError: (err) => handleError(err.message),
  })

  const handleSuccess = (resultProduct: any, action: string) => {
    setIsLoading(false)
    toast.success(`Product ${action} successfully!`)
    form.reset()
    setOpen(false)
    onSuccess?.(resultProduct)
  }

  const handleError = (message: string) => {
    setIsLoading(false)
    toast.error(
      `Failed to ${isEditMode ? "update" : "create"} product: ${message}`
    )
  }

  const onSubmit = (values: ProductFormValues) => {
    setIsLoading(true)

    const payload = {
      ...values,
      buyingPrice: Number(values.buyingPrice),
      sellingPrice: Number(values.sellingPrice),
      initialQuantity: Number(values.initialQuantity),
      lowInStockLimit: Number(values.lowInStockLimit),
      category: values.category || undefined,
      supplier: values.supplier || undefined,
      store: values.store || undefined,
      returnableGroup: values.returnableGroup || undefined,
    }

    if (isEditMode && product) {
      updateMutation.mutate({
        productId: product._id,
        ...payload,
      })
    } else {
      createMutation.mutate(payload)
    }
  }

  const title = isEditMode ? "Edit Product" : "Create New Product"
  const description = isEditMode
    ? "Update product information."
    : "Add a new product to your inventory."
  const buttonText = isEditMode ? "Save Changes" : "Create Product"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-162.5">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name *</label>
              <Input
                placeholder="e.g., Coca Cola 500ml"
                {...form.register("productName")}
              />
              {form.formState.errors.productName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.productName.message}
                </p>
              )}
            </div>

            {/* Code + Measurement Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product Code (optional)
                </label>
                <Input placeholder="SKU123" {...form.register("code")} />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unit *</label>
                <Input
                  placeholder="pcs, kg, liter"
                  {...form.register("measurementUnit")}
                />
                {form.formState.errors.measurementUnit && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.measurementUnit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Add notes about this product..."
                className="resize-none"
                rows={3}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buying Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("buyingPrice")}
                />
                {form.formState.errors.buyingPrice && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.buyingPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Selling Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("sellingPrice")}
                />
                {form.formState.errors.sellingPrice && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.sellingPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Initial Quantity *
                </label>
                <Input
                  type="number"
                  min="0"
                  {...form.register("initialQuantity")}
                />
                {form.formState.errors.initialQuantity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.initialQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Low Stock Limit *</label>
                <Input
                  type="number"
                  min="0"
                  {...form.register("lowInStockLimit")}
                />
                {form.formState.errors.lowInStockLimit && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lowInStockLimit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category + Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("category", value ? value : undefined)
                  }
                  value={form.watch("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      No categories yet
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("supplier", value ? value : undefined)
                  }
                  value={form.watch("supplier")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      No suppliers yet
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.supplier && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.supplier.message}
                  </p>
                )}
              </div>
            </div>

            {/* Store + Returnable Group */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store/Location</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("store", value ? value : undefined)
                  }
                  value={form.watch("store")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      No stores yet
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.store && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.store.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Returnable Group</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue(
                      "returnableGroup",
                      value === "None" ? null : value
                    )
                  }
                  value={form.watch("returnableGroup") ?? "None"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {returnables?.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.returnableGroup && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.returnableGroup.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
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
              className=""
            >
              {isLoading ? <Spinner /> : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
