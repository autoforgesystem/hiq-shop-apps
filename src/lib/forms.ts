import { BUSINESS, FORM_ENDPOINT } from "../config/site";

/**
 * Sends a form to the same inbox as the main site (sales@).
 * With VITE_FORM_ENDPOINT set (e.g. Formspree), posts JSON.
 * Without it, opens the visitor's email app with the details filled in.
 */
export async function submitForm(subject: string, data: Record<string, string>): Promise<"sent" | "mailto"> {
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
