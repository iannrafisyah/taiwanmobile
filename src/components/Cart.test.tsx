import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Header from "./Header";
import { products } from "@/data/products";

function renderShop() {
  return render(
    <CartProvider>
      <ToastProvider>
        <Header />
        <ProductList products={products} />
        <Cart />
      </ToastProvider>
    </CartProvider>,
  );
}

const addToCart = async (user: ReturnType<typeof userEvent.setup>, productName: string) => {
  const card = screen.getByText(productName).closest("article") as HTMLElement;
  await user.click(within(card).getByRole("button", { name: /tambah ke keranjang/i }));
};

describe("Cart", () => {
  it("menampilkan keadaan kosong pada awalnya", () => {
    renderShop();
    expect(screen.getByText(/keranjang masih kosong/i)).toBeInTheDocument();
  });

  it("menambahkan produk, menampilkan toast, dan memperbarui badge navbar", async () => {
    const user = userEvent.setup();
    renderShop();

    await addToCart(user, "Kopi Arabika Gayo");

    expect(await screen.findByRole("status")).toHaveTextContent(/ditambahkan ke keranjang/i);
    expect(screen.getByText("1 item di keranjang")).toBeInTheDocument();
    // Cek angka pada baris "Total", bukan harga di kartu produk / baris item.
    const cartPanel = screen.getByRole("complementary");
    const totalValue = within(cartPanel).getByText("Total").nextElementSibling;
    expect(totalValue).toHaveTextContent(/Rp\s?85\.000/);
  });

  it("menjumlahkan badge dari kuantitas, bukan jumlah jenis barang", async () => {
    const user = userEvent.setup();
    renderShop();

    await addToCart(user, "Kopi Arabika Gayo");   // step 1
    await addToCart(user, "Susu UHT (dus isi 6)"); // step 6

    expect(screen.getByText("7 item di keranjang")).toBeInTheDocument();
  });

  it("menaikkan kuantitas sesuai kelipatan produk lewat tombol +", async () => {
    const user = userEvent.setup();
    renderShop();
    await addToCart(user, "Susu UHT (dus isi 6)");

    await user.click(screen.getByRole("button", { name: /tambah susu uht/i }));

    expect(screen.getByRole("spinbutton", { name: /kuantitas susu uht/i })).toHaveValue(12);
  });

  it("meminta konfirmasi sebelum menghapus item", async () => {
    const user = userEvent.setup();
    renderShop();
    await addToCart(user, "Kopi Arabika Gayo");

    await user.click(screen.getByRole("button", { name: /^hapus$/i }));
    expect(screen.getByText(/akan dihapus dari keranjang/i)).toBeInTheDocument();

    // Batal -> item tetap ada
    await user.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.getByText("1 item di keranjang")).toBeInTheDocument();
  });

  it("menghapus item setelah konfirmasi", async () => {
    const user = userEvent.setup();
    renderShop();
    await addToCart(user, "Kopi Arabika Gayo");

    await user.click(screen.getByRole("button", { name: /^hapus$/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /^hapus$/i }));

    expect(screen.getByText(/keranjang masih kosong/i)).toBeInTheDocument();
  });
});
