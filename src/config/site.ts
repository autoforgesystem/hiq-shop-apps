/** Single source of truth for links back to the HIQ main site (Section 7). */
export const MAIN_SITE = {
  home: "https://hospitalityinnovations.com.ph/",
  hotelBottling: "https://hospitalityinnovations.com.ph/ecopure-waters-intl",
  bottleWashers: "https://hospitalityinnovations.com.ph/bottle-washers",
  waco: "https://hospitalityinnovations.com.ph/waco-philippines",
  sustainableSolutions: "https://hospitalityinnovations.com.ph/sustainable-solutions-1",
  videotree: "https://hospitalityinnovations.com.ph/videotree-tv",
  viscoseClosures: "https://hospitalityinnovations.com.ph/viscose-closures",
  contact: "https://hospitalityinnovations.com.ph/#contact",
} as const;

export type MainSiteKey = keyof typeof MAIN_SITE;

/** Planned shop address — [CONFIRM DOMAIN] */
export const SHOP_URL = "https://shop.hospitalityinnovations.com.ph";

/** Verified business facts (Section 4). Do not edit without HIQ approval. */
export const BUSINESS = {
  legalName: "Hospitality Innovations by Quorate Inc.",
  shortName: "HIQ Philippines",
  street: "Coral Tree Commercial Building, Silmer Village, Corner Road 7 & 18",
  city: "Biñan",
  province: "Laguna",
  postal: "4024",
  country: "PH",
  addressLine: "Coral Tree Commercial Building, Silmer Village, Corner Road 7 & 18, Biñan, Laguna 4024, Philippines",
  phone: "+63 917 628 7242",
  phoneHref: "tel:+639176287242",
  email: "sales@hospitalityinnovations.com.ph",
  hours: "9:00 AM – 6:00 PM",
  hoursDaysTbc: true, // [CONFIRM DAYS]
  social: {
    facebook: "https://facebook.com/HIQIPhilippines",
    instagram: "https://instagram.com/hiqphilippines",
    x: "https://x.com/Hiqphilippines",
    youtube: "https://www.youtube.com/@hospitalityinnovations1798",
  },
  championOfChange: "https://championsofchange.breakfreefromplastic.org/endorsers/",
  partners: [
    { name: "WACO Philippines", role: "Partner — Korean-manufactured filtration systems" },
    { name: "Ecopure Waters International", role: "Exclusive distributor — hotel bottling" },
    { name: "Aquatech BM", role: "Philippine representative — bottle washers" },
    { name: "Winterhalter", role: "Reseller — ware washers" },
  ],
};

/** Optional: endpoint that forwards form posts to sales@ (e.g. Formspree). Empty = mailto fallback. */
export const FORM_ENDPOINT: string = import.meta.env.VITE_FORM_ENDPOINT ?? "";
/** Google Tag Manager container — loaded only after cookie consent. [TBC] */
export const GTM_ID: string = import.meta.env.VITE_GTM_ID ?? "";

/** Adds UTM parameters to shop → main-site links so cross-site traffic is measurable. */
export function mainSiteUrl(key: MainSiteKey, content = "link"): string {
  const url = new URL(MAIN_SITE[key]);
  const hash = url.hash;
  url.hash = "";
  url.searchParams.set("utm_source", "hiq_shop");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "shop_to_main");
  url.searchParams.set("utm_content", content);
  return url.toString() + hash;
}
