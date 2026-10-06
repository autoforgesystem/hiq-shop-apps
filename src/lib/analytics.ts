import { GTM_ID } from "../config/site";

export type AnalyticsEvent =
  | "view_item" | "search" | "quiz_start" | "quiz_complete" | "add_to_cart" | "begin_checkout"
  | "purchase" | "book_installation" | "book_water_test" | "request_quote" | "filter_replacement"
  | "rental_request" | "newsletter_signup";

declare global { interface Window { dataLayer: unknown[] } }

/** Pushes to window.dataLayer (GTM-ready for GA4, Meta Pixel, TikTok Pixel). */
export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (import.meta.env.DEV) console.info("[analytics]", event, params);
}

const CONSENT_KEY = "hiq_consent";
export const getConsent = (): "granted" | "denied" | null => {
  try { return (localStorage.getItem(CONSENT_KEY) as "granted" | "denied" | null) ?? null; } catch { return null; }
};
export function setConsent(v: "granted" | "denied") {
  try { localStorage.setItem(CONSENT_KEY, v); } catch { /* storage unavailable */ }
  if (v === "granted") loadTags();
}

let loaded = false;
/** Tags load only after the visitor accepts cookies. */
export function loadTags() {
  if (loaded || !GTM_ID || getConsent() !== "granted") return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

/** Reads UTMs on arrival from the main site and keeps them for the session. */
export function captureUtms() {
  const p = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  p.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v; });
  if (Object.keys(utm).length) {
    try { sessionStorage.setItem("hiq_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "utm_captured", ...utm });
  }
}
