"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";

  const [value, setValue] = useState(queryFromUrl);
  const debouncedValue = useDebouncedValue(value, 300);
  const lastPushed = useRef(queryFromUrl);

  // Sinkronkan URL setelah user berhenti mengetik (debounce).
  useEffect(() => {
    if (debouncedValue === lastPushed.current) return;
    lastPushed.current = debouncedValue;

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (debouncedValue.trim()) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }
    const queryString = params.toString();
    router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
  }, [debouncedValue, router, searchParams]);

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="w-full sm:max-w-xs"
    >
      <label htmlFor="product-search" className="sr-only">
        Cari produk
      </label>
      <input
        id="product-search"
        type="search"
        value={value}
        placeholder="Cari produk…"
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900"
      />
    </form>
  );
}
