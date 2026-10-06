import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button, FormField, Input } from "../../components/ui";
import { IconCheck } from "../../components/Icons";
import { useToast } from "../../components/Toast";
import { safeNext, useAuth } from "../../lib/auth";
import { useSeo } from "../../lib/seo";
import { cx } from "../../lib/format";
import { AuthShell, Checkbox, PasswordInput } from "./AuthShell";

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "A letter and a number", test: (p: string) => /[a-z]/i.test(p) && /\d/.test(p) },
  { label: "Upper and lower case", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
];
const STRENGTH = [["Too weak", "bg-error"], ["Weak", "bg-error"], ["Good", "bg-warning"], ["Strong", "bg-success"]] as const;

export default function Register() {
  useSeo({ title: "Create an account", description: "Create your HIQ account.", path: "/register", noindex: true });
  const { user, register } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [d, setD] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "", terms: false, updates: false });
  const [e, setE] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={next} replace />;

  const passed = RULES.filter((r) => r.test(d.password)).length;
  const set = (k: "firstName" | "lastName" | "email" | "phone") => (ev: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: ev.target.value });
  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const x: Record<string, string> = {};
    if (!d.firstName.trim()) x.firstName = "Enter your first name.";
    if (!d.lastName.trim()) x.lastName = "Enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(d.email)) x.email = "Enter an email like name@example.com.";
    if (d.phone.replace(/\D/g, "").length < 10) x.phone = "Enter a mobile number with at least 10 digits.";
    if (passed < 2 || d.password.length < 8) x.password = "Use at least 8 characters with a letter and a number.";
    if (d.confirm !== d.password || !d.confirm) x.confirm = "The passwords don't match.";
    if (!d.terms) x.terms = "Please accept the terms to create an account.";
    setE(x);
    if (Object.keys(x).length) return document.getElementById(`rg-${Object.keys(x)[0]}`)?.focus();
    setBusy(true);
    const r = await register({ firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, password: d.password, marketingOptIn: d.updates });
    if (!r.ok) { setBusy(false); return setE({ [r.field ?? "form"]: r.error }); }
    show(`Mabuhay, ${d.firstName.trim()}! Your account is ready.`);
    nav(next, { replace: true });
  };
  const F = (k: "firstName" | "lastName" | "email" | "phone", label: string, p: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <FormField label={label} id={`rg-${k}`} error={e[k]}>
      <Input id={`rg-${k}`} value={d[k]} onChange={set(k)} aria-invalid={!!e[k]} aria-describedby={e[k] ? `rg-${k}-err` : undefined} {...p} />
    </FormField>
  );

  return (
    <AuthShell title="Create your account" intro={<>Already have one? <Link to={`/login${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">Sign in</Link></>}>
      <form noValidate onSubmit={submit} className="mt-6 space-y-5">
        {e.form && <p role="alert" className="rounded-lg bg-red-50 p-3 text-[15px] font-medium text-error ring-1 ring-red-200">{e.form}</p>}
        <div className="grid gap-5 sm:grid-cols-2">{F("firstName", "First name", { autoComplete: "given-name" })}{F("lastName", "Last name", { autoComplete: "family-name" })}</div>
        {F("email", "Email", { type: "email", autoComplete: "email" })}
        {F("phone", "Mobile number", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "0917 123 4567" })}

        <FormField label="Password" id="rg-password" error={e.password}>
          <PasswordInput id="rg-password" autoComplete="new-password" value={d.password} onChange={(v) => setD({ ...d, password: v })} invalid={!!e.password} describedBy="rg-pw-rules" />
          {d.password && (
            <div className="flex items-center gap-3 pt-1" aria-live="polite">
              <div className="flex flex-1 gap-1">{RULES.map((_, i) => <span key={i} className={cx("h-1.5 flex-1 rounded-full", i < passed ? STRENGTH[passed][1] : "bg-slate-200")} />)}</div>
              <span className="w-16 text-right text-sm font-semibold text-slate-600">{STRENGTH[passed][0]}</span>
            </div>
          )}
          <ul id="rg-pw-rules" className="grid gap-1 pt-1 text-sm sm:grid-cols-3">
            {RULES.map((r) => { const ok = r.test(d.password); return (
              <li key={r.label} className={cx("flex items-center gap-1.5", ok ? "text-success" : "text-slate-500")}>
                <IconCheck size={14} className={ok ? "" : "opacity-30"} />{r.label}<span className="sr-only">{ok ? " (done)" : " (not yet)"}</span>
              </li>); })}
          </ul>
        </FormField>
        <FormField label="Confirm password" id="rg-confirm" error={e.confirm}>
          <PasswordInput id="rg-confirm" autoComplete="new-password" value={d.confirm} onChange={(v) => setD({ ...d, confirm: v })} invalid={!!e.confirm} describedBy={e.confirm ? "rg-confirm-err" : undefined} />
        </FormField>

        <div>
          <Checkbox id="rg-terms" checked={d.terms} onChange={(v) => setD({ ...d, terms: v })} invalid={!!e.terms}>
            I agree to the <Link to="/terms" className="link">Terms of sale</Link> and <Link to="/privacy" className="link">Privacy policy</Link>
          </Checkbox>
          {e.terms && <p role="alert" className="text-sm font-medium text-error">{e.terms}</p>}
          <Checkbox id="rg-updates" checked={d.updates} onChange={(v) => setD({ ...d, updates: v })}>Send me filter reminders and offers by email (optional)</Checkbox>
        </div>
        <Button type="submit" variant="primary" full disabled={busy} aria-busy={busy}>{busy ? "Creating account…" : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}
