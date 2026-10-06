import { useSeo } from "../lib/seo";
import { BUSINESS } from "../config/site";
const COPY = {
  privacy: { title: "Privacy policy", body: "HIQ's privacy policy, compliant with the Data Privacy Act of 2012 (RA 10173), will be published here. [LEGAL COPY TBC]" },
  terms: { title: "Terms of sale", body: "Terms covering orders, delivery, installation, rental contracts and returns will be published here. [LEGAL COPY TBC]" },
  warranty: { title: "Warranty policy", body: "Warranty periods and claim procedures for each HIQ model will be published here. [WARRANTY TBC]" },
};
export default function Legal({ kind }: { kind: keyof typeof COPY }) {
  const c = COPY[kind];
  useSeo({ title: c.title, description: `${c.title} — ${BUSINESS.legalName}`, path: kind === "warranty" ? "/warranty-policy" : `/${kind}` });
  return <div className="page max-w-3xl py-12"><h1 className="text-[36px]">{c.title}</h1><p className="mt-4 text-lg"><span className="tbc">{c.body}</span></p><p className="mt-6 text-slate-700">Questions? Email <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p></div>;
}
