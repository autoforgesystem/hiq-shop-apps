import { Fragment, Suspense, useEffect } from "react";
import { useCatalogVersion } from "../data/catalogStore";
import { Outlet, useLocation } from "react-router-dom";
import { Header, TopBar } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { CompareTray } from "./CompareTray";
import { CookieConsent } from "./CookieConsent";
import { BUSINESS, SHOP_URL } from "../config/site";

const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SHOP_URL}/#org`, name: BUSINESS.legalName, alternateName: "HIQ Philippines", url: "https://hospitalityinnovations.com.ph/", email: BUSINESS.email, telephone: BUSINESS.phone, sameAs: Object.values(BUSINESS.social) },
    { "@type": "LocalBusiness", name: BUSINESS.legalName, telephone: BUSINESS.phone, email: BUSINESS.email, url: "https://hospitalityinnovations.com.ph/",
      address: { "@type": "PostalAddress", streetAddress: BUSINESS.street, addressLocality: BUSINESS.city, addressRegion: BUSINESS.province, postalCode: BUSINESS.postal, addressCountry: "PH" } },
  ],
};

export function Layout() {
  const { pathname } = useLocation();
  const catalogVersion = useCatalogVersion();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.text = JSON.stringify(orgLd);
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:shadow-lift">Skip to content</a>
      <TopBar />
      <Header />
      <main id="main" className="min-h-[60vh]">
        <Suspense fallback={<div className="page py-24 text-center text-slate-600" role="status">Loading…</div>}>
          {/* Remount the page when the admin changes the catalogue in another tab */}
          <Fragment key={catalogVersion}><Outlet /></Fragment>
        </Suspense>
      </main>
      <Footer />
      <CompareTray />
      <MobileBottomNav />
      <CookieConsent />
    </>
  );
}
