import { cx } from "../lib/format";
import { IconCheck } from "./Icons";
/** Used by BookingStepper and CheckoutStepper. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? "step" : undefined} className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className={cx("h-1.5 rounded-full", i <= current ? "bg-hiq-blue" : "bg-hiq-water")} />
          <span className={cx("flex items-center gap-1 whitespace-nowrap text-[13px]", i === current ? "font-semibold text-hiq-navy" : "text-slate-600")}>
            {i < current && <IconCheck size={14} className="text-success" />}{s}
          </span>
        </li>
      ))}
    </ol>
  );
}
