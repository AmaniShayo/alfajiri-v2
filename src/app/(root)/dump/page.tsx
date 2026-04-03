import "@/app/globals.css"
import ClientProviders from "@/context/ClientProviders"
import { AuthProvider } from "@/context/authContext"
import { Toaster } from "@/components/ui/sonner"
import Image from "next/image"

export const metadata = {
  title: "ALFAJIRI - auth",
  description: "Inventory management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen antialiased">
        <ClientProviders>
          <AuthProvider>
            <Toaster />

            <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-amber-50 to-yellow-50 p-6">
              <div className="flex w-full max-w-275 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row">
                {/* Left - Form Area */}
                <div className="flex flex-col p-10 lg:w-5/12 lg:p-14">
                  <div className="mb-12">
                    <div className="inline-flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500">
                        <span className="text-2xl font-bold text-white">A</span>
                      </div>
                      <p className="text-4xl font-bold tracking-tighter text-zinc-900">
                        ALFAJIRI
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-center">
                    {children}
                  </div>
                </div>

                {/* Right - Image Area */}
                <div className="relative hidden min-h-155 bg-zinc-900 lg:block lg:w-7/12">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/auth-image.jpg')",
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-br from-black/10 via-transparent to-black/40" />

                  {/* Top Task Card */}
                  <div className="absolute top-10 right-10 w-72 rounded-2xl bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div>
                          <p className="text-sm font-semibold">
                            Task Review With Team
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            09:30am - 10:00am
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-yellow-500">
                        • Live
                      </div>
                    </div>
                  </div>

                  {/* Bottom Daily Meeting Card */}
                  <div className="absolute bottom-16 left-12 w-64 rounded-2xl bg-white p-5 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      <p className="text-sm font-semibold">Daily Meeting</p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      12:00pm - 01:00pm
                    </p>

                    <div className="mt-6 flex -space-x-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-white ring-offset-2">
                        <Image
                          src="/avatar1.jpg"
                          alt=""
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-white ring-offset-2">
                        <Image
                          src="/avatar2.jpg"
                          alt=""
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-white ring-offset-2">
                        <Image
                          src="/avatar3.jpg"
                          alt=""
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Floating Avatars */}
                  <div className="absolute top-1/3 right-20 h-11 w-11 overflow-hidden rounded-2xl border-4 border-white shadow-xl">
                    <Image
                      src="/avatar4.jpg"
                      alt=""
                      width={44}
                      height={44}
                      className="object-cover"
                    />
                  </div>

                  <div className="absolute top-2/3 right-32 h-9 w-9 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                    <Image
                      src="/avatar5.jpg"
                      alt=""
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
