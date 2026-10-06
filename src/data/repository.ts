import type { FilterSku, Product } from "./types";
import type { PhotoKey, PhotoSlot } from "./images";

export type SitePhotos = Partial<Record<PhotoKey, Pick<PhotoSlot, "src" | "alt">>>;

export interface CatalogData {
  products: Product[];
  filters: FilterSku[];
  /** Only slots the admin changed; missing keys use the defaults in images.ts. */
  photos: SitePhotos;
}

/**
 * Everything the admin reads and writes goes through this interface, so the storage can be swapped
 * (browser mock today, a Postgres-backed API later) without touching any page. See docs/ADMIN.md.
 */
export interface CatalogRepository {
  readonly name: string;
  /** True when changes are only kept in this browser. */
  readonly local: boolean;
  load(): Promise<CatalogData>;
  /** `previousSlug` is set when an existing product is saved (slugs can't change after creation). */
  saveProduct(p: Product, previousSlug?: string): Promise<void>;
  deleteProduct(slug: string): Promise<void>;
  saveFilter(f: FilterSku): Promise<void>;
  deleteFilter(id: string): Promise<void>;
  savePhoto(key: PhotoKey, photo: SitePhotos[PhotoKey] | null): Promise<void>;
  /** Stores an image file and returns the URL to save on the product or photo slot. */
  uploadImage(file: File): Promise<string>;
  /** Replaces the whole catalogue (used by import). */
  replaceAll(data: CatalogData): Promise<void>;
  /** Restores the catalogue that ships with the site. */
  reset(): Promise<void>;
}
