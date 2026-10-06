import { useParams } from "react-router-dom";
import { ButtonLink } from "../components/ui";
import { IconCheck, IconDrop, IconPhone, IconFilter } from "../components/Icons";
import { useSeo } from "../lib/seo";

export default function Order() {
  const { id = "" } = useParams();
  useSeo({ title: "Order confirmed", description: "Order confirmation", path: `/order/${id}`, noindex: true });
  let order: { contact?: { email?: string }; needsInstall?: boolean; requiresQuote?: boolean } = {};
  try { order = JSON.parse(sessionStorage.getItem(`hiq_order_${id}`) || "{}"); } catch { /* ignore */ }
  const steps: { I: typeof IconDrop; t: string; d: string }[] = [
    ...(order.needsInstall !== false ? [{ I: IconDrop, t: "Water test, if needed", d: "HIQ may ask for a water report or test your water before installing." }] : []),
    { I: IconPhone, t: "Installation call", d: "HIQ calls you to confirm your delivery and installation schedule." },
    { I: IconFilter, t: "Filter reminders", d: "Sign up for reminders so you replace filters on time." },
  ];
  return (
    <div className="page max-w-2xl py-14">
      <p className="flex items-center gap-2 text-success"><IconCheck />Order received</p>
      <h1 className="mt-2 text-[34px]">Salamat! Your order is in.</h1>
      <p className="mt-2 text-lg text-slate-700">Order number <strong>{id}</strong>{order.contact?.email ? <> · confirmation sent to {order.contact.email}</> : null}</p>
      {order.requiresQuote && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-[15px] text-warning ring-1 ring-amber-200">Some prices in this order are still being confirmed. HIQ will call you with the total before you pay.</p>}
      <h2 className="mt-10 text-xl">What happens next</h2>
      <ol className="mt-4 space-y-4">{steps.map(({ I, t, d }, i) => (
        <li key={t} className="flex gap-4 rounded-card p-4 ring-1 ring-slate-200"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-hiq-sky text-hiq-blue"><I size={20} /></span><div><p className="font-semibold">{i + 1}. {t}</p><p className="text-[15px] text-slate-700">{d}</p></div></li>
      ))}</ol>
      <div className="mt-8 flex flex-wrap gap-3"><ButtonLink to="/account/filters" variant="secondary">Set up filter reminders</ButtonLink><ButtonLink to="/" variant="ghost">Back to the shop</ButtonLink></div>
    </div>
  );
}
