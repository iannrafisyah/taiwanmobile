export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  step: number;
  emoji: string;
};

export const products: Product[] = [
  { id: 1, name: "Kopi Arabika Gayo", description: "Biji kopi single origin 250gr", price: 85000, stock: 20, step: 1, emoji: "☕" },
  { id: 2, name: "Teh Hijau Premium", description: "Daun teh pilihan 100gr", price: 45000, stock: 30, step: 1, emoji: "🍵" },
  { id: 3, name: "Cokelat Bubuk", description: "Cokelat murni tanpa gula 200gr", price: 62000, stock: 15, step: 1, emoji: "🍫" },
  { id: 4, name: "Gula Aren Cair", description: "Pemanis alami botol 500ml", price: 38000, stock: 25, step: 1, emoji: "🍯" },
  { id: 5, name: "Susu UHT (dus isi 6)", description: "Dijual per kelipatan 6 pcs", price: 120000, stock: 24, step: 6, emoji: "🥛" },
  { id: 6, name: "Paper Filter V60", description: "Isi 100 lembar, kelipatan 2 pack", price: 55000, stock: 20, step: 2, emoji: "📦" },
];

export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
