import { useEffect, useRef, type ReactNode } from "react";
import { IconClose } from "./Icons";
import { cx } from "../lib/format";

/** Accessible dialog: traps focus via <dialog>, closes on Esc, restores focus. */
export function Modal({ open, onClose, title, children, side = "center" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: "center" | "bottom" | "right" }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-label={title}
      className={cx(
        "m-0 max-h-[100dvh] max-w-none bg-white p-0 text-hiq-navy backdrop:bg-hiq-navy/40",
        side === "center" && "mx-auto mt-[8vh] w-[min(640px,calc(100%-2rem))] rounded-2xl",
        side === "bottom" && "mt-auto w-full rounded-t-2xl md:mx-auto md:mb-auto md:mt-[8vh] md:w-[560px] md:rounded-2xl",
        side === "right" && "ml-auto h-[100dvh] w-[min(380px,90vw)]",
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <h2 className="text-lg">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full hover:bg-hiq-sky" aria-label="Close"><IconClose /></button>
      </div>
      <div className="max-h-[80dvh] overflow-y-auto px-5 py-4">{children}</div>
    </dialog>
  );
}
