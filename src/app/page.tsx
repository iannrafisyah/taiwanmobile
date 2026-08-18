import { Suspense } from "react";
import ProductSection from "@/components/ProductSection";
import Cart from "@/components/Cart";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* useSearchParams butuh Suspense boundary di App Router. */}
        <Suspense fallback={<p className="text-sm text-slate-500">Memuat produk…</p>}>
          <ProductSection />
        </Suspense>
        <Cart />
      </div>
    </main>
  );
}
