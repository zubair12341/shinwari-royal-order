import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getBranches } from "@/lib/menu.functions";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a Table | Arabic Shinwari Restaurant" },
      {
        name: "description",
        content:
          "Book a table at Arabic Shinwari Restaurant — family seating, private corners and traditional Shinwari dining at both branches.",
      },
      { property: "og:title", content: "Reserve a Table | Arabic Shinwari Restaurant" },
      { property: "og:description", content: "Book your table for traditional Shinwari dining." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReservePage,
});

function ReservePage() {
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    const { error } = await supabase.from("reservations").insert({
      branch_id: String(fd.get("branch_id")),
      full_name: String(fd.get("full_name")),
      phone: String(fd.get("phone")),
      email: (fd.get("email") as string) || null,
      reservation_date: String(fd.get("date")),
      reservation_time: String(fd.get("time")),
      guests: Number(fd.get("guests")),
      special_request: (fd.get("special_request") as string) || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("We couldn't save your reservation. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Reservation request sent — we'll call you to confirm.");
  }

  return (
    <div>
      <section className="bg-secondary py-14 text-center text-secondary-foreground">
        <p className="text-xs uppercase tracking-[0.4em] text-primary">Dine With Us</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Reserve a Table</h1>
        <p className="mt-3 text-secondary-foreground/80">No Compromise on Taste.</p>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-14">
        {done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="font-display text-2xl">Reservation requested</h2>
            <p className="mt-2 text-muted-foreground">
              Our team will call you shortly to confirm your table.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              Book another table
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-2">
              <Label htmlFor="branch_id">Branch</Label>
              <select
                id="branch_id"
                name="branch_id"
                required
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {(branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.short_name ?? b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required placeholder="03001234567" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guests">Guests</Label>
                <Input id="guests" name="guests" type="number" min={1} defaultValue={4} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="special_request">Special request</Label>
              <Textarea id="special_request" name="special_request" rows={3} />
            </div>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Sending…" : "Request reservation"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
