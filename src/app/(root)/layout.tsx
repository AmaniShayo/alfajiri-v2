import "../globals.css"
import type { Metadata } from "next"
import ClientProviders from "@/context/ClientProviders"
import { AuthProvider } from "@/context/authContext"
import { Toaster } from "sonner"
import { UserProvider } from "@/context/userContext"
// import { AppSidebar } from "@/components/sidebar";
// import Header from "@/components/header";
import { ProductProvider } from "@/context/productProvider"
import { CustomerProvider } from "@/context/customerProvider"
import { ExpenseProvider } from "@/context/expenseProvider"
import { ReturnableProvider } from "@/context/returnableProvider"
import { BusinessProvider } from "@/context/businessProvider"
import { AppSidebar } from "@/components/sidebar"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "ALFAJIRI",
  description:
    "Inventory management system for your business needs. Streamline operations, track stock, and boost efficiency with our user-friendly platform.",
  manifest: "/manifest.json",
}

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white antialiased">
        <ClientProviders>
          <AuthProvider>
            <UserProvider>
              <BusinessProvider>
                <ProductProvider>
                  <CustomerProvider>
                    <ExpenseProvider>
                      <ReturnableProvider>
                        <Toaster position="top-center" />
                        <main className="w-screen">
                          <div className="flex h-screen w-screen md:p-2">
                            <AppSidebar />
                            <div className="h-full w-full overflow-hidden bg-background md:rounded-4xl md:shadow">
                              <Header />
                              <div className="h-[calc(100%-48px)] p-2">
                                {children}
                              </div>
                            </div>
                          </div>
                        </main>
                      </ReturnableProvider>
                    </ExpenseProvider>
                  </CustomerProvider>
                </ProductProvider>
              </BusinessProvider>
            </UserProvider>
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  )
}

export default RootLayout
