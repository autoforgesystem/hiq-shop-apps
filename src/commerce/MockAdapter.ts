import type { CartLine, CommerceAdapter } from "./adapter";

type Listener = (lines: CartLine[]) => void;
const KEY = "hiq_mock_cart";

/** Local cart so the full cart → checkout → confirmation UI can be designed and tested. */
export class MockAdapter implements CommerceAdapter {
  readonly name = "mock";
  private lines: CartLine[] = [];
  private listeners = new Set<Listener>();
  constructor(private navigate: (path: string) => void, private resolve: (sku: string) => { name: string; price: number | null }) {
    try { this.lines = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { this.lines = []; }
  }
  private emit() {
    try { localStorage.setItem(KEY, JSON.stringify(this.lines)); } catch { /* ignore */ }
    this.listeners.forEach((l) => l([...this.lines]));
  }
  subscribe(l: Listener) { this.listeners.add(l); l([...this.lines]); return () => { this.listeners.delete(l); }; }
  async addToCart(sku: string, qty: number, options?: Record<string, string>) {
    const key = sku + JSON.stringify(options ?? {});
    const existing = this.lines.find((l) => l.sku + JSON.stringify(l.options ?? {}) === key);
    if (existing) existing.qty += qty;
    else {
      const info = this.resolve(sku);
      this.lines.push({ id: crypto.randomUUID?.() ?? String(Date.now()), sku, name: info.name, qty, unitPrice: info.price, options });
    }
    this.emit();
  }
  setQty(id: string, qty: number) { this.lines = this.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)); this.emit(); }
  remove(id: string) { this.lines = this.lines.filter((l) => l.id !== id); this.emit(); }
  clear() { this.lines = []; this.emit(); }
  goToCart() { this.navigate("/cart"); }
  goToCheckout() { this.navigate("/checkout"); }
}
