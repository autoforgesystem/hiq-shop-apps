# API contract (Phase 3+ backend)

Phase 1 is front-end only. Account screens render **demo data** from `src/pages/account/mockData.ts` and persist nothing. A backend should expose the following (JSON, authenticated with a session cookie or bearer token). Amounts in centavos, dates ISO 8601, currency PHP.

| Method & path | Purpose | Response (shape) |
|---|---|---|
| `POST /auth/otp` · `POST /auth/verify` | Mobile/email one-time-code sign-in | `{ token }` |
| `GET /me` | Profile | `{ id, name, email, phone }` |
| `GET /me/units` | **My Units** (top priority) | `[{ id, productSlug, model, configuration, installedAt, address, nextFilterDueAt, warranty: { endsAt, status }, serviceHistory: [{ date, type, notes }] }]` |
| `GET /me/orders` · `GET /orders/:id` | Orders | `[{ id, createdAt, lines, total, status }]` |
| `GET /me/filters/due` | Filter replacements, due-soon badges | `[{ unitId, filterSku, stage, dueAt }]` |
| `GET/POST/DELETE /me/subscriptions` | Subscribe & Save `[CONFIRM OFFER]` | `[{ id, unitId, filterSkus, intervalMonths, nextShipAt, status }]` |
| `GET /me/bookings` · `POST /bookings` | Service bookings (form at `/service/book`) | `{ id, service, unitId \| "new", preferredDate, preferredSlot, address, status: "requested" \| "confirmed" \| "done" }` |
| `POST /warranty-claims` | Warranty claim | `{ id, status }` |
| `GET/POST/PUT/DELETE /me/addresses` | Addresses | `[{ id, label, line1, city, province, postal }]` |
| `GET /me/loyalty` | Loyalty `[CONFIRM PROGRAMME]` | `{ points, history }` |
| `POST /leads` | Quote, rental, contact, newsletter forms (currently `VITE_FORM_ENDPOINT` → sales@) | `{ id }` |
| `POST /service-area/check` | Service-area check `[TBC]` | `{ covered: boolean, note }` |

Filter reminders: a scheduled job reads `nextFilterDueAt` per unit and sends SMS/email 30 days and 7 days before; the account UI already shows the badges.

Payment methods are never stored by this app; they belong to the commerce platform.
