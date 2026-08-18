"use client";

import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <p className="text-lg font-bold text-slate-900">🛍️ Simple Shop</p>
        <div className="relative">
          <span className="text-2xl" aria-hidden>
            🛒
          </span>
          {totalQuantity > 0 && (
            <span className="absolute -right-2 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-bold leading-5 text-white">
              {totalQuantity}
            </span>
          )}
          <span className="sr-only">{totalQuantity} item di keranjang</span>
        </div>
      </div>
    </header>
  );
}
