"use client"

import React, { createContext, ReactNode, useContext, useEffect } from "react"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import useAuth from "./authContext"
import { Business, User } from "@/constants/types"
import { Loading } from "@/components/loading"

interface UserContextType {
  userLoading: boolean
  user: User | null
  business: Business | null
  error: string | null
  userRefetch: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const router = useRouter()
  const path = usePathname()
  const { logout } = useAuth()
  const { data, isLoading, error, refetch } = trpc.user.me.useQuery()
  console.log(data)

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      logout()
      router.push("/login")
    }
  }, [error, logout, router])

  useEffect(() => {
    if (data && !data.business && path !== "/admin") {
      router.push("/onboarding")
    }
  }, [data, router, path])

  if (isLoading) {
    return <Loading />
  }

  return (
    <UserContext.Provider
      value={{
        userLoading: isLoading,
        user: data
          ? ({ ...data, _id: data._id.toString() } as unknown as User)
          : null,
        business: data?.business
          ? ({
              ...data.business,
              _id: data.business._id.toString(),
            } as unknown as Business)
          : null,
        error: error ? error.message : null,
        userRefetch: refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserProfile = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserProfile must be used within an UserProvider")
  }
  return context
}

export default useUserProfile
