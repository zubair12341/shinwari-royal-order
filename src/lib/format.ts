export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n)}`;
}

export const BRAND = {
  name: "Arabic Shinwari Restaurant",
  slogan: "No Compromise on Taste",
  statement: "The taste of TRADITION",
} as const;
