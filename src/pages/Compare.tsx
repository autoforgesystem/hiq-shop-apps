import { Link } from "react-router-dom";
import { useCompare } from "../components/CompareContext";
import { bySlugs } from "../data/catalog";
import { ButtonLink, EmptyState, FiltrationChip, PriceTag, Tbc } from "../components/ui";
import { useSeo } from "../lib/seo";
import type { Product } from "../data/types";

const ROWS: [string, (p: Product) => React.ReactNode][] = [
  ["Filtration options", (p) => <div className="flex flex-wrap gap-1">{p.filtration.map((f) => <FiltrationChip key={f} f={f} />)}</div>],
  ["Hot & cold", (p) => (p.hotCold ? "Yes" : "No")],
  ["Dimensions", (p) => p.specs["Dimensions (W × D × H)"] ?? <Tbc />],
  ["Capacity", (p) => p.specs["Capacity"] ?? (p.specs["Cold tank"] ? `Cold ${p.specs["Cold tank"]} / Hot ${p.specs["Hot tank"]}` : <Tbc />)],
  ["Installation type", (p) => p.install],
  ["TDS suitability", (p) => (p.tdsLimit ? `Inlet water below ${p.tdsLimit} ppm` : "Depends on configuration — confirmed by water test")],
  ["Price", (p) => <PriceTag price={p.price} />],
  ["Rental", () => <>Available on request · <Tbc>QUOTE</Tbc></>],
];

export default function Compare() {
  const { items, toggle } = useCompare();
  const list = bySlugs(items);
  useSeo({ title: "Compare water systems", description: "Compare up to three HIQ water systems side by side.", path: "/compare", noindex: true });
  if (!list.length) return <div className="page py-12"><h1 className="mb-6 text-[34px]">Compare</h1><EmptyState title="Nothing to compare yet" body="Tick “Compare” on up to three products in the shop to see them side by side." action={<ButtonLink to="/shop">Browse products</ButtonLink>} /></div>;
  return (
    <div className="page py-10">
      <h1 className="text-[34px]">Compare {list.length} product{list.length > 1 ? "s" : ""}</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
          <thead><tr><th className="w-44" scope="col"><span className="sr-only">Attribute</span></th>{list.map((p) => (
            <th key={p.slug} scope="col" className="p-3 align-top"><Link to={`/product/${p.slug}`} className="font-display text-lg font-bold hover:text-hiq-blue">{p.model}</Link>
              <button onClick={() => toggle(p.slug)} className="mt-1 block min-h-[44px] text-sm font-normal text-slate-600 underline">Remove</button></th>
          ))}</tr></thead>
          <tbody>{ROWS.map(([label, fn]) => (
            <tr key={label} className="border-t border-slate-200"><th scope="row" className="p-3 font-medium text-slate-600">{label}</th>{list.map((p) => <td key={p.slug} className="p-3 align-top">{fn(p)}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
