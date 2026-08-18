"use client";

import { useEffect, useRef, useState } from "react";
import type { CartItem } from "@/context/CartContext";
import { formatIDR } from "@/data/products";
import { paymentMethods, SHIPPING_COST } from "@/data/paymentMethods";

export type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

const emptyAddress: ShippingAddress = { name: "", phone: "", address: "", city: "", postalCode: "" };

const STEPS = ["Alamat", "Pembayaran", "Invoice"] as const;

export type AddressErrors = Partial<Record<keyof ShippingAddress, string>>;

export function validateAddress(address: ShippingAddress): AddressErrors {
  const errors: AddressErrors = {};
  if (!address.name.trim()) errors.name = "Nama penerima wajib diisi.";
  if (!/^[0-9+\-\s]{8,}$/.test(address.phone.trim())) errors.phone = "Nomor telepon minimal 8 digit angka.";
  if (address.address.trim().length < 10) errors.address = "Alamat terlalu pendek (minimal 10 karakter).";
  if (!address.city.trim()) errors.city = "Kota wajib diisi.";
  if (!/^[0-9]{5}$/.test(address.postalCode.trim())) errors.postalCode = "Kode pos harus 5 digit angka.";
  return errors;
}

export default function CheckoutModal({
  invoiceNumber,
  items,
  totalPrice,
  onConfirm,
  onCancel,
}: {
  invoiceNumber: string;
  items: CartItem[];
  totalPrice: number;
  onConfirm: (invoiceNumber: string) => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [paymentId, setPaymentId] = useState(paymentMethods[0].id);

  const payment = paymentMethods.find((method) => method.id === paymentId) ?? paymentMethods[0];
  const grandTotal = totalPrice + SHIPPING_COST + payment.fee;

  // Modal di-mount hanya ketika checkout dimulai, jadi state wizard selalu
  // mulai bersih tanpa perlu reset manual di dalam effect.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const goNext = () => {
    if (step === 0) {
      const nextErrors = validateAddress(address);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }
    setStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const inputClass = (field: keyof ShippingAddress) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 ${
      errors[field] ? "border-red-400" : "border-slate-300"
    }`;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(34rem,92vw)] rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-900/50"
    >
      <h2 className="text-lg font-semibold">Checkout</h2>

      {/* Indikator langkah */}
      <ol className="mt-4 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                index <= step ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {index + 1}
            </span>
            <span className={`text-xs font-medium ${index <= step ? "text-slate-900" : "text-slate-400"}`}>
              {label}
            </span>
            {index < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      <div className="mt-5 max-h-[60vh] overflow-y-auto text-sm">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="ck-name" className="mb-1 block text-xs font-medium text-slate-600">Nama Penerima</label>
              <input id="ck-name" value={address.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="ck-phone" className="mb-1 block text-xs font-medium text-slate-600">No. Telepon</label>
              <input id="ck-phone" inputMode="tel" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ck-address" className="mb-1 block text-xs font-medium text-slate-600">Alamat Lengkap</label>
              <textarea id="ck-address" rows={3} value={address.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass("address")} />
              {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            </div>
            <div>
              <label htmlFor="ck-city" className="mb-1 block text-xs font-medium text-slate-600">Kota</label>
              <input id="ck-city" value={address.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass("city")} />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="ck-postal" className="mb-1 block text-xs font-medium text-slate-600">Kode Pos</label>
              <input id="ck-postal" inputMode="numeric" maxLength={5} value={address.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} className={inputClass("postalCode")} />
              {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-medium text-slate-600">Pilih metode pembayaran</legend>
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  paymentId === method.id ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={paymentId === method.id}
                  onChange={() => setPaymentId(method.id)}
                  className="h-4 w-4 accent-slate-900"
                />
                <span className="text-xl">{method.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900">{method.label}</span>
                  <span className="block text-xs text-slate-500">{method.description}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                  {method.fee === 0 ? "Gratis" : `+${formatIDR(method.fee)}`}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Nomor Invoice</p>
              <p className="font-mono text-sm font-semibold text-slate-900">{invoiceNumber}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">Dikirim ke</p>
              <p className="font-medium text-slate-900">{address.name} · {address.phone}</p>
              <p className="text-slate-600">{address.address}, {address.city} {address.postalCode}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">Metode pembayaran</p>
              <p className="text-slate-900">{payment.emoji} {payment.label}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">Rincian pesanan</p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span className="truncate text-slate-700">{item.name} × {item.quantity}</span>
                    <span className="shrink-0 text-slate-900">{formatIDR(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-1 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="text-slate-900">{formatIDR(totalPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Ongkos kirim</dt>
                <dd className="text-slate-900">{formatIDR(SHIPPING_COST)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Biaya {payment.label}</dt>
                <dd className="text-slate-900">{formatIDR(payment.fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                <dt>Total bayar</dt>
                <dd>{formatIDR(grandTotal)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          onClick={step === 0 ? onCancel : () => setStep((prev) => prev - 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {step === 0 ? "Batal" : "Kembali"}
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Lanjut
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onConfirm(invoiceNumber)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Bayar Sekarang
          </button>
        )}
      </div>
    </dialog>
  );
}
