import { useState } from "react";
import { Badge, Button, Input } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, useCatalog } from "../../data/catalogStore";
import { PHOTO_DEFAULTS, PHOTO_PLACES, type PhotoKey } from "../../data/images";
import { PageHeader, PhotoDrop } from "./adminUi";

function PhotoSlotCard({ k }: { k: PhotoKey }) {
  const { photos } = useCatalog();
  const toast = useToast();
  const current = photos[k];
  const [alt, setAlt] = useState(current?.alt || PHOTO_DEFAULTS[k].alt);
  const save = async (src: string | undefined, nextAlt = alt) => {
    try {
      await catalogAdmin.savePhoto(k, src ? { src, alt: nextAlt.trim() || PHOTO_DEFAULTS[k].alt } : null);
      toast.show(src ? "Photo saved" : "Photo removed, the placeholder is back");
    } catch (e) { toast.show((e as Error).message, { tone: "error" }); }
  };
  const unused = PHOTO_PLACES[k].startsWith("Not shown");

  return (
    <li className="flex flex-col rounded-card bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-600">{PHOTO_PLACES[k]}</p>
        {current?.src ? <Badge tone="green">Photo added</Badge> : <Badge tone={unused ? "slate" : "amber"}>Placeholder</Badge>}
      </div>
      <p className="mt-1 text-[15px] font-semibold text-hiq-navy">{PHOTO_DEFAULTS[k].label}</p>
      <div className="mt-3">
        {current?.src
          ? <img src={current.src} alt="" className="aspect-[4/3] w-full rounded-lg bg-slate-100 object-cover" />
          : <PhotoDrop label="Upload photo" compact onUploaded={([src]) => void save(src)} />}
      </div>
      {current?.src && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`alt-${k}`} className="block text-sm font-semibold">Describe this photo</label>
          <div className="flex gap-2">
            <Input id={`alt-${k}`} value={alt} onChange={(e) => setAlt(e.target.value)} />
            <Button variant="outline" className="shrink-0 px-4" disabled={alt.trim() === current.alt} onClick={() => void save(current.src, alt)}>Save</Button>
          </div>
          <div className="flex flex-wrap gap-1">
            <PhotoDrop label="Replace photo" compact onUploaded={([src]) => void save(src)} />
            <Button variant="ghost" className="text-error hover:bg-red-50" onClick={() => void save(undefined)}>Remove photo</Button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminPhotos() {
  const keys = (Object.keys(PHOTO_DEFAULTS) as PhotoKey[]).sort((a, b) => Number(PHOTO_PLACES[a].startsWith("Not")) - Number(PHOTO_PLACES[b].startsWith("Not")));
  return (
    <>
      <PageHeader title="Website photos" intro="The lifestyle photos around the shop. Product photos are added on each product's page. Use real HIQ photos of Philippine homes, condos and offices." />
      <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{keys.map((k) => <PhotoSlotCard key={k} k={k} />)}</ul>
    </>
  );
}
