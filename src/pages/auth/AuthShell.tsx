import { useState, type ReactNode } from "react";
import { Input } from "../../components/ui";
import { IconCalendar, IconCheck, IconEye, IconEyeOff, IconFilter, IconWrench } from "../../components/Icons";
import { LogoMark } from "../../components/Logo";
import { cx } from "../../lib/format";
import { useApi } from "../../lib/api";

const PERKS = [
  { Icon: IconFilter, text: "Filter replacement reminders for every unit" },
  { Icon: IconWrench, text: "Book installation and maintenance in a few taps" },
  { Icon: IconCalendar, text: "Track orders, service visits and warranty" },
];

/** Shared two-panel layout for sign-in and registration. */
export function AuthShell({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-hiq-sky/60 py-8 sm:py-14">
      <div className="page grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lift lg:grid-cols-[1fr_1.15fr]">
        <aside className="relative hidden flex-col justify-between bg-hiq-navy p-10 text-white lg:flex">
          <div>
            <LogoMark size={44} className="rounded-xl bg-white px-3 py-2" />
            <p className="mt-8 font-display text-[28px] font-bold leading-tight">Clean water at home, looked after.</p>
            <ul className="mt-8 space-y-4">
              {PERKS.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[15px] text-white/90">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"><Icon size={18} /></span>
                  <span className="pt-1.5">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="waterline mt-10 h-1.5 rounded-full" aria-hidden />
        </aside>
        <div className="p-6 sm:p-10">
          <h1 className="text-[28px] sm:text-[34px]">{title}</h1>
          <p className="mt-2 text-[15px] text-slate-600">{intro}</p>
          {!useApi && <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-warning ring-1 ring-amber-200">Demo only. Accounts are stored in this browser and nothing is sent to HIQ.</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordInput({ id, value, onChange, autoComplete, invalid, describedBy }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean; describedBy?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={invalid} aria-describedby={describedBy} className="pr-12" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-lg text-slate-500 hover:text-hiq-blue">
        {show ? <IconEyeOff size={20} /> : <IconEye size={20} />}
      </button>
    </div>
  );
}

export function Checkbox({ id, checked, onChange, children, invalid }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: ReactNode; invalid?: boolean }) {
  return (
    <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-start gap-3 py-1 text-[15px]">
      <span className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalid}
          className={cx("peer h-5 w-5 cursor-pointer appearance-none rounded border-2 bg-white checked:border-hiq-blue checked:bg-hiq-blue", invalid ? "border-error" : "border-slate-400")} />
        <IconCheck size={14} strokeWidth={3} className="pointer-events-none absolute hidden text-white peer-checked:block" />
      </span>
      <span>{children}</span>
    </label>
  );
}

export const Divider = ({ children }: { children: ReactNode }) => (
  <div className="my-6 flex items-center gap-3 text-sm text-slate-500"><span className="h-px flex-1 bg-slate-200" />{children}<span className="h-px flex-1 bg-slate-200" /></div>
);
