import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order | Arabic Shinwari Restaurant" },
      {
        name: "description",
        content:
          "Enter your Arabic Shinwari order number and phone number to see live kitchen and delivery status.",
      },
      { property: "og:title", content: "Track Your Order | Arabic Shinwari Restaurant" },
      { property: "og:description", content: "Live status for your Arabic Shinwari order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

type TrackedOrder = {
  order_number: string;
  status: string;
  fulfillment: string;
  branch_name: string;
  customer_name: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  created_at: string;
  items: { item_name: string; variant_name: string | null; quantity: number; subtotal: number }[];
};

const STEPS = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed"];
const LABELS: Record<string, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  preparing: "In the kitchen",
  ready: "Ready",
  out_for_delivery: "On the way",
  completed: "Completed",
  cancelled: "Cancelled",
};

function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("order");
    if (fromUrl) setOrderNumber(fromUrl);
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    const { data, error: rpcError } = await supabase.rpc("track_order", {
      _order_number: orderNumber,
      _phone: phone,
    });
    setLoading(false);
    if (rpcError) {
      setError("Something went wrong. Please try again.");
      return;
    }
    if (!data) {
      setError("We couldn't find that order. Check the order number and phone number.");
      return;
    }
    setOrder(data as unknown as TrackedOrder);
  }

  const activeIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div>
      <section className="bg-secondary py-14 text-center text-secondary-foreground">
        <p className="text-xs uppercase tracking-[0.4em] text-primary">Order Status</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Track Your Order</h1>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-14">
        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-2">
            <Label htmlFor="order">Order number</Label>
            <Input
              id="order"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="AS-10001"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone number used on the order</Label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03001234567"
            />
          </div>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Checking…" : "Track order"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        {order && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{order.order_number}</h2>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.branch_name} · {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
            </p>

            {order.status !== "cancelled" && (
              <ol className="mt-6 space-y-3">
                {STEPS.filter(
                  (s) => !(order.fulfillment === "pickup" && s === "out_for_delivery"),
                ).map((s) => {
                  const idx = STEPS.indexOf(s);
                  const done = activeIndex >= idx;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${done ? "bg-primary" : "bg-muted-foreground/30"}`}
                      />
                      <span className={done ? "font-medium" : "text-muted-foreground"}>
                        {LABELS[s]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-6 border-t border-border pt-4">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span>
                    {it.quantity} × {it.item_name}
                    {it.variant_name ? ` (${it.variant_name})` : ""}
                  </span>
                  <span>{formatPrice(it.subtotal)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
