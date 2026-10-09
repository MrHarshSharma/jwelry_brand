"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  size?: string;
  color?: string;
};

// ─── localStorage-backed store ──────────────────────────────────────────────

const STORAGE_KEY = "dinaCart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let items: CartItem[] | null = null;

function read(): CartItem[] {
  if (items === null) {
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      items = [];
    }
  }
  return items!;
}

function write(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      items = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ─── Context ────────────────────────────────────────────────────────────────

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartItems = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [isOpen, setOpen] = useState(false);

  const add = useCallback<CartContextValue["add"]>((item, qty = 1) => {
    const key = [item.productId, item.size ?? "", item.color ?? ""].join("|");
    const current = read();
    const existing = current.find((i) => i.key === key);
    write(
      existing
        ? current.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, 20) } : i))
        : [...current, { ...item, key, qty }],
    );
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    write(
      qty <= 0
        ? read().filter((i) => i.key !== key)
        : read().map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 20) } : i)),
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: cartItems,
      count: cartItems.reduce((s, i) => s + i.qty, 0),
      subtotal: cartItems.reduce((s, i) => s + i.price * i.qty, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty,
      remove: (key) => write(read().filter((i) => i.key !== key)),
      clear: () => write([]),
    }),
    [cartItems, isOpen, add, setQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
