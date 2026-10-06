import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button, FormField, Input } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { safeNext, useAuth } from "../../lib/auth";
import { useSeo } from "../../lib/seo";
import { DEMO_USERS } from "./mockUsers";
import { useApi } from "../../lib/api";
import { AuthShell, Checkbox, Divider, PasswordInput } from "./AuthShell";

export default function Login() {
  useSeo({ title: "Sign in", description: "Sign in to your HIQ account.", path: "/login", noindex: true });
  const { user, login } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [d, setD] = useState({ email: "", password: "", remember: true });
  const [e, setE] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={next} replace />;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const x: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(d.email)) x.email = "Enter an email like name@example.com.";
    if (!d.password) x.password = "Enter your password.";
    setE(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    const r = await login(d.email, d.password, d.remember);
    if (!r.ok) { setBusy(false); return setE({ form: r.error }); }
    show("Welcome back! You're signed in.");
    nav(next, { replace: true });
  };
  const demo = DEMO_USERS[0];

  return (
    <AuthShell title="Sign in" intro={<>New to HIQ? <Link to={`/register${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">Create an account</Link></>}>
      <form noValidate onSubmit={submit} className="mt-6 space-y-5">
        {e.form && <p role="alert" className="rounded-lg bg-red-50 p-3 text-[15px] font-medium text-error ring-1 ring-red-200">{e.form}</p>}
        <FormField label="Email" id="li-email" error={e.email}>
          <Input id="li-email" type="email" autoComplete="email" value={d.email} onChange={(ev) => setD({ ...d, email: ev.target.value })} aria-invalid={!!e.email} aria-describedby={e.email ? "li-email-err" : undefined} />
        </FormField>
        <FormField label="Password" id="li-pw" error={e.password}>
          <PasswordInput id="li-pw" autoComplete="current-password" value={d.password} onChange={(v) => setD({ ...d, password: v })} invalid={!!e.password} describedBy={e.password ? "li-pw-err" : undefined} />
        </FormField>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox id="li-remember" checked={d.remember} onChange={(v) => setD({ ...d, remember: v })}>Keep me signed in</Checkbox>
          <button type="button" className="link min-h-[44px] text-[15px]" onClick={() => show(useApi ? "Password reset isn't available online yet. Call or email HIQ and we'll help." : "Password reset needs the HIQ backend. Not available in this demo.")}>Forgot password?</button>
        </div>
        <Button type="submit" variant="secondary" full disabled={busy} aria-busy={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>

      {/* The demo account exists in demo mode, and on a dev server seeded with SEED_DEMO=true. */}
      {(!useApi || import.meta.env.DEV) && <>
        <Divider>or try the demo</Divider>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-hiq-sky p-4">
          <div className="text-[15px]">
            <p className="font-semibold text-hiq-navy">Demo account</p>
            <p className="text-slate-600">{demo.email} · {demo.password}</p>
          </div>
          <Button type="button" variant="outline" onClick={() => { setD({ ...d, email: demo.email, password: demo.password }); setE({}); }}>Fill in</Button>
        </div>
      </>}
      <p className="mt-6 text-center text-[15px] text-slate-600">Just want to buy? <Link to="/shop" className="link">Continue as a guest</Link></p>
    </AuthShell>
  );
}
