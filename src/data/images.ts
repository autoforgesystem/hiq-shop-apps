import type { Product } from "./types";

/**
 * Photography slots. Every slot renders as a labelled placeholder frame until `src` is set.
 * Photos are managed in the admin (/admin/photos); the catalog store writes `src`/`alt` into these slots.
 * Brief: modern Philippine homes, condos, offices; never stock images of American suburbs.
 */
export interface PhotoSlot { label: string; src?: string; srcSet?: string; alt: string }

export const PHOTOS = {
  hero: { label: "Modern Philippine condo kitchen, filtered water from the tap into a glass", alt: "Filtered water pouring from a kitchen faucet into a glass in a bright condo kitchen" },
  family: { label: "Filipino family filling reusable glass bottles at the kitchen sink", alt: "A family filling reusable glass bottles at their kitchen sink" },
  office: { label: "Office pantry with a bottleless hot & cold dispenser", alt: "An office pantry with a plumbed-in hot and cold water dispenser" },
  technician: { label: "HIQ technician installing an under-sink system", alt: "An HIQ technician installing a water filtration system under a kitchen sink" },
  glassBottles: { label: "Reusable glass bottles on a sunlit counter", alt: "Reusable glass water bottles lined up on a kitchen counter" },
  hotel: { label: "Hotel table set with a branded reusable glass bottle", alt: "A hotel restaurant table set with a reusable glass water bottle" },
  waterTest: { label: "Technician testing tap water with a TDS meter", alt: "A technician measuring the TDS of tap water" },
  restaurant: { label: "Restaurant bar with HQ9 high-flow filtration", alt: "A restaurant bar counter with a commercial water filter" },
} satisfies Record<string, PhotoSlot>;

export type PhotoKey = keyof typeof PHOTOS;
/** Original slot text, kept so the admin can show and restore the defaults. */
export const PHOTO_DEFAULTS: Record<PhotoKey, PhotoSlot> = structuredClone(PHOTOS);

/** Where each site photo appears, in plain words for the admin. */
export const PHOTO_PLACES: Record<PhotoKey, string> = {
  hero: "Home page, top banner",
  family: "Not shown yet (reserved)",
  office: "Business page",
  technician: "Service page",
  glassBottles: "Home page and Eco page",
  hotel: "Not shown yet (reserved)",
  waterTest: "Not shown yet (reserved)",
  restaurant: "Not shown yet (reserved)",
};

/** Product photography: uses the uploaded photo when there is one, otherwise a labelled frame. */
export const productPhoto = (p: Product, i = 0): PhotoSlot => {
  const img = p.images?.[i];
  return img ? { label: `${p.model} photo ${i + 1}`, src: img.src, alt: img.alt || `${p.model} water filtration system` }
    : { label: `${p.model} product photo`, alt: `${p.model} water filtration system` };
};
