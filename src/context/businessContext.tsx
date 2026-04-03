"use client";

import React, { createContext, ReactNode, useContext } from "react";
import { trpc } from "@/lib/trpc";
import { icons } from "@/constants/icons";
import { IUserAuth } from "@/server/database/model";

interface UserContextType {
  userLoading: boolean;
  user: IUserAuth | null;
  error: string | null;
  userRefetch: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
}) => {
  const { data, isLoading, error, refetch } = trpc.user.me.useQuery();

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

  return (
    <UserContext.Provider
      value={{
        userLoading: isLoading,
        user: data
          ? ({ ...data, _id: data._id.toString() } as unknown as IUserAuth)
          : null,
        error: error ? error.message : null,
        userRefetch: refetch,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserProfile = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserProfile must be used within an BusinessProvider");
  }
  return context;
};

export default useUserProfile;
