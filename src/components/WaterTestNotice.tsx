import { Link } from "react-router-dom";
import { IconDrop } from "./Icons";
import { track } from "../lib/analytics";

/** Shown wherever filtration type is chosen (acceptance checklist). */
export function WaterTestNotice({ limit, compact }: { limit?: number; compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-card bg-hiq-sky p-4 ring-1 ring-hiq-water">
      <IconDrop className="mt-0.5 shrink-0 text-hiq-blue" />
      <div className="text-[15px]">
        <p className="font-semibold">{limit ? `Check your water first: this configuration needs inlet water below ${limit} ppm TDS.` : "Not sure which filtration you need?"}</p>
        {!compact && <p className="mt-1 text-slate-700">HIQ asks for a water-quality report or tests your water on a site visit before installation.</p>}
        <Link to="/service/book?service=water-test" onClick={() => track("book_water_test", { source: "notice" })} className="link mt-1 inline-block">Book a water test</Link>
      </div>
    </div>
  );
}
