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
import { ReturnableDialog } from "@/components/returnableDialog";
import { useReturnables } from "@/context/returnableProvider";
import { Edit, Trash2, MoreVertical, Eye, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { icons } from "@/constants/icons";
import { DeleteReturnableDialog } from "@/components/deleteReturnableDialog";

export default function ReturnablesPage() {
  const { returnables, returnablesLoading, returnablesRefetch } =
    useReturnables();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReturnables = returnables?.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (returnablesLoading) {
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
      {returnables?.length === 0 ? (
        <div className="py-12 h-full w-full flex items-center justify-center flex-col">
          <Image
            src="/EmptyList.svg"
            alt="Empty returnables illustration"
            width={600}
            height={400}
            className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain"
            priority
          />
          <p className="text-xl font-bold mt-6">No returnable items yet.</p>
          <p className="text-muted-foreground mb-8">
            Start by adding crates, bottles, cylinders, etc.
          </p>
          <ReturnableDialog
            trigger={
              <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white text-lg py-2 px-8 h-fit w-fit">
                <PlusCircle className="h-6 w-6 mr-2" />
                Add Returnable
              </Button>
            }
            onSuccess={() => returnablesRefetch()}
          />
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Header */}
          <div className="absolute w-full pb-2 border-b bg-white dark:bg-black">
            <div className="flex justify-between items-center gap-4">
              <div className="relative max-w-md">
                <Input
                  placeholder="Search by name, unit..."
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

              <ReturnableDialog
                trigger={
                  <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span className="max-md:hidden">Add Returnable</span>
                  </Button>
                }
                onSuccess={() => returnablesRefetch()}
              />
            </div>
          </div>

          <div className="absolute h-[calc(100%-48px)] w-full mt-12 pt-1 overflow-y-auto">
            {filteredReturnables?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm
                    ? "No returnable items found matching your search."
                    : "No returnable items yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                {filteredReturnables?.map((item) => (
                  <ContextMenu key={item._id}>
                    <ContextMenuTrigger asChild>
                      <div className="hover:shadow-sm transition-all duration-200 overflow-hidden border rounded-lg p-3 bg-card">
                        <div className="pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="font-semibold line-clamp-2">
                                {item.name}
                              </div>
                            </div>

                            {/* Mobile actions */}
                            <div className="lg:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  className="-mt-1 -mr-1">
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  <Link href={`/returnables/${item._id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4 text-primary" />
                                      View Details
                                    </DropdownMenuItem>
                                  </Link>

                                  <ReturnableDialog
                                    returnable={item}
                                    trigger={
                                      <div className="flex items-center text-sm p-2 cursor-default">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </div>
                                    }
                                    onSuccess={() => returnablesRefetch()}
                                  />
                                  <DeleteReturnableDialog
                                    returnable={{
                                      _id: item._id,
                                      name: item.name,
                                    }}
                                    onSuccess={() => returnablesRefetch()}
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

                        <div className="py-3 space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Empty</span>
                            <span className="font-medium">
                              {item.totalEmpty.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Filled
                            </span>
                            <span className="font-medium">
                              {item.totalFilled.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Pending Returns
                            </span>
                            <span className="font-medium text-amber-600">
                              {item.totalPendingReturns.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-muted-foreground">
                              Price/Empty
                            </span>
                            <span className="font-semibold">
                              TZS {item.priceEmpty.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {item.unit}
                          </Badge>

                          {item.isActive ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-500/10 text-green-700">
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent>
                      <ContextMenuLabel className="font-semibold text-sm">
                        Actions
                      </ContextMenuLabel>
                      <ContextMenuSeparator />

                      <ContextMenuItem asChild>
                        <Link
                          href={`/returnables/${item._id}`}
                          className="flex items-center">
                          <Eye className="mr-2 h-4 w-4 text-primary" />
                          View Details
                        </Link>
                      </ContextMenuItem>
                      <ContextMenuItem asChild>
                        <ReturnableDialog
                          returnable={item}
                          trigger={
                            <div className="flex items-center text-sm p-2 cursor-default">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Returnable
                            </div>
                          }
                          onSuccess={() => returnablesRefetch()}
                        />
                      </ContextMenuItem>

                      <ContextMenuSeparator />
                      <ContextMenuItem asChild>
                        <DeleteReturnableDialog
                          returnable={item}
                          trigger={
                            <div className="flex items-center text-sm p-2 text-destructive cursor-default">
                              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                              Delete Returnable
                            </div>
                          }
                          onSuccess={() => returnablesRefetch()}
                        />
                      </ContextMenuItem>
                      {/* Add Delete context menu item here when ready */}
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
