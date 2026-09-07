import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBranches } from "@/lib/menu.functions";

const branchesQuery = queryOptions({ queryKey: ["branches"], queryFn: () => getBranches() });

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Our Branches | Arabic Shinwari Restaurant" },
      {
        name: "description",
        content:
          "Visit Arabic Shinwari at Neval Hub River Road or Metroville SITE Area, Karachi. Dine in, pickup or delivery.",
      },
      { property: "og:title", content: "Our Branches | Arabic Shinwari Restaurant" },
      {
        property: "og:description",
        content: "Two branches serving traditional Shinwari karahi and BBQ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(branchesQuery),
  component: BranchesPage,
  errorComponent: () => (
    <div className="p-24 text-center">We couldn't load branch details. Please refresh.</div>
  ),
  notFoundComponent: () => <div className="p-16 text-center">Not found</div>,
});

function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${suffix}`;
}

function BranchesPage() {
  const { data: branches } = useSuspenseQuery(branchesQuery);

  return (
    <div>
      <section className="bg-secondary py-14 text-center text-secondary-foreground">
        <p className="text-xs uppercase tracking-[0.4em] text-primary">Find Us</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Our Branches</h1>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2">
        {branches.map((b) => (
          <article key={b.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-2xl text-secondary">{b.short_name ?? b.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{b.name}</p>

            <ul className="mt-5 space-y-3 text-sm">
              {b.address && (
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    {b.address}
                    {b.city ? `, ${b.city}` : ""}
                  </span>
                </li>
              )}
              {(b.opening_time || b.closing_time) && (
                <li className="flex gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    {formatTime(b.opening_time)} – {formatTime(b.closing_time)}
                  </span>
                </li>
              )}
              {b.phone && (
                <li className="flex gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <a href={`tel:${b.phone}`} className="hover:text-primary">
                    {b.phone}
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-3 py-1">
                {b.delivery_available ? "Delivery available" : "No delivery"}
              </span>
              <span className="rounded-full bg-muted px-3 py-1">
                {b.pickup_available ? "Pickup available" : "No pickup"}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${b.is_open ? "bg-primary/20 text-secondary" : "bg-destructive/15 text-destructive"}`}
              >
                {b.is_open ? "Open now" : "Currently closed"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/menu">Order from here</Link>
              </Button>
              {b.maps_url && (
                <Button asChild variant="outline">
                  <a href={b.maps_url} target="_blank" rel="noreferrer">
                    Get directions
                  </a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
