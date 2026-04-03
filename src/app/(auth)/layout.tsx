import "@/app/globals.css"
1
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
            <div className="animate-gradient grid h-screen w-full grid-cols-12 bg-linear-to-bl from-[#82c7ff] via-[#fff0f5] to-[#feeecd]">
              <div className="col-span-4 max-md:col-span-12">
                <div className="flex h-full w-full flex-col p-4">
                  <div className="">
                    <div className="flex w-fit items-center gap-2 rounded-full border bg-white px-4 py-2">
                      <Image
                        src="/logo.svg"
                        alt="logo Illustration"
                        width={40}
                        height={40}
                      />
                      <h1 className="text-2xl font-bold tracking-tighter text-zinc-900">
                        ALFAJIRI
                      </h1>
                    </div>
                  </div>
                  <div className="flex w-full flex-1 items-center justify-center">
                    {children}
                  </div>
                </div>
              </div>
              <div className="col-span-8 p-4 pl-0 max-md:hidden">
                <div className="relative h-full w-full rounded-4xl bg-[url('/auth.png')] bg-cover bg-center">
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

                  <div className="absolute bottom-16 left-12 w-64 rounded-2xl bg-white p-5 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      <p className="text-sm font-semibold">
                        Manage Collaborators
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Add employees with different access levels to your
                      business
                    </p>

                    <div className="mt-6 flex -space-x-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-white ring-offset-2">
                        <Image
                          src="/p2.jpg"
                          alt=""
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-white ring-offset-2">
                        <Image
                          src="/p3.jpg"
                          alt=""
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-white ring-offset-2">
                        <Image
                          src="/p1.jpg"
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
                      src="/a2.jpeg"
                      alt=""
                      width={44}
                      height={44}
                      className="object-cover"
                    />
                  </div>

                  <div className="absolute top-2/3 right-32 h-9 w-9 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                    <Image
                      src="/a3.jpeg"
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
