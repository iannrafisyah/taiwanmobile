"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import ProductList from "./ProductList";
import SearchBox from "./SearchBox";

/** Memfilter produk berdasarkan query `?q=` di URL (single source of truth). */
export function filterProducts(keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized),
  );
}

export default function ProductSection() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const filteredProducts = useMemo(() => filterProducts(query), [query]);

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-900">Daftar Produk</h1>
        <SearchBox />
      </div>
      <ProductList products={filteredProducts} />
    </section>
  );
}
