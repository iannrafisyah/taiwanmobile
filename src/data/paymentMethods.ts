export type PaymentMethod = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  fee: number;
};

export const paymentMethods: PaymentMethod[] = [
  { id: "transfer", label: "Transfer Bank", description: "BCA / Mandiri / BNI · verifikasi manual", emoji: "🏦", fee: 0 },
  { id: "va", label: "Virtual Account", description: "Otomatis terverifikasi", emoji: "🔢", fee: 4000 },
  { id: "ewallet", label: "E-Wallet", description: "GoPay / OVO / DANA", emoji: "📱", fee: 2500 },
  { id: "cod", label: "Bayar di Tempat (COD)", description: "Bayar saat barang diterima", emoji: "💵", fee: 10000 },
];

export const SHIPPING_COST = 15000;
