/** Membuat nomor invoice, dipanggil dari event handler (bukan saat render). */
export function generateInvoiceNumber(now: Date = new Date()) {
  return `INV-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`;
}
