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
