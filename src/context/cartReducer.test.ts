import { describe, expect, it } from "vitest";
import { cartReducer, initialCartState, type CartItem } from "./CartContext";
import { products } from "@/data/products";

const kopi = products.find((p) => p.step === 1)!;       // step 1, stok 20
const susu = products.find((p) => p.id === 5)!;          // step 6, stok 24
const teh = products[1];

const itemOf = (overrides: Partial<CartItem> & { id: number }): CartItem => ({
  name: "X",
  price: 1000,
  stock: 100,
  step: 1,
  emoji: "x",
  quantity: 1,
  ...overrides,
});

const stateWith = (items: CartItem[]) => ({
  items,
  totalQuantity: items.reduce((t, i) => t + i.quantity, 0),
  totalPrice: items.reduce((t, i) => t + i.price * i.quantity, 0),
});

describe("cartReducer / ADD_ITEM", () => {
  it("menambahkan produk baru dengan kuantitas sebesar step-nya", () => {
    const state = cartReducer(initialCartState, { type: "ADD_ITEM", product: susu });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(6);
    expect(state.totalQuantity).toBe(6);
    expect(state.totalPrice).toBe(susu.price * 6);
  });

  it("tidak menduplikasi item, hanya menambah kuantitas", () => {
    let state = cartReducer(initialCartState, { type: "ADD_ITEM", product: kopi });
    state = cartReducer(state, { type: "ADD_ITEM", product: kopi });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("tidak memutasi state sebelumnya", () => {
    const before = cartReducer(initialCartState, { type: "ADD_ITEM", product: kopi });
    const snapshot = JSON.parse(JSON.stringify(before));
    const after = cartReducer(before, { type: "ADD_ITEM", product: kopi });

    expect(before).toEqual(snapshot);
    expect(after).not.toBe(before);
    expect(after.items[0]).not.toBe(before.items[0]);
  });

  it("menahan penambahan pada batas stok", () => {
    // susu: stok 24, step 6 -> maksimal 4x tambah
    let state = initialCartState;
    for (let i = 0; i < 10; i += 1) {
      state = cartReducer(state, { type: "ADD_ITEM", product: susu });
    }
    expect(state.items[0].quantity).toBe(24);
  });
});

describe("cartReducer / UPDATE_QUANTITY (bug kelipatan)", () => {
  it("membulatkan nilai non-kelipatan ke kelipatan step terdekat", () => {
    const state = stateWith([itemOf({ id: 5, step: 6, stock: 24, quantity: 6 })]);
    const next = cartReducer(state, { type: "UPDATE_QUANTITY", id: 5, quantity: 8 });

    expect(next.items[0].quantity).toBe(6); // 8/6 -> round(1.33)=1 -> 6
  });

  it("membulatkan ke atas ketika lebih dekat ke kelipatan berikutnya", () => {
    const state = stateWith([itemOf({ id: 5, step: 6, stock: 24, quantity: 6 })]);
    const next = cartReducer(state, { type: "UPDATE_QUANTITY", id: 5, quantity: 10 });

    expect(next.items[0].quantity).toBe(12); // round(1.67)=2 -> 12
  });

  it("tidak pernah turun di bawah satu step", () => {
    const state = stateWith([itemOf({ id: 5, step: 6, stock: 24, quantity: 6 })]);

    expect(cartReducer(state, { type: "UPDATE_QUANTITY", id: 5, quantity: 0 }).items[0].quantity).toBe(6);
    expect(cartReducer(state, { type: "UPDATE_QUANTITY", id: 5, quantity: -12 }).items[0].quantity).toBe(6);
  });

  it("dibatasi oleh stok yang tersedia", () => {
    const state = stateWith([itemOf({ id: 5, step: 6, stock: 24, quantity: 6 })]);
    const next = cartReducer(state, { type: "UPDATE_QUANTITY", id: 5, quantity: 999 });

    expect(next.items[0].quantity).toBe(24);
  });

  it("menangani NaN dari input kosong tanpa merusak state", () => {
    const state = stateWith([itemOf({ id: 1, step: 1, stock: 20, quantity: 3 })]);
    const next = cartReducer(state, { type: "UPDATE_QUANTITY", id: 1, quantity: Number.NaN });

    expect(next.items[0].quantity).toBe(1);
    expect(Number.isNaN(next.totalPrice)).toBe(false);
  });

  it("hanya mengubah item yang ditarget", () => {
    const state = stateWith([
      itemOf({ id: 1, quantity: 2, price: 85000 }),
      itemOf({ id: 2, quantity: 5, price: 45000 }),
    ]);
    const next = cartReducer(state, { type: "UPDATE_QUANTITY", id: 1, quantity: 4 });

    expect(next.items[0].quantity).toBe(4);
    expect(next.items[1].quantity).toBe(5);
  });
});

describe("cartReducer / REMOVE_ITEM & CLEAR_CART", () => {
  it("menghapus item berdasarkan id dan menghitung ulang total", () => {
    const state = stateWith([
      itemOf({ id: 1, quantity: 2, price: 85000 }),
      itemOf({ id: 2, quantity: 1, price: 45000 }),
    ]);
    const next = cartReducer(state, { type: "REMOVE_ITEM", id: 1 });

    expect(next.items.map((i) => i.id)).toEqual([2]);
    expect(next.totalQuantity).toBe(1);
    expect(next.totalPrice).toBe(45000);
  });

  it("mengosongkan keranjang", () => {
    const state = stateWith([itemOf({ id: 1, quantity: 3 })]);
    expect(cartReducer(state, { type: "CLEAR_CART" })).toEqual(initialCartState);
  });
});

describe("cartReducer / kalkulasi total", () => {
  it("menjumlahkan kuantitas dan harga lintas item", () => {
    let state = cartReducer(initialCartState, { type: "ADD_ITEM", product: kopi });
    state = cartReducer(state, { type: "ADD_ITEM", product: teh });
    state = cartReducer(state, { type: "UPDATE_QUANTITY", id: teh.id, quantity: 3 });

    expect(state.totalQuantity).toBe(4);
    expect(state.totalPrice).toBe(kopi.price + teh.price * 3);
  });
});
