/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Banknote,
  UserPlus2Icon,
  ListRestart,
  ScrollText,
  UserRoundSearchIcon,
  Check,
  RotateCcw,
  PlusIcon,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { useProducts } from "@/context/productProvider";
import { useCustomers } from "@/context/customerProvider";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CustomerDialog } from "@/components/createAndUpdateCustomer";

type CartItem = {
  productId: string;
  name: string;
  code?: string;
  quantity: number;
  sellingPrice: number;
  finalPrice: number;
  buyingPrice: number;
  availableQuantity: number;
  returnableGroup?: string;
  returnableName?: string;
};

type ReturnableEntry = {
  groupId: string;
  name: string;
  returnedQuantity: number;
  maxPossible: number;
};

type PaymentMethod = "Cash" | "Bank" | "Mobile";

export default function PointOfSale() {
  const { products, productsLoading } = useProducts();
  const { customers, customersLoading, customersRefetch } = useCustomers();
  const [initialPaymentEdited, setInitialPaymentEdited] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [returnedReturnables, setReturnedReturnables] = useState<
    ReturnableEntry[]
  >([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [customerOpen, setCustomerOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Cash");
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | "">(
    "",
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const returnableMap = new Map<string, ReturnableEntry>();

    cart.forEach((item) => {
      if (item.returnableGroup && item.returnableName) {
        const current = returnableMap.get(item.returnableGroup) || {
          groupId: item.returnableGroup,
          name: item.returnableName,
          returnedQuantity: 0,
          maxPossible: 0,
        };

        current.maxPossible += item.quantity;
        if (!returnableMap.has(item.returnableGroup)) {
          current.returnedQuantity = item.quantity;
        }

        returnableMap.set(item.returnableGroup, current);
      }
    });

    setReturnedReturnables(Array.from(returnableMap.values()));
  }, [cart]);

  const updateReturnedQuantity = (groupId: string, value: number) => {
    setReturnedReturnables((prev) =>
      prev.map((entry) =>
        entry.groupId === groupId
          ? {
              ...entry,
              returnedQuantity: Math.max(0, Math.min(value, entry.maxPossible)),
            }
          : entry,
      ),
    );
  };

  const createSaleMutation = trpc.sale.createSale.useMutation({
    onSuccess: () => {
      toast.success("Sale created successfully");
      setCart([]);
      setSelectedCustomerId(null);
      setInitialPaymentAmount("");
    },
    onError: (err) => {
      console.log(err);

      toast.error(`Failed to create sale: ${err.message}`);
    },
  });

  const isLoading = productsLoading || customersLoading;

  const visibleProducts = useMemo(() => {
    if (!products) return [];

    const cartProductIds = new Set(cart.map((item) => item.productId));

    return products
      .filter(
        (p) =>
          p.productName.toLowerCase().includes(searchProduct.toLowerCase()) ||
          (p.code &&
            p.code.toLowerCase().includes(searchProduct.toLowerCase())),
      )
      .map((p) => ({
        ...p,
        isAdded: cartProductIds.has(p._id),
      }));
  }, [searchProduct, products, cart]);

  const selectedCustomer = customers?.find((c) => c._id === selectedCustomerId);

  const addToCart = () => {
    if (!selectedProduct) return;
    if (quantity < 1) return;

    const price =
      Number(customPrice) > 0
        ? Number(customPrice)
        : selectedProduct.sellingPrice;

    const existing = cart.find(
      (item) => item.productId === selectedProduct._id,
    );

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === selectedProduct._id
            ? { ...item, quantity: item.quantity + quantity, finalPrice: price }
            : item,
        ),
      );
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
      ]);
    }

    setSelectedProduct(null);
    setQuantity(1);
    setCustomPrice("");
  };

  const updateCartItemQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item,
      ),
    );
  };

  const updateCartItemPrice = (productId: string, newPrice: number) => {
    if (newPrice <= 0) return;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, finalPrice: newPrice } : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    if (cart.length == 0) {
      setInitialPaymentEdited(false);
      setInitialPaymentAmount("");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.finalPrice,
    0,
  );
  const initialPaid = Number(initialPaymentAmount) || 0;
  const balanceDue = initialPaymentEdited ? subtotal - initialPaid : 0;

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.success("Cart is empty");
      return;
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
    };
    createSaleMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading POS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-48px)]">
      {/* Header */}

      <div className="grid grid-cols-3 max-md:grid-cols-1 md:gap-2 gap-0 h-full">
        <div className="col-span-2 overflow-y-auto relative max-md:hidden">
          <div className="absolute w-full h-11 pb-2 border-b bg-white dark:bg-black flex justify-between">
            <div className="relative max-w-md">
              <Input
                placeholder="Search products by name"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
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
          <div className="mt-11 h-[calc(100%-48px)] overflow-y-auto py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
              {visibleProducts.map((product) => (
                <button
                  key={product._id}
                  disabled={product.isAdded || product.availableQuantity < 1}
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantity(1);
                    setCustomPrice("");
                  }}
                  className={cn(
                    "h-fit rounded-md border p-2 text-left transition-all",
                    product.isAdded
                      ? "bg-muted/60 border-muted-foreground/30 opacity-60 cursor-not-allowed"
                      : "hover:border-yellow-600/50 active:scale-[0.98] hover:shadow-sm",
                    product.availableQuantity < 1 &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="font-medium line-clamp-2">
                    {product.productName}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5 justify-between">
                    <span className="text-lg font-bold">
                      {product.sellingPrice.toLocaleString()} TZS
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5 justify-between">
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.availableQuantity}{" "}
                      {product.measurementUnit}
                    </span>
                    {product.isAdded && (
                      <Badge
                        variant="secondary"
                        className="text-xs border-muted-foreground/30 rounded-md"
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

        {/* Cart & Controls */}
        <div className="col-span-1 md:border-l h-[calc(100vh-48px)] -mt-1.5">
          <div className="h-full flex flex-col justify-between">
            {/* product select for mobile */}
            <div className="w-full md:hidden py-2 flex justify-end">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="w-fit justify-center rounded-md bg-yellow-600 text-white hover:bg-yellow-600/90 dark:bg-yellow-600 dark:hover:bg-yellow-600/90 dark:text-white">
                    <PlusIcon size={16} className="" />
                    <span className="text-lg">Add Items</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-2">
                  <SheetHeader>
                    <SheetTitle>Add Items</SheetTitle>
                  </SheetHeader>
                  <div className="flex justify-between items-center mb-4">
                    <div className="relative max-w-md flex-1">
                      <Input
                        placeholder="Search products by name"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        className="pl-10"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
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
                      <p className="font-semibold text-muted-foreground text-sm">
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
                            setSelectedProduct(product);
                            setQuantity(1);
                            setCustomPrice("");
                            setSheetOpen(false);
                          }}
                          className={cn(
                            "h-fit rounded-md border p-2 text-left transition-all",
                            product.isAdded
                              ? "bg-muted/60 border-muted-foreground/30 opacity-60 cursor-not-allowed"
                              : "hover:border-yellow-600/50 active:scale-[0.98] hover:shadow-sm",
                            product.availableQuantity < 1 &&
                              "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <div className="font-medium line-clamp-2">
                            {product.productName}
                          </div>
                          <div className="mt-2 flex items-baseline gap-1.5 justify-between">
                            <span className="text-lg font-bold">
                              {product.sellingPrice.toLocaleString()} TZS
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline gap-1.5 justify-between">
                            <span className="text-xs text-muted-foreground">
                              Stock: {product.availableQuantity}{" "}
                              {product.measurementUnit}
                            </span>
                            {product.isAdded && (
                              <Badge
                                variant="secondary"
                                className="text-xs border-muted-foreground/30 rounded-md"
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
            {/* Customer Selector */}
            <div className="w-full md:pl-2 flex justify-between items-center h-12 border-b">
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild className="w-full flex-1">
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between shadow-none flex-1 rounded-md -mt-0.5 cursor-pointer hover:bg-background"
                  >
                    {selectedCustomer ? (
                      `${selectedCustomer.customerName} (${selectedCustomer.phoneNumber})`
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserRoundSearchIcon className="h-4 w-4 mr-2" />
                        Walk in Customer
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-(--radix-popover-trigger-width)"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="walk-in-customer"
                          onSelect={() => {
                            setSelectedCustomerId(null);
                            setCustomerOpen(false);
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
                              setSelectedCustomerId(customer._id);
                              setCustomerOpen(false);
                            }}
                          >
                            <span>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  customer._id === selectedCustomerId
                                    ? ""
                                    : "hidden",
                                )}
                              />
                            </span>
                            <span className="font-medium">
                              {customer.customerName}
                            </span>
                            <span className="ml-2 text-muted-foreground text-sm">
                              {customer.phoneNumber}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="p-1"></div>
              <div className="flex gap-2">
                <CustomerDialog
                  trigger={
                    <div className="">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant={"ghost"} className="h-fit w-fit">
                            <UserPlus2Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add new customer</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  }
                  onSuccess={() => customersRefetch()}
                />
                <div
                  onClick={() => {
                    if (cart.length === 0) {
                      return;
                    }
                    setShowResetConfirm(true);
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        disabled={cart.length === 0}
                        variant={"ghost"}
                        className="h-fit w-fit"
                      >
                        <ListRestart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset Cart</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 h-full overflow-y-auto shadow-inner">
              <div className="md:p-2 space-y-2 pt-2 h-full">
                {cart.length === 0 ? (
                  <div className="text-muted-foreground h-full flex flex-col gap-2 items-center justify-center">
                    <ScrollText size={60} />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-md p-3 border bg-background relative overflow-hidden"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8 absolute top-0 right-0 bg-red-600/10 hover:bg-red-600/20 transition-all border rounded-none rounded-bl-md rounded-tr-md"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.quantity} <span className="font-semibold">x</span>{" "}
                        {item.finalPrice.toLocaleString()} TZS
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.productId,
                                item.quantity - 1,
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItemQuantity(
                                item.productId,
                                Number(e.target.value),
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
                                item.quantity + 1,
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Input
                          type="number"
                          min={item.buyingPrice}
                          value={item.finalPrice}
                          onChange={(e) =>
                            updateCartItemPrice(
                              item.productId,
                              Number(e.target.value),
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

            {/* Summary & Payment */}
            <div className="md:p-2 py-2 border-t bg-background">
              <div className="space-y-2">
                {returnedReturnables.length > 0 && (
                  <>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1.5 mb-2 whitespace-nowrap">
                        <RotateCcw size={16} />
                        Returned Empties:-
                        <span className="ml-1">Containers / Crates</span>
                      </Label>

                      <div className="overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                          {returnedReturnables.map((ret) => (
                            <div
                              key={ret.groupId}
                              className="border rounded-lg p-2 bg-muted/20 min-w-[140px]"
                            >
                              <div className="text-xs text-muted-foreground mb-1 truncate max-w-[120px]">
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
                                      ret.returnedQuantity - 1,
                                    )
                                  }
                                >
                                  <Minus size={14} />
                                </Button>
                                <Input
                                  type="number"
                                  value={ret.returnedQuantity}
                                  onChange={(e) =>
                                    updateReturnedQuantity(
                                      ret.groupId,
                                      Number(e.target.value),
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
                                      ret.returnedQuantity + 1,
                                    )
                                  }
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
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
                  <Label className="min-w-20">Payment:</Label>
                  <div className="flex gap-2 flex-1">
                    <Button
                      disabled={cart.length === 0 || initialPaymentAmount === 0}
                      variant={
                        selectedPaymentMethod === "Cash" ? "default" : "outline"
                      }
                      size="sm"
                      className={`flex-1 ${
                        selectedPaymentMethod === "Cash"
                          ? "bg-yellow-600 text-white hover:text-white hover:bg-yellow-600/90 dark:bg-yellow-600 dark:hover:bg-yellow-600/90 dark:text-white"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod("Cash")}
                    >
                      <Banknote className="h-4 w-4 mr-1" /> Cash
                    </Button>
                    <Button
                      disabled={cart.length === 0 || initialPaymentAmount === 0}
                      variant={
                        selectedPaymentMethod === "Bank" ? "default" : "outline"
                      }
                      size="sm"
                      className={`flex-1 ${
                        selectedPaymentMethod === "Bank"
                          ? "bg-yellow-600 text-white hover:text-white hover:bg-yellow-600/90 dark:bg-yellow-600 dark:hover:bg-yellow-600/90 dark:text-white"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod("Bank")}
                    >
                      <CreditCard className="h-4 w-4 mr-1" /> Bank
                    </Button>
                    <Button
                      disabled={cart.length === 0 || initialPaymentAmount === 0}
                      variant={
                        selectedPaymentMethod === "Mobile"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`flex-1 ${
                        selectedPaymentMethod === "Mobile"
                          ? "bg-yellow-600 text-white hover:text-white hover:bg-yellow-600/90 dark:bg-yellow-600 dark:hover:bg-yellow-600/90 dark:text-white"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod("Mobile")}
                    >
                      <Smartphone className="h-4 w-4 mr-1" /> Mobile
                    </Button>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2">
                    <Label className="">Paid:</Label>
                    <Input
                      type="number"
                      value={
                        initialPaymentEdited ? initialPaymentAmount : subtotal
                      }
                      onChange={(e) => {
                        setInitialPaymentEdited(true);
                        setInitialPaymentAmount(
                          e.target.value === "" ? "" : Number(e.target.value),
                        );
                      }}
                      placeholder="0"
                      className="flex-1 w-32"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Label className="">Balance:</Label>
                    <div className="flex-1 text-left px-3 py-2 border text-muted-foreground rounded-md whitespace-nowrap w-32 text-sm">
                      {balanceDue.toLocaleString()} TZS
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between text-lg font-bold mb-3">
                <span>Total:</span>
                <span className={""}>{subtotal.toLocaleString()} TZS</span>
              </div>

              <Button
                className="w-full h-fit bg-yellow-600 hover:bg-yellow-600/90 dark:bg-yellow-600 py-3 dark:text-white dark:hover:bg-yellow-600/90"
                size="lg"
                onClick={handleCompleteSale}
                disabled={createSaleMutation.isPending || cart.length === 0}
              >
                {createSaleMutation.isPending
                  ? "Processing..."
                  : "COMPLETE SALE"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Clear Current Cart?
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              This will remove all {cart.length} item
              {cart.length !== 1 ? "s" : ""} from the cart. This action cannot
              be undone.
            </p>
          </DialogHeader>

          <DialogFooter className="gap-2 flex">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCart([]);
                setInitialPaymentEdited(false);
                setInitialPaymentAmount("");
                setShowResetConfirm(false);
                toast.info("Cart has been cleared");
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
          <DialogContent className="sm:max-w-[425px]">
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
                    <Minus className="h-4 w-4" />
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
                    <Plus className="h-4 w-4" />
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
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder={selectedProduct.sellingPrice.toString()}
                />
                {Number(customPrice) > 0 &&
                  Number(customPrice) < selectedProduct.buyingPrice && (
                    <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="h-4 w-4" />
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
                className="bg-yellow-600 hover:bg-yellow-600/90 dark:bg-yellow-600"
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
