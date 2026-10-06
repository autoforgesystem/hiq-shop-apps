import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QUESTIONS, answersToQuery, isComplete, queryToAnswers, recommend, type Answers } from "../lib/quiz";
import { Button, ButtonLink, FiltrationChip, PriceTag } from "../components/ui";
import { PhotoFrame } from "../components/PhotoFrame";
import { productPhoto } from "../data/images";
import { TdsScale } from "../components/TdsScale";
import { IconBack, IconCheck, IconDrop } from "../components/Icons";
import { useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { cx } from "../lib/format";
import type { Product } from "../data/types";
import { useToast } from "../components/Toast";

function ResultCard({ p, why, filtration, primary }: { p: Product; why: string[]; filtration?: string | null; primary?: boolean }) {
  return (
    <article className={cx("grid gap-5 rounded-2xl bg-white p-5 ring-1 sm:grid-cols-[200px_1fr]", primary ? "ring-2 ring-hiq-blue" : "ring-slate-200")}>
      <PhotoFrame slot={productPhoto(p)} ratio="aspect-square" />
      <div>
        {primary && <p className="text-sm font-semibold text-hiq-blue">Recommended system</p>}
        <h3 className="mt-1 text-2xl">{p.model}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">{(filtration ? [filtration] : p.filtration).map((f) => <FiltrationChip key={f} f={f} />)}</div>
        <ul className="mt-3 space-y-1 text-[15px]">{why.map((w) => <li key={w} className="flex gap-2"><IconCheck size={18} className="mt-0.5 shrink-0 text-hiq-blue" />{w}</li>)}</ul>
        <p className="mt-3 text-[15px] text-slate-700">{p.highlights.slice(0, 2).join(" · ")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3"><PriceTag price={p.price} quote={p.channel === "quote"} /><span className="text-sm text-slate-600">Installation by HIQ · Buy or rent</span></div>
        <ButtonLink to={`/product/${p.slug}`} variant={primary ? "secondary" : "outline"} className="mt-4">View {primary ? "Recommended System" : p.model}</ButtonLink>
      </div>
    </article>
  );
}

export default function FindMySystem() {
  const [sp, setSp] = useSearchParams();
  const initial = useMemo(() => queryToAnswers(sp), []);
  const [a, setA] = useState<Answers>(initial);
  const firstOpen = QUESTIONS.findIndex((q) => !(a as Record<string, unknown>)[q.key]);
  const [step, setStep] = useState(firstOpen === -1 ? QUESTIONS.length : firstOpen);
  const done = step >= QUESTIONS.length && isComplete(a);
  const toast = useToast();
  useSeo({ title: "Find My System — which HIQ water system is right for you?", description: "Answer six quick questions about your space, your household and your water to find HIQ systems that fit.", path: "/find-my-system" });
  useEffect(() => { track("quiz_start", { prefilled: Object.keys(initial).length }); }, []);
  useEffect(() => { if (done) { setSp(answersToQuery(a), { replace: true }); track("quiz_complete", { ...a }); } }, [done]);

  const choose = (key: string, v: string) => {
    const next = { ...a, [key]: v };
    setA(next);
    setTimeout(() => setStep((s) => s + 1), 120);
  };

  if (done) {
    const r = recommend(a);
    const share = async () => {
      const url = window.location.href;
      try { if (navigator.share) await navigator.share({ title: "My HIQ system match", url }); else { await navigator.clipboard.writeText(url); toast.show("Link copied — share it with your family or building admin."); } } catch { /* cancelled */ }
    };
    return (
      <div className="page max-w-4xl py-10">
        <p className="text-sm font-semibold text-hiq-blue">Your results</p>
        <h1 className="mt-1 text-[32px] sm:text-[42px]">
          {r.mode === "quote" ? "Let's size a system for your business" : r.mode === "likely" ? "Your likely options" : "Your recommended HIQ system"}
        </h1>
        <div className="mt-6 rounded-card bg-hiq-sky p-5"><TdsScale highlight={r.filtration} /></div>

        {r.mode === "likely" && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-hiq-navy p-6 text-white sm:flex-row sm:items-center">
            <IconDrop size={32} className="shrink-0 text-hiq-water" />
            <div className="flex-1"><p className="text-lg font-semibold">Book a water test first</p><p className="text-white/85">Without a TDS reading we can't pick one system for you. Below is one likely option per filtration type. A test confirms which one fits.</p></div>
            <ButtonLink to="/service/book?service=water-test" variant="secondary" className="bg-white !text-hiq-navy hover:bg-hiq-sky" onClick={() => track("book_water_test", { source: "quiz" })}>Book a Water Test</ButtonLink>
          </div>
        )}
        {r.mode === "quote" && (
          <div className="mt-6 rounded-2xl bg-hiq-navy p-6 text-white">
            <p className="text-lg">{r.reasons[0]}</p>
            <div className="mt-4 flex flex-wrap gap-2"><ButtonLink to="/business#quote" variant="primary">Request a Quote</ButtonLink><a href="tel:+639176287242" className="inline-flex min-h-[44px] items-center rounded-full px-5 font-semibold ring-2 ring-white">Talk to a Water Specialist</a></div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {r.mode === "recommend" && r.primary && <ResultCard p={r.primary} why={r.reasons} filtration={r.filtration} primary />}
          {r.mode === "likely" && r.likely?.map((l) => <div key={l.filtration}><p className="mb-2 font-semibold">If your water suits {l.filtration}</p><ResultCard p={l.product} why={r.reasons} filtration={l.filtration} /></div>)}
          {r.alternatives.length > 0 && <><h2 className="pt-4 text-xl">{r.mode === "quote" ? "You can also buy online" : "Also worth a look"}</h2>{r.alternatives.map((p) => <ResultCard key={p.slug} p={p} why={[]} />)}</>}
        </div>
        {r.caveats.length > 0 && <ul className="mt-6 space-y-1 text-[15px] text-slate-700">{r.caveats.map((c) => <li key={c}>• {c}</li>)}</ul>}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" onClick={share}>Share my results</Button>
          <Button variant="ghost" onClick={() => { setA({}); setStep(0); setSp({}); }}>Start again</Button>
          {r.mode === "recommend" && <ButtonLink to="/service/book?service=water-test" variant="ghost">Book a water test</ButtonLink>}
        </div>
      </div>
    );
  }

  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const cur = (a as Record<string, string | undefined>)[q.key];
  return (
    <div className="page max-w-2xl py-10">
      <h1 className="text-[28px] sm:text-[34px]">Find My System</h1>
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-slate-600"><span>Question {step + 1} of {QUESTIONS.length}</span></div>
        <div className="mt-2 h-2 rounded-full bg-hiq-water" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-label="Quiz progress">
          <div className="h-2 rounded-full bg-hiq-blue transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>
      <fieldset className="mt-8" key={q.key}>
        <legend className="font-display text-2xl font-bold">{q.q}</legend>
        {"hint" in q && q.hint && <p className="mt-2 text-[15px] text-slate-600">{q.hint}</p>}
        <div className="mt-5 grid gap-3" role="radiogroup">
          {q.options.map(([v, l]) => (
            <button key={v} role="radio" aria-checked={cur === v} onClick={() => choose(q.key, v)}
              className={cx("flex min-h-[56px] items-center justify-between rounded-xl px-5 text-left text-[17px] font-semibold ring-1 transition", cur === v ? "bg-hiq-navy text-white ring-hiq-navy" : "bg-hiq-sky ring-hiq-water hover:ring-hiq-blue")}>
              {l}{cur === v && <IconCheck />}
            </button>
          ))}
        </div>
      </fieldset>
      {q.key === "tds" && <p className="mt-4 text-[15px]"><Link to="/guide/water-testing-tds" className="link">What's TDS?</Link></p>}
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><IconBack size={18} />Back</Button>
        {cur && <Button variant="outline" onClick={() => setStep((s) => s + 1)}>Next</Button>}
      </div>
    </div>
  );
}
