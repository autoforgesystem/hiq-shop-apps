import { Link } from "react-router-dom";
import { ButtonLink, MainSiteLink } from "../components/ui";
import { PhotoFrame } from "../components/PhotoFrame";
import { PHOTOS } from "../data/images";
import { BottleCalculator } from "../components/BottleCalculator";
import { TrustBar } from "../components/TrustBar";
import { useSeo } from "../lib/seo";

export default function Eco() {
  useSeo({ title: "Break the habit of single-use plastic", description: "How filtered tap water, reusable glass bottles and long-life systems help households and businesses rely less on disposable plastic bottles.", path: "/eco" });
  const blocks = [
    ["Why plastic bottles are a habit", "Buying bottled water becomes routine: the weekly order, the 5-gallon delivery, the case in the car. Filtered water at your own tap replaces the routine rather than asking you to remember a new one."],
    ["Reusable glass bottles", "Fill a glass bottle at the tap and use it again tomorrow. It's the same idea HIQ brings to hotels, where in-house bottling uses hotel-branded reusable glass."],
    ["Long-life systems, serviced locally", "HIQ systems are built to stay in place for years, with HIQ's own team handling installation, service and replacement filters."],
    ["Fewer deliveries", "No 5-gallon bottles to order, wait for or carry upstairs, and no delivery trips to arrange."],
  ];
  return (
    <>
      <section className="bg-hiq-sky">
        <div className="page grid items-center gap-10 py-12 lg:grid-cols-2">
          <div>
            <h1 className="text-[36px] sm:text-[52px]">Break the habit of single-use plastic.</h1>
            <p className="mt-4 text-lg text-slate-700">Better water solutions can make everyday hydration more convenient while reducing reliance on disposable plastic bottles.</p>
            <div className="mt-6"><TrustBar /></div>
          </div>
          <PhotoFrame slot={PHOTOS.glassBottles} />
        </div>
      </section>
      <section className="page section grid gap-x-12 gap-y-10 md:grid-cols-2">
        {blocks.map(([t, d]) => <div key={t}><h2 className="text-2xl">{t}</h2><p className="mt-3 text-[17px] text-slate-700">{d}</p></div>)}
      </section>
      <section className="page pb-12">
        <div className="rounded-2xl bg-hiq-navy p-6 text-white sm:p-8">
          <h2 className="text-2xl text-white">Champion of Change</h2>
          <p className="mt-2 max-w-2xl text-white/85">HIQ is an approved Champion of Change endorser with Break Free From Plastic.</p>
          <a href="https://championsofchange.breakfreefromplastic.org/endorsers/" className="mt-4 inline-block font-semibold text-hiq-water underline underline-offset-4">See the endorsers list</a>
        </div>
      </section>
      <section className="page pb-12">
        <h2 className="mb-2 text-2xl">My plastic bottles avoided</h2>
        <p className="mb-6 max-w-2xl text-slate-700">Enter your own numbers. We don't pre-fill this, because every household is different.</p>
        <BottleCalculator />
      </section>
      <section className="page grid gap-4 pb-6 md:grid-cols-3">
        <ButtonLink to="/shop" variant="primary">Shop Water Filters</ButtonLink>
        <ButtonLink to="/business" variant="outline">For offices and businesses</ButtonLink>
        <MainSiteLink to="sustainableSolutions" className="inline-flex min-h-[44px] items-center justify-center font-semibold text-hiq-blue" content="eco_page">Sustainable Solutions on HIQ main site</MainSiteLink>
      </section>
      <p className="page pb-8 text-[15px] text-slate-600">Hotels: see <MainSiteLink to="hotelBottling" className="link" content="eco_page">hotel bottling with reusable glass</MainSiteLink>. Learn more in the <Link to="/guide" className="link">Water Quality Guide</Link>.</p>
    </>
  );
}
