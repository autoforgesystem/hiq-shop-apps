import { useSearchParams } from "react-router-dom";
import { ButtonLink, SectionTitle, Tbc } from "../components/ui";
import { RequestForm } from "../components/RequestForm";
import { shopProducts } from "../data/catalog";
import { IconCheck } from "../components/Icons";
import { useSeo } from "../lib/seo";

export default function Rent() {
  const [sp] = useSearchParams();
  useSeo({ title: "Buy or rent a water system", description: "Buy an HIQ water system outright, or rent one for a fixed monthly fee with service and consumables included.", path: "/rent" });
  return (
    <div className="page py-10">
      <h1 className="text-[36px] sm:text-[48px]">Buy or rent</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-700">Own your system outright, or pay a fixed monthly fee that includes regular service and consumables.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl p-6 ring-1 ring-slate-200">
          <h2 className="text-2xl">Buy</h2>
          <ul className="mt-4 space-y-2 text-[17px]">
            {["Pay once and own the system", "Installation by HIQ (fee [TBC])", "Order replacement filters when they're due", "Warranty [TBC]"].map((t) => <li key={t} className="flex gap-2"><IconCheck className="mt-0.5 shrink-0 text-hiq-blue" />{t}</li>)}
          </ul>
          <ButtonLink to="/shop" variant="primary" className="mt-6">Shop Water Filters</ButtonLink>
        </section>
        <section className="rounded-2xl bg-hiq-sky p-6 ring-1 ring-hiq-water">
          <h2 className="text-2xl">Rent</h2>
          <ul className="mt-4 space-y-2 text-[17px]">
            {["Fixed monthly cost", "Minimum two-year contract", "Price calculated from the unit and number of users", "Regular service and consumables included", "Subject to financial approval"].map((t) => <li key={t} className="flex gap-2"><IconCheck className="mt-0.5 shrink-0 text-hiq-blue" />{t}</li>)}
          </ul>
          <p className="mt-4 text-[15px]">Monthly fee: <Tbc>QUOTE</Tbc></p>
          <ButtonLink to="#request" variant="secondary" className="mt-6">Request a rental quote</ButtonLink>
        </section>
      </div>
      <section id="request" className="mt-14 max-w-3xl scroll-mt-24">
        <SectionTitle title="Request a rental quote" intro="Tell us about your space and HIQ will reply with a monthly price." />
        <RequestForm subject="Rental request" event="rental_request" submitLabel="Send rental request"
          success="HIQ will review your request and reply with a quote. Rental is subject to financial approval."
          fields={[
            { name: "name", label: "Name or company", required: true, autoComplete: "organization" },
            { name: "location", label: "Location (city)", required: true, autoComplete: "address-level2" },
            { name: "unit", label: "Unit of interest", type: "select", options: [...shopProducts.map((p) => p.model), "Not sure yet"], defaultValue: sp.get("unit") ?? "", required: true },
            { name: "users", label: "Number of users", type: "number", required: true },
            { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
          ]} />
      </section>
    </div>
  );
}
