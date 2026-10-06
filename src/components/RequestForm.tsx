import { useState, type FormEvent, type ReactNode } from "react";
import { FormField, Input, Select, Textarea, Button } from "./ui";
import { submitForm } from "../lib/forms";
import { track, type AnalyticsEvent } from "../lib/analytics";
import { IconCheck } from "./Icons";

export interface FieldDef { name: string; label: string; type?: "text" | "tel" | "email" | "number" | "select" | "textarea" | "date"; options?: string[]; required?: boolean; hint?: string; defaultValue?: string; autoComplete?: string }

/** Generic lead form → sales@ inbox (same as the main site). Inline errors, minimal fields. */
export function RequestForm({ subject, fields, submitLabel, event, success, footer }: { subject: string; fields: FieldDef[]; submitLabel: string; event: AnalyticsEvent; success: ReactNode; footer?: ReactNode }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      const v = String(fd.get(f.name) ?? "").trim();
      data[f.label] = v;
      if (f.required && !v) errs[f.name] = `Enter ${f.label.toLowerCase()}.`;
      if (v && f.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) errs[f.name] = "Enter an email like name@example.com.";
      if (v && f.type === "tel" && v.replace(/\D/g, "").length < 10) errs[f.name] = "Enter a mobile number with at least 10 digits, e.g. 0917 123 4567.";
    });
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById(`rf-${Object.keys(errs)[0]}`)?.focus(); return; }
    setState("sending"); setErr("");
    try {
      await submitForm(subject, data);
      track(event, { form: subject });
      setState("done");
    } catch (x) { setErr((x as Error).message); setState("idle"); }
  };
  if (state === "done") return (
    <div role="status" className="rounded-card bg-green-50 p-6 ring-1 ring-green-200">
      <p className="flex items-center gap-2 text-lg font-semibold text-success"><IconCheck />Request sent</p>
      <div className="mt-2 text-slate-700">{success}</div>
    </div>
  );
  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `rf-${f.name}`;
        const common = { id, name: f.name, defaultValue: f.defaultValue, "aria-invalid": !!errors[f.name], "aria-describedby": errors[f.name] ? `${id}-err` : f.hint ? `${id}-hint` : undefined, required: f.required, autoComplete: f.autoComplete };
        const wide = f.type === "textarea";
        return (
          <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
            <FormField label={f.label + (f.required ? "" : " (optional)")} id={id} error={errors[f.name]} hint={f.hint}>
              {f.type === "select" ? (
                <Select {...common}><option value="">Choose…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</Select>
              ) : f.type === "textarea" ? <Textarea {...common} /> : (
                <Input {...common} type={f.type ?? "text"} inputMode={f.type === "tel" ? "tel" : f.type === "number" ? "numeric" : undefined} />
              )}
            </FormField>
          </div>
        );
      })}
      {err && <p role="alert" className="text-sm font-medium text-error sm:col-span-2">{err}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : submitLabel}</Button>
        {footer && <div className="mt-3 text-sm text-slate-600">{footer}</div>}
      </div>
    </form>
  );
}
