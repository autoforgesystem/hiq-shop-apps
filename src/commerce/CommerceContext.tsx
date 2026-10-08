import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { CartLine, CommerceAdapter } from "./adapter";
import { MockAdapter } from "./MockAdapter";
import { GoDaddyLinkAdapter } from "./GoDaddyLinkAdapter";
import { filters, getProduct, partFromSku } from "../data/catalog";
import { track } from "../lib/analytics";
import { useToast } from "../components/Toast";

interface Ctx {
  adapter: CommerceAdapter;
  lines: CartLine[];
  count: number;
  add: (sku: string, qty?: number, options?: Record<string, string>) => Promise<void>;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}
const CommerceCtx = createContext<Ctx | null>(null);

export const resolveSku = (sku: string) => {
  const p = getProduct(sku);
  if (p) return { name: p.model, price: p.price, storeUrl: p.storeUrl };
  const part = partFromSku(sku);
  if (part) return { name: part.name, price: part.price, storeUrl: null as string | null };
  const f = filters.find((x) => x.id === sku);
  return { name: f ? f.name : sku, price: f?.price ?? null, storeUrl: null as string | null };
};

export function CommerceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [lines, setLines] = useState<CartLine[]>([]);
  const adapter = useMemo<CommerceAdapter>(() => {
    if (import.meta.env.VITE_COMMERCE_ADAPTER === "godaddy")
      return new GoDaddyLinkAdapter((s) => resolveSku(s).storeUrl, import.meta.env.VITE_GODADDY_CART_URL || null);
    return new MockAdapter(navigate, resolveSku);
  }, [navigate]);

  useEffect(() => (adapter instanceof MockAdapter ? adapter.subscribe(setLines) : undefined), [adapter]);

  const value: Ctx = {
    adapter, lines, count: lines.reduce((n, l) => n + l.qty, 0),
    add: async (sku, qty = 1, options) => {
      try {
        await adapter.addToCart(sku, qty, options);
        track("add_to_cart", { item_id: sku, quantity: qty, ...options });
        toast.show(`${resolveSku(sku).name} added to your cart`, { action: { label: "View cart", onClick: () => adapter.goToCart() } });
      } catch (e) { toast.show((e as Error).message, { tone: "error" }); }
    },
    setQty: (id, q) => adapter instanceof MockAdapter && adapter.setQty(id, q),
    remove: (id) => adapter instanceof MockAdapter && adapter.remove(id),
    clear: () => adapter instanceof MockAdapter && adapter.clear(),
  };
  return <CommerceCtx.Provider value={value}>{children}</CommerceCtx.Provider>;
}

export const useCommerce = () => {
  const c = useContext(CommerceCtx);
  if (!c) throw new Error("useCommerce must be used inside CommerceProvider");
  return c;
};
