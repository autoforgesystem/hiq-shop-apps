# Shop admin (`/admin`)

A plain-language admin for non-developers: add and edit products, upload product photos, hide or delete products, manage replacement filters, replace the website's lifestyle photos, and back up or reset the catalogue.

## Demo mode (current)
- **Sign-in:** demo password `hiq-admin`, or set `VITE_ADMIN_PASSWORD` in `.env`. This is **not security**, because the password is in the browser bundle. Replace it with real sign-in when the backend exists.
- **Storage:** `MockCatalogRepository` keeps everything, photos included, in the browser's IndexedDB. Changes appear on the shop in the same browser (other open tabs update automatically) but nowhere else. Uploaded photos are resized to 1600 px max and saved as WebP data URLs.
- **Backup & reset:** `/admin/data` downloads the full catalogue as JSON, loads a backup, or restores the original catalogue from `src/data/products.json` and `src/data/catalog.ts`.

## How it fits together
| File | Role |
|---|---|
| `src/data/repository.ts` | `CatalogRepository` interface: the only thing that touches storage |
| `src/data/MockCatalogRepository.ts` | Browser (IndexedDB) implementation |
| `src/data/catalogStore.ts` | Picks the repository, loads it before first render (`main.tsx`), exposes `catalogAdmin` and `useCatalog()`, syncs tabs |
| `src/data/catalog.ts` | Storefront read API (`products`, `getProduct`, `filtersFor`…), updated via `applyCatalog`; hidden products are excluded |
| `src/pages/admin/` | Admin screens |

## Moving to Postgres
1. Build API endpoints that match the interface, for example:
   `GET /admin/catalog` · `PUT /admin/products/:slug` · `POST /admin/products` · `DELETE /admin/products/:slug` · `PUT /admin/filters/:id` · `DELETE /admin/filters/:id` · `PUT /admin/photos/:key` · `POST /admin/uploads` (multipart, returns `{ url }` from object storage) · `PUT /admin/catalog` (import). The storefront needs a public `GET /catalog` (visible products only).
2. Write `ApiCatalogRepository implements CatalogRepository` and set `repository` in `catalogStore.ts` to it. Set `local = false` to remove the demo banner.
3. Replace the demo password in `Admin.tsx` with real sign-in (session cookie), and enforce auth on every `/admin/*` endpoint on the server.
4. Seed the database from an admin backup file (same shape as `CatalogData`). Move data-URL images into object storage during the import.

Product slugs can't be changed after creation because links, the quiz (`src/lib/quiz.ts`) and filter compatibility all point to them.
