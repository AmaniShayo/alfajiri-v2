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
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { ReactNode, useState } from "react"
import { trpc } from "@/lib/trpc"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { Check, ChevronUp } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { currencies } from "@/constants/currency"
import { Spinner } from "@/components/ui/spinner"

const createBusinessSchema = z.object({
  key: z.string().min(1, "Product key is required"),
  businessName: z.string().min(1, "Business name is required"),
  currency: z.string().min(1, "Currency is required"),
  address: z.string().min(1, "Address is required"),
  TINNumber: z.string().optional(),
  about: z.string().optional(),
})

type CreateBusinessFormValues = z.infer<typeof createBusinessSchema>

interface CreateBusinessDialogProps {
  trigger: ReactNode
  onSuccess?: (business: unknown) => void
}

export function CreateBusinessDialog({
  trigger,
  onSuccess,
}: CreateBusinessDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const form = useForm<CreateBusinessFormValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      key: "",
      businessName: "",
      currency: "TZS",
      address: "",
      TINNumber: "",
      about: "",
    },
  })

  // ✅ React Compiler-safe way to watch values
  const selectedCurrency = useWatch({
    control: form.control,
    name: "currency",
  })

  const selectedCurrencyData = currencies.find(
    (c) => c.code === selectedCurrency
  )

  const createBusinessMutation = trpc.business.createBusiness.useMutation({
    onSuccess: (data) => {
      setIsLoading(false)
      toast.success("Business created successfully!")
      form.reset()
      setOpen(false)
      onSuccess?.(data)
    },
    onError: (error) => {
      setIsLoading(false)
      toast.error("Failed to create business", {
        description: error.message,
      })
    },
  })

  const onSubmit = (values: CreateBusinessFormValues) => {
    setIsLoading(true)
    createBusinessMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Create New Business</DialogTitle>
          <DialogDescription>
            Enter your product key and business details to get started. Each
            product key unlocks one business.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            {/* Product Key */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Product Key *</label>
              <Input
                placeholder="XXXXX-XXXX-XXXX-XXXX-XXXX"
                {...form.register("key")}
              />
              {form.formState.errors.key && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.key.message}
                </p>
              )}
            </div>

            {/* Business Name */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Business Name *</label>
              <Input
                placeholder="My Awesome Store"
                {...form.register("businessName")}
              />
              {form.formState.errors.businessName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.businessName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Currency Combobox */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Currency *</label>
                <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                  <PopoverTrigger>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedCurrency && "text-muted-foreground"
                      )}
                    >
                      {selectedCurrencyData
                        ? `${selectedCurrencyData.country} - ${selectedCurrencyData.currencyName}`
                        : "Select currency..."}
                      <HugeiconsIcon
                        icon={ChevronUp}
                        className="ml-2 h-4 w-4 shrink-0 opacity-50"
                      />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search currency..." />
                      <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                          {currencies.map((currency) => (
                            <CommandItem
                              key={currency.code}
                              value={`${currency.country} ${currency.currencyName} ${currency.code}`}
                              onSelect={() => {
                                form.setValue("currency", currency.code)
                                setCurrencyOpen(false)
                              }}
                            >
                              {currency.country} - {currency.currencyName} (
                              {currency.code})
                              <HugeiconsIcon
                                icon={Check}
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCurrency === currency.code
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {form.formState.errors.currency && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.currency.message}
                  </p>
                )}
              </div>

              {/* TIN Number */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">TIN Number</label>
                <Input
                  placeholder="TIN-123456"
                  {...form.register("TINNumber")}
                />
                {form.formState.errors.TINNumber && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.TINNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Business Address *</label>
              <Input
                placeholder="123 Main St, City, Country"
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            {/* About */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">About (Optional)</label>
              <Textarea
                placeholder="Tell us about your business..."
                className="resize-none"
                rows={3}
                {...form.register("about")}
              />
              {form.formState.errors.about && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.about.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : "Create Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
