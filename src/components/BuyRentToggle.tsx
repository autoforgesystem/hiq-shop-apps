import { cx } from "../lib/format";
export type Mode = "buy" | "rent";
export function BuyRentToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="radiogroup" aria-label="Buy or rent" className="inline-grid w-full grid-cols-2 rounded-full bg-hiq-sky p-1 ring-1 ring-hiq-water">
      {(["buy", "rent"] as Mode[]).map((m) => (
        <button key={m} role="radio" aria-checked={value === m} onClick={() => onChange(m)}
          className={cx("min-h-[44px] rounded-full text-[15px] font-semibold", value === m ? "bg-white text-hiq-navy shadow-soft" : "text-hiq-blue")}>
          {m === "buy" ? "Buy" : "Rent monthly"}
        </button>
      ))}
    </div>
  );
}
