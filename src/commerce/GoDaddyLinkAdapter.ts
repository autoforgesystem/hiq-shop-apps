import type { CommerceAdapter } from "./adapter";

/**
 * Opens each product's GoDaddy Online Store URL (product.storeUrl).
 * Assumes NO GoDaddy cart API exists — see /docs/COMMERCE.md.
 */
export class GoDaddyLinkAdapter implements CommerceAdapter {
  readonly name = "godaddy";
  constructor(private storeUrlFor: (sku: string) => string | null, private storeCartUrl: string | null) {}
  async addToCart(sku: string) {
    const url = this.storeUrlFor(sku);
    if (!url) throw new Error("This product isn't in the online store yet. Call or email HIQ to order.");
    window.location.href = url;
  }
  goToCart() { if (this.storeCartUrl) window.location.href = this.storeCartUrl; }
  goToCheckout() { this.goToCart(); }
}
