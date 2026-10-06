import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCommerce } from "../commerce/CommerceContext";
import { Stepper } from "../components/Stepper";
import { Button, ButtonLink, EmptyState, FormField, Input, PriceTag, Select, Tbc } from "../components/ui";
import { useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { cx } from "../lib/format";
import { IconCheck } from "../components/Icons";

const STEPS = ["Contact", "Delivery", "Installation", "Payment", "Review"];
const PAY = ["Credit or debit card", "GCash", "Maya", "Online banking"];

export default function Checkout() {
  const { lines, clear } = useCommerce();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ name: "", email: "", phone: "", address: "", city: "", province: "", postal: "", installDate: "", installSlot: "", pay: "" });
  const [e, setE] = useState<Record<string, string>>({});
  useSeo({ title: "Checkout", description: "Checkout", path: "/checkout", noindex: true });
  const needsInstall = lines.some((l) => l.options?.installation === "Yes");
  const set = (k: keyof typeof d) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD({ ...d, [k]: ev.target.value });

  if (!lines.length) return <div className="page py-12"><EmptyState title="Your cart is empty" body="Add a product to start checkout." action={<ButtonLink to="/shop" variant="primary">Shop Water Filters</ButtonLink>} /></div>;

  const validate = () => {
    const x: Record<string, string> = {};
    if (step === 0) { if (!d.name) x.name = "Enter your full name."; if (!/^\S+@\S+\.\S+$/.test(d.email)) x.email = "Enter an email like name@example.com."; if (d.phone.replace(/\D/g, "").length < 10) x.phone = "Enter a mobile number with at least 10 digits."; }
    if (step === 1) { if (!d.address) x.address = "Enter your street address."; if (!d.city) x.city = "Enter your city."; if (!d.province) x.province = "Enter your province."; }
    if (step === 3 && !d.pay) x.pay = "Choose how you'd like to pay.";
    setE(x); return !Object.keys(x).length;
  };
  const place = () => {
    const id = "HIQ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    try { sessionStorage.setItem(`hiq_order_${id}`, JSON.stringify({ id, lines, contact: d, needsInstall })); } catch { /* ignore */ }
    track("purchase", { transaction_id: id, items: lines.map((l) => ({ item_id: l.sku, quantity: l.qty })), currency: "PHP" });
    clear(); nav(`/order/${id}`);
  };
  const F = (k: keyof typeof d, label: string, p: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <FormField label={label} id={`co-${k}`} error={e[k]}><Input id={`co-${k}`} value={d[k]} onChange={set(k)} aria-invalid={!!e[k]} {...p} /></FormField>
  );

  return (
    <div className="page grid gap-10 py-10 lg:grid-cols-[1fr_340px]">
      <div className="max-w-xl">
        <h1 className="text-[32px]">Checkout</h1>
        <p className="mt-1 text-[15px] text-slate-600">Checking out as a guest. <Link to="/login?next=/checkout" className="link">Sign in</Link></p>
        <div className="mt-6"><Stepper steps={STEPS} current={step} /></div>
        <form noValidate className="mt-8 space-y-5" onSubmit={(ev) => { ev.preventDefault(); if (step === 4) place(); else if (validate()) setStep(step + 1); }}>
          {step === 0 && <>{F("name", "Full name", { autoComplete: "name" })}{F("email", "Email", { type: "email", autoComplete: "email" })}{F("phone", "Mobile number", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "0917 123 4567" })}</>}
          {step === 1 && <>{F("address", "Street address", { autoComplete: "street-address" })}{F("city", "City or municipality", { autoComplete: "address-level2" })}{F("province", "Province", { autoComplete: "address-level1" })}{F("postal", "Postal code (optional)", { inputMode: "numeric", autoComplete: "postal-code" })}<p className="text-sm text-slate-600">Delivery fee: <span className="tbc">[TBC]</span></p></>}
          {step === 2 && (needsInstall ? <>
            <p className="text-[17px]">Pick a preferred installation window. HIQ calls to confirm, and may test your water first.</p>
            {F("installDate", "Preferred date", { type: "date", min: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) })}
            <FormField label="Preferred time" id="co-slot"><Select id="co-slot" value={d.installSlot} onChange={set("installSlot")}><option value="">No preference</option><option>Morning</option><option>Afternoon</option></Select></FormField>
          </> : <p className="rounded-card bg-hiq-sky p-4">No installation in this order. You can <Link to="/service/book" className="link">book a service</Link> any time.</p>)}
          {step === 3 && <fieldset><legend className="mb-3 font-semibold">Payment method</legend>
            <div className="space-y-2" role="radiogroup">{PAY.map((p) => <button type="button" role="radio" aria-checked={d.pay === p} key={p} onClick={() => setD({ ...d, pay: p })} className={cx("flex min-h-[56px] w-full items-center justify-between rounded-xl px-4 font-semibold ring-1", d.pay === p ? "bg-hiq-navy text-white ring-hiq-navy" : "ring-slate-300 hover:ring-hiq-blue")}>{p}{d.pay === p && <IconCheck />}</button>)}</div>
            {e.pay && <p role="alert" className="mt-2 text-sm font-medium text-error">{e.pay}</p>}
            <p className="mt-3 text-sm text-slate-600">Payment is processed securely by the commerce platform. This demo doesn't take payment.</p></fieldset>}
          {step === 4 && <dl className="divide-y divide-slate-200 rounded-card ring-1 ring-slate-200">{[["Contact", `${d.name} · ${d.email} · ${d.phone}`], ["Deliver to", `${d.address}, ${d.city}, ${d.province} ${d.postal}`], ["Installation", needsInstall ? `${d.installDate || "HIQ to propose"} ${d.installSlot}` : "Not included"], ["Payment", d.pay]].map(([k, v]) => <div key={k} className="px-4 py-3"><dt className="text-sm text-slate-600">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>}
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => (step ? setStep(step - 1) : nav("/cart"))}>Back</Button>
            <Button type="submit" variant={step === 4 ? "primary" : "secondary"}>{step === 4 ? "Place order" : "Continue"}</Button>
          </div>
        </form>
      </div>
      <aside className="h-fit rounded-card bg-hiq-sky p-5">
        <h2 className="text-lg">Order summary</h2>
        <ul className="mt-3 space-y-2 text-[15px]">{lines.map((l) => <li key={l.id} className="flex justify-between gap-2"><span>{l.qty} × {l.name}</span><PriceTag price={l.unitPrice} /></li>)}</ul>
        <p className="mt-3 border-t border-hiq-water pt-3 text-[15px]">Delivery <Tbc /> · Currency PHP</p>
      </aside>
    </div>
  );
}
