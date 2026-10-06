import type { PhotoSlot } from "../data/images";
import { cx } from "../lib/format";

/** Renders the real photo when supplied, otherwise a labelled placeholder frame. */
/** `sizes` tells the browser how wide the photo is shown, so it downloads the right file from `srcSet`. */
export function PhotoFrame({ slot, className, ratio = "aspect-[4/3]", eager, sizes = "(min-width: 1024px) 50vw, 100vw" }: { slot: PhotoSlot; className?: string; ratio?: string; eager?: boolean; sizes?: string }) {
  if (slot.src) {
    return (
      <img src={slot.src} srcSet={slot.srcSet} sizes={sizes} alt={slot.alt}
        loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined}
        className={cx("w-full rounded-card object-cover", ratio, className)} />
    );
  }
  return (
    <div role="img" aria-label={slot.alt} className={cx("relative grid w-full place-items-center overflow-hidden rounded-card bg-hiq-sky", ratio, className)}>
      <svg className="absolute inset-x-0 bottom-0 h-1/2 w-full text-hiq-water" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 C 60 20, 120 60, 200 40 S 340 20, 400 40 V100 H0Z" fill="currentColor" />
        <path d="M0 62 C 80 45, 140 78, 220 60 S 350 48, 400 62 V100 H0Z" fill="#B7DCF2" />
      </svg>
      <span className="relative mx-6 rounded-md bg-white/85 px-3 py-1.5 text-center text-[13px] font-medium text-hiq-navy/80 ring-1 ring-hiq-water">[PHOTO: {slot.label}]</span>
    </div>
  );
}
