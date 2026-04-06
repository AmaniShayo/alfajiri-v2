/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"
import useAuth from "./authContext"
import { Loading } from "@/components/loading"

interface ExpenseOption {
  _id: string
  amount: number
  description?: string
  category: string
  business: string
  store?: string
  issuedBy: string
  attachment?: string
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

interface ExpenseFilters {
  search?: string
  category?: string
  period?: "week" | "month" | "3months" | "year"
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

interface ExpenseContextType {
  expensesLoading: boolean
  expenses: ExpenseOption[] | null
  expensesError: string | null
  expensesRefetch: () => void
  totals: { totalSum: number; categorySums: Record<string, number> } | null
  setFilters: (filters: ExpenseFilters) => void
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

interface ExpenseProviderProps {
  children: ReactNode
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth()
  const router = useRouter()
  const [filters, setFilters] = useState<ExpenseFilters>({})

  const { data, isLoading, error, refetch } =
    trpc.expense.getMyExpenses.useQuery(filters)

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      logout()
      router.push("/login")
    }
  }, [error, router, logout])

  if (isLoading && !data) {
    return <Loading />
  }

  const serializedExpenses = data?.expenses
    ? (data.expenses.map((e: any) => ({
        ...e,
        _id: e._id.toString(),
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })) as ExpenseOption[])
    : null

  return (
    <ExpenseContext.Provider
      value={{
        expensesLoading: isLoading,
        expenses: serializedExpenses,
        expensesError: error ? error.message : null,
        expensesRefetch: refetch,
        totals: data?.totals || null,
        setFilters,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error("useExpenses must be used within a ExpenseProvider")
  }
  return context
}

export default useExpenses
