# HIQ 2.0 — Placeholders to supply

Everything below renders visibly on the site as `[… TBC]` (amber tag) until HIQ supplies it. Nothing here was invented.

## Business & brand
| Item | Where it appears | File to edit |
|---|---|---|
| HIQ logo — supplied as a 225 px PNG (`public/img/hiq-logo.png`); an SVG would stay sharper | Header, footer, mobile drawer, admin, favicon | `src/components/Logo.tsx` |
| Opening days `[CONFIRM DAYS]` | Footer, Help, service booking | `src/config/site.ts` (`hoursDaysTbc`) + Footer/Help |
| Shop domain `[CONFIRM DOMAIN]` | Canonical URLs, sitemap, schema | `src/config/site.ts` (`SHOP_URL`), `public/robots.txt` |
| Partner logo permission `[CONFIRM LOGO PERMISSION]` | Partner strip (names only for now) | `src/components/TrustBar.tsx` |
| Sustainable-solutions offer `[CONFIRM CURRENT OFFER]` | Linked to main site only | — |
| Brand font (if any) | Whole site (Plus Jakarta Sans + Inter used) | `tailwind.config.js`, `src/styles/index.css` |

## Products (`src/data/products.json`)
| Item | Where | Notes |
|---|---|---|
| `price` for every model `[PRICE TBC]` | Product cards, product page, compare, cart, quiz results | Set a number in pesos; budget filter in the quiz and price filter/sort in the shop switch on once prices exist |
| Warranty per model `[WARRANTY TBC]` | Product page, spec table, account, warranty policy | |
| Availability / stock `[TBC]` | Product page, shop availability filter | |
| `storeUrl` (GoDaddy Online Store URL) | Used by `GoDaddyLinkAdapter` | Required before switching `VITE_COMMERCE_ADAPTER=godaddy` |
| Missing specs (`null` values) — dimensions, capacity, power for under-sink/countertop/whole-house models | Spec tables, compare | Shown as `[TBC]` |
| Filtration stage details per model `[TBC]` | Product page "How the filtration works" | |
| Product photography (one per model + installed + detail shots) | All product cards, gallery, filter finder | `src/data/images.ts` (`productPhoto`) |

## Replacement filters (`src/data/catalog.ts`)
| Item | Where |
|---|---|
| Every filter SKU `[FILTER SKU TBC]` | /filters, product page, cart |
| `intervalMonths` `[TBC]` for every filter | /filters, product page, account reminders |
| `price` `[TBC]` for every filter | /filters, cart |
| Number of stages for HW NP 100M, HW NP 200, W2-160P, W2-170P, HW-110, HWJ-L110, Infinite L20, WHNS-01 (single "Stage [TBC]" entry each) | /filters |
| VP-CU-200 stage types 1–4 `[TYPE TBC]` | /filters |
| HWLP UV compatibility with the HQ9 RO cartridge | /filters note |
| Subscribe & Save offer `[CONFIRM SUBSCRIPTION OFFER]` (button disabled) | /filters, account subscriptions |

## Service, rental, delivery
| Item | Where |
|---|---|
| Installation fee `[TBC]` | Product page add-on, service hub, cart, FAQ |
| Service areas / service-area check `[TBC]` | Service hub, booking step 4, FAQ |
| Booking days & slots `[CONFIRM DAYS]` (indicative slots used) | `src/pages/ServiceBook.tsx` |
| Rental monthly fee `[QUOTE]` (always quote) | Product page rent mode, /rent, compare |
| Delivery fee `[TBC]` | Cart, checkout, FAQ |
| Loyalty programme `[CONFIRM PROGRAMME]` | Account |

## Content
| Item | Where |
|---|---|
| Real customer testimonials (3 sample cards labelled) | Home |
| Star ratings / review counts — hidden until real reviews exist | — |
| Lifestyle photography (8 slots) | `src/data/images.ts` (`PHOTOS`) — Home hero, glass bottles, technician, office, etc. |
| Privacy policy, terms of sale `[LEGAL COPY TBC]` | /privacy, /terms |
| Warranty policy `[WARRANTY TBC]` | /warranty-policy |
| 13 planned guide articles (shown as "Coming soon") | `src/data/guide.ts` |
| Cost calculator defaults (₱20 per 0.5 L bottle, ₱35 per 5-gallon refill, 2 L/person/day) are labelled example assumptions, editable on screen | `src/components/CostCalculator.tsx` |

## Integrations
| Item | Where |
|---|---|
| `VITE_GTM_ID` (GTM container for GA4 / Meta / TikTok) | `.env` |
| `VITE_FORM_ENDPOINT` (form forwarder to sales@; mailto fallback without it) | `.env` |
| `VITE_COMMERCE_ADAPTER` (`mock` default, `godaddy` when store URLs exist) and `VITE_GODADDY_CART_URL` | `.env` |
