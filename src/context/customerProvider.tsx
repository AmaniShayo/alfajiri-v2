/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { createContext, ReactNode, useContext, useEffect } from "react"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"
import useAuth from "./authContext"
import { Loading } from "@/components/loading"

interface CustomerOption {
  _id: string
  customerName: string
  phoneNumber: string
  emailAddress?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

interface CustomerContextType {
  customersLoading: boolean
  customers: CustomerOption[] | null
  customersError: string | null
  customersRefetch: () => void
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
)

interface CustomerProviderProps {
  children: ReactNode
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth()
  const router = useRouter()

  const { data, isLoading, error, refetch } =
    trpc.customer.getCustomerOptions.useQuery(undefined)

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      logout()
      router.push("/login")
    }
  }, [error, router, logout])

  if (isLoading && !data) {
    return <Loading />
  }

  const serializedCustomers = data?.options
    ? (data.options.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      })) as CustomerOption[])
    : null

  return (
    <CustomerContext.Provider
      value={{
        customersLoading: isLoading,
        customers: serializedCustomers,
        customersError: error ? error.message : null,
        customersRefetch: refetch,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomers = (): CustomerContextType => {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error("useCustomers must be used within a CustomerProvider")
  }
  return context
}

export default useCustomers
