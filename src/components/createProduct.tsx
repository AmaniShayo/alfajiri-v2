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
import { useReturnables } from "@/context/returnableProvider";

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
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Product {
  _id: string;
  productName: string;
  code?: string;
  description?: string;
  category?: { _id: string; name?: string } | null;
  supplier?: { _id: string; name?: string } | null;
  store?: { _id: string; name?: string } | null;
  returnableGroup?: { _id: string; name?: string } | null;
  buyingPrice: number;
  sellingPrice: number;
  initialQuantity: number;
  lowInStockLimit: number;
  measurementUnit: string;
}

interface ProductDialogProps {
  trigger: ReactNode;
  product?: Product | null; // ← for edit mode
  onSuccess?: (product: any) => void;
}

export function ProductDialog({
  trigger,
  product = null,
  onSuccess,
}: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!product;

  const { returnables } = useReturnables();

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
  });

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
        });
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
        });
      }
    }
  }, [open, product, isEditMode, form]);

  const createMutation = trpc.product.createProduct.useMutation({
    onSuccess: (data) => handleSuccess(data.product, "created"),
    onError: (err) => {
      console.log(err);

      handleError(err.message);
    },
  });

  const updateMutation = trpc.product.updateProduct.useMutation({
    onSuccess: (data) => handleSuccess(data.product, "updated"),
    onError: (err) => handleError(err.message),
  });

  const handleSuccess = (resultProduct: any, action: string) => {
    setIsLoading(false);
    toast.success(`Product ${action} successfully!`);
    form.reset();
    setOpen(false);
    onSuccess?.(resultProduct);
  };

  const handleError = (message: string) => {
    setIsLoading(false);
    toast.error(
      `Failed to ${isEditMode ? "update" : "create"} product: ${message}`,
    );
  };

  const onSubmit = (values: ProductFormValues) => {
    setIsLoading(true);

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
    };

    if (isEditMode && product) {
      updateMutation.mutate({
        productId: product._id,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const title = isEditMode ? "Edit Product" : "Create New Product";
  const description = isEditMode
    ? "Update product information."
    : "Add a new product to your inventory.";
  const buttonText = isEditMode ? "Save Changes" : "Create Product";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Coca Cola 500ml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Code + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurementUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <FormControl>
                        <Input placeholder="pcs, kg, liter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add notes about this product..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buyingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buying Price *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowInStockLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Limit *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category + Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Replace with real categories when available */}
                          <SelectItem value="none" disabled>
                            No categories yet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" disabled>
                            No suppliers yet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Store + Returnable Group */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store/Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" disabled>
                            No stores yet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnableGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Returnable Group</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="None">None</SelectItem>
                          {returnables?.map((group) => (
                            <SelectItem key={group._id} value={group._id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
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
