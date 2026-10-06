# Shop admin (`/admin`)

A plain-language admin for non-developers: add and edit products, upload product photos, hide or delete products, manage replacement filters, replace the website's lifestyle photos, and back up or reset the catalogue.

## Demo mode (no `VITE_API_URL`)
- **Sign-in:** demo password `hiq-admin`, or set `VITE_ADMIN_PASSWORD` in `.env`. This is **not security**, because the password is in the browser bundle. Use the API for real sign-in.
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

## With the API (`VITE_API_URL` set)
- **Sign-in:** admins sign in with an email and password from the `admin_users` table. The first admin comes from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when you run `npm run db:seed` in `../server`. The session ends when the tab closes. Roles: `owner` can do everything; `editor` can't reset the catalogue or read the change log.
- **Storage:** `ApiCatalogRepository` reads and writes Postgres through `/admin/*`. Every change is checked on the server and recorded in the audit log, and it reaches every visitor.
- **Photos:** uploads go to `POST /admin/uploads` (JPEG, PNG, WebP or AVIF, 5 MB max) and are stored on the server's disk. Move them to object storage before running more than one server.
- **Backup & reset:** loading a backup replaces the catalogue. Products that customers have installed are hidden instead of deleted. Reset restores the catalogue in `server/prisma/seed-data` (owner only).
- **Seeding from a browser backup:** sign in to the API admin and use "Load a backup" with a file downloaded in demo mode. Photos saved as data URLs import as they are.

The front-end side is the `CatalogRepository` interface (`src/data/repository.ts`): `catalogStore.ts` picks `ApiCatalogRepository` or `MockCatalogRepository`, and no admin screen needs to know which.

Product slugs can't be changed after creation because links, the quiz (`src/lib/quiz.ts`) and filter compatibility all point to them. The API refuses a slug change.
