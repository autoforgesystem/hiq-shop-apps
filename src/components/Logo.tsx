import { Link } from "react-router-dom";

/** HIQ Philippines logo (public/img/hiq-logo.png). An SVG version would stay sharper at large sizes. */
export const LOGO_SRC = "/img/hiq-logo.png";

const LOGO_RATIO = 1350 / 336; // width / height of the PNG

/** `size` is the rendered height; width follows the logo's proportions. */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return <img src={LOGO_SRC} width={Math.round(size * LOGO_RATIO)} height={size} alt="" className={className} decoding="async" />;
}

export function Logo() {
  return (
    <Link to="/" className="inline-flex min-h-[44px] items-center gap-2" aria-label="HIQ Philippines Shop home">
      <LogoMark />
    </Link>
  );
}
