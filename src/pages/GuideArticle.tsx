import { Link, useParams } from "react-router-dom";
import { getArticle } from "../data/guide";
import { bySlugs } from "../data/catalog";
import { Breadcrumbs, ButtonLink, EmptyState } from "../components/ui";
import { TdsScale } from "../components/TdsScale";
import { ProductCard } from "../components/ProductCard";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { SHOP_URL } from "../config/site";
import { IconDrop } from "../components/Icons";

export default function GuideArticle() {
  const { topic = "" } = useParams();
  const a = getArticle(topic);
  useSeo({
    title: a?.title ?? "Guide article", description: a?.description ?? "", path: `/guide/${topic}`, noindex: !a?.published,
    jsonLd: a ? [{ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description, url: `${SHOP_URL}/guide/${a.slug}`, publisher: { "@type": "Organization", name: "Hospitality Innovations by Quorate Inc." } },
      breadcrumbLd([{ name: "Guide", path: "/guide" }, { name: a.title, path: `/guide/${a.slug}` }])] : undefined,
  });
  if (!a || !a.published) return <div className="page py-16"><EmptyState title={a ? "This article is coming soon" : "Article not found"} body="Browse the published guides in the meantime." action={<ButtonLink to="/guide">Water Quality Guide</ButtonLink>} /></div>;
  return (
    <article className="page py-10">
      <Breadcrumbs items={[{ label: "Guide", to: "/guide" }, { label: a.title }]} />
      <header className="mt-6 max-w-3xl"><p className="text-sm font-semibold text-hiq-blue">{a.group}</p><h1 className="mt-2 text-[34px] sm:text-[46px]">{a.title}</h1><p className="mt-4 text-xl text-slate-700">{a.description}</p></header>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="prose-hiq">
          {a.body.map((b, i) => "h2" in b ? <h2 key={i}>{b.h2}</h2> : "p" in b ? <p key={i}>{b.p}</p> : "ul" in b ? <ul key={i}>{b.ul.map((x) => <li key={x}>{x}</li>)}</ul> : <div key={i} className="my-6 max-w-[68ch] rounded-card bg-hiq-sky p-5"><TdsScale /></div>)}
          {a.location && <div className="mt-8 flex max-w-[68ch] gap-3 rounded-card bg-hiq-navy p-5 text-white"><IconDrop className="mt-1 shrink-0 text-hiq-water" /><div><p className="font-semibold">Supply quality varies by building and source. Test your water before choosing a system.</p><Link to="/service/book?service=water-test" className="mt-2 inline-block font-semibold text-hiq-water underline underline-offset-4">Book a Water Test</Link></div></div>}
        </div>
        <aside className="space-y-4">
          <div className="rounded-card bg-hiq-sky p-5"><h2 className="text-lg">Find your match</h2><p className="mt-1 text-[15px] text-slate-700">Six questions about your space and your water.</p><ButtonLink to="/find-my-system" className="mt-3">Find My System</ButtonLink></div>
          <div className="rounded-card p-5 ring-1 ring-slate-200"><h2 className="text-lg">Installation & testing</h2><p className="mt-1 text-[15px] text-slate-700">HIQ tests your water before installing.</p><Link to="/service" className="link mt-2 inline-block">Installation & service</Link></div>
        </aside>
      </div>
      {a.related.length > 0 && <section className="mt-14"><h2 className="mb-5 text-2xl">Systems mentioned</h2><ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{bySlugs(a.related).map((p) => <li key={p.slug}><ProductCard p={p} /></li>)}</ul></section>}
    </article>
  );
}
