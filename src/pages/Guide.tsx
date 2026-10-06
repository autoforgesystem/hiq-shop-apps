import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ARTICLES, type Article } from "../data/guide";
import { Input } from "../components/ui";
import { TdsScale } from "../components/TdsScale";
import { useSeo } from "../lib/seo";

const GROUPS: Article["group"][] = ["Technology", "Testing & choosing", "Your space", "Your area"];

export default function Guide() {
  const [q, setQ] = useState("");
  useSeo({ title: "Water Quality Guide", description: "Plain-language guides to UF, Nano and RO filtration, water testing and TDS, and choosing a water system in the Philippines.", path: "/guide" });
  const list = useMemo(() => ARTICLES.filter((a) => (a.title + a.description).toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="page py-10">
      <h1 className="text-[36px] sm:text-[48px]">Water Quality Guide</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-700">Plain answers about filtration, testing and choosing a system — without the jargon.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <label htmlFor="gq" className="sr-only">Search the guide</label>
          <Input id="gq" type="search" placeholder="Search the guide" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
          {GROUPS.map((g) => {
            const items = list.filter((a) => a.group === g);
            if (!items.length) return null;
            return (
              <section key={g} className="mt-10">
                <h2 className="mb-4 text-xl">{g}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">{items.map((a) => (
                  <li key={a.slug}>{a.published ? (
                    <Link to={`/guide/${a.slug}`} className="block h-full rounded-card bg-white p-5 ring-1 ring-slate-200 hover:ring-hiq-blue"><span className="font-display text-lg font-bold">{a.title}</span><span className="mt-1 block text-[15px] text-slate-700">{a.description}</span></Link>
                  ) : (
                    <div className="h-full rounded-card bg-slate-50 p-5 ring-1 ring-slate-200" aria-disabled><span className="font-display text-lg font-bold text-slate-500">{a.title}</span><span className="mt-1 block text-[15px] text-slate-500">Coming soon</span></div>
                  )}</li>
                ))}</ul>
              </section>
            );
          })}
        </div>
        <aside className="h-fit rounded-card bg-hiq-sky p-5 lg:sticky lg:top-24"><h2 className="mb-3 text-lg">HIQ's TDS guideline</h2><TdsScale /></aside>
      </div>
    </div>
  );
}
