/** Placeholder-aware: renders sample label until a real quote is supplied. Ratings stay hidden until real reviews exist. */
export function TestimonialCard({ quote, name, place, sample = true }: { quote: string; name: string; place: string; sample?: boolean }) {
  return (
    <figure className="flex h-full flex-col rounded-card bg-white p-5 ring-1 ring-slate-200">
      {sample && <p className="mb-3 self-start rounded bg-amber-50 px-2 py-0.5 text-[13px] font-semibold text-warning ring-1 ring-amber-200">Sample testimonial — replace with a real customer quote.</p>}
      <blockquote className="flex-1 text-[17px] leading-relaxed">“{quote}”</blockquote>
      <figcaption className="mt-4 text-sm"><span className="font-semibold">{name}</span><span className="text-slate-600"> · {place}</span></figcaption>
    </figure>
  );
}
