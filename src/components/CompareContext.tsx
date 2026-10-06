import { createContext, useContext, type ReactNode } from "react";
import { useLocalState } from "../lib/useLocalState";
import { useToast } from "./Toast";

const Ctx = createContext<{ items: string[]; toggle: (slug: string) => void; clear: () => void } | null>(null);
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalState<string[]>("hiq_compare", []);
  const toast = useToast();
  const toggle = (slug: string) => {
    if (items.includes(slug)) return setItems(items.filter((s) => s !== slug));
    if (items.length >= 3) return toast.show("You can compare up to 3 products. Remove one to add another.", { tone: "error" });
    setItems([...items, slug]);
  };
  return <Ctx.Provider value={{ items, toggle, clear: () => setItems([]) }}>{children}</Ctx.Provider>;
}
export const useCompare = () => { const c = useContext(Ctx); if (!c) throw new Error("no compare"); return c; };
