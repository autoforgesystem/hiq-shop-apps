import { useState } from "react";
import { Input } from "./ui";

/** User enters their own consumption; output is labelled as an estimate. No pre-filled environmental claims. */
export function BottleCalculator() {
  const [perWeek, setPerWeek] = useState<number | "">("");
  const [years, setYears] = useState(1);
  const total = typeof perWeek === "number" ? Math.round(perWeek * 52 * years) : null;
  return (
    <div className="grid gap-6 rounded-2xl bg-white p-6 ring-1 ring-hiq-water sm:grid-cols-2">
      <div className="space-y-4">
        <label className="block text-sm font-semibold">How many single-use bottles does your household buy each week?
          <Input className="mt-1" type="number" inputMode="numeric" min={0} placeholder="e.g. your own count" value={perWeek} onChange={(e) => setPerWeek(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))} />
        </label>
        <label className="block text-sm font-semibold">Over how many years?
          <Input className="mt-1" type="number" inputMode="numeric" min={1} value={years} onChange={(e) => setYears(Math.max(1, Number(e.target.value) || 1))} />
        </label>
      </div>
      <div className="flex flex-col justify-center rounded-xl bg-hiq-sky p-5" aria-live="polite">
        <p className="text-sm font-semibold text-slate-600">My plastic bottles avoided</p>
        <p className="font-display text-5xl font-bold text-hiq-blue">{total == null ? "—" : total.toLocaleString()}</p>
        <p className="mt-2 text-sm text-slate-600">{total == null ? "Enter your weekly count to see your estimate." : `Estimate based on ${perWeek} bottles a week for ${years} year${years > 1 ? "s" : ""}.`}</p>
      </div>
    </div>
  );
}
