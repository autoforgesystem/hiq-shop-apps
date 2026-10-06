# Assumptions made in this build

1. **Built all six phases' UI in one pass**, as requested. Backend features (accounts, bookings persistence, reminders) use mock data or email forms, per Section 7.
2. **MockAdapter is the default** commerce adapter because no GoDaddy `storeUrl`s exist yet. Switch with `VITE_COMMERCE_ADAPTER=godaddy` once they do (Section 7 asks for GoDaddyLinkAdapter as default — it ships ready).
3. **Forms**: with `VITE_FORM_ENDPOINT` set (e.g. Formspree routed to sales@hospitalityinnovations.com.ph) forms post JSON; without it they open the visitor's email app pre-filled. Photo upload for "identify my unit" needs a backend.
4. **Quiz rules**: "Business + 7+ people" and "Business + whole-house" route to quote. Countertop + RO water shows the under-sink RO with an explanation, since no countertop model offers RO. Dispensers are ordered office-first for office/business answers. When TDS is unknown, one *different* product per filtration type is shown and Book a Water Test is the primary CTA.
5. **Rental** is offered on every purchasable model as a request (verified terms only). HIQ to confirm which models are rentable.
6. **Filter stages**: only stages verified in the brief are itemised (VP-CU-200 has 4–5 filters; HQ9 cartridge types; EGHW-200 Multi UF / Eco Mac / Bio Alkaline). Every other model has one "Stage [TBC]" entry.
7. **HQ9 High Flow Filters** are purchasable online (F&B), per "HQ9 filtration for F&B — link to their product pages". HCRO/HIRO/HINRO/EMRO/HPRO are quote-only.
8. **Photography**: Higgsfield image generation needs a paid Higgsfield plan, so every photo is a labelled frame. Slots live in `src/data/images.ts`; drop in WebP/AVIF files and set `src`/`srcSet`.
9. **SEO pre-rendering is not yet in place.** Titles, descriptions, canonicals and JSON-LD are set per page client-side. Phase 6 should add SSG — e.g. `vite-react-ssg` or a Playwright pre-render of the routes — before launch (Section 11 notes a SPA alone is not enough).
10. **Fonts** are self-hosted via Fontsource (`font-display: swap`). Subsetting to Latin only can trim further.
11. **Hosting**: static build; `public/_redirects` (Netlify) and `vercel.json` provide SPA fallbacks. Point `shop.hospitalityinnovations.com.ph` to the host with a CNAME in GoDaddy DNS.
12. Defaults in the cost calculator (₱20 per 500 ml bottle, ₱35 per 5-gallon refill, 2 L per person per day) are labelled on screen as example assumptions and are editable.
