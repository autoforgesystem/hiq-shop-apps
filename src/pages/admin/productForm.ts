import { categoryLabel } from "../../data/catalog";
import type { Category, Filtration, Need, Product, ProductImage } from "../../data/types";
import type { SpecRow } from "./adminUi";

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = (
  ["under-sink", "countertop", "dispensers", "whole-house", "commercial", "industrial", "emergency"] as Category[]
).map((c) => ({ value: c, label: c === "industrial" ? "Industrial" : c === "emergency" ? "Emergency" : categoryLabel(c) }));

export const NEED_OPTIONS: { value: Need; label: string }[] = [
  { value: "home", label: "Home" }, { value: "condo", label: "Condo" }, { value: "office", label: "Office" }, { value: "business", label: "Business" },
];
export const FILTRATION_OPTIONS: { value: Filtration; label: string }[] = (["UF", "Nano", "RO", "UV", "Alkaline"] as Filtration[]).map((f) => ({ value: f, label: f }));
/** The first four feed the shop's "Installation" filter. */
export const INSTALL_SUGGESTIONS = ["Under the sink", "On the counter", "Freestanding", "Point of entry", "Commercial / F&B line", "Commercial", "Industrial", "Emergency / portable"];

export interface ProductForm {
  model: string; slug: string; category: Category; channel: "shop" | "quote"; hidden: boolean; featured: string;
  price: string; storeUrl: string;
  summary: string; highlights: string[]; configurations: string[];
  needs: Need[]; filtration: Filtration[]; hotCold: boolean; install: string; tdsLimit: string;
  specs: SpecRow[]; images: ProductImage[];
}
export type FormErrors = Partial<Record<keyof ProductForm, string>>;

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export const emptyForm = (): ProductForm => ({
  model: "", slug: "", category: "under-sink", channel: "shop", hidden: false, featured: "",
  price: "", storeUrl: "", summary: "", highlights: [""], configurations: [""],
  needs: [], filtration: [], hotCold: false, install: "", tdsLimit: "",
  specs: [{ label: "Filtration", value: "" }, { label: "Installation", value: "" }, { label: "Capacity", value: "" }, { label: "Dimensions", value: "" }, { label: "Power", value: "" }],
  images: [],
});

export const toForm = (p: Product): ProductForm => ({
  model: p.model, slug: p.slug, category: p.category, channel: p.channel, hidden: !!p.hidden, featured: p.featured?.toString() ?? "",
  price: p.price?.toString() ?? "", storeUrl: p.storeUrl ?? "",
  summary: p.summary, highlights: [...p.highlights], configurations: [...p.configurations],
  needs: [...p.needs], filtration: [...p.filtration], hotCold: p.hotCold, install: p.install, tdsLimit: p.tdsLimit?.toString() ?? "",
  specs: Object.entries(p.specs).map(([label, value]) => ({ label, value: value ?? "" })),
  images: (p.images ?? []).map((i) => ({ ...i })),
});

const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(/[₱,\s]/g, "")));

/** Keeps fields the form doesn't edit (e.g. warrantyTbc, entry, office) from the original product. */
export function toProduct(f: ProductForm, original?: Product): Product {
  const clean = (l: string[]) => l.map((s) => s.trim()).filter(Boolean);
  const p: Product = {
    ...original,
    slug: f.slug, model: f.model.trim(), category: f.category, channel: f.channel,
    needs: f.needs, filtration: f.filtration,
    configurations: clean(f.configurations).length ? clean(f.configurations) : f.filtration.length ? [f.filtration.join(" + ")] : ["Standard"],
    hotCold: f.hotCold, install: f.install.trim(),
    summary: f.summary.trim(), highlights: clean(f.highlights),
    specs: Object.fromEntries(f.specs.filter((r) => r.label.trim()).map((r) => [r.label.trim(), r.value.trim() || null])),
    price: f.channel === "quote" ? null : num(f.price) ?? null,
    storeUrl: f.storeUrl.trim() || null,
    images: f.images.map((i) => ({ src: i.src, alt: i.alt.trim() })),
    hidden: f.hidden || undefined,
  };
  const tds = num(f.tdsLimit), featured = num(f.featured);
  if (tds != null) p.tdsLimit = tds; else delete p.tdsLimit;
  if (featured != null) p.featured = featured; else delete p.featured;
  if (!p.hidden) delete p.hidden;
  return p;
}

export function validate(f: ProductForm, takenSlugs: string[], isNew: boolean): FormErrors {
  const e: FormErrors = {};
  if (!f.model.trim()) e.model = "Enter the model name.";
  if (isNew) {
    if (!f.slug) e.slug = "Enter a web address.";
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) e.slug = "Use only lowercase letters, numbers and dashes.";
    else if (takenSlugs.includes(f.slug)) e.slug = "Another product already uses this web address.";
  }
  if (!f.summary.trim()) e.summary = "Write a short description.";
  if (!f.filtration.length) e.filtration = "Pick at least one filtration type.";
  if (!f.needs.length) e.needs = "Pick at least one.";
  if (!f.install.trim()) e.install = "Say how it's installed.";
  const price = num(f.price);
  if (f.channel === "shop" && price != null && (!Number.isFinite(price) || price < 0)) e.price = "Enter a price in pesos, e.g. 24990.";
  const tds = num(f.tdsLimit);
  if (tds != null && (!Number.isFinite(tds) || tds <= 0)) e.tdsLimit = "Enter a number in ppm, e.g. 190, or leave it blank.";
  const featured = num(f.featured);
  if (featured != null && !Number.isFinite(featured)) e.featured = "Enter a number, or leave it blank.";
  if (f.storeUrl.trim() && !/^https?:\/\//.test(f.storeUrl.trim())) e.storeUrl = "The link should start with https://";
  if (f.images.some((i) => !i.alt.trim())) e.images = "Describe every photo. This helps blind visitors and Google.";
  return e;
}
