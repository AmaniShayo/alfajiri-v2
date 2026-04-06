import "../globals.css"
import { Geist_Mono, Raleway, Roboto } from "next/font/google"
import type { Metadata } from "next"
import ClientProviders from "@/context/ClientProviders"
import { AuthProvider } from "@/context/authContext"
import { Toaster } from "sonner"
import { UserProvider } from "@/context/userContext"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "ALFAJIRI",
  description:
    "Inventory management system for your business needs. Streamline operations, track stock, and boost efficiency with our user-friendly platform.",
  manifest: "/manifest.json",
}

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" })

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          fontMono.variable,
          "font-sans",
          raleway.variable,
          robotoHeading.variable
        )}
      >
        <ClientProviders>
          <AuthProvider>
            <UserProvider>
              <Toaster />
              <main className="w-screen">
                <div className="flex h-screen w-screen">
                  <div className="h-screen w-full overflow-hidden">
                    <div className="relative h-screen w-full overflow-y-auto bg-linear-to-bl from-[#a9d7fc] via-[#fff0f5] to-[#feeecd]">
                      {children}
                    </div>
                  </div>
                </div>
              </main>
            </UserProvider>
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  )
}

export default RootLayout
