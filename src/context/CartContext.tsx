"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  stock: number;
  step: number;
  emoji: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
};

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; id: number }
  | { type: "UPDATE_QUANTITY"; id: number; quantity: number }
  | { type: "CLEAR_CART" };

/**
 * Kuantitas selalu dibulatkan ke kelipatan `step` produk, minimal 1 step,
 * maksimal stok. Ini yang memperbaiki bug update kuantitas berbasis kelipatan.
 */
function normalizeQuantity(raw: number, step: number, stock: number) {
  const value = Number.isFinite(raw) ? raw : step;
  const maxSteps = Math.max(1, Math.floor(stock / step));
  const steps = Math.round(value / step);
  return Math.min(maxSteps, Math.max(1, steps)) * step;
}

// Total dihitung terpusat di reducer -> single source of truth.
function withTotals(items: CartItem[]): CartState {
  return {
    items,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}

export const initialCartState: CartState = { items: [], totalQuantity: 0, totalPrice: 0 };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product } = action;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        return withTotals(
          state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: normalizeQuantity(item.quantity + product.step, product.step, product.stock) }
              : item,
          ),
        );
      }
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        step: product.step,
        emoji: product.emoji,
        quantity: product.step,
      };
      return withTotals([...state.items, newItem]);
    }
    case "REMOVE_ITEM":
      return withTotals(state.items.filter((item) => item.id !== action.id));
    case "UPDATE_QUANTITY":
      return withTotals(
        state.items.map((item) =>
          item.id === action.id
            ? { ...item, quantity: normalizeQuantity(action.quantity, item.step, item.stock) }
            : item,
        ),
      );
    case "CLEAR_CART":
      return initialCartState;
    default:
      return state;
  }
}

type CartContextValue = CartState & {
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      addItem: (product) => dispatch({ type: "ADD_ITEM", product }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
      updateQuantity: (id, quantity) => dispatch({ type: "UPDATE_QUANTITY", id, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return context;
}
