import "../globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "ALFAJIRI",
  description:
    "Inventory management system for your business needs. Streamline operations, track stock, and boost efficiency with our user-friendly platform.",
  manifest: "/manifest.json",
};

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.className} antialiased bg-white dark:bg-black dark:text-white`}>
        <main className="w-screen">
          <div className="w-screen h-screen flex">
            <div className="w-full h-screen overflow-hidden">
              <div className="h-screen relative overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

export default RootLayout;
