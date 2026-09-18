import type { CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export const WHATSAPP_NUMBERS = [
  { label: "Neval Hub, River Road", number: "923480238699" },
  { label: "Metroville SITE Area", number: "923112311010" },
] as const;

export const DEFAULT_WHATSAPP = WHATSAPP_NUMBERS[0].number;

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function cartMessage(
  lines: CartLine[],
  opts: {
    branchName?: string | null | undefined;
    fulfillment?: string | undefined;
    subtotal?: number | undefined;
  } = {},
): string {
  const items = lines
    .map(
      (l) =>
        `• ${l.quantity} x ${l.name}${l.variant_name ? ` (${l.variant_name})` : ""} — ${formatPrice(
          l.unit_price * l.quantity,
        )}`,
    )
    .join("\n");

  return [
    "Assalam-o-Alaikum! I'd like to place an order from Arabic Shinwari Restaurant.",
    "",
    items || "(I'll share my order details here)",
    opts.subtotal ? `\nSubtotal: ${formatPrice(opts.subtotal)}` : "",
    opts.branchName ? `Branch: ${opts.branchName}` : "",
    opts.fulfillment ? `Order type: ${opts.fulfillment}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function itemMessage(name: string, variant?: string | null): string {
  return `Assalam-o-Alaikum! I'd like to order ${name}${variant ? ` (${variant})` : ""} from Arabic Shinwari Restaurant.`;
}

export function reservationMessage(d: {
  branchName: string;
  full_name: string;
  phone: string;
  date: string;
  time: string;
  guests: string | number;
  special_request?: string;
}): string {
  return [
    "Assalam-o-Alaikum! I'd like to reserve a table at Arabic Shinwari Restaurant.",
    "",
    `Branch: ${d.branchName}`,
    `Name: ${d.full_name}`,
    `Phone: ${d.phone}`,
    `Date: ${d.date}`,
    `Time: ${d.time}`,
    `Guests: ${d.guests}`,
    d.special_request ? `Special request: ${d.special_request}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
