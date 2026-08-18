import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Simple Shop",
  description: "Product list, shopping cart, dan simulasi checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <CartProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
