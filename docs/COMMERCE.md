# Commerce integration

All cart and checkout actions go through `CommerceAdapter` (`src/commerce/adapter.ts`). UI never talks to a platform directly.

```ts
interface CommerceAdapter {
  addToCart(sku: string, qty: number, options?: Record<string, string>): Promise<void>;
  goToCart(): void;
  goToCheckout(): void;
}
```

## Adapters shipped
**MockAdapter** (current default) keeps a local cart in `localStorage` so the full cart → checkout → confirmation flow can be designed and tested. It takes no payment.

**GoDaddyLinkAdapter** opens each product's GoDaddy Online Store page (`product.storeUrl`). It assumes **no GoDaddy cart API exists**: "Add to cart" sends the visitor to the store's product page, and the store handles cart, payment (card, GCash, Maya, online banking as configured there) and order emails. Enable with:

```
VITE_COMMERCE_ADAPTER=godaddy
VITE_GODADDY_CART_URL=https://<store>/cart
```

Before enabling, every purchasable product and filter needs a `storeUrl`. Products without one show the error "This product isn't in the online store yet. Call or email HIQ to order."

## What a full adapter needs
To keep the on-site cart and checkout UI with a real platform (Shopify Storefront API, WooCommerce, Medusa, etc.), implement the interface plus:
- a SKU map from shop slugs / filter ids to platform variant IDs (including configuration options such as UF / Nano / RO);
- an installation add-on product or line-item property;
- cart read/update/remove for the cart page;
- a hosted checkout URL (recommended) so card/e-wallet handling stays PCI-scoped to the platform;
- order webhooks feeding `/docs/API.md` (orders, units, filter reminders).

Analytics: `add_to_cart`, `begin_checkout` and `purchase` fire from the UI layer, so they keep working whichever adapter is active. With GoDaddy, `purchase` must be tracked on the store's thank-you page instead.
