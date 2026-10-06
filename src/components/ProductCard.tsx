import { Link } from "react-router-dom";
import type { Product } from "../data/types";
import { productPhoto } from "../data/images";
import { PhotoFrame } from "./PhotoFrame";
import { Badge, Button, ButtonLink, FiltrationChip, PriceTag } from "./ui";
import { useCommerce } from "../commerce/CommerceContext";
import { useCompare } from "./CompareContext";
import { IconWrench } from "./Icons";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCommerce();
  const { items, toggle } = useCompare();
  const keySpec = p.highlights[0];
  const quote = p.channel === "quote";
  return (
    <article className="group flex flex-col rounded-card bg-white p-3 ring-1 ring-slate-200 transition-shadow hover:shadow-lift">
      <Link to={`/product/${p.slug}`} className="block" aria-label={`View ${p.model}`}>
        <PhotoFrame slot={productPhoto(p)} ratio="aspect-square" />
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-3">
        <div className="flex flex-wrap gap-1.5">{p.filtration.map((f) => <FiltrationChip key={f} f={f} />)}</div>
        <h3 className="mt-2 text-lg"><Link to={`/product/${p.slug}`} className="hover:text-hiq-blue">{p.model}</Link></h3>
        <p className="mt-1 text-[15px] text-slate-700">{keySpec}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {!quote && <Badge><IconWrench size={14} />Installation available</Badge>}
          {p.hotCold && <Badge tone="slate">Hot & cold</Badge>}
        </div>
        <div className="mt-auto pt-4">
          <PriceTag price={p.price} quote={quote} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quote ? (
              <ButtonLink to={`/business?interest=${p.slug}#quote`} variant="outline" className="col-span-2">Request a quote</ButtonLink>
            ) : (
              <>
                <ButtonLink to={`/product/${p.slug}`} variant="outline">View</ButtonLink>
                <Button variant="secondary" onClick={() => add(p.slug, 1, { configuration: p.configurations[0] })}>Add to cart</Button>
              </>
            )}
          </div>
          {!quote && (
            <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-5 w-5 accent-hiq-blue" checked={items.includes(p.slug)} onChange={() => toggle(p.slug)} />
              Compare
            </label>
          )}
        </div>
      </div>
    </article>
  );
}
