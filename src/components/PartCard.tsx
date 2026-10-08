import { Link } from "react-router-dom";
import type { SparePart } from "../data/types";
import { partPhoto } from "../data/images";
import { PART_UNIT_LABEL, partCategoryLabel, partSku } from "../data/catalog";
import { PhotoFrame } from "./PhotoFrame";
import { Button, PriceTag } from "./ui";
import { useCommerce } from "../commerce/CommerceContext";

/** The first two specs that are filled in, e.g. "Tube size: 1/4" · Connection: Push-fit". */
const keySpecs = (p: SparePart) => Object.entries(p.specs).filter(([, v]) => v).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" · ");

export function PartCard({ p }: { p: SparePart }) {
  const { add } = useCommerce();
  return (
    <article className="flex flex-col rounded-card bg-white p-3 ring-1 ring-slate-200 transition-shadow hover:shadow-lift">
      <Link to={`/parts/${p.slug}`} className="block" aria-label={`View ${p.name}`}>
        <PhotoFrame slot={partPhoto(p)} ratio="aspect-square" sizes="(min-width: 1024px) 25vw, 50vw" />
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="text-sm font-semibold text-hiq-blue">{partCategoryLabel(p.category)}</p>
        <h3 className="mt-1 text-[17px] leading-snug"><Link to={`/parts/${p.slug}`} className="hover:text-hiq-blue">{p.name}</Link></h3>
        {keySpecs(p) && <p className="mt-1 text-sm text-slate-600">{keySpecs(p)}</p>}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-x-1.5"><PriceTag price={p.price} />{p.price != null && <span className="text-sm text-slate-600">{PART_UNIT_LABEL[p.unit]}</span>}</div>
          {/* One button: cards are narrow (four across, two on phones), and the photo and name already open the part. */}
          <Button variant="secondary" full className="mt-3" onClick={() => add(partSku(p.slug), 1)}>Add to cart</Button>
        </div>
      </div>
    </article>
  );
}
