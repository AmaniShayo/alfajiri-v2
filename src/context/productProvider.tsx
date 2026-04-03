"use client";

import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { icons } from "@/constants/icons";
import { useRouter } from "next/navigation";
import useAuth from "./authContext";

interface Product {
  _id: string;
  productName: string;
  code?: string;
  description?: string;
  category: { _id: string; name?: string } | null;
  supplier: { _id: string; name?: string } | null;
  store: { _id: string; name?: string } | null;
  returnableGroup: { _id: string; name?: string } | null;
  buyingPrice: number;
  sellingPrice: number;
  initialQuantity: number;
  availableQuantity: number;
  lowInStockLimit: number;
  measurementUnit: string;
  isLowInStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductContextType {
  productsLoading: boolean;
  products: Product[] | null;
  productsError: string | null;
  productsRefetch: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const router = useRouter();
  const { data, isLoading, error, refetch } =
    trpc.product.getMyProducts.useQuery();

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

  const serializedProducts = data?.products
    ? (data.products.map((p: Product) => ({
        ...p,
        _id: p._id.toString(),
        category: p.category
          ? { ...p.category, _id: p.category._id.toString() }
          : null,
        supplier: p.supplier
          ? { ...p.supplier, _id: p.supplier._id.toString() }
          : null,
        store: p.store ? { ...p.store, _id: p.store._id.toString() } : null,
        returnableGroup: p.returnableGroup
          ? { ...p.returnableGroup, _id: p.returnableGroup._id.toString() }
          : null,
      })) as unknown as Product[])
    : null;

  return (
    <ProductContext.Provider
      value={{
        productsLoading: isLoading,
        products: serializedProducts,
        productsError: error ? error.message : null,
        productsRefetch: refetch,
      }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

export default useProducts;
