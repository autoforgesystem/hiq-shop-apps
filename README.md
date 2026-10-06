# HIQ 2.0 Shop

Mobile-first React shop for Hospitality Innovations by Quorate Inc. (HIQ Philippines). It runs alongside the existing site at hospitalityinnovations.com.ph and links back to it for hotel bottling, bottle washers, WACO and sustainable solutions.

**Stack:** React 18 · Vite · TypeScript · React Router · Tailwind CSS (HIQ tokens) · static JSON data. No UI or animation libraries.

**Backend:** optional NestJS API in `../server` (see `server/README.md`). Set `VITE_API_URL` to use it; without it, the shop runs on mock data.

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
VITE_API_URL=                     # HIQ API in ../server, e.g. http://localhost:3000/api. Empty = mock data
```

## Deploy to Render

The `deploy/render` branch has a Blueprint (`render.yaml`) for a Render static site. Deploy the API first (`hiq-shop-server`, same branch name), because the site needs its address at build time.

1. In Render, choose **New → Blueprint**, connect the `hiq-shop` repository and pick the `deploy/render` branch.
2. When asked for `VITE_API_URL`, enter the API address with `/api`, e.g. `https://hiq-shop-api.onrender.com/api`.
3. Deploy. Render runs `npm ci && npm run build` and publishes `dist/`. Every path rewrites to `index.html`, so links like `/shop` and `/account/orders` work.
4. Copy the site's address (e.g. `https://hiq-shop.onrender.com`) into the API's `CORS_ORIGINS` setting and redeploy the API. Until then the browser blocks the site's calls to the API.

`VITE_API_URL` is built into the site, so change it in Render and then redeploy the site. Leave it empty to publish the mock-data version.

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
| `src/lib/api.ts`, `src/data/ApiCatalogRepository.ts` | Connection to the HIQ API (`../server`) when `VITE_API_URL` is set, see `docs/API.md` |
| `src/pages/admin/`, `src/data/catalogStore.ts` | Shop admin at `/admin` (demo password `hiq-admin`), see `docs/ADMIN.md` |
| `content/PLACEHOLDERS.md` | Everything HIQ still needs to supply |
| `docs/` | Commerce, API contract, assumptions |

## Routes
`/` · `/shop` · `/shop/:category` · `/shop/need/:need` · `/product/:slug` · `/compare` · `/find-my-system` · `/filters` · `/service` · `/service/book` · `/rent` · `/business` · `/eco` · `/guide` · `/guide/:topic` · `/login` · `/register` · `/account/*` · `/cart` · `/checkout` · `/order/:id` · `/help` · `/contact` · `/privacy` · `/terms` · `/warranty-policy`
