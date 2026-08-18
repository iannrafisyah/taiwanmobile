import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutModal, { validateAddress } from "./CheckoutModal";
import type { CartItem } from "@/context/CartContext";
import { SHIPPING_COST } from "@/data/paymentMethods";

const items: CartItem[] = [
  { id: 1, name: "Kopi Arabika Gayo", price: 85000, stock: 20, step: 1, emoji: "☕", quantity: 2 },
];
const subtotal = 170000;

const validAddress = {
  name: "Ian Rafisyah",
  phone: "081234567890",
  address: "Jl. Merdeka No. 45, Kelurahan Sukamaju",
  city: "Bandung",
  postalCode: "40123",
};

function renderModal(onConfirm = vi.fn()) {
  const onCancel = vi.fn();
  render(
    <CheckoutModal
      invoiceNumber="INV-2026-123456"
      items={items}
      totalPrice={subtotal}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
}

async function fillAddress(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nama penerima/i), validAddress.name);
  await user.type(screen.getByLabelText(/no\. telepon/i), validAddress.phone);
  await user.type(screen.getByLabelText(/alamat lengkap/i), validAddress.address);
  await user.type(screen.getByLabelText(/kota/i), validAddress.city);
  await user.type(screen.getByLabelText(/kode pos/i), validAddress.postalCode);
}

describe("validateAddress", () => {
  it("menerima alamat yang lengkap dan valid", () => {
    expect(validateAddress(validAddress)).toEqual({});
  });

  it("menolak setiap field yang kosong", () => {
    const errors = validateAddress({ name: "", phone: "", address: "", city: "", postalCode: "" });
    expect(Object.keys(errors).sort()).toEqual(["address", "city", "name", "phone", "postalCode"]);
  });

  it("menolak nomor telepon yang terlalu pendek atau berisi huruf", () => {
    expect(validateAddress({ ...validAddress, phone: "0812" }).phone).toBeDefined();
    expect(validateAddress({ ...validAddress, phone: "08123abcd" }).phone).toBeDefined();
  });

  it("menolak kode pos yang bukan 5 digit", () => {
    expect(validateAddress({ ...validAddress, postalCode: "401" }).postalCode).toBeDefined();
    expect(validateAddress({ ...validAddress, postalCode: "401234" }).postalCode).toBeDefined();
    expect(validateAddress({ ...validAddress, postalCode: "4012a" }).postalCode).toBeDefined();
  });

  it("menolak alamat yang lebih pendek dari 10 karakter", () => {
    expect(validateAddress({ ...validAddress, address: "Jl. Mawar" }).address).toBeDefined();
  });
});

describe("CheckoutModal (wizard 3 langkah)", () => {
  it("mulai dari langkah alamat", () => {
    renderModal();
    expect(screen.getByLabelText(/nama penerima/i)).toBeInTheDocument();
    expect(screen.queryByText(/pilih metode pembayaran/i)).not.toBeInTheDocument();
  });

  it("menahan langkah berikutnya saat alamat belum valid", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    expect(screen.getByText(/nama penerima wajib diisi/i)).toBeInTheDocument();
    expect(screen.queryByText(/pilih metode pembayaran/i)).not.toBeInTheDocument();
  });

  it("membersihkan pesan error setelah field diperbaiki", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: /lanjut/i }));
    expect(screen.getByText(/kota wajib diisi/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/kota/i), "Bandung");
    expect(screen.queryByText(/kota wajib diisi/i)).not.toBeInTheDocument();
  });

  it("melanjutkan ke pemilihan metode pembayaran saat alamat valid", async () => {
    const user = userEvent.setup();
    renderModal();

    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    expect(screen.getByText(/pilih metode pembayaran/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /transfer bank/i })).toBeChecked();
  });

  it("menghitung invoice dari subtotal + ongkir + biaya metode terpilih", async () => {
    const user = userEvent.setup();
    renderModal();

    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /lanjut/i }));
    await user.click(screen.getByRole("radio", { name: /e-wallet/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    const expectedTotal = subtotal + SHIPPING_COST + 2500;
    const totalRow = screen.getByText("Total bayar").parentElement as HTMLElement;
    expect(totalRow).toHaveTextContent(
      new Intl.NumberFormat("id-ID").format(expectedTotal),
    );
    expect(screen.getByText(/INV-/)).toBeInTheDocument();
    expect(screen.getByText(/Ian Rafisyah/)).toBeInTheDocument();
  });

  it("bisa kembali ke langkah sebelumnya tanpa kehilangan isian", async () => {
    const user = userEvent.setup();
    renderModal();

    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /lanjut/i }));
    await user.click(screen.getByRole("button", { name: /kembali/i }));

    expect(screen.getByLabelText(/nama penerima/i)).toHaveValue(validAddress.name);
  });

  it("mengirim nomor invoice saat pembayaran dikonfirmasi", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderModal();

    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /lanjut/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));
    await user.click(screen.getByRole("button", { name: /bayar sekarang/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith("INV-2026-123456");
  });

  it("tombol Batal di langkah pertama menutup modal tanpa membayar", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal();

    await user.click(screen.getByRole("button", { name: /batal/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
