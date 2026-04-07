"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductDialog } from "@/components/createProduct";
import { useProducts } from "@/context/productProvider";
import {
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  PlusCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteProductDialog } from "@/components/deleteProductDialog";
import { icons } from "@/constants/icons";
import { ContextMenuLabel } from "@radix-ui/react-context-menu";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ProductsPage() {
  const { products, productsLoading, productsRefetch } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products?.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full stroke-yellow-600 relative">
        <div className="absolute w-full h-full flex items-center justify-center">
          <p className="text-xs animate-bounce uppercase font-semibold text-pink-900">
            Alfajiri
          </p>
        </div>
        {icons.loading}
      </div>
    );
  }

  return (
    <div className="h-full">
      {products?.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package className="h-16 w-16 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No products yet</EmptyTitle>
              <EmptyDescription>
                Create your first product to start managing inventory, prices,
                and stock levels.
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <ProductDialog
                trigger={
                  <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white py-2 px-8 h-fit">
                    <PlusCircle className="h-5 w-5" />
                    Add Product
                  </Button>
                }
                onSuccess={() => productsRefetch()}
              />
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Header */}
          <div className="absolute w-full pb-2 border-b bg-white dark:bg-black">
            <div className="flex justify-between items-center gap-4">
              <div className="relative max-w-md">
                <Input
                  placeholder="Search products by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <ProductDialog
                trigger={
                  <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white">
                    <PlusCircle className="h-5 w-5" />
                    <span className="max-md:hidden">Add Product</span>
                  </Button>
                }
                onSuccess={() => productsRefetch()}
              />
            </div>
          </div>
          <div className="absolute h-[calc(100%-48px)] w-full mt-12 pt-1 overflow-y-auto">
            {filteredProducts?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm
                    ? "No products found matching your search."
                    : "No products yet. Create your first one!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredProducts?.map((product) => (
                  <ContextMenu key={product._id}>
                    <ContextMenuTrigger asChild>
                      <div className="hover:shadow transition-all duration-300 overflow-hidden border rounded-md p-2">
                        <div className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="line-clamp-2 font-semibold">
                                {product.productName}
                              </div>
                            </div>
                            <div className="lg:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  className="-mt-2 -mr-2">
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <Link href={`/products/${product._id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4 text-primary" />
                                      View Details
                                    </DropdownMenuItem>
                                  </Link>
                                  <ProductDialog
                                    trigger={
                                      <div className="flex items-center p-2 text-sm cursor-default hover:bg-muted rounded-md">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </div>
                                    }
                                    product={product}
                                    onSuccess={() => productsRefetch()}
                                  />
                                  <DeleteProductDialog
                                    product={{
                                      _id: product._id,
                                      productName: product.productName,
                                    }}
                                    onSuccess={() => productsRefetch()}
                                    trigger={
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                        Delete
                                      </DropdownMenuItem>
                                    }
                                  />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="py-2">
                          <div className="w-full flex justify-between items-center">
                            <p className="text-muted-foreground">Initial Qty</p>
                            <p className="font-medium">
                              {product.initialQuantity}{" "}
                              {product.measurementUnit}
                            </p>
                          </div>
                          <div className="w-full flex justify-between items-center">
                            <p className="text-muted-foreground">
                              Available Qty
                            </p>
                            <p
                              className={`font-semibold ${
                                product.isLowInStock ? "text-red-600" : ""
                              }`}>
                              {product.availableQuantity}{" "}
                              {product.measurementUnit}
                            </p>
                          </div>
                          <div className="w-full flex justify-between items-center">
                            <p className="text-muted-foreground">
                              Buying Price
                            </p>
                            <p className="font-medium">
                              TZS {product.buyingPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="w-full flex justify-between items-center">
                            <p className="text-muted-foreground">
                              Selling Price
                            </p>
                            <p className="font-semibold">
                              TZS {product.sellingPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex mt-2">
                          {product.code && (
                            <Badge
                              className="text-sm text-muted-foreground"
                              variant="outline">
                              {product.code}
                            </Badge>
                          )}
                          {product.isLowInStock && (
                            <Badge
                              variant="outline"
                              className="text-sm ml-2 outline-1 outline-red-500 bg-red-500/10 text-red-500">
                              <AlertCircle className="" />
                              Low in Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="fit">
                      <ContextMenuLabel className="font-semibold text-sm p-1">
                        Actions
                      </ContextMenuLabel>
                      <ContextMenuSeparator />
                      <ContextMenuItem asChild>
                        <Link
                          href={`/products/${product._id}`}
                          className="flex items-center">
                          <Eye className="mr-2 h-4 w-4 text-primary" />
                          View Details
                        </Link>
                      </ContextMenuItem>

                      <ProductDialog
                        trigger={
                          <div className="flex items-center p-2 text-sm cursor-default hover:bg-muted rounded-md">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </div>
                        }
                        product={product}
                        onSuccess={() => productsRefetch()}
                      />

                      <ContextMenuSeparator />

                      <DeleteProductDialog
                        product={{
                          _id: product._id,
                          productName: product.productName,
                        }}
                        onSuccess={() => productsRefetch()}
                        trigger={
                          <ContextMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            Delete Product
                          </ContextMenuItem>
                        }
                      />
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
