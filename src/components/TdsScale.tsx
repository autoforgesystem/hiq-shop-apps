import { Link } from "react-router-dom";
import { cx } from "../lib/format";
import type { Filtration } from "../data/types";

const BANDS = [
  { f: "UF", range: "0–150 ppm", note: "UF, with or without softener", w: "flex-[150]" },
  { f: "Nano", range: "151–190 ppm", note: "Nano", w: "flex-[60]" },
  { f: "RO", range: "Above 190 ppm or deep well", note: "Reverse osmosis", w: "flex-[110]" },
] as const;

/** HIQ's own TDS guideline — the site's recurring "water line" motif. */
export function TdsScale({ highlight, compact, className }: { highlight?: Filtration | null; compact?: boolean; className?: string }) {
  return (
    <figure className={cx("w-full", className)}>
      <div className="flex h-3 overflow-hidden rounded-full waterline" aria-hidden />
      <ol className="mt-2 flex gap-2">
        {BANDS.map((b) => (
          <li key={b.f} className={cx(b.w, "min-w-0 rounded-lg px-2 py-1.5 transition-colors", highlight === b.f ? "bg-hiq-navy text-white" : "")}>
            <span className="block font-display text-[15px] font-bold">{b.f}</span>
            <span className={cx("block text-[13px]", highlight === b.f ? "text-white/85" : "text-slate-600")}>{b.range}</span>
            {!compact && <span className={cx("block text-[13px]", highlight === b.f ? "text-white/85" : "text-slate-600")}>{b.note}</span>}
          </li>
        ))}
      </ol>
      {!compact && (
        <figcaption className="mt-3 text-sm text-slate-600">
          HIQ's usual recommendation by measured TDS. Your final choice depends on a water report or site visit — <Link to="/service/book?service=water-test" className="link">book a water test</Link>.
        </figcaption>
      )}
    </figure>
  );
}
