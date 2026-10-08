# API

The backend lives in `../server` (NestJS + Prisma + Postgres). Setup and the full route list are in `server/README.md`, and live docs are at `/api/docs` on a running server.

## Connecting the shop

Set `VITE_API_URL` (e.g. `http://localhost:3000/api`) and restart the dev server. When it's empty, the shop runs exactly as before, on mock data and browser storage, and makes no API calls.

| Front-end piece | With `VITE_API_URL` | Without it |
|---|---|---|
| Sign in / register (`src/lib/auth.tsx`) | `/auth/login`, `/auth/register`; token in localStorage ("Keep me signed in") or sessionStorage | Demo accounts in this browser |
| Catalogue (`src/data/ApiCatalogRepository.ts`) | `GET /catalog`; the admin uses `/admin/*` | `MockCatalogRepository` (IndexedDB) |
| Account pages (`src/pages/account/useAccountData.ts`) | `/me/units`, `/me/orders`, `/me/bookings`, `/me/addresses` | `mockData.ts` |
| Spare parts (`src/pages/Parts.tsx`, `PartDetail.tsx`) | Part of `GET /catalog`; also `GET /parts?category=&model=` and `GET /parts/:slug` | Example parts in `src/data/parts.json` |
| Checkout (`src/pages/Checkout.tsx`) | `POST /orders`, priced by the server. Each line is `{ productSlug }`, `{ filterSkuId }` or `{ sparePartSlug }` with a `qty` | Local order number |
| Service booking (`src/pages/ServiceBook.tsx`) | `POST /bookings`, linked to the customer's unit | `submitForm` (email) |
| Quote, rental, contact and newsletter forms (`src/lib/forms.ts`) | `POST /leads` | `VITE_FORM_ENDPOINT` or mailto |
| Admin sign-in (`src/pages/admin/Admin.tsx`) | Email and password of an admin account | Demo password |

All API calls go through `src/lib/api.ts`, which adds the token and turns server errors into readable messages.

## Conventions

- Prices are in **pesos** in requests and responses, the same as `Product.price` in the front-end. The database stores centavos. `null` means **[TBC]**.
- Dates are ISO 8601 (`YYYY-MM-DD` for date-only fields). The currency is PHP.
- Signed-in requests send `Authorization: Bearer <token>`.
- Errors return `{ statusCode, message }`, where `message` is a sentence or a list of validation messages.
- Payment methods are never stored by this app; they belong to the commerce platform.

## Main customer routes

| Method & path | Purpose |
|---|---|
| `POST /auth/register` · `POST /auth/login` | Email and password sign-in → `{ token, customer }` |
| `POST /auth/otp` · `POST /auth/verify` | One-time code by email or SMS → `{ token, customer }` |
| `GET /me` | Profile `{ id, firstName, lastName, name, email, phone }` |
| `GET /me/units` | **My Units**: `[{ id, productSlug, model, configuration, installedAt, address, nextFilterDueAt, warranty: { endsAt, status }, serviceHistory: [{ date, type, notes }] }]` |
| `GET /me/orders` · `GET /orders/:id` | Orders `[{ id, createdAt, lines, subtotal, total, requiresQuote, status }]` |
| `GET /me/filters/due` | `[{ unitId, filterSku, stage, dueAt, daysLeft }]` |
| `GET/POST/DELETE /me/subscriptions` | Subscribe & Save `[CONFIRM OFFER]`, off until `SUBSCRIPTIONS_ENABLED=true` |
| `GET /me/bookings` · `POST /bookings` | `{ id, service, unitId \| "new", preferredDate, preferredSlot, address, status: "requested" \| "confirmed" \| "done" \| "cancelled" }` |
| `POST /warranty-claims` | `{ id, status }` |
| `GET/POST/PUT/DELETE /me/addresses` | `[{ id, label, line1, line2, city, province, postal, isDefault }]` |
| `GET /me/loyalty` | `{ points, history }` `[CONFIRM PROGRAMME]` |
| `POST /leads` | Quote, rental, contact and newsletter forms → `{ id }` |
| `POST /service-area/check` | `{ covered: true \| false \| null, note }`, where `null` means areas are `[TBC]` |

Filter reminders: a daily job sends an SMS and email 30 days and 7 days before a unit's filters are due. The account UI shows the same due dates as badges.
