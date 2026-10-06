import { useState } from "react";
import { PhotoFrame } from "./PhotoFrame";
import type { PhotoSlot } from "../data/images";
import { cx } from "../lib/format";

export function Gallery({ slots }: { slots: PhotoSlot[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <PhotoFrame slot={slots[i]} ratio="aspect-square" eager />
      {slots.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2" role="tablist" aria-label="Product images">
          {slots.map((s, n) => (
            <button key={n} role="tab" aria-selected={i === n} aria-label={`Image ${n + 1}: ${s.label}`} onClick={() => setI(n)}
              className={cx("overflow-hidden rounded-lg ring-2", i === n ? "ring-hiq-blue" : "ring-transparent")}>
              <PhotoFrame slot={{ ...s, label: `${n + 1}` }} ratio="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
