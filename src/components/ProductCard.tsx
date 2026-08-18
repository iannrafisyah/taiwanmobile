"use client";

import { formatIDR, type Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { notify } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    notify(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-slate-100 text-5xl">
        {product.emoji}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{product.description}</p>
      <p className="mt-3 text-lg font-bold text-slate-900">{formatIDR(product.price)}</p>
      <p className="mt-1 text-xs text-slate-500">
        Stok {product.stock}
        {product.step > 1 ? ` · kelipatan ${product.step}` : ""}
      </p>
      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Tambah ke Keranjang
      </button>
    </article>
  );
}
