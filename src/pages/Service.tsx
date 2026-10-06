import { Link } from "react-router-dom";
import { ButtonLink, SectionTitle } from "../components/ui";
import { PhotoFrame } from "../components/PhotoFrame";
import { PHOTOS } from "../data/images";
import { IconCalendar, IconDrop, IconFilter, IconPhone, IconShield, IconWrench } from "../components/Icons";
import { TdsScale } from "../components/TdsScale";
import { useSeo } from "../lib/seo";
import { BUSINESS } from "../config/site";

export const SERVICES = [
  { id: "installation", label: "Installation", desc: "HIQ installs all purchased and rented direct-plumbed, bottleless systems.", Icon: IconWrench },
  { id: "water-test", label: "Water test / site assessment", desc: "We test your water or review your report so the filtration fits.", Icon: IconDrop },
  { id: "maintenance", label: "Maintenance", desc: "A scheduled check-up for your unit.", Icon: IconCalendar },
  { id: "filter-replacement", label: "Filter replacement", desc: "We bring the right filters and fit them for you.", Icon: IconFilter },
  { id: "warranty", label: "Warranty claim", desc: "Report a fault on a unit under warranty.", Icon: IconShield },
  { id: "troubleshooting", label: "Troubleshooting", desc: "Something's not right? Tell us what's happening.", Icon: IconPhone },
  { id: "general", label: "General service request", desc: "Anything else about your HIQ unit.", Icon: IconWrench },
];

export default function Service() {
  useSeo({ title: "Water filter installation and service in the Philippines", description: "Book HIQ installation, water testing, maintenance, filter replacement and warranty service for your water system.", path: "/service" });
  return (
    <>
      <section className="bg-hiq-sky">
        <div className="page grid items-center gap-10 py-12 lg:grid-cols-2">
          <div>
            <h1 className="text-[36px] sm:text-[48px]">Installation & service</h1>
            <p className="mt-4 text-lg text-slate-700">HIQ's own service department installs every direct-plumbed, bottleless system it sells or rents, and looks after it afterwards.</p>
            <div className="mt-6 flex flex-wrap gap-3"><ButtonLink to="/service/book">Book a service</ButtonLink><ButtonLink to="/service/book?service=water-test" variant="outline">Book a water test</ButtonLink></div>
            <p className="mt-4 text-[15px] text-slate-600">Installation fee and service areas: <span className="tbc">[TBC]</span></p>
          </div>
          <PhotoFrame slot={PHOTOS.technician} />
        </div>
      </section>
      <section className="page section">
        <SectionTitle title="What we can help with" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ id, label, desc, Icon }) => (
            <li key={id}><Link to={`/service/book?service=${id}`} className="flex h-full gap-4 rounded-card p-5 ring-1 ring-slate-200 hover:ring-hiq-blue">
              <Icon className="shrink-0 text-hiq-blue" /><span><span className="block font-display text-lg font-bold">{label}</span><span className="text-[15px] text-slate-700">{desc}</span></span>
            </Link></li>
          ))}
        </ul>
      </section>
      <section className="page grid gap-10 pb-8 lg:grid-cols-2">
        <div><h2 className="text-2xl">We check your water first</h2>
          <p className="mt-3 text-[17px] text-slate-700">Before installation, HIQ requests a water-quality report or conducts a site visit to test your water. The reading decides between UF, Nano and RO.</p>
          <div className="mt-6"><TdsScale /></div>
        </div>
        <div className="rounded-card bg-hiq-navy p-6 text-white"><h2 className="text-2xl text-white">Prefer to talk?</h2>
          <p className="mt-2 text-white/85">Call or email the HIQ team, {BUSINESS.hours}.</p>
          <p className="mt-4 text-xl font-semibold"><a href={BUSINESS.phoneHref} className="hover:underline">{BUSINESS.phone}</a></p>
          <p className="mt-1"><a href={`mailto:${BUSINESS.email}`} className="underline underline-offset-4">{BUSINESS.email}</a></p>
          <Link to="/filters" className="mt-6 inline-block font-semibold text-hiq-water underline underline-offset-4">Order replacement filters yourself</Link>
        </div>
      </section>
    </>
  );
}
