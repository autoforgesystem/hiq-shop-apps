import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonLink, EmptyState, FormField, Input, Select, Textarea } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, useCatalog } from "../../data/catalogStore";
import { PART_CATEGORIES, TBC_PART_SKU } from "../../data/catalog";
import type { PartCategory, PartUnit, ProductImage, SparePart } from "../../data/types";
import { cx } from "../../lib/format";
import { Card, CheckGroup, ConfirmDialog, PageHeader, PhotoList, SpecEditor, Toggle, type SpecRow } from "./adminUi";
import { slugify } from "./productForm";

const UNIT_OPTIONS: { value: PartUnit; label: string; hint: string }[] = [
  { value: "piece", label: "Per piece", hint: "Fittings, valves, faucets, single cartridges" },
  { value: "meter", label: "Per meter", hint: "Tubing cut to the length the customer orders" },
  { value: "pack", label: "Per pack", hint: "Rolls, boxes and reseller packs. Say how many are in a pack in the specifications." },
];

interface PartForm {
  name: string; slug: string; sku: string; category: PartCategory; unit: PartUnit; price: string;
  description: string; specs: SpecRow[]; images: ProductImage[]; compatibleModels: string[]; hidden: boolean;
}
type FormErrors = Partial<Record<keyof PartForm, string>>;

const emptyForm = (): PartForm => ({
  name: "", slug: "", sku: "", category: "fittings", unit: "piece", price: "", description: "",
  specs: [{ label: "Size", value: "" }, { label: "Connection", value: "" }, { label: "Material", value: "" }], images: [], compatibleModels: [], hidden: false,
});
const toForm = (p: SparePart): PartForm => ({
  name: p.name, slug: p.slug, sku: p.sku === TBC_PART_SKU ? "" : p.sku, category: p.category, unit: p.unit, price: p.price?.toString() ?? "",
  description: p.description, specs: Object.entries(p.specs).map(([label, value]) => ({ label, value: value ?? "" })),
  images: p.images.map((i) => ({ ...i })), compatibleModels: [...p.compatibleModels], hidden: !!p.hidden,
});
const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(/[₱,\s]/g, "")));
const toPart = (f: PartForm): SparePart => ({
  slug: f.slug, sku: f.sku.trim() || TBC_PART_SKU, name: f.name.trim(), category: f.category, unit: f.unit, price: num(f.price),
  description: f.description.trim(), specs: Object.fromEntries(f.specs.filter((r) => r.label.trim()).map((r) => [r.label.trim(), r.value.trim() || null])),
  images: f.images.map((i) => ({ src: i.src, alt: i.alt.trim() })), compatibleModels: f.compatibleModels, ...(f.hidden && { hidden: true }),
});

function validate(f: PartForm, takenSlugs: string[], isNew: boolean): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim()) e.name = "Enter the part name, including its size.";
  if (isNew) {
    if (!f.slug) e.slug = "Enter a web address.";
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) e.slug = "Use only lowercase letters, numbers and dashes.";
    else if (takenSlugs.includes(f.slug)) e.slug = "Another spare part already uses this web address.";
  }
  const price = num(f.price);
  if (price != null && !(Number.isFinite(price) && price >= 0)) e.price = "Enter a price in pesos, e.g. 85.";
  if (f.images.some((i) => !i.alt.trim())) e.images = "Describe every photo. This helps blind visitors and Google.";
  return e;
}

export default function PartEditorRoute() {
  const { slug } = useParams();
  return <PartEditor key={slug ?? "new"} slug={slug} />;
}

