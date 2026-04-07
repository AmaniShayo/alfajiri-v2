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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseDialog } from "@/components/createAndUpdateExpense";
import {
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  PlusCircle,
  Tag,
  ScrollText,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { icons } from "@/constants/icons";

import { useExpenses } from "@/context/expenseProvider";

import { DeleteExpenseDialog } from "@/components/deleteExpenseDialog";

export default function ExpensesPage() {
  const { expenses, expensesLoading, expensesRefetch, totals, setFilters } =
    useExpenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "3months" | "year" | ""
  >("week");

  const filteredExpenses = expenses?.filter(
    (e) =>
      (e.description &&
        e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.remarks && e.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (expensesLoading) {
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
      {expenses?.length === 0 ? (
        <div className="py-12 h-full w-full flex items-center justify-center flex-col">
          <ScrollText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold mb-2">
            No expenses yet. Add your first expense!
          </p>
          <p className="text-muted-foreground mb-6"></p>
          <ExpenseDialog
            trigger={
              <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white text-lg py-2 px-8 h-fit w-fit">
                <span className="max-md:hidden">Add Expense</span>
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </Button>
            }
            onSuccess={() => expensesRefetch()}
          />
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Header */}
          <div className="absolute w-full pb-2 border-b bg-white dark:bg-black">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative max-w-md">
                  <Input
                    placeholder="Search by description, category or remarks"
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

                <div className="flex gap-2">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedPeriod}
                        onValueChange={(value) => {
                          setSelectedPeriod(
                            value as "week" | "month" | "3months" | "year" | ""
                          );
                          setFilters({
                            search: searchTerm,
                            period: selectedPeriod || undefined,
                            dateFrom: undefined,
                            dateTo: undefined,
                          });
                        }}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="3months">Last 3 Months</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <ExpenseDialog
                    trigger={
                      <Button className="bg-yellow-600 hover:bg-yellow-600/90 text-white">
                        <PlusCircle className="h-5 w-5" />
                        <span className="max-md:hidden">Add Expense</span>
                      </Button>
                    }
                    onSuccess={() => expensesRefetch()}
                  />
                </div>
              </div>

              {/* Filters */}
            </div>
          </div>

          {/* Totals */}
          {/* {totals && (
            <div className="px-4 py-2 bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="font-semibold">
                  Total Expenses: TZS {totals.totalSum.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  {Object.entries(totals.categorySums).map(
                    ([category, sum]) => (
                      <Badge key={category} variant="secondary">
                        {category}: TZS {sum.toLocaleString()}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          )} */}

          <div className="absolute h-[calc(100%-48px)] w-full mt-12 pt-1 overflow-y-auto">
            {filteredExpenses?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm
                    ? "No expenses found matching your search."
                    : "No expenses yet. Add your first one!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredExpenses?.map((expense) => (
                  <ContextMenu key={expense._id}>
                    <ContextMenuTrigger asChild>
                      <div className="hover:shadow transition-all duration-300 overflow-hidden border rounded-md p-3">
                        <div className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="font-semibold line-clamp-1">
                                {expense.description || "No description"}
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

                                  <Link href={`/expenses/${expense._id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 text-primary" />
                                      View Details
                                    </DropdownMenuItem>
                                  </Link>

                                  <ExpenseDialog
                                    expense={expense}
                                    onSuccess={() => expensesRefetch()}
                                    trigger={
                                      <span className="flex items-center p-2 text-sm cursor-default hover:bg-muted rounded-md">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </span>
                                    }
                                  />

                                  <DeleteExpenseDialog
                                    expense={{
                                      _id: expense._id,
                                      description: expense.description,
                                      amount: expense.amount,
                                    }}
                                    onSuccess={() => expensesRefetch()}
                                    trigger={
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
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
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            TZS {expense.amount.toLocaleString()}
                          </div>
                          <div className="flex items-start gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="line-clamp-2 text-muted-foreground">
                              {expense.category}
                            </span>
                          </div>

                          {/* {expense.remarks && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground line-clamp-1">
                                {expense.remarks}
                              </span>
                            </div>
                          )} */}
                        </div>

                        <Separator className="my-2" />

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {expense.category}
                          </Badge>
                        </div>
                      </div>
                    </ContextMenuTrigger>

                    {/* Desktop / Right-click menu */}
                    <ContextMenuContent>
                      <ContextMenuLabel className="font-semibold text-sm p-1">
                        Actions
                      </ContextMenuLabel>
                      <ContextMenuSeparator />

                      <ContextMenuItem asChild>
                        <Link
                          href={`/expenses/${expense._id}`}
                          className="flex items-center">
                          <Eye className=" h-4 w-4 text-primary" />
                          View Details
                        </Link>
                      </ContextMenuItem>

                      <ContextMenuItem asChild>
                        <ExpenseDialog
                          expense={expense}
                          onSuccess={() => expensesRefetch()}
                          trigger={
                            <span className="flex items-center p-2 text-sm cursor-default hover:bg-muted rounded-md">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Expense
                            </span>
                          }
                        />
                      </ContextMenuItem>

                      <ContextMenuSeparator />

                      <DeleteExpenseDialog
                        expense={{
                          _id: expense._id,
                          description: expense.description,
                          amount: expense.amount,
                        }}
                        onSuccess={() => expensesRefetch()}
                        trigger={
                          <ContextMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            Delete Expense
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
