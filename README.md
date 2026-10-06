# HIQ 2.0 Shop

Mobile-first React shop for Hospitality Innovations by Quorate Inc. (HIQ Philippines). It runs alongside the existing site at hospitalityinnovations.com.ph and links back to it for hotel bottling, bottle washers, WACO and sustainable solutions.

**Stack:** React 18 · Vite · TypeScript · React Router · Tailwind CSS (HIQ tokens) · static JSON data. No UI or animation libraries.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/ for static hosting
```

Optional `.env`:
```
VITE_COMMERCE_ADAPTER=mock        # or godaddy
VITE_GODADDY_CART_URL=
VITE_FORM_ENDPOINT=               # e.g. Formspree endpoint forwarding to sales@
VITE_GTM_ID=                      # loads only after cookie consent
VITE_ADMIN_PASSWORD=              # demo admin password (default hiq-admin), not real security
```

## Where things live
| Path | What |
|---|---|
| `src/config/site.ts` | Main-site URLs (single source), verified business facts, UTM helper |
| `src/data/products.json` | Product catalogue (verified data; `null` = [TBC]) |
| `src/data/catalog.ts` | Categories, needs, replacement filters |
| `src/data/images.ts` | Photo slots — set `src` to replace placeholders |
| `src/data/guide.ts` | Water Quality Guide articles |
| `src/lib/quiz.ts` | Find My System decision rules |
| `src/commerce/` | `CommerceAdapter`, `MockAdapter`, `GoDaddyLinkAdapter` |
| `src/lib/analytics.ts` | `dataLayer` events + consent-gated GTM |
| `src/pages/auth/`, `src/lib/auth.tsx` | Customer sign-in & registration (demo only, browser storage). Demo login `juan@example.com` / `demo1234` |
| `src/pages/admin/`, `src/data/catalogStore.ts` | Shop admin at `/admin` (demo password `hiq-admin`), see `docs/ADMIN.md` |
| `content/PLACEHOLDERS.md` | Everything HIQ still needs to supply |
| `docs/` | Commerce, API contract, assumptions |

## Routes
`/` · `/shop` · `/shop/:category` · `/shop/need/:need` · `/product/:slug` · `/compare` · `/find-my-system` · `/filters` · `/service` · `/service/book` · `/rent` · `/business` · `/eco` · `/guide` · `/guide/:topic` · `/login` · `/register` · `/account/*` · `/cart` · `/checkout` · `/order/:id` · `/help` · `/contact` · `/privacy` · `/terms` · `/warranty-policy`
