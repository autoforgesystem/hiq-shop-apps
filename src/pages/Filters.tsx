import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { filtersFor, getProduct, shopProducts } from "../data/catalog";
import { productPhoto } from "../data/images";
import { PhotoFrame } from "../components/PhotoFrame";
import { Button, Input, PriceTag, Tbc } from "../components/ui";
import { useCommerce } from "../commerce/CommerceContext";
import { useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { cx } from "../lib/format";
import { RequestForm } from "../components/RequestForm";

export default function Filters() {
  const [sp, setSp] = useSearchParams();
  const model = sp.get("model");
  const [q, setQ] = useState("");
  const [photoForm, setPhotoForm] = useState(false);
  const { add } = useCommerce();
  const p = model ? getProduct(model) : undefined;
  const units = useMemo(() => shopProducts.filter((x) => filtersFor(x.slug).length && x.model.toLowerCase().includes(q.toLowerCase())), [q]);
  useSeo({ title: p ? `Replacement filters for ${p.model}` : "Find filters for my HIQ unit", description: "Find the exact replacement filters for your HIQ water system, by model and stage.", path: p ? `/filters?model=${p.slug}` : "/filters" });
  const list = p ? filtersFor(p.slug) : [];

  return (
    <div className="page py-10">
      <h1 className="text-[34px] sm:text-[44px]">Find filters for my HIQ unit</h1>
      <ol className="mt-6 flex gap-6 text-[15px]">
        <li className={cx("font-semibold", !p ? "text-hiq-blue" : "text-slate-600")}>1. Select your model</li>
        <li className={cx("font-semibold", p ? "text-hiq-blue" : "text-slate-600")}>2. Choose your filters</li>
      </ol>

      {!p ? (
        <>
          <label htmlFor="unit-q" className="mt-6 block font-semibold">Search your model</label>
          <Input id="unit-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. W2-170P" className="mt-2 max-w-md" />
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {units.map((u) => (
              <li key={u.slug}><button onClick={() => setSp({ model: u.slug })} className="block w-full rounded-card bg-white p-3 text-left ring-1 ring-slate-200 hover:ring-hiq-blue">
                <PhotoFrame slot={productPhoto(u)} ratio="aspect-square" /><span className="mt-2 block font-semibold">{u.model}</span><span className="text-sm text-slate-600">{u.install}</span>
              </button></li>
            ))}
          </ul>
          <div className="mt-10 rounded-card bg-hiq-sky p-5">
            <p className="font-semibold">Not sure of your model?</p>
            <p className="mt-1 text-[15px] text-slate-700">Send us a photo of your unit and its label, and we'll tell you which filters it takes.</p>
            {!photoForm ? <Button variant="outline" className="mt-3" onClick={() => setPhotoForm(true)}>Send us a photo</Button> : (
              <div className="mt-4"><RequestForm subject="Filter help — identify my unit" event="filter_replacement" submitLabel="Send request"
                success="HIQ will reply with your model and the filters it takes. Attach your photo to the email reply, or send it to sales@hospitalityinnovations.com.ph."
                fields={[{ name: "name", label: "Name", required: true, autoComplete: "name" }, { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" }, { name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "notes", label: "Where is the unit and what does it look like?", type: "textarea" }]}
                footer="Photo upload needs a backend [TBC]. For now, HIQ will ask you to reply with the photo." /></div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-card bg-hiq-sky p-4">
            <div className="w-20"><PhotoFrame slot={productPhoto(p)} ratio="aspect-square" /></div>
            <div className="flex-1"><p className="text-sm text-slate-600">Showing filters for</p><p className="font-display text-xl font-bold">{p.model}</p></div>
            <Button variant="ghost" onClick={() => setSp({})}>Change model</Button>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {list.map((f) => (
              <li key={f.id} className="flex flex-col rounded-card p-5 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-hiq-blue">{f.stage}</p>
                <h2 className="mt-1 text-lg">{f.name}</h2>
                <p className="mt-1 text-sm text-slate-600">SKU {f.sku}</p>
                <p className="mt-2 text-[15px]">Replace every <Tbc /> months</p>
                {f.note && <p className="mt-1 text-sm text-warning">{f.note}</p>}
                <div className="mt-auto pt-4"><PriceTag price={f.price} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => { add(f.id, 1, { model: p.model }); track("filter_replacement", { model: p.slug, stage: f.stage }); }}>Replace Filter</Button>
                    <Button variant="outline" disabled title="Subscription offer to be confirmed">Subscribe & Save <span className="tbc ml-1">[CONFIRM]</span></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] text-slate-700">Want HIQ to replace them for you? <Link to={`/service/book?service=filter-replacement&unit=${p.slug}`} className="link">Book a filter replacement visit</Link></p>
        </>
      )}
    </div>
  );
}
