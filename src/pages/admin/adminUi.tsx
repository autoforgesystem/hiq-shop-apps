import { useRef, useState, type ReactNode } from "react";
import { Modal } from "../../components/Modal";
import { Button, Input } from "../../components/ui";
import type { ProductImage } from "../../data/types";
import { IconClose, IconPlus } from "../../components/Icons";
import { catalogAdmin } from "../../data/catalogStore";
import { cx } from "../../lib/format";

export const PageHeader = ({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-[28px] sm:text-[32px]">{title}</h1>{intro && <p className="mt-1 max-w-2xl text-[15px] text-slate-600">{intro}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card = ({ title, intro, children, className }: { title?: string; intro?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cx("rounded-card bg-white p-5 ring-1 ring-slate-200 sm:p-6", className)}>
    {title && <h2 className="text-xl">{title}</h2>}
    {intro && <p className="mt-1 text-[15px] text-slate-600">{intro}</p>}
    <div className={title || intro ? "mt-5 space-y-5" : "space-y-5"}>{children}</div>
  </section>
);

/** "Are you sure?" dialog for actions that can't be undone. */
export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onClose }: { open: boolean; title: string; body: ReactNode; confirmLabel: string; onConfirm: () => Promise<void> | void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-[15px] text-slate-700">{body}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="button" disabled={busy} className="bg-error hover:bg-red-800" onClick={async () => { setBusy(true); try { await onConfirm(); onClose(); } finally { setBusy(false); } }}>{busy ? "Working…" : confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/** Large checkbox chips for picking several options. */
export function CheckGroup<T extends string>({ label, options, value, onChange, hint, error }: { label: string; options: { value: T; label: string }[]; value: T[]; onChange: (v: T[]) => void; hint?: string; error?: string }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-semibold">{label}</legend>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <label key={o.value} className={cx("flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-4 text-[15px] font-semibold ring-1", on ? "bg-hiq-blue text-white ring-hiq-blue" : "bg-white ring-slate-300 hover:ring-hiq-blue")}>
              <input type="checkbox" className="sr-only" checked={on} onChange={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])} />
              {on && <span aria-hidden>✓</span>}{o.label}
            </label>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-1.5 text-sm font-medium text-error">{error}</p>}
    </fieldset>
  );
}

/** On/off switch with a plain-language explanation. */
export function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-hiq-blue" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><span className="block text-[15px] font-semibold">{label}</span>{description && <span className="block text-sm text-slate-600">{description}</span>}</span>
    </label>
  );
}

/** Editable list of short texts (highlights, configurations). */
export function ListEditor({ label, hint, items, onChange, placeholder, addLabel, error }: { label: string; hint?: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel: string; error?: string }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-semibold">{label}</legend>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      <ul className="mt-2 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <Input aria-label={`${label} ${i + 1}`} value={it} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-500 ring-1 ring-slate-300 hover:text-error hover:ring-error" aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}><IconClose size={18} /></button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" className="mt-1 px-3" onClick={() => onChange([...items, ""])}><IconPlus size={18} />{addLabel}</Button>
      {error && <p role="alert" className="text-sm font-medium text-error">{error}</p>}
    </fieldset>
  );
}

export type SpecRow = { label: string; value: string };

/** Specification rows. An empty value is shown on the shop as [TBC]. */
export function SpecEditor({ rows, onChange }: { rows: SpecRow[]; onChange: (r: SpecRow[]) => void }) {
  const set = (i: number, patch: Partial<SpecRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div>
      <div className="hidden grid-cols-[1fr_1fr_44px] gap-2 text-sm font-semibold text-slate-600 sm:grid"><span>Name (e.g. Capacity)</span><span>Value (e.g. 150 gallons/day)</span><span /></div>
      <ul className="mt-2 space-y-3 sm:space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[1fr_44px] gap-2 sm:grid-cols-[1fr_1fr_44px]">
            <Input aria-label={`Specification ${i + 1} name`} value={r.label} placeholder="Name" onChange={(e) => set(i, { label: e.target.value })} />
            <Input aria-label={`Specification ${i + 1} value`} value={r.value} placeholder="Leave blank to show [TBC]" onChange={(e) => set(i, { value: e.target.value })} className="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto" />
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="row-span-2 grid h-11 w-11 place-items-center rounded-lg text-slate-500 ring-1 ring-slate-300 hover:text-error hover:ring-error sm:row-span-1" aria-label={`Remove specification ${r.label || i + 1}`}><IconClose size={18} /></button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" className="mt-1 px-3" onClick={() => onChange([...rows, { label: "", value: "" }])}><IconPlus size={18} />Add a specification</Button>
    </div>
  );
}

