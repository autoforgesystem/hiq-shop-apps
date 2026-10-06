import type { Faq } from "../components/FAQAccordion";
export const FAQ: Record<string, Faq[]> = {
  Installation: [
    { q: "Who installs my system?", a: "HIQ's own service department installs all purchased and rented direct-plumbed, bottleless systems." },
    { q: "How much does installation cost?", a: "The installation fee is still being confirmed [TBC]. HIQ will confirm the fee when it calls to schedule your installation." },
    { q: "Which areas do you serve?", a: "Service areas are being confirmed [TBC]. Enter your address when booking and HIQ will confirm coverage." },
  ],
  "Water testing": [
    { q: "Why do I need a water test?", a: "The right filtration depends on your water. Before installation, HIQ requests a water-quality report or tests your water on a site visit." },
    { q: "What is TDS?", a: "TDS (total dissolved solids) is a reading in ppm that HIQ uses as a starting point: 0–150 ppm usually suits UF, 151–190 ppm Nano, and above 190 ppm or deep wells RO." },
  ],
  Rental: [
    { q: "How does renting work?", a: "You pay a fixed monthly fee on a minimum two-year contract. The fee depends on the unit and number of users, and includes regular service and consumables. Rental is subject to financial approval." },
    { q: "How much is the monthly fee?", a: "Every rental is quoted individually. Send a rental request and HIQ will reply with a quote." },
  ],
  Filters: [
    { q: "How often should I replace filters?", a: "Replacement intervals for each model and stage are being confirmed [TBC]. Your account will show reminders once they're set." },
    { q: "How do I find the right filter?", a: "Use Find filters for my HIQ unit and pick your model. If you're unsure of your model, send HIQ a photo of your unit." },
  ],
  Delivery: [
    { q: "How much is delivery?", a: "Delivery fees are being confirmed [TBC] and will show at checkout." },
  ],
  Warranty: [
    { q: "What warranty comes with my system?", a: "Warranty periods are being confirmed for each model [WARRANTY TBC]. See the warranty policy page for updates." },
  ],
};
