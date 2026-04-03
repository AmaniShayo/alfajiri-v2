"use client";

import React, { createContext, useEffect, ReactNode, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
// import { useIdleTimeout } from "@/hooks/useIdleTimeout";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);

  const setToken = useAuthStore((state) => state.setToken);
  const clearToken = useAuthStore((state) => state.clearToken);

  const isLoggedIn = !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/verify-email"
      ) {
        router.push("/dashboard");
      }

      setToken(storedToken);
    } else {
      if (
        pathname !== "/login" &&
        pathname !== "/register" &&
        pathname !== "/forgot-password" &&
        pathname !== "/verify-email"
      ) {
        router.push("/login");
      }
    }
  }, [pathname, router, setToken]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    clearToken();
    router.push("/login");
  };

  // Optional: Idle timeout (uncomment when you add the hook)
  // useIdleTimeout(240, () => {
  //   if (isLoggedIn) {
  //     logout();
  //   }
  // });

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
