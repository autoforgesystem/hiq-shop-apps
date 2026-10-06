import { useSearchParams } from "react-router-dom";
import { ButtonLink, MainSiteLink, SectionTitle } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { RequestForm } from "../components/RequestForm";
import { bySlugs, getProduct } from "../data/catalog";
import { PhotoFrame } from "../components/PhotoFrame";
import { PHOTOS } from "../data/images";
import { BUSINESS } from "../config/site";
import { useSeo } from "../lib/seo";
import { Link } from "react-router-dom";

const SEGMENTS = ["Offices", "Restaurants", "Hotels", "Developers & architects", "Interior designers", "Property managers", "Commercial & industrial"];

export default function Business() {
  const [sp] = useSearchParams();
  const interest = getProduct(sp.get("interest") ?? "");
  useSeo({ title: "Commercial water filtration for offices and businesses", description: "Office dispensers, F&B filtration and commercial RO from HIQ Philippines. Request a quote or talk to a water specialist.", path: "/business" });
  return (
    <>
      <section className="bg-hiq-sky">
        <div className="page grid items-center gap-10 py-12 lg:grid-cols-2">
          <div>
            <h1 className="text-[36px] sm:text-[48px]">Water solutions for homes and businesses.</h1>
            <p className="mt-4 text-lg text-slate-700">From office pantries to restaurant lines and commercial RO plants, HIQ specifies, installs and services the system.</p>
            <div className="mt-6 flex flex-wrap gap-3"><ButtonLink to="#quote" variant="primary">Request a Quote</ButtonLink><a href={BUSINESS.phoneHref} className="inline-flex min-h-[44px] items-center rounded-full border-2 border-hiq-blue px-5 font-semibold text-hiq-blue hover:bg-white">Talk to a Water Specialist</a></div>
          </div>
          <PhotoFrame slot={PHOTOS.office} />
        </div>
      </section>
      <section className="page section">
        <ul className="flex flex-wrap gap-2">{SEGMENTS.map((s) => <li key={s} className="rounded-full bg-white px-4 py-2 text-[15px] font-semibold ring-1 ring-hiq-water">{s}</li>)}</ul>
      </section>
      <section className="page pb-12">
        <SectionTitle title="Buy or rent online" intro="Office dispensers and HQ9 filtration for F&B are available through the shop." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{bySlugs(["hw-110", "hwj-l110", "infinite-l20", "w2-170p"]).map((p) => <li key={p.slug}><ProductCard p={p} /></li>)}</ul>
        <p className="mt-4"><Link to="/product/hq9-high-flow" className="link">HQ9 High Flow Filters for cafés and restaurants</Link></p>
      </section>
      <section className="bg-hiq-sky">
        <div className="page section">
          <SectionTitle title="Quote-only systems" />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{bySlugs(["hcro-300g", "hcro-400-600-900g", "hiro-hinro", "emro-hpro"]).map((p) => (
            <li key={p.slug} className="flex flex-col rounded-card bg-white p-5 ring-1 ring-hiq-water">
              <h3 className="text-lg">{p.model}</h3><p className="mt-1 text-[15px] text-slate-700">{p.summary}</p>
              <ul className="mt-3 space-y-0.5 text-sm text-slate-600">{p.highlights.map((h) => <li key={h}>· {h}</li>)}</ul>
              <ButtonLink to={`/business?interest=${p.slug}#quote`} variant="outline" className="mt-auto self-start">Request a quote</ButtonLink>
            </li>))}</ul>
        </div>
      </section>
      <section className="page section">
        <SectionTitle title="More from HIQ Philippines" intro="These solutions are covered on the HIQ main site." />
        <ul className="grid gap-4 md:grid-cols-3">
          {([["hotelBottling", "Hotel Bottling ↗", "Exclusive distributor of Ecopure Waters International: in-house bottling with hotel-branded reusable glass bottles."],
            ["bottleWashers", "Bottle Washers ↗", "Aquatech BM bottle washers, and Winterhalter ware washers."],
            ["sustainableSolutions", "Sustainable Solutions ↗", "HIQ's wider sustainable solutions."]] as const).map(([k, t, d]) => (
            <li key={k} className="rounded-card p-5 ring-1 ring-slate-200"><MainSiteLink to={k} className="font-display text-lg font-bold text-hiq-blue hover:underline" content="business_page">{t.replace(" ↗", "")}</MainSiteLink><p className="mt-1 text-[15px] text-slate-700">{d}</p><p className="mt-2 text-sm text-slate-500">On HIQ main site</p></li>
          ))}
        </ul>
        <p className="mt-6 text-[15px]">Cutting plastic at work too? <Link to="/eco" className="link">Break the habit</Link></p>
      </section>
      <section id="quote" className="page max-w-3xl scroll-mt-24 pb-8">
        <SectionTitle title="Request a quote" intro="Tell us about your site. Quotes go to the HIQ sales team." />
        <RequestForm subject="Quote request" event="request_quote" submitLabel="Request a Quote"
          success={`HIQ's sales team will reply from ${BUSINESS.email}.`}
          fields={[
            { name: "segment", label: "Segment", type: "select", options: SEGMENTS, required: true },
            { name: "property", label: "Property type", required: true },
            { name: "location", label: "Location", required: true },
            { name: "users", label: "Number of users or rooms", type: "number", required: true },
            { name: "solution", label: "Solution of interest", type: "select", options: ["Office dispensers", "HQ9 / F&B filtration", "Commercial RO", "Industrial RO", "Emergency water", "Hotel bottling", "Bottle washers", "Not sure"], defaultValue: interest ? (interest.category === "commercial" ? "Commercial RO" : interest.category === "industrial" ? "Industrial RO" : interest.category === "emergency" ? "Emergency water" : "") : "" },
            { name: "timeline", label: "Timeline", type: "select", options: ["As soon as possible", "1–3 months", "3–6 months", "Just researching"] },
            { name: "name", label: "Contact name", required: true, autoComplete: "name" },
            { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
            { name: "notes", label: "Details", type: "textarea", defaultValue: interest ? `Interested in: ${interest.model}` : "" },
          ]} />
      </section>
    </>
  );
}
