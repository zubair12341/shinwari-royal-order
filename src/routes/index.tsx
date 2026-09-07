import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Leaf, Truck, UtensilsCrossed } from "lucide-react";

import heroImage from "@/assets/hero-karahi.jpg";
import { MenuItemCard } from "@/components/site/MenuItemCard";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/format";
import { getFeatured } from "@/lib/menu.functions";

const featuredQuery = queryOptions({ queryKey: ["featured"], queryFn: () => getFeatured() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arabic Shinwari Restaurant | No Compromise on Taste" },
      {
        name: "description",
        content:
          "Traditional Shinwari karahi, charcoal BBQ, mandi and biryani in Karachi. Order online for delivery or pickup from Neval Hub and Metroville SITE Area.",
      },
      { property: "og:title", content: "Arabic Shinwari Restaurant | No Compromise on Taste" },
      {
        property: "og:description",
        content: "The taste of TRADITION — karahi, BBQ, mandi and biryani. Order online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery),
  component: Home,
  errorComponent: () => (
    <div className="p-24 text-center">We couldn't load the page. Please refresh.</div>
  ),
  notFoundComponent: () => <div className="p-16 text-center">Not found</div>,
});

function Home() {
  const { data: featured } = useSuspenseQuery(featuredQuery);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Traditional Shinwari karahi with charcoal grilled kababs and fresh naan"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-24">
          <p className="text-xs uppercase tracking-[0.5em] text-primary">{BRAND.statement}</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-white sm:text-6xl md:text-7xl">
            Arabic Shinwari
            <span className="block text-primary">Restaurant</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Charcoal-fired karahi, hand-pounded spices and Shinwari recipes carried through
            generations. {BRAND.slogan}.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/menu">Order online</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <Link to="/reserve">Reserve a table</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Flame, title: "Charcoal Fired", text: "Slow-cooked karahi over open flame." },
            { icon: Leaf, title: "Fresh Daily", text: "Meat and spices sourced every morning." },
            { icon: Truck, title: "Fast Delivery", text: "Hot food to your door from both branches." },
            { icon: UtensilsCrossed, title: "Family Dining", text: "Comfortable halls and family seating." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <h3 className="font-display text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">Signature Dishes</p>
          <h2 className="mt-3 font-display text-3xl text-secondary md:text-4xl">
            Chef's Specials & Bestsellers
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((p) => (
            <MenuItemCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="secondary">
            <Link to="/menu">See the full menu</Link>
          </Button>
        </div>
      </section>

      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary">Our Story</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">The taste of TRADITION</h2>
            <p className="mt-5 leading-relaxed text-secondary-foreground/85">
              Shinwari cooking is honest cooking — meat, salt, tomato and fire. We keep it that way,
              from our Neval Hub kitchen on River Road to Metroville SITE Area in Karachi. Every
              karahi is cooked to order, every kabab hand-skewered.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/branches">Visit a branch</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
              >
                <Link to="/catering">Catering & events</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { n: "2", l: "Branches" },
              { n: "200+", l: "Dishes" },
              { n: "100%", l: "Fresh Halal" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/10 p-5">
                <p className="font-display text-3xl text-primary">{s.n}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-secondary-foreground/70">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
