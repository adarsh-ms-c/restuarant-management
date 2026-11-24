import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/data";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Coffee Time",
  description: "Order Coffee Time favourites and manage orders, payments and stock.",
  icons: { icon: "/coffee-logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <DataProvider>{children}</DataProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
