"use client";

import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { icons } from "@/constants/icons";
import { useRouter } from "next/navigation";
import useAuth from "./authContext";
import { useUserProfile } from "./userContext";

interface Business {
  _id: string;
  businessName: string;
  TINNumber?: string;
  owner: string;
  about?: string;
  currency: string;
  address: string;
  productKey: {
    _id: string;
    key: string;
    generatedAt: Date;
    notes?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface BusinessContextType {
  businessesLoading: boolean;
  businesses: Business[] | null;
  businessesError: string | null;
  businessesRefetch: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const router = useRouter();
  const { user } = useUserProfile();

  const isOwner = user?.role === "owner";

  const { data, isLoading, error, refetch } =
    trpc.business.getMyBusinesses.useQuery(undefined, {
      enabled: isOwner,
    });

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      logout();
      router.push("/login");
    }
  }, [error, router, logout]);

  if (!isOwner) {
    return (
      <BusinessContext.Provider
        value={{
          businessesLoading: false,
          businesses: null,
          businessesError: null,
          businessesRefetch: () => {},
        }}>
        {children}
      </BusinessContext.Provider>
    );
  }

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

  const serializedBusinesses = data?.businesses
    ? (data.businesses.map((business: Business) => ({
        ...business,
        _id: business._id.toString(),
        productKey: business.productKey
          ? { ...business.productKey, _id: business.productKey._id.toString() }
          : undefined,
      })) as unknown as Business[])
    : null;

  return (
    <BusinessContext.Provider
      value={{
        businessesLoading: isLoading,
        businesses: serializedBusinesses,
        businessesError: error ? error.message : null,
        businessesRefetch: refetch,
      }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinesses = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusinesses must be used within a BusinessProvider");
  }
  return context;
};

export default useBusinesses;
