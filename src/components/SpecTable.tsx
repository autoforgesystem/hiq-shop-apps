import { Tbc } from "./ui";
/** Verified data only; blanks show [TBC]. */
export function SpecTable({ specs, warranty = true }: { specs: Record<string, string | null>; warranty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">Specifications</caption>
        <tbody>
          {Object.entries(specs).map(([k, v]) => (
            <tr key={k} className="border-b border-slate-200">
              <th scope="row" className="w-1/2 py-3 pr-4 font-medium text-slate-600">{k}</th>
              <td className="py-3 font-semibold">{v ?? <Tbc />}</td>
            </tr>
          ))}
          {warranty && <tr className="border-b border-slate-200"><th scope="row" className="py-3 pr-4 font-medium text-slate-600">Warranty</th><td className="py-3"><Tbc>WARRANTY TBC</Tbc></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