function PartEditor({ slug }: { slug?: string }) {
  const { parts, products } = useCatalog();
  const nav = useNavigate();
  const toast = useToast();
  const original = slug ? parts.find((p) => p.slug === slug) : undefined;
  const isNew = !slug;
  const [form, setForm] = useState<PartForm>(() => (original ? toForm(original) : emptyForm()));
  const [errors, setErrors] = useState<FormErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [discard, setDiscard] = useState(false);
  const errorBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (slug && !original) return <EmptyState title="Spare part not found" body="It may have been deleted." action={<ButtonLink to="/admin/parts">Back to spare parts</ButtonLink>} />;

  const set = (patch: Partial<PartForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setErrors((e) => { const n = { ...e }; for (const k of Object.keys(patch)) delete n[k as keyof PartForm]; return n; });
  };
  const field = (k: keyof PartForm) => ({ id: `rf-${k}`, error: errors[k] });
  const aria = (k: keyof PartForm) => ({ id: `rf-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `rf-${k}-err` : undefined });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form, parts.map((p) => p.slug), isNew);
    setErrors(errs);
    if (Object.keys(errs).length) { requestAnimationFrame(() => errorBox.current?.focus()); return; }
    setSaving(true);
    try {
      const p = toPart(form);
      await catalogAdmin.savePart(p, original?.slug);
      setDirty(false);
      toast.show(isNew ? `${p.name} added` : "Changes saved", { action: p.hidden ? undefined : { label: "View on shop", onClick: () => window.open(`/parts/${p.slug}`, "_blank", "noopener") } });
      if (isNew) nav(`/admin/parts/${p.slug}`, { replace: true });
    } catch (err) {
      toast.show((err as Error).message.includes("quota") ? "The browser is out of space. Remove some photos and try again." : (err as Error).message, { tone: "error" });
    } finally { setSaving(false); }
  };

  const leave = () => (dirty ? setDiscard(true) : nav("/admin/parts"));
  const errorList = Object.entries(errors);

  return (
    <form onSubmit={save} noValidate className="pb-28">
      <p className="mb-2 text-sm"><Link to="/admin/parts" className="link">← All spare parts</Link></p>
      <PageHeader title={isNew ? "Add a spare part" : `Edit ${original!.name}`}
        intro={isNew ? "Add each size as its own part, e.g. one for 1/4\" and one for 3/8\". Fields marked * are required." : <>Changes show on the shop as soon as you press Save. {!original!.hidden && <a href={`/parts/${original!.slug}`} target="_blank" rel="noopener" className="link">See it on the shop</a>}</>} />

      {errorList.length > 0 && (
        <div ref={errorBox} tabIndex={-1} role="alert" className="mb-6 rounded-card bg-red-50 p-4 text-[15px] text-error ring-1 ring-red-200">
          <p className="font-semibold">Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} before saving:</p>
          <ul className="mt-1 list-disc pl-5">{errorList.map(([k, msg]) => <li key={k}><a href={`#rf-${k}`} className="underline">{msg}</a></li>)}</ul>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Basic details">
            <FormField label="Part name *" {...field("name")} hint='Include the size, e.g. Elbow connector, 1/4" tube'>
              <Input {...aria("name")} value={form.name} onChange={(e) => set({ name: e.target.value, ...(isNew && !slugTouched ? { slug: slugify(e.target.value) } : {}) })} />
            </FormField>
            <FormField label="Web address *" {...field("slug")} hint={isNew ? "Filled in for you from the name. It can't be changed after saving, because links to the part use it." : "This can't be changed, because links to the part use it."}>
              <div className="flex items-center">
                <span className="hidden shrink-0 pr-1 text-[15px] text-slate-500 sm:inline">/parts/</span>
                <Input {...aria("slug")} value={form.slug} disabled={!isNew} className="disabled:bg-slate-100 disabled:text-slate-600"
                  onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); }} />
              </div>
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category *" {...field("category")}>
                <Select {...aria("category")} value={form.category} onChange={(e) => set({ category: e.target.value as PartCategory })}>
                  {PART_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </Select>
              </FormField>
              <FormField label="SKU / product code" {...field("sku")} hint="Leave blank to show [SKU TBC].">
                <Input {...aria("sku")} value={form.sku} onChange={(e) => set({ sku: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Description" {...field("description")} hint="One or two sentences: what it's for and where it goes.">
              <Textarea {...aria("description")} value={form.description} onChange={(e) => set({ description: e.target.value })} className="min-h-[90px]" />
            </FormField>
            <Toggle label="Show this part on the shop" description="Turn off to hide it from customers while you work on it. Hidden parts are kept here." checked={!form.hidden} onChange={(v) => set({ hidden: !v })} />
          </Card>

          <Card title="Photos" intro="The first photo is the main one, shown on part cards. Square photos with a plain background look best.">
            <PhotoList id="rf-images" images={form.images} onChange={(images) => set({ images })} error={errors.images}
              defaultAlt={form.name || "Spare part"} altPlaceholder={`e.g. ${form.name || "The part"} on a white background`} />
          </Card>

          <Card title="Specifications" intro="Size, thread, material, length and so on. Leave a value blank and the shop shows [TBC].">
            <SpecEditor rows={form.specs} onChange={(specs) => set({ specs })} />
          </Card>

          <Card title="Fits these models" intro="Pick the HIQ models this part is made for. They show it under “Spare parts for this model”. Leave all unticked for standard parts that fit any system of that size.">
            <CheckGroup label="Models" options={products.map((p) => ({ value: p.slug, label: p.model }))} value={form.compatibleModels} onChange={(compatibleModels) => set({ compatibleModels })} />
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-[84px] xl:self-start">
          <Card title="Price">
            <fieldset>
              <legend className="text-[15px] font-semibold">Sold *</legend>
              <div className="mt-1.5 space-y-1">
                {UNIT_OPTIONS.map((u) => (
                  <label key={u.value} className="flex cursor-pointer items-start gap-2.5 py-1">
                    <input type="radio" name="unit" className="mt-1 h-5 w-5 accent-hiq-blue" checked={form.unit === u.value} onChange={() => set({ unit: u.value })} />
                    <span><span className="block text-[15px] font-semibold">{u.label}</span><span className="text-sm text-slate-600">{u.hint}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <FormField label={`Price (₱) ${UNIT_OPTIONS.find((u) => u.value === form.unit)!.label.toLowerCase()}`} {...field("price")} hint="Leave blank to show [PRICE TBC] on the shop.">
              <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                <Input {...aria("price")} inputMode="decimal" value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="e.g. 85" className="pl-7" /></div>
            </FormField>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-end gap-3 px-4 py-3 sm:px-6">
          <span className={cx("mr-auto text-sm", dirty ? "font-semibold text-warning" : "text-slate-600")} aria-live="polite">{dirty ? "You have unsaved changes" : isNew ? "" : "All changes saved"}</span>
          <Button type="button" variant="ghost" onClick={leave}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : isNew ? "Save part" : "Save changes"}</Button>
        </div>
      </div>

      <ConfirmDialog open={discard} onClose={() => setDiscard(false)} title="Discard your changes?" confirmLabel="Discard changes"
        body="You have changes that aren't saved. If you leave now they'll be lost." onConfirm={() => { setDirty(false); nav("/admin/parts"); }} />
    </form>
  );
}
