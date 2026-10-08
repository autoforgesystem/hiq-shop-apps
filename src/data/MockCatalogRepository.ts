import { SEED_FILTERS, SEED_PARTS, SEED_PRODUCTS } from "./catalog";
import type { CatalogData, CatalogImport, CatalogRepository, SitePhotos } from "./repository";
import type { FilterSku, Product, SparePart } from "./types";
import type { PhotoKey } from "./images";

const DB_NAME = "hiq-admin", STORE = "kv", KEY = "catalog", VERSION = 1;

function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => { db.close(); resolve(req.result); };
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error ?? new Error("Could not save in this browser")); };
    };
  });
}

const seed = (): CatalogData => structuredClone({ products: SEED_PRODUCTS, filters: SEED_FILTERS, parts: SEED_PARTS, photos: {} });

/** Shrinks photos to a web-friendly size so the browser database stays small. */
async function compressImage(file: File, maxSide = 1600): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
}

/**
 * Development stand-in for the real catalogue API. Keeps everything, photos included, in this
 * browser's IndexedDB. Nothing reaches a server, so other people and other browsers won't see changes.
 */
export class MockCatalogRepository implements CatalogRepository {
  readonly name = "mock (this browser)";
  readonly local = true;
  private data: CatalogData = seed();

  async load() {
    try {
      const stored = await idb<{ version: number; data: CatalogData } | undefined>("readonly", (s) => s.get(KEY));
      this.data = stored?.version === VERSION ? stored.data : seed();
      // Saved before spare parts existed: keep the admin's changes and add the example parts.
      this.data.parts ??= structuredClone(SEED_PARTS);
    } catch {
      this.data = seed(); // private mode or storage blocked: work in memory for this visit
    }
    return structuredClone(this.data);
  }

  private async persist(next: CatalogData) {
    await idb("readwrite", (s) => s.put({ version: VERSION, data: next }, KEY));
    this.data = next;
  }
  private draft = () => structuredClone(this.data);

  async saveProduct(p: Product, previousSlug?: string) {
    const d = this.draft();
    const i = d.products.findIndex((x) => x.slug === (previousSlug ?? p.slug));
    if (previousSlug == null && i >= 0) throw new Error(`Another product already uses the web address "${p.slug}".`);
    if (previousSlug != null && i < 0) throw new Error("This product no longer exists. It may have been deleted in another tab.");
    if (i >= 0) d.products[i] = p; else d.products.push(p);
    await this.persist(d);
  }

  async deleteProduct(slug: string) {
    const d = this.draft();
    d.products = d.products.filter((p) => p.slug !== slug);
    d.filters = d.filters.map((f) => ({ ...f, compatibleModels: f.compatibleModels.filter((s) => s !== slug) }));
    d.parts = d.parts.map((p) => ({ ...p, compatibleModels: p.compatibleModels.filter((s) => s !== slug) }));
    await this.persist(d);
  }

  async saveFilter(f: FilterSku) {
    const d = this.draft();
    const i = d.filters.findIndex((x) => x.id === f.id);
    if (i >= 0) d.filters[i] = f; else d.filters.push(f);
    await this.persist(d);
  }

  async deleteFilter(id: string) {
    const d = this.draft();
    d.filters = d.filters.filter((f) => f.id !== id);
    await this.persist(d);
  }

  async savePart(p: SparePart, previousSlug?: string) {
    const d = this.draft();
    const i = d.parts.findIndex((x) => x.slug === (previousSlug ?? p.slug));
    if (previousSlug == null && i >= 0) throw new Error(`Another spare part already uses the web address "${p.slug}".`);
    if (previousSlug != null && i < 0) throw new Error("This spare part no longer exists. It may have been deleted in another tab.");
    if (i >= 0) d.parts[i] = p; else d.parts.push(p);
    await this.persist(d);
  }

  async deletePart(slug: string) {
    const d = this.draft();
    d.parts = d.parts.filter((p) => p.slug !== slug);
    await this.persist(d);
  }

  async savePhoto(key: PhotoKey, photo: SitePhotos[PhotoKey] | null) {
    const d = this.draft();
    if (photo) d.photos[key] = photo; else delete d.photos[key];
    await this.persist(d);
  }

  async uploadImage(file: File) {
    if (!file.type.startsWith("image/")) throw new Error("Please choose a photo (JPG, PNG or WebP).");
    if (file.size > 20 * 1024 * 1024) throw new Error("That photo is larger than 20 MB. Please choose a smaller one.");
    try { return await compressImage(file); } catch { throw new Error("This photo couldn't be read. Try saving it as JPG or PNG first."); }
  }

  /** A backup from before spare parts existed keeps the parts already here, like the API does. */
  async replaceAll(data: CatalogImport) { await this.persist(structuredClone({ ...data, parts: data.parts ?? this.data.parts })); }
  async reset() { await this.persist(seed()); }
}
