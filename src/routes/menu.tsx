import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { MenuItemCard } from "@/components/site/MenuItemCard";
import { Input } from "@/components/ui/input";
import { getMenu } from "@/lib/menu.functions";

const menuQuery = queryOptions({ queryKey: ["menu"], queryFn: () => getMenu() });

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu | Arabic Shinwari Restaurant" },
      {
        name: "description",
        content:
          "Explore the full Arabic Shinwari menu — karahi, handi, BBQ, mandi, biryani, broast and more. Order online for delivery or pickup.",
      },
      { property: "og:title", content: "Menu | Arabic Shinwari Restaurant" },
      {
        property: "og:description",
        content: "Charcoal karahi, BBQ, mandi and biryani. Order online for delivery or pickup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(menuQuery),
  component: MenuPage,
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl">We couldn't load the menu</h1>
      <p className="mt-2 text-muted-foreground">Please refresh the page and try again.</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-16 text-center">Not found</div>,
});

function MenuPage() {
  const { data: categories } = useSuspenseQuery(menuQuery);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => !active || c.id === active)
      .map((c) => ({
        ...c,
        products: q
          ? c.products.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.description ?? "").toLowerCase().includes(q),
            )
          : c.products,
      }))
      .filter((c) => c.products.length > 0);
  }, [categories, query, active]);

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-secondary py-14 text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">Our Kitchen</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">The Full Menu</h1>
          <p className="mt-3 text-secondary-foreground/80">The taste of TRADITION, plate by plate.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="sticky top-16 z-30 -mx-4 bg-background/95 px-4 py-3 backdrop-blur md:top-20">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="mx-auto max-w-lg"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActive(null)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${
                active === null ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${
                  active === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">No dishes matched your search.</p>
        )}

        {filtered.map((c) => (
          <section key={c.id} id={c.slug} className="scroll-mt-40 py-8">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl text-secondary md:text-3xl">{c.name}</h2>
              <span className="h-px flex-1 gold-rule" />
            </div>
            {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {c.products.map((p) => (
                <MenuItemCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
