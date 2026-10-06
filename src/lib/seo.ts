import { useEffect } from "react";
import { SHOP_URL } from "../config/site";

interface SeoOpts { title: string; description: string; path: string; jsonLd?: object | object[]; noindex?: boolean }

const setMeta = (sel: string, attr: string, key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = content;
};

/** Per-page title, description, self-referencing canonical, OG tags and JSON-LD. */
export function useSeo({ title, description, path, jsonLd, noindex }: SeoOpts) {
  useEffect(() => {
    const full = title.includes("HIQ") ? title : `${title} | HIQ Shop`;
    document.title = full;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", full);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex,nofollow" : "index,follow");
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = SHOP_URL + path;
    document.head.querySelectorAll("script[data-page-ld]").forEach((n) => n.remove());
    if (jsonLd) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.pageLd = "1";
      s.text = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }
  }, [title, description, path, noindex, JSON.stringify(jsonLd ?? null)]);
}

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SHOP_URL + it.path })),
});
