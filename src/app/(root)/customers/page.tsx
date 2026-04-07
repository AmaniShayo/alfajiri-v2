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
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { CustomerDialog } from "@/components/createAndUpdateCustomer";
import {
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCustomers } from "@/context/customerProvider";
import { DeleteCustomerDialog } from "@/components/deleteCustomerDialog";
import { icons } from "@/constants/icons";

export default function CustomersPage() {
  const { customers, customersLoading, customersRefetch } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers?.filter((c) =>
    [c.customerName, c.phoneNumber, c.emailAddress, c.address]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (customersLoading) {
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
      {customers?.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-16 w-16 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No customers yet</EmptyTitle>
              <EmptyDescription>
                Add your first customer to get started. You can manage contacts,
                track sales, and more.
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <CustomerDialog
                trigger={
                  <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white py-2 px-8 h-fit">
                    <PlusCircle className="h-5 w-5" />
                    Add Customer
                  </Button>
                }
                onSuccess={() => customersRefetch()}
              />
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Header */}
          <div className="sticky top-0 w-full pb-2 border-b bg-white dark:bg-black">
            <div className="flex justify-between items-center gap-4">
              <div className="relative max-w-md">
                <Input
                  placeholder="Search by name, phone, email or address"
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

              <CustomerDialog
                trigger={
                  <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white">
                    <PlusCircle className="h-5 w-5" />
                    <span className="max-md:hidden">Add Customer</span>
                  </Button>
                }
                onSuccess={() => customersRefetch()}
              />
            </div>
          </div>

          <div className="mt-2 h-[calc(100%-68px)] overflow-y-auto pt-1">
            {filteredCustomers?.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {searchTerm
                    ? "No customers found matching your search."
                    : "No customers found."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredCustomers?.map((customer) => (
                  <ContextMenu key={customer._id}>
                    <ContextMenuTrigger asChild>
                      <div className="group border rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-card">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-1 text-base">
                              {customer.customerName}
                            </h3>
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              {customer.phoneNumber}
                            </div>
                          </div>

                          <div className="lg:hidden -mr-1 -mt-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                  <Link href={`/customers/${customer._id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>

                                <CustomerDialog
                                  customer={customer}
                                  onSuccess={() => customersRefetch()}
                                  trigger={
                                    <DropdownMenuItem className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  }
                                />

                                <DeleteCustomerDialog
                                  customer={{
                                    _id: customer._id,
                                    customerName: customer.customerName,
                                  }}
                                  onSuccess={() => customersRefetch()}
                                  trigger={
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive cursor-pointer"
                                      onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  }
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <Separator className="mb-3" />

                        <div className="space-y-2 text-sm text-muted-foreground">
                          {customer.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">
                                {customer.address}
                              </span>
                            </div>
                          )}

                          {customer.emailAddress && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span className="line-clamp-1 break-all">
                                {customer.emailAddress}
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex flex-wrap gap-2">
                          {customer.emailAddress && (
                            <Badge variant="secondary" className="text-xs">
                              Has Email
                            </Badge>
                          )}
                        </div>
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-56">
                      <ContextMenuLabel>Customer Actions</ContextMenuLabel>
                      <ContextMenuSeparator />

                      <ContextMenuItem asChild>
                        <Link
                          href={`/customers/${customer._id}`}
                          className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </ContextMenuItem>

                      <ContextMenuItem asChild>
                        <CustomerDialog
                          customer={customer}
                          onSuccess={() => customersRefetch()}
                          trigger={
                            <span className="flex items-center w-full p-2 text-sm cursor-pointer hover:bg-accent rounded-sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </span>
                          }
                        />
                      </ContextMenuItem>

                      <ContextMenuSeparator />

                      <DeleteCustomerDialog
                        customer={{
                          _id: customer._id,
                          customerName: customer.customerName,
                        }}
                        onSuccess={() => customersRefetch()}
                        trigger={
                          <ContextMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
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
