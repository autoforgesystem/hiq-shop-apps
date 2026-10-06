import { IconChevronDown } from "./Icons";
export interface Faq { q: string; a: string }
export function FAQAccordion({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-card ring-1 ring-slate-200">
      {items.map((f) => (
        <details key={f.q} className="group px-4">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}<IconChevronDown className="shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-4 text-slate-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
export const faqLd = (items: Faq[]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
