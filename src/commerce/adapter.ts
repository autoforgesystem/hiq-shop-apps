/** All cart/checkout actions go through this interface so the platform can be swapped without touching UI. */
export interface CommerceAdapter {
  readonly name: string;
  addToCart(sku: string, qty: number, options?: Record<string, string>): Promise<void>;
  goToCart(): void;
  goToCheckout(): void;
}

export interface CartLine {
  id: string;
  sku: string; // product slug, filter id, or "part:<slug>" for a spare part
  name: string;
  qty: number;
  unitPrice: number | null; // null = [PRICE TBC]
  options?: Record<string, string>;
}
