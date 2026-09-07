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

export const Route = createFileRoute("/catering")({
  head: () => ({
    meta: [
      { title: "Catering & Events | Arabic Shinwari Restaurant" },
      {
        name: "description",
        content:
          "Shinwari karahi, sajji, mandi and BBQ catering for weddings, corporate events and family gatherings across Karachi.",
      },
      { property: "og:title", content: "Catering & Events | Arabic Shinwari Restaurant" },
      {
        property: "og:description",
        content: "Live BBQ counters and traditional degs for your event.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CateringPage,
});

function CateringPage() {
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    const { error } = await supabase.from("catering_requests").insert({
      branch_id: (fd.get("branch_id") as string) || null,
      full_name: String(fd.get("full_name")),
      phone: String(fd.get("phone")),
      email: (fd.get("email") as string) || null,
      event_date: String(fd.get("event_date")),
      event_time: (fd.get("event_time") as string) || null,
      guests: fd.get("guests") ? Number(fd.get("guests")) : null,
      event_type: (fd.get("event_type") as string) || null,
      venue: (fd.get("venue") as string) || null,
      service_type: (fd.get("service_type") as string) || null,
      requirements: (fd.get("requirements") as string) || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("We couldn't send your request. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Catering request sent — our team will contact you.");
  }

  return (
    <div>
      <section className="bg-secondary py-14 text-center text-secondary-foreground">
        <p className="text-xs uppercase tracking-[0.4em] text-primary">Events</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Catering & Events</h1>
        <p className="mt-3 text-secondary-foreground/80">
          Degs, live BBQ counters and full-service catering.
        </p>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-2xl text-secondary">What we cater</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {[
              "Weddings, mehndi and walima functions",
              "Corporate lunches and office events",
              "Birthday and family gatherings",
              "Live BBQ and sajji counters on site",
              "Traditional degs: karahi, biryani, mandi",
              "Full service with staff, crockery and setup",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="font-display text-2xl">Request received</h2>
            <p className="mt-2 text-muted-foreground">
              Our catering team will contact you with a tailored quote.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              Send another request
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch_id">Nearest branch</Label>
                <select
                  id="branch_id"
                  name="branch_id"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No preference</option>
                  {(branches ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.short_name ?? b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="event_date">Event date</Label>
                <Input id="event_date" name="event_date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event_time">Time</Label>
                <Input id="event_time" name="event_time" type="time" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guests">Guests</Label>
                <Input id="guests" name="guests" type="number" min={1} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="event_type">Event type</Label>
                <Input id="event_type" name="event_type" placeholder="Wedding, corporate…" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service_type">Service type</Label>
                <select
                  id="service_type"
                  name="service_type"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="delivery">Food delivery only</option>
                  <option value="live_counter">Live BBQ counter</option>
                  <option value="full_service">Full service with staff</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" name="venue" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" rows={4} />
            </div>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Sending…" : "Request a quote"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
