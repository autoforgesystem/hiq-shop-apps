import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonLink, EmptyState, FormField, Input, Select, Textarea } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, useCatalog } from "../../data/catalogStore";
import { cx } from "../../lib/format";
import { Card, CheckGroup, ConfirmDialog, ListEditor, PageHeader, PhotoDrop, SpecEditor, Toggle } from "./adminUi";
import {
  CATEGORY_OPTIONS, FILTRATION_OPTIONS, INSTALL_SUGGESTIONS, NEED_OPTIONS, emptyForm, slugify, toForm, toProduct, validate,
  type FormErrors, type ProductForm,
} from "./productForm";

export default function ProductEditorRoute() {
  const { slug } = useParams();
  return <ProductEditor key={slug ?? "new"} slug={slug} />;
}

function ProductEditor({ slug }: { slug?: string }) {
  const { products } = useCatalog();
  const nav = useNavigate();
  const toast = useToast();
  const original = slug ? products.find((p) => p.slug === slug) : undefined;
  const isNew = !slug;
  const [form, setForm] = useState<ProductForm>(() => (original ? toForm(original) : emptyForm()));
  const [errors, setErrors] = useState<FormErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [discard, setDiscard] = useState(false);
  const errorBox = useRef<HTMLDivElement>(null);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (slug && !original) return <EmptyState title="Product not found" body="It may have been deleted." action={<ButtonLink to="/admin/products">Back to products</ButtonLink>} />;

  const set = (patch: Partial<ProductForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setErrors((e) => { const n = { ...e }; for (const k of Object.keys(patch)) delete n[k as keyof ProductForm]; return n; });
  };
  const field = (k: keyof ProductForm) => ({ id: `pf-${k}`, error: errors[k] });
  const aria = (k: keyof ProductForm) => ({ id: `pf-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `pf-${k}-err` : undefined });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form, products.map((p) => p.slug), isNew);
    setErrors(errs);
    if (Object.keys(errs).length) { requestAnimationFrame(() => errorBox.current?.focus()); return; }
    setSaving(true);
    try {
      const p = toProduct(form, original);
      await catalogAdmin.saveProduct(p, original?.slug);
      setDirty(false);
      toast.show(isNew ? `${p.model} added` : "Changes saved", { action: p.hidden ? undefined : { label: "View on shop", onClick: () => window.open(`/product/${p.slug}`, "_blank", "noopener") } });
      if (isNew) nav(`/admin/products/${p.slug}`, { replace: true });
    } catch (err) {
      toast.show((err as Error).message.includes("quota") ? "The browser is out of space. Remove some photos and try again." : (err as Error).message, { tone: "error" });
    } finally { setSaving(false); }
  };

  const leave = () => (dirty ? setDiscard(true) : nav("/admin/products"));
  const moveImage = (i: number, to: number) => { const imgs = [...form.images]; const [m] = imgs.splice(i, 1); imgs.splice(to, 0, m); set({ images: imgs }); };
  const quote = form.channel === "quote";
  const errorList = Object.entries(errors);

  return (
    <form onSubmit={save} noValidate className="pb-28">
      <p className="mb-2 text-sm"><Link to="/admin/products" className="link">← All products</Link></p>
      <PageHeader title={isNew ? "Add a product" : `Edit ${original!.model}`}
        intro={isNew ? "Fill in the details below and press Save. Fields marked * are required." : <>Changes show on the shop as soon as you press Save. {!original!.hidden && <a href={`/product/${original!.slug}`} target="_blank" rel="noopener" className="link">See it on the shop</a>}</>} />

      {errorList.length > 0 && (
        <div ref={errorBox} tabIndex={-1} role="alert" className="mb-6 rounded-card bg-red-50 p-4 text-[15px] text-error ring-1 ring-red-200">
          <p className="font-semibold">Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} before saving:</p>
          <ul className="mt-1 list-disc pl-5">{errorList.map(([k, msg]) => <li key={k}><a href={`#pf-${k}`} className="underline">{msg}</a></li>)}</ul>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Basic details">
            <FormField label="Model name *" {...field("model")} hint="As it should appear on the shop, e.g. W2-170P">
              <Input {...aria("model")} value={form.model} onChange={(e) => set({ model: e.target.value, ...(isNew && !slugTouched ? { slug: slugify(e.target.value) } : {}) })} />
            </FormField>
            <FormField label="Web address *" {...field("slug")} hint={isNew ? "Filled in for you from the model name. It can't be changed after saving, because links to the product use it." : "This can't be changed, because links to the product use it."}>
              <div className="flex items-center rounded-lg ring-0">
                <span className="hidden shrink-0 pr-1 text-[15px] text-slate-500 sm:inline">/product/</span>
                <Input {...aria("slug")} value={form.slug} disabled={!isNew} className="disabled:bg-slate-100 disabled:text-slate-600"
                  onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); }} />
              </div>
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category *" {...field("category")}>
                <Select {...aria("category")} value={form.category} onChange={(e) => set({ category: e.target.value as ProductForm["category"] })}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </FormField>
              <fieldset>
                <legend className="text-[15px] font-semibold">How customers get it *</legend>
                <div className="mt-1.5 space-y-1">
                  {([["shop", "Buy or rent online", "Shows a price and Add to cart"], ["quote", "Request a quote only", "No price; shows a quote form"]] as const).map(([v, l, d]) => (
                    <label key={v} className="flex cursor-pointer items-start gap-2.5 py-1">
                      <input type="radio" name="channel" className="mt-1 h-5 w-5 accent-hiq-blue" checked={form.channel === v} onChange={() => set({ channel: v })} />
                      <span><span className="block text-[15px] font-semibold">{l}</span><span className="text-sm text-slate-600">{d}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <Toggle label="Show this product on the shop" description="Turn off to hide it from customers while you work on it. Hidden products are kept here." checked={!form.hidden} onChange={(v) => set({ hidden: !v })} />
          </Card>

          <Card title="Photos" intro="The first photo is the main one, shown on product cards. Square photos with a plain background look best.">
            {form.images.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2">
                {form.images.map((img, i) => (
                  <li key={i} className={cx("rounded-card p-3 ring-1", i === 0 ? "ring-2 ring-hiq-blue" : "ring-slate-200")}>
                    <div className="relative">
                      <img src={img.src} alt="" className="aspect-square w-full rounded-lg bg-slate-100 object-cover" />
                      {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-hiq-blue px-2 py-0.5 text-sm font-semibold text-white">Main photo</span>}
                    </div>
                    <label htmlFor={`img-alt-${i}`} className="mt-3 block text-sm font-semibold">Describe this photo</label>
                    <Input id={`img-alt-${i}`} value={img.alt} placeholder={`e.g. ${form.model || "The unit"} installed under a kitchen sink`}
                      onChange={(e) => set({ images: form.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)) })} className="mt-1" aria-invalid={!!errors.images && !img.alt.trim()} />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {i > 0 && <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => moveImage(i, 0)}>Make main photo</Button>}
                      {i > 0 && <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => moveImage(i, i - 1)} aria-label={`Move photo ${i + 1} earlier`}>← Earlier</Button>}
                      {i < form.images.length - 1 && <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => moveImage(i, i + 1)} aria-label={`Move photo ${i + 1} later`}>Later →</Button>}
                      <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm text-error hover:bg-red-50" onClick={() => set({ images: form.images.filter((_, j) => j !== i) })}>Remove</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div id="pf-images" tabIndex={-1}>
              <PhotoDrop multiple label={form.images.length ? "Add more photos" : "Add photos"}
                onUploaded={(urls) => set({ images: [...form.images, ...urls.map((src) => ({ src, alt: `${form.model || "Product"} water filtration system` }))] })} />
            </div>
            {errors.images && <p role="alert" className="text-sm font-medium text-error">{errors.images}</p>}
          </Card>

          <Card title="Description">
            <FormField label="Short description *" {...field("summary")} hint="One or two sentences shown under the product name.">
              <Textarea {...aria("summary")} value={form.summary} onChange={(e) => set({ summary: e.target.value })} className="min-h-[90px]" />
            </FormField>
            <ListEditor label="Key points" hint="Short selling points. The first one also appears on the product card." items={form.highlights} onChange={(highlights) => set({ highlights })} placeholder="e.g. 5 L cold tank" addLabel="Add a key point" />
          </Card>

          <Card title="Filtration and use" intro="These power the shop filters, Compare and the Find My System quiz.">
            <CheckGroup label="Filtration types *" options={FILTRATION_OPTIONS} value={form.filtration} onChange={(filtration) => set({ filtration })} error={errors.filtration} />
            <ListEditor label="Options customers choose from" hint="Shown as buttons on the product page, e.g. UF, RO, UF + Alkaline. Leave one option if there's no choice." items={form.configurations} onChange={(configurations) => set({ configurations })} placeholder="e.g. UF + Alkaline" addLabel="Add an option" />
            <CheckGroup label="Who it's for *" options={NEED_OPTIONS} value={form.needs} onChange={(needs) => set({ needs })} error={errors.needs} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="How it's installed *" {...field("install")} hint="Pick a suggestion so it appears in the shop's installation filter.">
                <Input {...aria("install")} list="install-suggestions" value={form.install} onChange={(e) => set({ install: e.target.value })} />
                <datalist id="install-suggestions">{INSTALL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
              </FormField>
              <FormField label="Water limit (ppm TDS)" {...field("tdsLimit")} hint="Only if inlet water must test below a level. Otherwise leave blank.">
                <Input {...aria("tdsLimit")} inputMode="numeric" value={form.tdsLimit} onChange={(e) => set({ tdsLimit: e.target.value })} placeholder="e.g. 190" />
              </FormField>
            </div>
            <Toggle label="Hot and cold water" description="Turn on for dispensers that give hot and cold water." checked={form.hotCold} onChange={(hotCold) => set({ hotCold })} />
          </Card>

          <Card title="Specifications" intro="Shown in the product's specification table and on Compare. Leave a value blank and the shop shows [TBC].">
            <SpecEditor rows={form.specs} onChange={(specs) => set({ specs })} />
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-[84px] xl:self-start">
          <Card title="Price">
            {quote ? <p className="text-[15px] text-slate-600">This product is quote only, so no price is shown. Customers see "Price on quote".</p> : (
              <FormField label="Price (₱)" {...field("price")} hint="Leave blank to show [PRICE TBC] on the shop.">
                <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                  <Input {...aria("price")} inputMode="decimal" value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="e.g. 24990" className="pl-7" /></div>
              </FormField>
            )}
          </Card>
          <Card title="Order and links">
            <FormField label="Position on the shop" {...field("featured")} hint="Lower numbers show first when sorting by Featured. Leave blank to show it last.">
              <Input {...aria("featured")} inputMode="numeric" value={form.featured} onChange={(e) => set({ featured: e.target.value })} placeholder="e.g. 3" />
            </FormField>
            <FormField label="GoDaddy store link" {...field("storeUrl")} hint="Optional. The product's page in your GoDaddy Online Store, used when online checkout goes live.">
              <Input {...aria("storeUrl")} type="url" value={form.storeUrl} onChange={(e) => set({ storeUrl: e.target.value })} placeholder="https://" />
            </FormField>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-end gap-3 px-4 py-3 sm:px-6">
          <span className={cx("mr-auto text-sm", dirty ? "font-semibold text-warning" : "text-slate-600")} aria-live="polite">{dirty ? "You have unsaved changes" : isNew ? "" : "All changes saved"}</span>
          <Button type="button" variant="ghost" onClick={leave}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : isNew ? "Save product" : "Save changes"}</Button>
        </div>
      </div>

      <ConfirmDialog open={discard} onClose={() => setDiscard(false)} title="Discard your changes?" confirmLabel="Discard changes"
        body="You have changes that aren't saved. If you leave now they'll be lost." onConfirm={() => { setDirty(false); nav("/admin/products"); }} />
    </form>
  );
}
