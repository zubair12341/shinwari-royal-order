import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  fulfillment: string;
  delivery_address: string | null;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

type Item = { order_id: string; item_name: string; variant_name: string | null; quantity: number };

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, fulfillment, delivery_address, total, status, payment_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    const list = (data ?? []) as unknown as Order[];
    setOrders(list);
    if (list.length) {
      const { data: its } = await supabase
        .from("order_items")
        .select("order_id, item_name, variant_name, quantity")
        .in(
          "order_id",
          list.map((o) => o.id),
        );
      setItems((its ?? []) as unknown as Item[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as Order["status"] } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success("Order updated");
  }

  async function togglePaid(o: Order) {
    const next = o.payment_status === "paid" ? "unpaid" : "paid";
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: next } as never)
      .eq("id", o.id);
    if (error) return toast.error(error.message);
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, payment_status: next } : x)));
  }

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading orders…</p>}
      {!loading && shown.length === 0 && (
        <p className="text-sm text-muted-foreground">No orders here yet.</p>
      )}

      <div className="space-y-3">
        {shown.map((o) => (
          <div key={o.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg">{o.order_number}</p>
                <p className="text-sm">
                  {o.customer_name} · {o.customer_phone}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {o.fulfillment}
                  {o.delivery_address ? ` · ${o.delivery_address}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {items
                    .filter((i) => i.order_id === o.id)
                    .map(
                      (i) =>
                        `${i.quantity} x ${i.item_name}${i.variant_name ? ` (${i.variant_name})` : ""}`,
                    )
                    .join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg">{formatPrice(o.total)}</p>
                <button
                  onClick={() => void togglePaid(o)}
                  className={`mt-1 rounded-full px-2 py-0.5 text-[11px] ${
                    o.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {o.payment_status}
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => void setStatus(o.id, s)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] capitalize ${
                    o.status === s
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
