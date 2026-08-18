import { describe, expect, it } from "vitest";
import { generateInvoiceNumber } from "./invoice";

describe("generateInvoiceNumber", () => {
  it("mengikuti format INV-<tahun>-<6 digit>", () => {
    expect(generateInvoiceNumber(new Date("2026-08-18T10:00:00Z"))).toMatch(/^INV-2026-\d{6}$/);
  });

  it("memakai tahun dari tanggal yang diberikan", () => {
    expect(generateInvoiceNumber(new Date("2030-01-01T00:00:00Z"))).toContain("INV-2030-");
  });

  it("menghasilkan nomor berbeda untuk waktu yang berbeda", () => {
    const a = generateInvoiceNumber(new Date("2026-08-18T10:00:00Z"));
    const b = generateInvoiceNumber(new Date("2026-08-18T10:00:01Z"));
    expect(a).not.toBe(b);
  });
});
