import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  key: string;
  product_id: string;
  variant_id: string | null;
  name: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  branchId: string | null;
  fulfillment: "delivery" | "pickup";
};

type CartContextValue = CartState & {
  add: (line: Omit<CartLine, "key" | "quantity">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setBranchId: (id: string) => void;
  setFulfillment: (f: "delivery" | "pickup") => void;
  count: number;
  subtotal: number;
};

const STORAGE_KEY = "as-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    lines: [],
    branchId: null,
    fulfillment: "delivery",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as Partial<CartState>) }));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const add: CartContextValue["add"] = useCallback((line, qty = 1) => {
    const key = `${line.product_id}:${line.variant_id ?? "base"}`;
    setState((s) => {
      const existing = s.lines.find((l) => l.key === key);
      const lines = existing
        ? s.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + qty } : l))
        : [...s.lines, { ...line, key, quantity: qty }];
      return { ...s, lines };
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setState((s) => ({
      ...s,
      lines:
        qty <= 0
          ? s.lines.filter((l) => l.key !== key)
          : s.lines.map((l) => (l.key === key ? { ...l, quantity: qty } : l)),
    }));
  }, []);

  const remove = useCallback(
    (key: string) => setState((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) })),
    [],
  );
  const clear = useCallback(() => setState((s) => ({ ...s, lines: [] })), []);
  const setBranchId = useCallback((id: string) => setState((s) => ({ ...s, branchId: id })), []);
  const setFulfillment = useCallback(
    (f: "delivery" | "pickup") => setState((s) => ({ ...s, fulfillment: f })),
    [],
  );

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = state.lines.reduce((n, l) => n + l.unit_price * l.quantity, 0);
    return {
      ...state,
      add,
      setQty,
      remove,
      clear,
      setBranchId,
      setFulfillment,
      count: hydrated ? count : 0,
      subtotal,
    };
  }, [state, hydrated, add, setQty, remove, clear, setBranchId, setFulfillment]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
