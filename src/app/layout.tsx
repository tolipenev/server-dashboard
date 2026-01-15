import type { Metadata } from "next";
import Navbar from "@/components/custom/navbar";
import { Providers } from "@/components/custom/providers";
import { auth } from "@/lib/auth";
import "./globals.css";
export const metadata: Metadata = {
  title: "Home Server",
  description: "Home Server",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased min-h-screen bg-background text-foreground"
        suppressHydrationWarning
      >
        <Providers session={session}>
          <main className="min-h-screen flex flex-col">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {session?.user && <Navbar />}
              <div className="flex-1 mt-6">{children}</div>
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
