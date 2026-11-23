import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/data";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "restuarant management",
  description: "Order items and manage restaurant orders, payments and stock.",
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
