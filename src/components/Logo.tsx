import { Link } from "react-router-dom";

/** HIQ Philippines logo (public/img/hiq-logo.png). An SVG version would stay sharper at large sizes. */
export const LOGO_SRC = "/img/hiq-logo.png";

export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return <img src={LOGO_SRC} width={size} height={size} alt="" className={className} decoding="async" />;
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex min-h-[44px] items-center gap-2" aria-label="HIQ Philippines Shop home">
      <LogoMark />
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-hiq-navy"}`}>Shop</span>
    </Link>
  );
}
