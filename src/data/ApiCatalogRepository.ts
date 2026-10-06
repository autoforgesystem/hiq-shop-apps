import { api, tokens } from "../lib/api";
import type { CatalogData, CatalogRepository, SitePhotos } from "./repository";
import type { FilterSku, Product } from "./types";
import type { PhotoKey } from "./images";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Catalogue stored in Postgres through the HIQ API (../server). The storefront reads the public catalogue;
 * a signed-in admin reads the full one (hidden products included) and can change it.
 */
export class ApiCatalogRepository implements CatalogRepository {
  readonly name = "HIQ API";
  readonly local = false;

  load() {
    return tokens.get("admin")
      ? api<CatalogData>("/admin/catalog", { auth: "admin" }).catch(() => api<CatalogData>("/catalog")) // expired admin session: show the shop anyway
      : api<CatalogData>("/catalog");
  }

  async saveProduct(p: Product, previousSlug?: string) {
    if (previousSlug) await api(`/admin/products/${encodeURIComponent(previousSlug)}`, { method: "PUT", body: p, auth: "admin" });
    else await api("/admin/products", { body: p, auth: "admin" });
  }

  async deleteProduct(slug: string) {
    await api(`/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE", auth: "admin" });
  }

  /** New filters get a temporary id in the admin (e.g. "f-lq3x"); the server assigns the real one. */
  async saveFilter({ id, ...f }: FilterSku) {
    if (UUID.test(id)) await api(`/admin/filters/${id}`, { method: "PUT", body: f, auth: "admin" });
    else await api("/admin/filters", { body: f, auth: "admin" });
  }

  async deleteFilter(id: string) {
    await api(`/admin/filters/${id}`, { method: "DELETE", auth: "admin" });
  }

  async savePhoto(key: PhotoKey, photo: SitePhotos[PhotoKey] | null) {
    if (photo) await api(`/admin/photos/${key}`, { method: "PUT", body: { src: photo.src ?? null, alt: photo.alt }, auth: "admin" });
    else await api(`/admin/photos/${key}`, { method: "DELETE", auth: "admin" });
  }

  async uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    return (await api<{ url: string }>("/admin/uploads", { form, auth: "admin" })).url;
  }

  async replaceAll(data: CatalogData) {
    await api("/admin/catalog", { method: "PUT", body: data, auth: "admin" });
  }

  async reset() {
    await api("/admin/catalog/reset", { method: "POST", auth: "admin" });
  }
}
