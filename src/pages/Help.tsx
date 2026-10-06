import { FAQAccordion, faqLd } from "../components/FAQAccordion";
import { FAQ } from "../data/faq";
import { RequestForm } from "../components/RequestForm";
import { BUSINESS } from "../config/site";
import { useSeo } from "../lib/seo";
import { Tbc } from "../components/ui";

export default function Help() {
  const all = Object.values(FAQ).flat();
  useSeo({ title: "Help, FAQ and contact", description: "Answers about installation, water testing, rental, filters, delivery and warranty — or contact HIQ Philippines.", path: "/help", jsonLd: faqLd(all) });
  return (
    <div className="page py-10">
      <h1 className="text-[36px] sm:text-[48px]">Help & contact</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          {Object.entries(FAQ).map(([g, items]) => <section key={g}><h2 className="mb-3 text-xl">{g}</h2><FAQAccordion items={items} /></section>)}
        </div>
        <div className="space-y-8">
          <section className="rounded-card bg-hiq-sky p-5">
            <h2 className="text-xl">Talk to HIQ</h2>
            <p className="mt-2"><a href={BUSINESS.phoneHref} className="text-lg font-semibold text-hiq-blue">{BUSINESS.phone}</a></p>
            <p><a href={`mailto:${BUSINESS.email}`} className="link">{BUSINESS.email}</a></p>
            <p className="mt-2 text-[15px]">{BUSINESS.hours} <Tbc>CONFIRM DAYS</Tbc></p>
            <address className="mt-2 text-[15px] not-italic text-slate-700">{BUSINESS.addressLine}</address>
          </section>
          <section aria-label="Map of the HIQ office in Biñan" className="overflow-hidden rounded-card ring-1 ring-slate-200">
            <iframe title="Map of the HIQ office in Biñan, Laguna" loading="lazy" className="h-64 w-full" referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.addressLine)}&output=embed`} />
          </section>
          <section id="contact"><h2 className="mb-4 text-xl">Send us a message</h2>
            <RequestForm subject="Website enquiry" event="request_quote" submitLabel="Send message" success="Thanks — HIQ will reply by email or phone."
              fields={[{ name: "name", label: "Name", required: true, autoComplete: "name" }, { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" }, { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" }, { name: "msg", label: "Message", type: "textarea", required: true }]} />
          </section>
        </div>
      </div>
    </div>
  );
}
