import { Link } from "react-router-dom";
import { ButtonLink, SectionTitle } from "../components/ui";
import { PhotoFrame } from "../components/PhotoFrame";
import { PHOTOS } from "../data/images";
import { TdsScale } from "../components/TdsScale";
import { CostCalculator } from "../components/CostCalculator";
import { TestimonialCard } from "../components/TestimonialCard";
import { PartnerStrip, TrustBar } from "../components/TrustBar";
import { IconBottle, IconBuilding, IconCheck, IconDrop, IconFilter, IconHome, IconShield, IconTap, IconWrench, IconPhone, IconCalendar } from "../components/Icons";
import { useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { QUESTIONS } from "../lib/quiz";

const BENEFITS = [
  [IconBottle, "No plastic bottles"], [IconTap, "Plumbed into your sink"], [IconDrop, "Filtration matched to your water"],
  [IconShield, "Long-life systems"], [IconWrench, "Installed and serviced by HIQ"],
] as const;

const NEED_TILES = [
  ["/shop/need/home", "Home", "Family kitchens and whole-house options", IconHome],
  ["/shop/need/condo", "Condo", "Compact under-sink and countertop units", IconBuilding],
  ["/shop/need/office", "Office", "Bottleless hot & cold dispensers", IconBuilding],
  ["/shop/need/business", "Business", "F&B, hotels and commercial RO", IconBuilding],
  ["/filters", "Replacement filters", "Find the filters for your HIQ unit", IconFilter],
] as const;

// Tile photos are AI-generated design images (public/img/photos/tile-*); replace with real HIQ product photos.
const PRODUCT_TILES = [
  ["/shop/under-sink", "Under-sink", "Out of sight, with a dedicated faucet", "under-sink"],
  ["/shop/countertop", "Countertop", "Beside the sink, some need no power", "countertop"],
  ["/shop/dispensers", "Hot & cold dispensers", "Bottleless, plumbed in", "dispensers"],
  ["/shop/whole-house", "Whole house", "Filtered water at every tap", "whole-house"],
  ["/shop/replacement-filters", "Replacement filters", "Exact filters for your model", "replacement-filters"],
  ["/business", "Commercial", "Request a quote", "commercial"],
] as const;
const tilePhoto = (label: string, img: string) => ({
  label, alt: "", src: `/img/photos/tile-${img}-640.webp`, srcSet: `/img/photos/tile-${img}-320.webp 320w, /img/photos/tile-${img}-640.webp 640w`,
});

const LOOP = [
  ["Filtration", "Matched to your measured water"],
  ["Installation", "By HIQ's own service team"],
  ["Service", "Maintenance when it's due"],
  ["Replacement filters", "On time, for your exact model"],
  ["Support", "A team you can call"],
];

export default function Home() {
  useSeo({
    title: "HIQ Shop — Water filters for Philippine homes, condos and offices",
    description: "Under-sink, countertop and bottleless hot & cold water systems with professional installation, service and replacement filters from HIQ Philippines. Break the habit of plastic bottles.",
    path: "/",
  });
  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hiq-sky to-white">
        <div className="page grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <p className="font-display text-lg font-bold text-hiq-blue">Break the habit.</p>
            <h1 className="mt-3 text-[40px] sm:text-[56px] lg:text-[64px]">Clean, safe water straight from your sink.</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-700 sm:text-xl">No plastic bottles. No deliveries. Just filtered water whenever you need it.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/shop" variant="primary" className="h-12 px-7 text-base">Shop Water Filters</ButtonLink>
              <ButtonLink to="/find-my-system" variant="outline" className="h-12 px-7 text-base" onClick={() => track("quiz_start", { source: "hero" })}>Find My System</ButtonLink>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[15px] text-slate-700"><IconWrench size={18} className="text-hiq-blue" />Professional installation and service by HIQ.</p>
          </div>
          <div className="relative">
            <PhotoFrame slot={PHOTOS.hero} ratio="aspect-[4/3] lg:aspect-[5/4]" eager />
            <div className="relative -mt-14 ml-4 mr-4 rounded-2xl bg-white p-4 shadow-lift sm:absolute sm:-bottom-8 sm:-left-8 sm:mt-0 sm:w-[360px]">
              <p className="mb-2 text-sm font-semibold">Your water decides your filter</p>
              <TdsScale compact />
              <Link to="/guide/water-testing-tds" className="link mt-2 inline-block text-sm">How TDS works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Benefit strip */}
      <section aria-label="Why HIQ" className="border-y border-hiq-water bg-white">
        <ul className="page grid grid-cols-2 gap-x-4 gap-y-3 py-5 sm:grid-cols-3 lg:grid-cols-5">
          {BENEFITS.map(([Icon, t]) => <li key={t} className="flex items-center gap-2 text-[15px] font-semibold"><Icon className="shrink-0 text-hiq-blue" />{t}</li>)}
        </ul>
      </section>

      {/* 3. Shop by need */}
      <section className="page section">
        <SectionTitle title="Shop by need" intro="Start with where the water's going. We'll show what fits." />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {NEED_TILES.map(([to, t, d, Icon]) => (
            <li key={to}><Link to={to} className="flex h-full flex-col rounded-card bg-hiq-sky p-5 ring-1 ring-transparent transition hover:ring-hiq-blue">
              <Icon className="text-hiq-blue" /><span className="mt-4 font-display text-lg font-bold">{t}</span><span className="mt-1 text-[15px] text-slate-700">{d}</span>
            </Link></li>
          ))}
        </ul>
      </section>

      {/* 4. Shop by product */}
      <section className="bg-hiq-sky">
        <div className="page section">
          <SectionTitle title="Shop by product" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_TILES.map(([to, t, d, img]) => (
              <li key={to}><Link to={to} className="group flex items-center gap-4 rounded-card bg-white p-3 ring-1 ring-hiq-water hover:ring-hiq-blue">
                <div className="w-28 shrink-0"><PhotoFrame slot={tilePhoto(t, img)} ratio="aspect-square" sizes="112px" /></div>
                <div><span className="font-display text-lg font-bold group-hover:text-hiq-blue">{t}</span><span className="mt-1 block text-[15px] text-slate-700">{d}</span></div>
              </Link></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. More than a water filter */}
      <section className="page section">
        <SectionTitle title="More than a water filter" intro="HIQ looks after the whole cycle, so your water stays the way it was on installation day." />
        <ol className="relative grid gap-4 md:grid-cols-5">
          <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-1 rounded-full waterline md:block" />
          {LOOP.map(([t, d], i) => (
            <li key={t} className="relative flex gap-4 md:flex-col md:gap-3">
              <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white font-display text-lg font-bold text-hiq-blue ring-2 ring-hiq-blue">{i + 1}</span>
              <div><p className="font-display text-lg font-bold">{t}</p><p className="text-[15px] text-slate-700">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[15px] text-slate-600">…and back to step 4 on schedule. That's the loop.</p>
      </section>

      {/* 6. Find My System banner with first question inline */}
      <section className="page">
        <div className="rounded-2xl bg-hiq-navy p-6 text-white sm:p-10">
          <h2 className="text-[28px] text-white sm:text-[34px]">Which HIQ system is right for you?</h2>
          <p className="mt-2 text-lg text-white/85">Six quick questions. Start with the first one:</p>
          <p className="mt-6 font-semibold">{QUESTIONS[0].q}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUESTIONS[0].options.map(([v, l]) => (
              <Link key={v} to={`/find-my-system?where=${v}`} onClick={() => track("quiz_start", { source: "home_banner" })}
                className="flex min-h-[56px] items-center justify-center rounded-xl bg-white/10 px-4 text-center font-semibold ring-1 ring-white/20 hover:bg-white hover:text-hiq-navy">{l}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How it works */}
      <section className="page section">
        <SectionTitle title="How it works" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [IconPhone, "Tell us what you need", "Shop online, answer the quiz or call us."],
            [IconDrop, "Test your water", "Share a water report or book a test, so the filtration fits."],
            [IconWrench, "We deliver and install", "HIQ's service team plumbs it in and shows you how it works."],
            [IconCalendar, "Replace filters on schedule", "Order the exact filters for your unit when they're due."],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof IconPhone;
            return (
              <li key={t as string} className="rounded-card bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between"><I className="text-hiq-blue" /><span className="font-display text-sm font-bold text-slate-400">Step {i + 1}</span></div>
                <p className="mt-4 font-display text-lg font-bold">{t as string}</p><p className="mt-1 text-[15px] text-slate-700">{d as string}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 8. Break the habit */}
      <section className="bg-hiq-sky">
        <div className="page section grid items-center gap-10 lg:grid-cols-2">
          <PhotoFrame slot={PHOTOS.glassBottles} />
          <div>
            <h2 className="text-[28px] sm:text-[34px]">Break free from single-use plastic bottles.</h2>
            <p className="mt-4 text-lg text-slate-700">Redefining convenience without harming the planet: filtered water from your own tap, poured into glass you use again and again, with no deliveries to wait for.</p>
            <div className="mt-6"><TrustBar /></div>
            <ButtonLink to="/eco" variant="outline" className="mt-6">Why break the habit</ButtonLink>
          </div>
        </div>
      </section>

      {/* 9. Cost comparison */}
      <section className="page section">
        <SectionTitle title="Compare the cost of your water" intro="HIQ filtered water vs bottled water vs a refilling station. Change any number to match your home." />
        <CostCalculator />
      </section>

      {/* 10. Testimonials */}
      <section className="bg-hiq-sky">
        <div className="page section">
          <SectionTitle title="What customers say" />
          <div className="grid gap-4 md:grid-cols-3">
            <TestimonialCard quote="Customer quote about installation and service will go here." name="[Customer name]" place="[City]" />
            <TestimonialCard quote="Customer quote about no longer ordering bottled water will go here." name="[Customer name]" place="[City]" />
            <TestimonialCard quote="Customer quote from an office or business client will go here." name="[Customer name]" place="[Company]" />
          </div>
        </div>
      </section>

      {/* 11. Backed by professional experience */}
      <section className="page section">
        <SectionTitle title="Backed by professional experience" intro="Beyond homes, HIQ supplies water solutions to offices, commercial sites, hotels, industry and emergency response." />
        <ul className="mb-8 flex flex-wrap gap-2">
          {["Residential", "Office", "Commercial", "Hospitality", "Industrial"].map((s) => <li key={s} className="flex items-center gap-1.5 rounded-full bg-hiq-sky px-4 py-2 text-[15px] font-semibold"><IconCheck size={16} className="text-hiq-blue" />{s}</li>)}
        </ul>
        <PartnerStrip />
        <ButtonLink to="/business" variant="outline" className="mt-8">Water for offices and businesses</ButtonLink>
      </section>

      {/* 12. Final CTA */}
      <section className="page pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-hiq-blue px-6 py-12 text-center text-white sm:py-16">
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-2 waterline opacity-60" />
          <h2 className="text-[32px] text-white sm:text-[42px]">Ready to break the habit?</h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to="/shop" variant="primary" className="h-12 px-7 text-base">Shop Water Filters</ButtonLink>
            <ButtonLink to="/find-my-system" variant="outline" className="h-12 border-white px-7 text-base !text-white hover:bg-white/10">Find My System</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
