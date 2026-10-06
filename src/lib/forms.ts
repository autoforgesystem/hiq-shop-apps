import { BUSINESS, FORM_ENDPOINT } from "../config/site";
import { api, useApi } from "./api";

/** Which lead type a form subject becomes on the HIQ API. */
const leadType = (subject: string) =>
  /rental/i.test(subject) ? "rental" : /newsletter/i.test(subject) ? "newsletter" : /quote/i.test(subject) ? "quote" : "contact";

/** Splits a form's label → value map into the API's lead fields; everything else goes in `details`. */
function toLead(subject: string, data: Record<string, string>) {
  const lead: Record<string, unknown> = { type: leadType(subject) };
  const details: Record<string, string> = { Form: subject };
  for (const [label, value] of Object.entries(data)) {
    if (!value) continue;
    if (/^(name|contact name|name or company)$/i.test(label)) lead.name = value;
    else if (/email/i.test(label)) lead.email = value;
    else if (/mobile|phone/i.test(label)) lead.phone = value;
    else if (/^(message|details|notes)$/i.test(label)) lead.message = value;
    else details[label] = value;
  }
  try {
    const utm = JSON.parse(sessionStorage.getItem("hiq_utm") || "{}") as Record<string, string>;
    Object.assign(lead, { utmSource: utm.utm_source, utmMedium: utm.utm_medium, utmCampaign: utm.utm_campaign });
  } catch { /* no UTM tags */ }
  return { ...lead, details };
}

/**
 * Sends a form to HIQ.
 * With VITE_API_URL set, it is stored as a lead on the HIQ API (and emailed to sales@).
 * With VITE_FORM_ENDPOINT set (e.g. Formspree), posts JSON to the same inbox as the main site.
 * Without either, opens the visitor's email app with the details filled in.
 */
export async function submitForm(subject: string, data: Record<string, string>): Promise<"sent" | "mailto"> {
  if (useApi) {
    await api("/leads", { body: toLead(subject, data) });
    return "sent";
  }
  if (FORM_ENDPOINT) {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, ...data }),
    });
    if (!res.ok) throw new Error("The form could not be sent. Check your connection, or call us instead.");
    return "sent";
  }
  const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  window.location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mailto";
}
