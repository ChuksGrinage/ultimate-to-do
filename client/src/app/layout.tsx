/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { GeistSans } from "geist/font/sans";
import "~/styles/globals.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const queryClient = new QueryClient();

import { usePathname } from "next/navigation";
import { DashboardLayout } from "~/components";

export default function RootLayout({ children }) {
  const pathName = usePathname();
  return (
    <html lang="en" className={`h-full bg-gray-900 ${GeistSans.variable}`}>
      <body className="h-full">
        <QueryClientProvider client={queryClient}>
          {pathName === "/login" ? (
            <div className="flex h-full w-full items-center justify-center">
              {children}
            </div>
          ) : (
            <DashboardLayout>{children}</DashboardLayout>
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
