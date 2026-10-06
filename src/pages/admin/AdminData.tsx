import { useRef, useState } from "react";
import { Button } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, repository, useCatalog } from "../../data/catalogStore";
import type { CatalogData } from "../../data/repository";
import { Card, ConfirmDialog, PageHeader } from "./adminUi";

const isCatalog = (d: unknown): d is CatalogData =>
  !!d && typeof d === "object" && Array.isArray((d as CatalogData).products) && Array.isArray((d as CatalogData).filters)
  && (d as CatalogData).products.every((p) => typeof p?.slug === "string" && typeof p?.model === "string");

export default function AdminData() {
  const data = useCatalog();
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<CatalogData | null>(null);
  const [resetting, setResetting] = useState(false);

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hiq-shop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const pick = async (f: File | undefined) => {
    if (!f) return;
    try {
      const parsed: unknown = JSON.parse(await f.text());
      if (!isCatalog(parsed)) throw new Error();
      setPending({ products: parsed.products, filters: parsed.filters, photos: parsed.photos ?? {} });
    } catch { toast.show("That file isn't an HIQ Shop backup.", { tone: "error" }); }
    finally { if (file.current) file.current.value = ""; }
  };

  return (
    <>
      <PageHeader title="Backup & reset" intro="Save a copy of everything, bring a copy back, or start over." />
      <div className="space-y-6">
        {repository.local && (
          <Card title="Where your changes are saved">
            <p className="text-[15px] text-slate-700">The shop is in demo mode, so your changes are saved <strong>in this browser on this computer only</strong>. Clearing the browser's data deletes them, and other people won't see them. Download a backup regularly. When the database is ready, a backup file can be loaded straight into it.</p>
          </Card>
        )}
        <Card title="Download a backup" intro={`${data.products.length} products, ${data.filters.length} filters and ${Object.keys(data.photos).length} website photos, photos included.`}>
          <div><Button onClick={download}>Download backup file</Button></div>
        </Card>
        <Card title="Load a backup" intro="Replaces everything in the admin with the contents of a backup file.">
          <input ref={file} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => void pick(e.target.files?.[0])} />
          <div><Button variant="outline" onClick={() => file.current?.click()}>Choose backup file</Button></div>
        </Card>
        <Card title="Start over" intro="Puts back the original products, filters and placeholder photos the shop shipped with. Everything you've added or changed is lost.">
          <div><Button className="bg-error hover:bg-red-800" onClick={() => setResetting(true)}>Reset to the original catalogue</Button></div>
        </Card>
      </div>

      <ConfirmDialog open={!!pending} onClose={() => setPending(null)} title="Load this backup?" confirmLabel="Replace everything"
        body={<p>This replaces what's in the admin now with {pending?.products.length} products and {pending?.filters.length} filters from the backup. Download a backup of the current data first if you might need it.</p>}
        onConfirm={async () => {
          if (!pending) return;
          try { await catalogAdmin.replaceAll(pending); toast.show("Backup loaded"); }
          catch (e) { toast.show((e as Error).message, { tone: "error" }); }
        }} />
      <ConfirmDialog open={resetting} onClose={() => setResetting(false)} title="Reset everything?" confirmLabel="Reset catalogue"
        body="All products, filters and photos you've added or changed will be deleted and the original catalogue put back. This can't be undone."
        onConfirm={async () => {
          try { await catalogAdmin.reset(); toast.show("The original catalogue is back"); }
          catch (e) { toast.show((e as Error).message, { tone: "error" }); }
        }} />
    </>
  );
}
