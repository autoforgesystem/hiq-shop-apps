import raw from "./products.json";
import type { Category, FilterSku, Need, Product } from "./types";

/** Original catalogue shipped with the site. The admin starts from this and can reset back to it. */
export const SEED_PRODUCTS = raw as unknown as Product[];

/**
 * Live catalogue, replaced by `applyCatalog` when the catalog store loads or the admin saves.
 * These are `let` exports (ES live bindings), so every importer always sees the current data.
 * Hidden products are left out here; the admin reads the full list from the store.
 */
export let products: Product[] = SEED_PRODUCTS;
export let shopProducts = products.filter((p) => p.channel === "shop");
export let quoteProducts = products.filter((p) => p.channel === "quote");
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const bySlugs = (slugs: string[]) => slugs.map(getProduct).filter(Boolean) as Product[];

export const CATEGORIES: { slug: Category | "replacement-filters"; label: string; intro: string; quote?: boolean }[] = [
  { slug: "under-sink", label: "Under-sink systems", intro: "Under-sink systems sit out of sight inside your kitchen cabinet and send filtered water to a dedicated faucet. Pick UF, Nano or RO based on what your water test shows." },
  { slug: "countertop", label: "Countertop systems", intro: "Countertop units sit beside your sink and are a good fit for condos and rentals. Some need no power at all." },
  { slug: "dispensers", label: "Hot & cold dispensers", intro: "Bottleless dispensers connect to your water line, so there are no 5-gallon bottles to order or lift. Choose a home or office model and the filtration your water needs." },
  { slug: "whole-house", label: "Whole-house systems", intro: "A whole-house system is installed where water enters your home, so every tap gets filtered water. HIQ sizes it after a site visit." },
  { slug: "replacement-filters", label: "Replacement filters", intro: "Keep your HIQ unit performing as it should by replacing filters on schedule. Find the exact filters for your model below." },
  { slug: "commercial", label: "Commercial", intro: "Commercial and F&B filtration, plus commercial RO plants sized for your operation.", quote: true },
];

export const NEEDS: { slug: Need; label: string; blurb: string }[] = [
  { slug: "home", label: "Home", blurb: "Houses and family kitchens" },
  { slug: "condo", label: "Condo", blurb: "Compact kitchens and building supply" },
  { slug: "office", label: "Office", blurb: "Pantries and lobbies" },
  { slug: "business", label: "Business", blurb: "F&B, hotels and commercial sites" },
];

export const categoryLabel = (c: string) => CATEGORIES.find((x) => x.slug === c)?.label ?? c;

/** One entry per filter stage per model. SKUs, intervals and prices are placeholders. */
type FilterSeed = Omit<FilterSku, "id">;
const tbcStage = (model: string, slug: string): FilterSeed => ({
  sku: "[FILTER SKU TBC]", name: `${model} replacement filter`, stage: "Stage [TBC]",
  compatibleModels: [slug], intervalMonths: null, price: null,
  note: "HIQ to confirm the number of stages and the filter for each one.",
});

const seeds: FilterSeed[] = [
  tbcStage("HW NP 100M", "hw-np-100m"),
  tbcStage("HW NP 200", "hw-np-200"),
  ...[1, 2, 3, 4].map((n) => ({ sku: "[FILTER SKU TBC]", name: `VP-CU-200 filter ${n}`, stage: `Stage ${n} [TYPE TBC]`, compatibleModels: ["vp-cu-200"], intervalMonths: null, price: null })),
  { sku: "[FILTER SKU TBC]", name: "VP-CU-200 alkaline filter", stage: "Stage 5 — alkaline (5-filter configuration only)", compatibleModels: ["vp-cu-200"], intervalMonths: null, price: null },
  ...["3-in-1 Eco Mac", "Antiscalant", "UF", "RO (300 GPD, no pump)"].map((t) => ({ sku: "[FILTER SKU TBC]", name: `HQ9 ${t} filter`, stage: t, compatibleModels: ["hwlp-uv-hq9", "hq9-high-flow"], intervalMonths: null, price: null, note: t === "RO (300 GPD, no pump)" ? "Confirm HWLP UV compatibility." : undefined })),
  { sku: "[FILTER SKU TBC]", name: "EGHW-200 Multi UF filter", stage: "Multi UF", compatibleModels: ["eghw-200"], intervalMonths: null, price: null },
  { sku: "[FILTER SKU TBC]", name: "EGHW-200 Eco Mac filter", stage: "Eco Mac (option)", compatibleModels: ["eghw-200"], intervalMonths: null, price: null },
  { sku: "[FILTER SKU TBC]", name: "EGHW-200 Bio Alkaline filter", stage: "Bio Alkaline (option)", compatibleModels: ["eghw-200"], intervalMonths: null, price: null },
  tbcStage("W2-160P", "w2-160p"),
  tbcStage("W2-170P", "w2-170p"),
  tbcStage("HW-110", "hw-110"),
  tbcStage("HWJ-L110", "hwj-l110"),
  tbcStage("Infinite L20", "infinite-l20"),
  tbcStage("WHNS-01", "whns-01"),
];
export const SEED_FILTERS: FilterSku[] = seeds.map((f, i) => ({ ...f, id: `f${i + 1}` }));
export let filters: FilterSku[] = SEED_FILTERS;

export const filtersFor = (slug: string) => filters.filter((f) => f.compatibleModels.includes(slug));

/** Called by the catalog store; swaps the live catalogue the storefront reads from. */
export function applyCatalog(allProducts: Product[], allFilters: FilterSku[]) {
  products = allProducts.filter((p) => !p.hidden);
  shopProducts = products.filter((p) => p.channel === "shop");
  quoteProducts = products.filter((p) => p.channel === "quote");
  const visible = new Set(products.map((p) => p.slug));
  filters = allFilters.filter((f) => f.compatibleModels.some((s) => visible.has(s)));
}
