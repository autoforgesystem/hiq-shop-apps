import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SERVICES } from "./Service";
import { Stepper } from "../components/Stepper";
import { Button, FormField, Input, Select, Textarea } from "../components/ui";
import { shopProducts } from "../data/catalog";
import { submitForm } from "../lib/forms";
import { api, useApi } from "../lib/api";
import { useAuth } from "../lib/auth";
import { track } from "../lib/analytics";
import { useSeo } from "../lib/seo";
import { cx } from "../lib/format";
import { IconCheck } from "../components/Icons";

const STEPS = ["Service", "Unit", "Date & time", "Contact & address", "Review"];
const SLOTS = ["Morning (9 AM – 12 NN)", "Afternoon (1 PM – 3 PM)", "Late afternoon (3 PM – 6 PM)"];
const slotCode = (s: string) => (s.startsWith("Late") ? "late-afternoon" : s.startsWith("Afternoon") ? "afternoon" : s ? "morning" : undefined);

export default function ServiceBook() {
  const [sp] = useSearchParams();
  const [step, setStep] = useState(0);
  const { user } = useAuth();
  const [sendError, setSendError] = useState("");
  const [d, setD] = useState({ service: sp.get("service") ?? "", unit: sp.get("unit") ?? "", date: "", slot: "", name: user ? `${user.firstName} ${user.lastName}` : "", phone: user?.phone ?? "", email: user?.email ?? "", address: "", city: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  useSeo({ title: "Book installation, service or a water test", description: "Book HIQ installation, a water test, maintenance or filter replacement in a few steps.", path: "/service/book" });
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  const svc = SERVICES.find((s) => s.id === d.service);
  const unitLabel = d.unit === "new" ? "New installation" : shopProducts.find((p) => p.slug === d.unit)?.model ?? d.unit;
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !d.service) e.service = "Choose a service.";
    if (step === 1 && !d.unit) e.unit = "Choose your unit, or “New installation”.";
    if (step === 2) { if (!d.date) e.date = "Choose a preferred date."; if (!d.slot) e.slot = "Choose a time slot."; }
    if (step === 3) {
      if (!d.name) e.name = "Enter your name.";
      if (d.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a mobile number with at least 10 digits.";
      if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) e.email = "Enter an email like name@example.com.";
      if (!d.address) e.address = "Enter the service address.";
      if (!d.city) e.city = "Enter your city or municipality.";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };
  const next = () => validate() && setStep((s) => s + 1);
  const confirm = async () => {
    setSending(true); setSendError("");
    try {
      if (useApi) await api("/bookings", {
        auth: "customer",
        body: { service: d.service, unit: d.unit, date: d.date, slot: slotCode(d.slot), name: d.name, phone: d.phone, email: d.email || undefined, address: d.address, city: d.city, notes: d.notes || undefined },
      });
      else await submitForm(`Service booking — ${svc?.label}`, { Service: svc?.label ?? "", Unit: unitLabel, "Preferred date": d.date, "Preferred time": d.slot, Name: d.name, Mobile: d.phone, Email: d.email, Address: `${d.address}, ${d.city}`, Notes: d.notes });
      track(d.service === "water-test" ? "book_water_test" : "book_installation", { service: d.service, unit: d.unit });
      setDone(true);
    } catch (x) {
      setSendError((x as Error).message);
    } finally { setSending(false); }
  };

  if (done) return (
    <div className="page max-w-2xl py-14">
      <div className="rounded-2xl bg-green-50 p-8 ring-1 ring-green-200">
        <p className="flex items-center gap-2 text-2xl font-bold text-success"><IconCheck />Booking request sent</p>
        <p className="mt-3 text-lg">HIQ will call you on <strong>{d.phone}</strong> to confirm the schedule for your {svc?.label.toLowerCase()}.</p>
        <p className="mt-2 text-slate-700">Your preferred slot: {d.date}, {d.slot}. This isn't confirmed until HIQ calls.</p>
        <Link to="/" className="link mt-6 inline-block">Back to the shop</Link>
      </div>
    </div>
  );

  const Choice = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={cx("flex min-h-[56px] w-full items-center justify-between rounded-xl px-4 text-left font-semibold ring-1", on ? "bg-hiq-navy text-white ring-hiq-navy" : "bg-hiq-sky ring-hiq-water hover:ring-hiq-blue")}>{children}{on && <IconCheck />}</button>
  );

  return (
    <div className="page max-w-2xl py-10">
      <h1 className="text-[30px] sm:text-[38px]">Book a service</h1>
      <div className="mt-6"><Stepper steps={STEPS} current={step} /></div>
      <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); step < 4 ? next() : confirm(); }} noValidate>
        {step === 0 && <fieldset><legend className="mb-3 text-xl font-bold">What do you need?</legend>
          <div className="space-y-2" role="radiogroup">{SERVICES.map((s) => <Choice key={s.id} on={d.service === s.id} onClick={() => setD({ ...d, service: s.id })}>{s.label}</Choice>)}</div>
          {errors.service && <p role="alert" className="mt-2 text-sm font-medium text-error">{errors.service}</p>}</fieldset>}
        {step === 1 && <fieldset><legend className="mb-3 text-xl font-bold">Which unit is this for?</legend>
          <div className="space-y-2" role="radiogroup"><Choice on={d.unit === "new"} onClick={() => setD({ ...d, unit: "new" })}>New installation</Choice>
            {shopProducts.map((p) => <Choice key={p.slug} on={d.unit === p.slug} onClick={() => setD({ ...d, unit: p.slug })}>{p.model}</Choice>)}</div>
          {errors.unit && <p role="alert" className="mt-2 text-sm font-medium text-error">{errors.unit}</p>}</fieldset>}
        {step === 2 && <>
          <FormField label="Preferred date" id="date" error={errors.date}><Input id="date" type="date" min={minDate} value={d.date} onChange={set("date")} /></FormField>
          <FormField label="Preferred time" id="slot" error={errors.slot}><Select id="slot" value={d.slot} onChange={set("slot")}><option value="">Choose…</option>{SLOTS.map((s) => <option key={s}>{s}</option>)}</Select></FormField>
          <p className="text-sm text-slate-600">Time slots are indicative. HIQ calls to confirm. Available days: <span className="tbc">[CONFIRM DAYS]</span></p>
        </>}
        {step === 3 && <>
          <FormField label="Full name" id="name" error={errors.name}><Input id="name" autoComplete="name" value={d.name} onChange={set("name")} /></FormField>
          <FormField label="Mobile number" id="phone" error={errors.phone}><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" value={d.phone} onChange={set("phone")} /></FormField>
          <FormField label="Email (optional)" id="email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={d.email} onChange={set("email")} /></FormField>
          <FormField label="Service address" id="address" error={errors.address} hint="Unit, building, street, barangay"><Input id="address" autoComplete="street-address" value={d.address} onChange={set("address")} /></FormField>
          <FormField label="City or municipality" id="city" error={errors.city}><Input id="city" autoComplete="address-level2" value={d.city} onChange={set("city")} /></FormField>
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-warning">Service-area check: <strong>[TBC]</strong>. HIQ confirms coverage when it calls.</p>
          <FormField label="Anything we should know? (optional)" id="notes"><Textarea id="notes" value={d.notes} onChange={set("notes")} /></FormField>
        </>}
        {step === 4 && <section aria-label="Review"><h2 className="mb-3 text-xl">Review your booking</h2>
          <dl className="divide-y divide-slate-200 rounded-card ring-1 ring-slate-200">{[["Service", svc?.label], ["Unit", unitLabel], ["Preferred slot", `${d.date}, ${d.slot}`], ["Name", d.name], ["Mobile", d.phone], ["Email", d.email || "—"], ["Address", `${d.address}, ${d.city}`]].map(([k, v]) => (
            <div key={k} className="flex flex-wrap justify-between gap-2 px-4 py-3"><dt className="text-slate-600">{k}</dt><dd className="font-semibold">{v}</dd></div>))}</dl>
          <p className="mt-3 text-[15px] text-slate-700">HIQ will call you to confirm the schedule.</p></section>}
        {sendError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-[15px] font-medium text-error ring-1 ring-red-200">{sendError}</p>}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <Button type="submit" variant="secondary" disabled={sending}>{step < 4 ? "Continue" : sending ? "Sending…" : "Confirm booking"}</Button>
        </div>
      </form>
    </div>
  );
}
