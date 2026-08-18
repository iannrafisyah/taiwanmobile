import type { Product } from "@/data/products";
import ProductCard from "./ProductCard";

export default function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Produk tidak ditemukan.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
