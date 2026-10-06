import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal } from "../../components/Modal";
import { Badge, Button, EmptyState, FormField, Input, Select, Tbc, Textarea } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, useCatalog } from "../../data/catalogStore";
import type { FilterSku } from "../../data/types";
import { formatPHP } from "../../lib/format";
import { CheckGroup, ConfirmDialog, PageHeader } from "./adminUi";

const TBC_SKU = "[FILTER SKU TBC]";
interface FilterForm { name: string; sku: string; stage: string; compatibleModels: string[]; intervalMonths: string; price: string; note: string }
const toForm = (f?: FilterSku): FilterForm => ({
  name: f?.name ?? "", sku: f && f.sku !== TBC_SKU ? f.sku : "", stage: f?.stage ?? "", compatibleModels: f?.compatibleModels ?? [],
  intervalMonths: f?.intervalMonths?.toString() ?? "", price: f?.price?.toString() ?? "", note: f?.note ?? "",
});
const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(/[₱,\s]/g, "")));

function FilterEditor({ initial, presetModel, onClose }: { initial?: FilterSku; presetModel?: string; onClose: () => void }) {
  const { products } = useCatalog();
  const toast = useToast();
  const [f, setF] = useState(() => ({ ...toForm(initial), ...(!initial && presetModel ? { compatibleModels: [presetModel] } : {}) }));
  const [errors, setErrors] = useState<Partial<Record<keyof FilterForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<FilterForm>) => { setF((x) => ({ ...x, ...p })); setErrors({}); };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Enter the filter name.";
    if (!f.stage.trim()) errs.stage = "Enter the stage, e.g. Stage 1 — sediment.";
    if (!f.compatibleModels.length) errs.compatibleModels = "Pick at least one product this filter fits.";
    const interval = num(f.intervalMonths), price = num(f.price);
    if (interval != null && !(Number.isInteger(interval) && interval > 0)) errs.intervalMonths = "Enter a whole number of months, e.g. 6.";
    if (price != null && !(Number.isFinite(price) && price >= 0)) errs.price = "Enter a price in pesos, e.g. 850.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await catalogAdmin.saveFilter({
        id: initial?.id ?? `f-${Date.now().toString(36)}`, name: f.name.trim(), sku: f.sku.trim() || TBC_SKU, stage: f.stage.trim(),
        compatibleModels: f.compatibleModels, intervalMonths: interval, price, note: f.note.trim() || undefined,
      });
      toast.show(initial ? "Filter saved" : `${f.name.trim()} added`);
      onClose();
    } catch (err) { toast.show((err as Error).message, { tone: "error" }); }
    finally { setSaving(false); }
  };
  const a = (k: keyof FilterForm) => ({ id: `ff-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `ff-${k}-err` : undefined });

  return (
    <form onSubmit={save} noValidate className="space-y-5">
      <FormField label="Filter name *" id="ff-name" error={errors.name}><Input {...a("name")} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. W2-170P sediment filter" /></FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Stage *" id="ff-stage" error={errors.stage}><Input {...a("stage")} value={f.stage} onChange={(e) => set({ stage: e.target.value })} placeholder="e.g. Stage 1 — sediment" /></FormField>
        <FormField label="SKU / product code" id="ff-sku" hint="Leave blank to show [FILTER SKU TBC]."><Input {...a("sku")} value={f.sku} onChange={(e) => set({ sku: e.target.value })} /></FormField>
        <FormField label="Replace every (months)" id="ff-intervalMonths" error={errors.intervalMonths} hint="Leave blank to show [TBC]."><Input {...a("intervalMonths")} inputMode="numeric" value={f.intervalMonths} onChange={(e) => set({ intervalMonths: e.target.value })} placeholder="e.g. 6" /></FormField>
        <FormField label="Price (₱)" id="ff-price" error={errors.price} hint="Leave blank to show [PRICE TBC]."><Input {...a("price")} inputMode="decimal" value={f.price} onChange={(e) => set({ price: e.target.value })} placeholder="e.g. 850" /></FormField>
      </div>
      <CheckGroup label="Fits these products *" options={products.map((p) => ({ value: p.slug, label: p.model }))} value={f.compatibleModels} onChange={(compatibleModels) => set({ compatibleModels })} error={errors.compatibleModels} />
      <FormField label="Note for customers" id="ff-note" hint="Optional, shown in amber under the filter."><Textarea {...a("note")} value={f.note} onChange={(e) => set({ note: e.target.value })} className="min-h-[70px]" /></FormField>
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save filter" : "Add filter"}</Button>
      </div>
    </form>
  );
}

export default function AdminFilters() {
  const { filters, products } = useCatalog();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [model, setModel] = useState("");
  const [editing, setEditing] = useState<FilterSku | "new" | null>(sp.get("new") ? "new" : null);
  const [deleting, setDeleting] = useState<FilterSku | null>(null);
  const modelName = (slug: string) => products.find((p) => p.slug === slug)?.model ?? slug;
  const list = filters.filter((f) => !model || f.compatibleModels.includes(model));
  const close = () => { setEditing(null); if (sp.has("new")) setSp({}, { replace: true }); };

  return (
    <>
      <PageHeader title="Replacement filters" intro="The filters customers can order for their unit on the Find my filters page."
        actions={<Button variant="primary" onClick={() => setEditing("new")}>Add a filter</Button>} />
      <Select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Show filters for product" className="mb-4 sm:w-72">
        <option value="">All products</option>
        {products.map((p) => <option key={p.slug} value={p.slug}>{p.model}</option>)}
      </Select>
      {list.length === 0 ? <EmptyState title="No filters yet" body="Add the replacement filters for this product." action={<Button onClick={() => setEditing("new")}>Add a filter</Button>} /> : (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-white p-4 ring-1 ring-slate-200">
              <div className="min-w-0">
                <p className="font-semibold text-hiq-navy">{f.name}</p>
                <p className="text-sm text-slate-600">{f.stage} · SKU {f.sku === TBC_SKU ? <Tbc>SKU TBC</Tbc> : f.sku}</p>
                <p className="mt-1 text-sm text-slate-600">Every {f.intervalMonths ?? <Tbc />} months · {f.price != null ? formatPHP(f.price) : <Tbc>PRICE TBC</Tbc>}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{f.compatibleModels.length ? f.compatibleModels.map((s) => <Badge key={s} tone="slate">{modelName(s)}</Badge>) : <Badge tone="amber">Not linked to a product</Badge>}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" className="min-h-[40px] px-4" onClick={() => setEditing(f)}>Edit</Button>
                <button onClick={() => setDeleting(f)} className="min-h-[40px] rounded-full px-4 text-[15px] font-semibold text-error hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing != null} onClose={close} title={editing === "new" ? "Add a filter" : "Edit filter"}>
        {editing != null && <FilterEditor key={editing === "new" ? "new" : editing.id} initial={editing === "new" ? undefined : editing} presetModel={model} onClose={close} />}
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete this filter?" confirmLabel="Delete filter"
        body={<p>Customers will no longer be able to order <strong>{deleting?.name}</strong>.</p>}
        onConfirm={async () => {
          if (!deleting) return;
          try { await catalogAdmin.deleteFilter(deleting.id); toast.show("Filter deleted"); }
          catch (e) { toast.show((e as Error).message, { tone: "error" }); }
        }} />
    </>
  );
}
