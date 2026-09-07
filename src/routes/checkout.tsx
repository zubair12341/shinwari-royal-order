import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getBranches } from "@/lib/menu.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Arabic Shinwari Restaurant" },
      {
        name: "description",
        content:
          "Complete your Arabic Shinwari order — choose delivery or pickup from Neval Hub or Metroville SITE Area and pay cash on delivery.",
      },
      { property: "og:title", content: "Checkout | Arabic Shinwari Restaurant" },
      { property: "og:description", content: "Delivery or pickup, cash on delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, subtotal, branchId, setBranchId, fulfillment, setFulfillment, clear } = useCart();
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!branchId && branches && branches.length > 0) setBranchId(branches[0]!.id);
  }, [branches, branchId, setBranchId]);

  const branch = branches?.find((b) => b.id === branchId) ?? null;
  const deliveryFee = fulfillment === "delivery" ? Number(branch?.delivery_fee ?? 0) : 0;
  const total = subtotal + deliveryFee;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    const { data, error } = await supabase.rpc("place_order", {
      payload: {
        branch_id: branchId,
        fulfillment,
        customer_name: String(fd.get("customer_name")),
        customer_phone: String(fd.get("customer_phone")),
        customer_email: (fd.get("customer_email") as string) || null,
        delivery_address: (fd.get("delivery_address") as string) || null,
        delivery_area: (fd.get("delivery_area") as string) || null,
        delivery_landmark: (fd.get("delivery_landmark") as string) || null,
        delivery_instructions: (fd.get("delivery_instructions") as string) || null,
        customer_notes: (fd.get("customer_notes") as string) || null,
        items: lines.map((l) => ({
          product_id: l.product_id,
          variant_id: l.variant_id,
          quantity: l.quantity,
        })),
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "We couldn't place your order. Please try again.");
      return;
    }
    const result = data as unknown as { order_number: string };
    clear();
    toast.success(`Order ${result.order_number} placed!`);
    navigate({ to: "/track", search: { order: result.order_number } as never });
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a few dishes before checking out.</p>
        <Button asChild className="mt-6">
          <Link to="/menu">Browse the menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-secondary py-12 text-center text-secondary-foreground">
        <h1 className="font-display text-4xl">Checkout</h1>
      </section>

      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.3fr_1fr]"
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Branch & fulfilment</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="branch">Branch</Label>
                <select
                  id="branch"
                  value={branchId ?? ""}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {(branches ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.short_name ?? b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Order type</Label>
                <div className="flex gap-2">
                  {(["delivery", "pickup"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFulfillment(f)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize ${
                        fulfillment === f
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Full name</Label>
                <Input id="customer_name" name="customer_name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_phone">Phone</Label>
                <Input id="customer_phone" name="customer_phone" required placeholder="03001234567" />
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Label htmlFor="customer_email">Email (optional)</Label>
              <Input id="customer_email" name="customer_email" type="email" />
            </div>
          </div>

          {fulfillment === "delivery" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl">Delivery address</h2>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="delivery_address">Address</Label>
                  <Input id="delivery_address" name="delivery_address" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="delivery_area">Area</Label>
                    <Input id="delivery_area" name="delivery_area" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="delivery_landmark">Landmark</Label>
                    <Input id="delivery_landmark" name="delivery_landmark" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="delivery_instructions">Instructions for the rider</Label>
                  <Textarea id="delivery_instructions" name="delivery_instructions" rows={2} />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6">
            <Label htmlFor="customer_notes">Notes for the kitchen</Label>
            <Textarea id="customer_notes" name="customer_notes" rows={3} className="mt-2" />
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="mt-4 space-y-2">
            {lines.map((l) => (
              <div key={l.key} className="flex justify-between gap-3 text-sm">
                <span>
                  {l.quantity} × {l.name}
                  {l.variant_name ? ` (${l.variant_name})` : ""}
                </span>
                <span className="shrink-0">{formatPrice(l.unit_price * l.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {fulfillment === "delivery" ? "Delivery" : "Pickup"}
              </span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-display text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Payment: {fulfillment === "delivery" ? "Cash on delivery" : "Pay at pickup"}.
          </p>
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
