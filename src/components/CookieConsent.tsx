import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, loadTags, setConsent } from "../lib/analytics";
import { Button } from "./ui";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const c = getConsent(); if (c === null) setOpen(true); else loadTags(); }, []);
  if (!open) return null;
  const choose = (v: "granted" | "denied") => { setConsent(v); setOpen(false); };
  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-[84px] z-[60] mx-auto max-w-xl rounded-2xl bg-white p-4 shadow-lift ring-1 ring-slate-200 md:bottom-4">
      <p className="text-[15px]">We use cookies to measure how the shop is used and to improve it. Analytics and ad tags load only if you accept. <Link to="/privacy" className="link">Privacy policy</Link></p>
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" onClick={() => choose("granted")}>Accept</Button>
        <Button variant="outline" onClick={() => choose("denied")}>Decline</Button>
      </div>
    </div>
  );
}
