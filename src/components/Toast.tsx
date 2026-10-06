import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cx } from "../lib/format";

interface ToastItem { id: number; text: string; tone: "info" | "error"; action?: { label: string; onClick: () => void } }
const Ctx = createContext<{ show: (text: string, o?: { tone?: "info" | "error"; action?: ToastItem["action"] }) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((text: string, o: { tone?: "info" | "error"; action?: ToastItem["action"] } = {}) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, tone: o.tone ?? "info", action: o.action }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 5000);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {items.map((t) => (
          <div key={t.id} role="status" className={cx("pointer-events-auto flex max-w-md items-center gap-4 rounded-xl px-4 py-3 text-sm shadow-lift", t.tone === "error" ? "bg-error text-white" : "bg-hiq-navy text-white")}>
            <span>{t.text}</span>
            {t.action && <button onClick={t.action.onClick} className="min-h-[44px] shrink-0 font-semibold text-hiq-water underline underline-offset-4">{t.action.label}</button>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast outside provider");
  return c;
};
