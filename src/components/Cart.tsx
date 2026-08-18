"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatIDR } from "@/data/products";
import ConfirmDialog from "./ConfirmDialog";
import CheckoutModal from "./CheckoutModal";
import { generateInvoiceNumber } from "@/lib/invoice";

export default function Cart() {
  const { items, totalQuantity, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { notify } = useToast();
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null);
  // Menyimpan nomor invoice sekaligus menandai sesi checkout yang aktif.
  const [checkoutInvoice, setCheckoutInvoice] = useState<string | null>(null);

  const pendingItem = items.find((item) => item.id === pendingRemoveId) ?? null;

  const handleConfirmRemove = () => {
    if (pendingItem) {
      removeItem(pendingItem.id);
      notify(`${pendingItem.name} dihapus dari keranjang`);
    }
    setPendingRemoveId(null);
  };

  const handleConfirmCheckout = (invoiceNumber: string) => {
    clearCart();
    setCheckoutInvoice(null);
    notify(`Pembayaran berhasil · ${invoiceNumber}`);
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Keranjang <span className="text-sm font-normal text-slate-500">({totalQuantity} item)</span>
      </h2>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Keranjang masih kosong.</p>
      ) : (
        <>
          {/* Batas tinggi + scroll agar banyak item tidak merusak layout */}
          <ul className="mt-4 max-h-96 divide-y divide-slate-100 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 py-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatIDR(item.price)} × {item.quantity} = {formatIDR(item.price * item.quantity)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Kurangi ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity - item.step)}
                      className="h-7 w-7 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      aria-label={`Kuantitas ${item.name}`}
                      value={item.quantity}
                      min={item.step}
                      max={item.stock}
                      step={item.step}
                      onChange={(event) => updateQuantity(item.id, parseInt(event.target.value, 10))}
                      className="h-7 w-16 rounded border border-slate-300 px-2 text-center text-sm text-slate-900"
                    />
                    <button
                      type="button"
                      aria-label={`Tambah ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + item.step)}
                      className="h-7 w-7 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingRemoveId(item.id)}
                      className="ml-auto text-xs font-medium text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-lg font-bold text-slate-900">{formatIDR(totalPrice)}</span>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutInvoice(generateInvoiceNumber())}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Checkout
          </button>
        </>
      )}

      <ConfirmDialog
        open={pendingItem !== null}
        title="Hapus item?"
        confirmLabel="Hapus"
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemoveId(null)}
      >
        {pendingItem ? `"${pendingItem.name}" akan dihapus dari keranjang.` : null}
      </ConfirmDialog>

      {checkoutInvoice && (
        <CheckoutModal
          invoiceNumber={checkoutInvoice}
          items={items}
          totalPrice={totalPrice}
          onConfirm={handleConfirmCheckout}
          onCancel={() => setCheckoutInvoice(null)}
        />
      )}
    </aside>
  );
}
