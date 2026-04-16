/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  MinusSignIcon,
  Delete02Icon,
  Alert02Icon,
  CreditCardIcon,
  SmartPhone02Icon,
  Money04Icon,
  UserAdd01Icon,
  ListRestartIcon,
  ShoppingCart01Icon,
  UserSearch01Icon,
  Check,
  Rotate01Icon,
} from "@hugeicons/core-free-icons"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useProducts } from "@/context/productProvider"
import { useCustomers } from "@/context/customerProvider"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { CustomerDialog } from "@/components/createAndUpdateCustomer"
import { Spinner } from "@/components/ui/spinner"

type CartItem = {
  productId: string
  name: string
  code?: string
  quantity: number
  sellingPrice: number
  finalPrice: number
  buyingPrice: number
  availableQuantity: number
  returnableGroup?: string
  returnableName?: string
}

type ReturnableEntry = {
  groupId: string
  name: string
  returnedQuantity: number
  maxPossible: number
}

type PaymentMethod = "Cash" | "Bank" | "Mobile"

export default function PointOfSale() {
  const { products, productsLoading } = useProducts()
  const { customers, customersLoading, customersRefetch } = useCustomers()

  const [initialPaymentEdited, setInitialPaymentEdited] = useState(false)
  const [searchProduct, setSearchProduct] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [customPrice, setCustomPrice] = useState<number | "">("")
  const [returnedQuantities, setReturnedQuantities] = useState<
    Record<string, number>
  >({})
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  )
  const [customerOpen, setCustomerOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Cash")
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | "">(
    ""
  )

  const returnedReturnables = useMemo(() => {
    const returnableMap = new Map<string, ReturnableEntry>()

    cart.forEach((item) => {
      if (item.returnableGroup && item.returnableName) {
        const groupId = item.returnableGroup

        if (!returnableMap.has(groupId)) {
          returnableMap.set(groupId, {
            groupId,
            name: item.returnableName,
            returnedQuantity: returnedQuantities[groupId] ?? item.quantity,
            maxPossible: 0,
          })
        }

        const entry = returnableMap.get(groupId)!
        entry.maxPossible += item.quantity
      }
    })

    return Array.from(returnableMap.values())
  }, [cart, returnedQuantities])

  const updateReturnedQuantity = (groupId: string, value: number) => {
    const entry = returnedReturnables.find((r) => r.groupId === groupId)
    if (!entry) return

    const newQuantity = Math.max(0, Math.min(value, entry.maxPossible))

    setReturnedQuantities((prev) => ({
      ...prev,
      [groupId]: newQuantity,
    }))
  }

  const createSaleMutation = trpc.sale.createSale.useMutation({
    onSuccess: () => {
      toast.success("Sale created successfully")
      setCart([])
      setSelectedCustomerId(null)
      setInitialPaymentAmount("")
      setInitialPaymentEdited(false)
      setReturnedQuantities({})
    },
    onError: (err) => {
      console.log(err)
      toast.error(`Failed to create sale: ${err.message}`)
    },
  })

  const isLoading = productsLoading || customersLoading

  const visibleProducts = useMemo(() => {
    if (!products) return []

    const cartProductIds = new Set(cart.map((item) => item.productId))

    return products
      .filter(
        (p) =>
          p.productName.toLowerCase().includes(searchProduct.toLowerCase()) ||
          (p.code && p.code.toLowerCase().includes(searchProduct.toLowerCase()))
      )
      .map((p) => ({
        ...p,
        isAdded: cartProductIds.has(p._id),
      }))
  }, [searchProduct, products, cart])

  const selectedCustomer = customers?.find((c) => c._id === selectedCustomerId)

  const addToCart = () => {
    if (!selectedProduct) return
    if (quantity < 1) return

    const price =
      Number(customPrice) > 0
        ? Number(customPrice)
        : selectedProduct.sellingPrice

    const existing = cart.find((item) => item.productId === selectedProduct._id)

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === selectedProduct._id
            ? { ...item, quantity: item.quantity + quantity, finalPrice: price }
            : item
        )
      )
    } else {
      setCart((prev) => [
        {
          productId: selectedProduct._id,
          name: selectedProduct.productName,
          code: selectedProduct.code,
          quantity,
          sellingPrice: selectedProduct.sellingPrice,
          finalPrice: price,
          buyingPrice: selectedProduct.buyingPrice,
          availableQuantity: selectedProduct.availableQuantity,
          returnableGroup: selectedProduct.returnableGroup?._id,
          returnableName: selectedProduct.returnableGroup?.name || undefined,
        },
        ...prev,
      ])
    }

    setSelectedProduct(null)
    setQuantity(1)
    setCustomPrice("")
  }

  const updateCartItemQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      )
    )
  }

  const updateCartItemPrice = (productId: string, newPrice: number) => {
    if (newPrice <= 0) return
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, finalPrice: newPrice } : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.finalPrice,
    0
  )
  const initialPaid = Number(initialPaymentAmount) || 0
  const balanceDue = initialPaymentEdited ? subtotal - initialPaid : 0

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    const payload = {
      customer: selectedCustomerId ?? undefined,
      store: undefined,
      remarks: undefined,
      tax: undefined,
      discount: undefined,
      dueDate: undefined,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        sellingPrice: item.finalPrice,
      })),
      initialPayment:
        initialPaid > 0
          ? {
              amount: initialPaid,
              paymentMethod: selectedPaymentMethod,
            }
          : undefined,
      returnedDuringSale: returnedReturnables.map((rr) => ({
        returnableId: rr.groupId,
        quantity: rr.returnedQuantity,
      })),
    }
    createSaleMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading POS data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-48px)]">
      <div className="grid h-full grid-cols-3 gap-0 max-md:grid-cols-1 md:gap-2 md:p-2">
        <div className="relative col-span-2 overflow-y-auto max-md:hidden">
          <div className="absolute top-0 flex h-11 w-full justify-between pb-2">
            <div className="relative max-w-md">
              <Input
                placeholder="Search products by name"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
              <svg
                className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex h-full items-center">
              <p className="font-semibold text-muted-foreground">
                Total products in stock:
              </p>
              <div className="p-1"></div>
              <p className="font-bold">{products?.length}</p>
            </div>
          </div>
          <div className="mt-9 h-[calc(100%-48px)] overflow-y-auto py-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <button
                  key={product._id}
                  disabled={product.isAdded || product.availableQuantity < 1}
                  onClick={() => {
                    setSelectedProduct(product)
                    setQuantity(1)
                    setCustomPrice("")
                  }}
                  className={cn(
                    "h-fit rounded-4xl border p-3 text-left transition-all",
                    product.isAdded
                      ? "cursor-not-allowed border-muted-foreground/30 bg-muted/60 opacity-60"
                      : "hover:shadow-sm active:scale-[0.98]",
                    product.availableQuantity < 1 &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <div className="line-clamp-2 font-medium">
                    {product.productName}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-1.5">
                    <span className="text-lg font-bold">
                      {product.sellingPrice.toLocaleString()} TZS
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.availableQuantity}{" "}
                      {product.measurementUnit}
                    </span>
                    {product.isAdded && (
                      <Badge
                        variant="secondary"
                        className="rounded-md border-muted-foreground/30 text-xs"
                      >
                        Added
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 h-[calc(100vh-82px)] bg-accent max-md:h-[calc(100vh-48px)] md:rounded-4xl">
          <div className="flex h-full flex-col justify-between p-2">
            <div className="flex w-full justify-end py-2 md:hidden">
              <Sheet>
                <SheetTrigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="w-fit justify-center rounded-md bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
                    >
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="mr-2 h-4 w-4"
                      />
                      <span className="text-lg">Add Items</span>
                    </Button>
                  )}
                ></SheetTrigger>
                <SheetContent className="w-full! p-2 sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Add Items</SheetTitle>
                  </SheetHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="relative max-w-md flex-1">
                      <Input
                        placeholder="Search products by name"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        className="pl-10"
                      />
                      <svg
                        className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-muted-foreground">
                        Total: {products?.length}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {visibleProducts.map((product) => (
                        <button
                          key={product._id}
                          disabled={
                            product.isAdded || product.availableQuantity < 1
                          }
                          onClick={() => {
                            setSelectedProduct(product)
                            setQuantity(1)
                            setCustomPrice("")
                          }}
                          className={cn(
                            "h-fit rounded-4xl border p-3 text-left transition-all",
                            product.isAdded
                              ? "cursor-not-allowed border-muted-foreground/30 bg-muted/60 opacity-60"
                              : "hover:border-yellow-600/50 hover:shadow-sm active:scale-[0.98]",
                            product.availableQuantity < 1 &&
                              "cursor-not-allowed opacity-50"
                          )}
                        >
                          <div className="line-clamp-2 font-medium">
                            {product.productName}
                          </div>
                          <div className="mt-2 flex items-baseline justify-between gap-1.5">
                            <span className="text-lg font-bold">
                              {product.sellingPrice.toLocaleString()} TZS
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between gap-1.5">
                            <span className="text-xs text-muted-foreground">
                              Stock: {product.availableQuantity}{" "}
                              {product.measurementUnit}
                            </span>
                            {product.isAdded && (
                              <Badge
                                variant="secondary"
                                className="rounded-md border-muted-foreground/30 text-xs"
                              >
                                Added
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex h-10 w-full items-center justify-between">
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger
                  className="h-full w-full flex-1"
                  render={(props) => (
                    <Button
                      {...props}
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerOpen}
                      className="h-full w-full flex-1 cursor-pointer justify-between rounded-4xl shadow-none hover:bg-background"
                    >
                      {selectedCustomer ? (
                        `${selectedCustomer.customerName} (${selectedCustomer.phoneNumber})`
                      ) : (
                        <div className="flex items-center justify-center">
                          <HugeiconsIcon
                            icon={UserSearch01Icon}
                            className="mr-2 h-4 w-4"
                          />
                          Walk in Customer
                        </div>
                      )}
                    </Button>
                  )}
                ></PopoverTrigger>
                <PopoverContent className="w-full! p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList className="w-full!">
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="walk-in-customer"
                          onSelect={() => {
                            setSelectedCustomerId(null)
                            setCustomerOpen(false)
                          }}
                        >
                          <span className="font-medium">Walk in Customer</span>
                        </CommandItem>
                        {customers?.map((customer) => (
                          <CommandItem
                            key={customer._id}
                            value={
                              customer.customerName + " " + customer.phoneNumber
                            }
                            onSelect={() => {
                              setSelectedCustomerId(customer._id)
                              setCustomerOpen(false)
                            }}
                          >
                            <span className="font-medium">
                              {customer.customerName}
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {customer.phoneNumber}
                            </span>
                            <span>
                              <HugeiconsIcon
                                icon={Check}
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  customer._id === selectedCustomerId
                                    ? ""
                                    : "hidden"
                                )}
                              />
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex h-full items-center justify-center gap-2">
                {/* Add New Customer Button - Fixed for Base UI */}
                <Tooltip>
                  <TooltipTrigger
                    render={(props) => (
                      <CustomerDialog
                        trigger={
                          <div
                            {...props}
                            className="flex h-10 w-fit items-center justify-between"
                          >
                            <HugeiconsIcon
                              icon={UserAdd01Icon}
                              className="h-4 w-4"
                            />
                          </div>
                        }
                        onSuccess={() => customersRefetch()}
                      />
                    )}
                  />
                  <TooltipContent>
                    <p>Add new customer</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={(props) => (
                      <Button
                        {...props}
                        disabled={cart.length === 0}
                        variant="ghost"
                        className="w-fit"
                        onClick={() => setShowResetConfirm(true)}
                      >
                        <HugeiconsIcon
                          icon={ListRestartIcon}
                          className="h-4 w-4"
                        />
                      </Button>
                    )}
                  ></TooltipTrigger>
                  <TooltipContent>
                    <p>Reset Cart</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="my-1 h-full flex-1 overflow-y-auto rounded-4xl">
              <div className="h-full space-y-2">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <HugeiconsIcon
                      icon={ShoppingCart01Icon}
                      className="h-12 w-12"
                    />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.productId}
                      className="relative overflow-hidden rounded-4xl border bg-background p-3"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-8 w-8 rounded-none rounded-tr-4xl rounded-bl-3xl border bg-red-600/10 text-destructive transition-all hover:bg-red-600/20 hover:text-destructive"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="h-4 w-4"
                        />
                      </Button>
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.quantity} <span className="font-semibold">x</span>{" "}
                        {item.finalPrice.toLocaleString()} TZS
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                          >
                            <HugeiconsIcon
                              icon={MinusSignIcon}
                              className="h-4 w-4"
                            />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItemQuantity(
                                item.productId,
                                Number(e.target.value)
                              )
                            }
                            className="h-8 w-28 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                          >
                            <HugeiconsIcon
                              icon={PlusSignIcon}
                              className="h-4 w-4"
                            />
                          </Button>
                        </div>

                        <Input
                          type="number"
                          min={item.buyingPrice}
                          value={item.finalPrice}
                          onChange={(e) =>
                            updateCartItemPrice(
                              item.productId,
                              Number(e.target.value)
                            )
                          }
                          className="h-8 w-28"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-4xl border-t bg-background p-3">
              <div className="space-y-2">
                {returnedReturnables.length > 0 && (
                  <>
                    <div>
                      <Label className="mb-2 flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                        <HugeiconsIcon
                          icon={Rotate01Icon}
                          className="h-4 w-4"
                        />
                        Returned Empties:-
                        <span className="ml-1">Containers / Crates</span>
                      </Label>

                      <div className="overflow-x-auto">
                        <div className="flex min-w-max gap-2">
                          {returnedReturnables.map((ret) => (
                            <div
                              key={ret.groupId}
                              className="min-w-35 rounded-4xl border bg-muted/20 p-2"
                            >
                              <div className="mb-1 max-w-30 truncate text-xs text-muted-foreground">
                                {ret.name}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateReturnedQuantity(
                                      ret.groupId,
                                      ret.returnedQuantity - 1
                                    )
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={MinusSignIcon}
                                    className="h-4 w-4"
                                  />
                                </Button>
                                <Input
                                  type="number"
                                  value={ret.returnedQuantity}
                                  onChange={(e) =>
                                    updateReturnedQuantity(
                                      ret.groupId,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-8 w-16 text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateReturnedQuantity(
                                      ret.groupId,
                                      ret.returnedQuantity + 1
                                    )
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={PlusSignIcon}
                                    className="h-4 w-4"
                                  />
                                </Button>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                max: {ret.maxPossible}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}

                <div className="flex items-center gap-2">
                  <Label className="w-fit">Payment:</Label>
                  <div className="flex flex-1 gap-2">
                    <Button
                      disabled={cart.length === 0}
                      variant={
                        selectedPaymentMethod === "Cash" ? "default" : "outline"
                      }
                      size="sm"
                      className={`flex-1 ${
                        selectedPaymentMethod === "Cash"
                          ? "bg-primary text-white hover:bg-primary/90 hover:text-white dark:bg-primary dark:text-white dark:hover:bg-primary/90"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod("Cash")}
                    >
                      <HugeiconsIcon
                        icon={Money04Icon}
                        className="mr-1 h-4 w-4"
                      />
                      Cash
                    </Button>
                    <Button
                      disabled={cart.length === 0}
                      variant={
                        selectedPaymentMethod === "Bank" ? "default" : "outline"
                      }
                      size="sm"
                      className={`flex-1 ${
                        selectedPaymentMethod === "Bank"
                          ? "bg-primary text-white hover:bg-primary/90 hover:text-white dark:bg-primary dark:text-white dark:hover:bg-primary/90"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod("Bank")}
                    >
                      <HugeiconsIcon
                        icon={CreditCardIcon}
                        className="mr-1 h-4 w-4"
                      />
                      Bank
                    </Button>
                    <Button
                      disabled={cart.length === 0}
                      variant={
                        selectedPaymentMethod === "Mobile"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`flex-1 ${
                        selectedPaymentMethod === "Mobile"
                          ? "bg-primary text-white hover:bg-primary/90 hover:text-white dark:bg-primary dark:text-white dark:hover:bg-primary/90"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod("Mobile")}
                    >
                      <HugeiconsIcon
                        icon={SmartPhone02Icon}
                        className="mr-1 h-4 w-4"
                      />
                      Mobile
                    </Button>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="mb-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{subtotal.toLocaleString()} TZS</span>
                </div>

                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Label>Paid:</Label>
                    <Input
                      type="number"
                      value={
                        initialPaymentEdited ? initialPaymentAmount : subtotal
                      }
                      disabled={
                        createSaleMutation.isPending || cart.length === 0
                      }
                      onChange={(e) => {
                        setInitialPaymentEdited(true)
                        setInitialPaymentAmount(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }}
                      placeholder="0"
                      className="w-28 flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Label>Balance:</Label>
                    <div className="w-28 flex-1 rounded-4xl bg-accent px-3 py-2 text-left text-sm whitespace-nowrap text-muted-foreground">
                      {balanceDue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* <Separator className="my-2" /> */}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCompleteSale}
                disabled={createSaleMutation.isPending || cart.length === 0}
              >
                {createSaleMutation.isPending ? <Spinner /> : "Complete Sale"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5" />
              Clear Current Cart?
            </DialogTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This will remove all {cart.length} item
              {cart.length !== 1 ? "s" : ""} from the cart. This action cannot
              be undone.
            </p>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCart([])
                setInitialPaymentEdited(false)
                setInitialPaymentAmount("")
                setReturnedQuantities({})
                setShowResetConfirm(false)
                toast.info("Cart has been cleared")
              }}
            >
              Yes, Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quantity + Price Dialog */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        {selectedProduct && (
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>{selectedProduct.productName}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-3">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="shadow-none"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <HugeiconsIcon icon={MinusSignIcon} className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="text-center text-lg"
                  />
                  <Button
                    variant="outline"
                    className="shadow-none"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Selling Price (TZS)</Label>
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) =>
                    setCustomPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder={selectedProduct.sellingPrice.toString()}
                />
                {Number(customPrice) > 0 &&
                  Number(customPrice) < selectedProduct.buyingPrice && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
                      <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
                      Selling below cost price
                    </p>
                  )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  quantity < 1 ||
                  (Number(customPrice) > 0 &&
                    Number(customPrice) < selectedProduct.buyingPrice)
                }
                onClick={addToCart}
                className=""
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
