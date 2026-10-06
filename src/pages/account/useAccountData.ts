import { useEffect, useState } from "react";
import { api, useApi } from "../../lib/api";
import { SERVICES } from "../Service";
import { MOCK } from "./mockData";

export type AccountData = typeof MOCK;
type ApiUnit = { id: string; productSlug: string; model: string; installedAt: string; address: string; nextFilterDueAt: string | null; warranty: { endsAt: string | null; status: string }; serviceHistory: { date: string; type: string; notes: string | null }[] };
type ApiOrder = { id: string; createdAt: string; status: string; total: number; requiresQuote: boolean; lines: { name: string; qty: number; withInstallation: boolean }[] };
type ApiBooking = { id: string; service: string; unitId: string; preferredDate: string | null; status: string };
type ApiAddress = { line1: string; line2: string | null; city: string; province: string; postal: string | null };

const serviceLabel = (id: string) => SERVICES.find((s) => s.id === id)?.label ?? id;
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

/** Converts API responses into the shapes the account screens render (the same as mockData.ts). */
async function loadFromApi(): Promise<AccountData> {
  const [units, orders, bookings, addresses] = await Promise.all([
    api<ApiUnit[]>("/me/units", { auth: "customer" }),
    api<ApiOrder[]>("/me/orders", { auth: "customer" }),
    api<ApiBooking[]>("/me/bookings", { auth: "customer" }),
    api<ApiAddress[]>("/me/addresses", { auth: "customer" }),
  ]);
  return {
    user: MOCK.user,
    units: units.map((u) => ({
      id: u.id, model: u.model, slug: u.productSlug, installed: u.installedAt, address: u.address,
      nextFilterDue: u.nextFilterDueAt ?? "",
      warranty: u.warranty.endsAt ? `${sentence(u.warranty.status)} until ${u.warranty.endsAt}` : "[WARRANTY TBC]",
      history: u.serviceHistory.map((h) => ({ date: h.date, what: h.notes || serviceLabel(h.type) })),
    })),
    orders: orders.map((o) => ({
      id: o.id, date: o.createdAt.slice(0, 10), status: sentence(o.status),
      items: o.lines.map((l) => `${l.qty > 1 ? `${l.qty} × ` : ""}${l.name}${l.withInstallation ? " + installation" : ""}`).join(", "),
      total: o.requiresQuote ? null : o.total,
    })),
    bookings: bookings.map((b) => ({
      id: b.id, service: serviceLabel(b.service), status: sentence(b.status), date: b.preferredDate ?? "date to be agreed",
      unit: b.unitId === "new" ? "New installation" : units.find((u) => u.id === b.unitId)?.model ?? "Your unit",
    })),
    addresses: addresses.map((a) => [a.line1, a.line2, a.city, a.province, a.postal].filter(Boolean).join(", ")),
  };
}

/** The signed-in customer's account: live from the API when VITE_API_URL is set, otherwise demo data. */
export function useAccountData() {
  const [state, setState] = useState<{ data: AccountData | null; error: string }>({ data: useApi ? null : MOCK, error: "" });
  useEffect(() => {
    if (!useApi) return;
    let live = true;
    loadFromApi().then((data) => live && setState({ data, error: "" }), (e: Error) => live && setState({ data: null, error: e.message }));
    return () => { live = false; };
  }, []);
  return state;
}
