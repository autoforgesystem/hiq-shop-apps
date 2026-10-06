import { bySlugs, getProduct } from "../data/catalog";
import type { Filtration, Product } from "../data/types";

export type Where = "home" | "condo" | "office" | "business";
export type People = "1-2" | "3-4" | "5-6" | "7+";
export type Tds = "lt150" | "151-190" | "gt190" | "deepwell" | "unsure";
export type NeedKind = "cold" | "hotcold" | "drinking" | "whole";
export type Place = "undersink" | "counter" | "freestanding";
export type Budget = "lt20" | "20-40" | "40-70" | "70plus";

export interface Answers { where?: Where; people?: People; tds?: Tds; need?: NeedKind; place?: Place; budget?: Budget }

export const QUESTIONS = [
  { key: "where", q: "Where will you use it?", options: [["home", "Home"], ["condo", "Condo"], ["office", "Office"], ["business", "Business"]] },
  { key: "people", q: "How many people will drink from it?", options: [["1-2", "1–2"], ["3-4", "3–4"], ["5-6", "5–6"], ["7+", "7 or more"]] },
  { key: "tds", q: "Do you know your water's TDS reading?", hint: "TDS (total dissolved solids) is measured in ppm with a simple meter. HIQ can test it for you.", options: [["lt150", "Under 150 ppm"], ["151-190", "151–190 ppm"], ["gt190", "Over 190 ppm"], ["deepwell", "Deep well or provincial supply"], ["unsure", "Not sure"]] },
  { key: "need", q: "What do you need?", options: [["cold", "Cold filtered water"], ["hotcold", "Hot & cold"], ["drinking", "Drinking water only"], ["whole", "Whole-house water"]] },
  { key: "place", q: "Where will it go?", options: [["undersink", "Under the sink"], ["counter", "On the counter"], ["freestanding", "Freestanding"]] },
  { key: "budget", q: "What's your budget?", hint: "Prices are still being finalised, so we'll show every match for now.", options: [["lt20", "Under ₱20,000"], ["20-40", "₱20,000–40,000"], ["40-70", "₱40,000–70,000"], ["70plus", "₱70,000+"]] },
] as const;

/** HIQ's own guideline (Section 6). */
export function filtrationForTds(tds?: Tds): Filtration | null {
  switch (tds) {
    case "lt150": return "UF";
    case "151-190": return "Nano";
    case "gt190": case "deepwell": return "RO";
    default: return null;
  }
}

export interface QuizResult {
  mode: "quote" | "recommend" | "likely";
  filtration: Filtration | null;
  primary?: Product;
  /** For "likely": one option per filtration type. */
  likely?: { filtration: Filtration; product: Product }[];
  alternatives: Product[];
  reasons: string[];
  caveats: string[];
}

const supports = (p: Product, f: Filtration) => p.filtration.includes(f);

function candidates(a: Answers): { list: Product[]; caveats: string[] } {
  const caveats: string[] = [];
  if (a.need === "whole") return { list: bySlugs(["whns-01"]), caveats };
  const officeFirst = a.where === "office" || a.where === "business";
  if (a.need === "hotcold" || a.place === "freestanding") {
    const order = officeFirst
      ? ["hw-110", "hwj-l110", "infinite-l20", "w2-170p", "w2-160p"]
      : ["w2-170p", "w2-160p", "hw-110", "infinite-l20", "hwj-l110"];
    return { list: bySlugs(order), caveats };
  }
  if (a.place === "counter") return { list: bySlugs(["hwlp-uv-hq9", "eghw-200"]), caveats };
  return { list: bySlugs(["hw-np-100m", "hw-np-200", "vp-cu-200"]), caveats };
}

export function recommend(a: Answers): QuizResult {
  const reasons: string[] = [];
  const caveats: string[] = [];
  const filtration = filtrationForTds(a.tds);

  if ((a.where === "business" && a.people === "7+") || (a.where === "business" && a.need === "whole")) {
    return {
      mode: "quote", filtration, alternatives: bySlugs(["hw-110", "hq9-high-flow"]),
      reasons: ["You're equipping a business for 7 or more people, so a specialist should size the system on site."],
      caveats: [],
    };
  }

  const { list } = candidates(a);
  if (a.where) reasons.push(`Suited to ${a.where === "office" ? "an office" : a.where === "condo" ? "a condo" : a.where === "home" ? "a home" : "a business"}.`);
  if (a.need === "hotcold") reasons.push("You asked for hot and cold water, so we matched bottleless dispensers.");
  if (a.need === "whole") reasons.push("You want filtered water at every tap, which calls for a point-of-entry system.");
  if (a.place === "undersink") reasons.push("It fits out of sight under your sink.");
  if (a.place === "counter") reasons.push("It sits on your counter, with no cabinet work.");
  if (a.place === "freestanding") reasons.push("It stands on its own, plumbed into your water line.");

  if (!filtration) {
    // TDS unknown: never give one definitive pick (Section 9).
    const likely: { filtration: Filtration; product: Product }[] = [];
    (["UF", "Nano", "RO"] as Filtration[]).forEach((f) => {
      const used = likely.map((l) => l.product.slug);
      const p = list.find((x) => supports(x, f) && !used.includes(x.slug)) ?? list.find((x) => supports(x, f));
      if (p) likely.push({ filtration: f, product: p });
    });
    if (!likely.length && list[0]) likely.push({ filtration: list[0].filtration[0], product: list[0] });
    return {
      mode: "likely", filtration: null, likely, alternatives: [],
      reasons, caveats: ["The right filtration depends on your water. Book a water test and HIQ will confirm which option fits."],
    };
  }

  reasons.push(`Your TDS answer points to ${filtration} under HIQ's usual guideline.`);
  let matches = list.filter((p) => supports(p, filtration));
  if (a.need === "whole" && filtration !== "Nano") {
    caveats.push("The WHNS-01 uses Nano filtration. HIQ will check your supply on a site visit before confirming it suits your water.");
    matches = list;
  }
  if (!matches.length) {
    if (a.place === "counter" && filtration === "RO") {
      caveats.push("None of our countertop units use RO. For water above 190 ppm, an under-sink RO system is the usual fit.");
      matches = bySlugs(["hw-np-100m", ...list.map((p) => p.slug)]);
    } else {
      matches = list;
      caveats.push(`None of these options list ${filtration}. A water test will confirm the best fit.`);
    }
  }
  const primary = matches[0];
  if (primary?.tdsLimit) caveats.push(`The ${primary.model} needs inlet water below ${primary.tdsLimit} ppm TDS.`);
  if (a.budget) caveats.push("Prices are being finalised, so we haven't filtered by budget yet.");
  caveats.push("HIQ confirms your water quality before installation, with a water report or a site visit.");
  return { mode: "recommend", filtration, primary, alternatives: matches.slice(1, 3), reasons, caveats };
}

export const answersToQuery = (a: Answers) => new URLSearchParams(Object.entries(a).filter(([, v]) => v) as [string, string][]).toString();
export function queryToAnswers(q: URLSearchParams): Answers {
  const a: Answers = {};
  QUESTIONS.forEach((qq) => {
    const v = q.get(qq.key);
    if (v && qq.options.some(([val]) => val === v)) (a as Record<string, string>)[qq.key] = v;
  });
  return a;
}
export const isComplete = (a: Answers) => QUESTIONS.every((q) => (a as Record<string, unknown>)[q.key]);
export { getProduct };
