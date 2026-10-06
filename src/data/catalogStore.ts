import { useSyncExternalStore } from "react";
import { applyCatalog, SEED_FILTERS, SEED_PRODUCTS } from "./catalog";
import { PHOTO_DEFAULTS, PHOTOS, type PhotoKey } from "./images";
import { MockCatalogRepository } from "./MockCatalogRepository";
import { ApiCatalogRepository } from "./ApiCatalogRepository";
import { useApi } from "../lib/api";
import type { CatalogData, CatalogRepository, SitePhotos } from "./repository";
import type { FilterSku, Product } from "./types";

/** The HIQ API when VITE_API_URL is set, otherwise the browser-only mock (see docs/ADMIN.md). */
export const repository: CatalogRepository = useApi ? new ApiCatalogRepository() : new MockCatalogRepository();

let data: CatalogData = { products: SEED_PRODUCTS, filters: SEED_FILTERS, photos: {} };
let version = 0;
const listeners = new Set<() => void>();
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("hiq-catalog") : null;

function apply(next: CatalogData) {
  data = next;
  applyCatalog(next.products, next.filters);
  for (const k of Object.keys(PHOTO_DEFAULTS) as PhotoKey[]) {
    const o = next.photos[k];
    Object.assign(PHOTOS[k], { src: o?.src, alt: o?.alt || PHOTO_DEFAULTS[k].alt });
  }
  version++;
  listeners.forEach((l) => l());
}

/** Loads the catalogue before the app first renders (main.tsx). */
export async function loadCatalog() {
  apply(await repository.load());
}

// Another tab (usually the admin) changed the catalogue: reload so the shop shows it.
channel?.addEventListener("message", () => { void loadCatalog(); });

async function mutate(op: () => Promise<void>) {
  await op();
  await loadCatalog();
  channel?.postMessage("changed");
}

export const catalogAdmin = {
  saveProduct: (p: Product, previousSlug?: string) => mutate(() => repository.saveProduct(p, previousSlug)),
  deleteProduct: (slug: string) => mutate(() => repository.deleteProduct(slug)),
  saveFilter: (f: FilterSku) => mutate(() => repository.saveFilter(f)),
  deleteFilter: (id: string) => mutate(() => repository.deleteFilter(id)),
  savePhoto: (key: PhotoKey, photo: SitePhotos[PhotoKey] | null) => mutate(() => repository.savePhoto(key, photo)),
  uploadImage: (file: File) => repository.uploadImage(file),
  replaceAll: (d: CatalogData) => mutate(() => repository.replaceAll(d)),
  reset: () => mutate(() => repository.reset()),
};

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Full catalogue including hidden products, for the admin. Re-renders on every change. */
export const useCatalog = () => useSyncExternalStore(subscribe, () => data);
/** Changes whenever the catalogue changes; the storefront layout uses it to refresh the page. */
export const useCatalogVersion = () => useSyncExternalStore(subscribe, () => version);
