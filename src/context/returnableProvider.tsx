/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { icons } from "@/constants/icons";
import { useRouter } from "next/navigation";
import useAuth from "./authContext";

interface Returnable {
  _id: string;
  name: string;
  totalEmpty: number;
  totalFilled: number;
  priceEmpty: number;
  totalPendingReturns: number;
  unit: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReturnableContextType {
  returnablesLoading: boolean;
  returnables: Returnable[] | null;
  returnablesError: string | null;
  returnablesRefetch: () => void;
}

const ReturnableContext = createContext<ReturnableContextType | undefined>(
  undefined
);

interface ReturnableProviderProps {
  children: ReactNode;
}

export const ReturnableProvider: React.FC<ReturnableProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const router = useRouter();

  const { data, isLoading, error, refetch } =
    trpc.returnable.getMyReturnables.useQuery();

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      logout();
      router.push("/login");
    }
  }, [error, router, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen stroke-yellow-600 relative">
        <div className="absolute w-full h-full flex items-center justify-center">
          <p className="text-xs animate-bounce uppercase font-semibold text-pink-900">
            Alfajiri
          </p>
        </div>
        {icons.loading}
      </div>
    );
  }

  const serializedReturnables = data?.returnables
    ? (data.returnables.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      })) as Returnable[])
    : null;

  return (
    <ReturnableContext.Provider
      value={{
        returnablesLoading: isLoading,
        returnables: serializedReturnables,
        returnablesError: error ? error.message : null,
        returnablesRefetch: refetch,
      }}>
      {children}
    </ReturnableContext.Provider>
  );
};

export const useReturnables = (): ReturnableContextType => {
  const context = useContext(ReturnableContext);
  if (!context) {
    throw new Error("useReturnables must be used within a ReturnableProvider");
  }
  return context;
};

export default useReturnables;
