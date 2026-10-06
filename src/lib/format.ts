const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
/** ₱1,234.00 */
export const formatPHP = (n: number) => peso.format(n).replace("PHP", "₱").replace(/\s/g, "");
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
