import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductSection, { filterProducts } from "./ProductSection";
import ProductList from "./ProductList";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { products } from "@/data/products";

const renderSection = () =>
  render(
    <CartProvider>
      <ToastProvider>
        <ProductSection />
      </ToastProvider>
    </CartProvider>,
  );

describe("filterProducts", () => {
  it("mengembalikan semua produk saat query kosong atau hanya spasi", () => {
    expect(filterProducts("")).toHaveLength(products.length);
    expect(filterProducts("   ")).toHaveLength(products.length);
  });

  it("mencocokkan nama produk tanpa peduli huruf besar/kecil", () => {
    expect(filterProducts("KOPI").map((p) => p.name)).toEqual(["Kopi Arabika Gayo"]);
  });

  it("juga mencocokkan deskripsi produk", () => {
    const result = filterProducts("single origin");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Kopi Arabika Gayo");
  });

  it("mengembalikan array kosong bila tidak ada yang cocok", () => {
    expect(filterProducts("tidak-ada-produk-ini")).toEqual([]);
  });
});

describe("ProductSection", () => {
  it("menampilkan seluruh produk saat tidak ada query di URL", () => {
    renderSection();
    expect(screen.getAllByRole("button", { name: /tambah ke keranjang/i })).toHaveLength(products.length);
  });

  it("menampilkan pesan kosong saat hasil filter nihil", () => {
    render(<ProductList products={filterProducts("tidak-ada")} />);
    expect(screen.getByText(/produk tidak ditemukan/i)).toBeInTheDocument();
  });

  it("memiliki kotak pencarian yang bisa diketik", async () => {
    const user = userEvent.setup();
    renderSection();

    const input = screen.getByRole("searchbox", { name: /cari produk/i });
    await user.type(input, "teh");

    expect(input).toHaveValue("teh");
  });
});
