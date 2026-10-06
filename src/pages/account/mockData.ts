/** DEMO DATA ONLY — Phase 1 is front-end only. Real data comes from the API in /docs/API.md. */
export const MOCK = {
  user: { name: "Juan dela Cruz", email: "juan@example.com" },
  units: [
    { id: "u1", model: "W2-170P", slug: "w2-170p", installed: "2026-03-14", address: "Unit 12B, Sample Tower, Makati City", nextFilterDue: "2026-11-10", warranty: "[WARRANTY TBC]", history: [{ date: "2026-03-14", what: "Installation" }, { date: "2026-08-02", what: "Maintenance visit" }] },
    { id: "u2", model: "VP-CU-200", slug: "vp-cu-200", installed: "2025-12-01", address: "Sample Street, Biñan, Laguna", nextFilterDue: "2026-10-20", warranty: "[WARRANTY TBC]", history: [{ date: "2025-12-01", what: "Installation" }] },
  ],
  orders: [{ id: "HIQ-DEMO-1042", date: "2026-03-01", items: "W2-170P + installation", total: null as number | null, status: "Delivered" }],
  bookings: [{ id: "B-DEMO-77", service: "Filter replacement", unit: "VP-CU-200", date: "2026-10-21", status: "Awaiting HIQ call" }],
  addresses: ["Unit 12B, Sample Tower, Makati City", "Sample Street, Biñan, Laguna"],
};
