import { useMemo, useState } from "react";
import { formatPHP } from "../lib/format";
import { Input } from "./ui";

/** Every input is editable and every default is a labelled assumption. Output is an estimate only. */
export function CostCalculator() {
  const [v, setV] = useState({ people: 4, litres: 2, bottlePrice: 20, bottleSize: 0.5, refillPrice: 35, systemPrice: 0, filterCost: 0, years: 3 });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: Math.max(0, Number(e.target.value) || 0) });
  const r = useMemo(() => {
    const litresYear = v.people * v.litres * 365;
    const bottled = v.bottleSize > 0 ? (litresYear / v.bottleSize) * v.bottlePrice * v.years : 0;
    const refill = (litresYear / 18.9) * v.refillPrice * v.years; // 5-gallon ≈ 18.9 L
    const hiq = v.systemPrice + v.filterCost * v.years;
    return { litresYear, bottled, refill, hiq, bottles: v.bottleSize > 0 ? Math.round(litresYear / v.bottleSize) : 0 };
  }, [v]);
  const max = Math.max(r.bottled, r.refill, r.hiq, 1);
  const fields: [keyof typeof v, string, string][] = [
    ["people", "People in your household", "people"],
    ["litres", "Drinking water per person per day", "litres"],
    ["bottlePrice", "Price of one bottle of water", "₱"],
    ["bottleSize", "Size of that bottle", "litres"],
    ["refillPrice", "Price of a 5-gallon refill", "₱"],
    ["systemPrice", "HIQ system price (from your quote)", "₱"],
    ["filterCost", "Replacement filters per year", "₱"],
    ["years", "Years to compare", "years"],
  ];
  return (
    <div className="grid gap-6 rounded-2xl bg-white p-5 ring-1 ring-hiq-water sm:p-7 lg:grid-cols-[1fr_1.1fr]">
      <form className="grid grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()} aria-label="Cost comparison inputs">
        {fields.map(([k, label, unit]) => (
          <label key={k} className="text-sm font-semibold">
            {label}
            <span className="mt-1 flex items-center gap-2">
              <Input type="number" inputMode="decimal" min={0} step="any" value={v[k]} onChange={set(k)} />
              <span className="w-12 shrink-0 text-[13px] font-normal text-slate-600">{unit}</span>
            </span>
          </label>
        ))}
        <p className="col-span-2 text-[13px] text-slate-600">Defaults are example assumptions, not HIQ figures. Change them to match your household. Enter the system and filter prices from your HIQ quote.</p>
      </form>
      <div aria-live="polite">
        <p className="text-sm font-semibold text-slate-600">Estimated cost over {v.years} year{v.years === 1 ? "" : "s"} · {Math.round(r.litresYear).toLocaleString()} L per year</p>
        <dl className="mt-4 space-y-4">
          {[["Bottled water", r.bottled, "bg-slate-400"], ["Refilling station", r.refill, "bg-hiq-water"], ["HIQ filtered water", r.hiq, "bg-hiq-blue"]].map(([label, val, c]) => (
            <div key={label as string}>
              <div className="flex justify-between text-[15px]"><dt className="font-semibold">{label as string}</dt><dd className="font-display font-bold">{formatPHP(val as number)}</dd></div>
              <div className="mt-1.5 h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${c}`} style={{ width: `${((val as number) / max) * 100}%` }} /></div>
            </div>
          ))}
        </dl>
        {v.systemPrice === 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-warning">Add the HIQ system price from your quote to complete the comparison.</p>}
        <p className="mt-4 text-sm text-slate-600">At these numbers, bottled water would mean about <strong>{r.bottles.toLocaleString()}</strong> bottles a year.</p>
        <p className="mt-2 text-[13px] font-semibold text-slate-500">Estimate only</p>
      </div>
    </div>
  );
}
