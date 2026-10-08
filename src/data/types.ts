export type Category = "under-sink" | "countertop" | "dispensers" | "whole-house" | "commercial" | "industrial" | "emergency";
export type Need = "home" | "condo" | "office" | "business";
export type Filtration = "UF" | "Nano" | "RO" | "UV" | "Alkaline";

export interface ProductImage { src: string; alt: string }

export interface Product {
  slug: string;
  model: string;
  category: Category;
  /** shop = can be bought/rented online, quote = request a quote only */
  channel: "shop" | "quote";
  needs: Need[];
  filtration: Filtration[];
  configurations: string[];
  hotCold: boolean;
  install: string;
  tdsLimit?: number;
  entry?: boolean;
  bottleless?: boolean;
  tableTop?: boolean;
  office?: boolean;
  summary: string;
  highlights: string[];
  /** null = not yet supplied, rendered as [TBC] */
  specs: Record<string, string | null>;
  price: number | null;
  warrantyTbc?: boolean;
  storeUrl: string | null;
  featured?: number;
  /** Product photos, first one is the main photo. Empty = labelled placeholder frames. */
  images?: ProductImage[];
  /** Hidden products stay in the admin but are not shown on the shop. */
  hidden?: boolean;
}

export interface FilterSku {
  id: string;
  sku: string; // [FILTER SKU TBC]
  name: string;
  stage: string;
  compatibleModels: string[]; // product slugs
  intervalMonths: number | null; // [TBC]
  price: number | null; // [TBC]
  note?: string;
}

export type PartCategory = "fittings" | "hoses-tubing" | "filter-cartridges" | "faucets" | "valves" | "housings" | "other";
/** What the price and quantity count: one piece, one meter of tubing, or one pack. */
export type PartUnit = "piece" | "meter" | "pack";

/**
 * Fittings, hoses, general-purpose cartridges and other parts. Each size is its own part with its own SKU.
 * Filters made for one HIQ model are `FilterSku`s instead (they drive filter reminders).
 */
export interface SparePart {
  /** Never changes after creation: links and cart lines use it. */
  slug: string;
  sku: string; // [PART SKU TBC]
  name: string;
  category: PartCategory;
  description: string;
  /** null = not yet supplied, rendered as [TBC] */
  specs: Record<string, string | null>;
  /** First one is the main photo. Empty = labelled placeholder frame. */
  images: ProductImage[];
  unit: PartUnit;
  /** Per unit. null = [PRICE TBC] */
  price: number | null;
  /** Product slugs. Empty = fits any system. */
  compatibleModels: string[];
  hidden?: boolean;
}