/** Upload button + drop zone. Calls onUploaded with one URL per photo. */
export function PhotoDrop({ onUploaded, multiple, label = "Add photos", compact }: { onUploaded: (urls: string[]) => void; multiple?: boolean; label?: string; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError("");
    try {
      const list = multiple ? Array.from(files) : [files[0]];
      onUploaded(await Promise.all(list.map((f) => catalogAdmin.uploadImage(f))));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  };
  return (
    <div>
      <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); void upload(e.dataTransfer.files); }}
        className={cx("flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed text-center", compact ? "p-4" : "p-6", over ? "border-hiq-blue bg-hiq-sky" : "border-slate-300 bg-slate-50")}>
        <input ref={input} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => void upload(e.target.files)} tabIndex={-1} aria-hidden />
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Uploading…" : label}</Button>
        <p className="text-sm text-slate-600">or drag {multiple ? "photos" : "a photo"} here · JPG, PNG or WebP</p>
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-error">{error}</p>}
    </div>
  );
}

export const Thumb = ({ src, alt, className }: { src?: string; alt: string; className?: string }) =>
  src ? <img src={src} alt={alt} className={cx("aspect-square w-full rounded-lg bg-slate-100 object-cover", className)} />
    : <div className={cx("grid aspect-square w-full place-items-center rounded-lg bg-hiq-sky text-[11px] font-semibold text-hiq-navy/60", className)} aria-label={alt} role="img">No photo</div>;

/** Uploaded photos with alt text, reordering and removal, plus the upload drop zone. The first photo is the main one. */
export function PhotoList({ id, images, onChange, defaultAlt, altPlaceholder, error }: { id: string; images: ProductImage[]; onChange: (images: ProductImage[]) => void; defaultAlt: string; altPlaceholder: string; error?: string }) {
  const move = (i: number, to: number) => { const imgs = [...images]; const [m] = imgs.splice(i, 1); imgs.splice(to, 0, m); onChange(imgs); };
  return (
    <>
      {images.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {images.map((img, i) => (
            <li key={i} className={cx("rounded-card p-3 ring-1", i === 0 ? "ring-2 ring-hiq-blue" : "ring-slate-200")}>
              <div className="relative">
                <img src={img.src} alt="" className="aspect-square w-full rounded-lg bg-slate-100 object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-hiq-blue px-2 py-0.5 text-sm font-semibold text-white">Main photo</span>}
              </div>
              <label htmlFor={`img-alt-${i}`} className="mt-3 block text-sm font-semibold">Describe this photo</label>
              <Input id={`img-alt-${i}`} value={img.alt} placeholder={altPlaceholder}
                onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} className="mt-1" aria-invalid={!!error && !img.alt.trim()} />
              <div className="mt-2 flex flex-wrap gap-1">
                {i > 0 && <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => move(i, 0)}>Make main photo</Button>}
                {i > 0 && <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => move(i, i - 1)} aria-label={`Move photo ${i + 1} earlier`}>← Earlier</Button>}
                {i < images.length - 1 && <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => move(i, i + 1)} aria-label={`Move photo ${i + 1} later`}>Later →</Button>}
                <Button type="button" variant="ghost" className="min-h-[40px] px-3 text-sm text-error hover:bg-red-50" onClick={() => onChange(images.filter((_, j) => j !== i))}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div id={id} tabIndex={-1}>
        <PhotoDrop multiple label={images.length ? "Add more photos" : "Add photos"} onUploaded={(urls) => onChange([...images, ...urls.map((src) => ({ src, alt: defaultAlt }))])} />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-error">{error}</p>}
    </>
  );
}
