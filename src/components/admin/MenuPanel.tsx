import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

type Category = { id: string; name: string; slug: string; image_url: string | null; is_active: boolean };
type Product = {
  id: string;
  category_id: string;
  name: string;
  base_price: number | null;
  image_url: string | null;
  is_active: boolean;
  out_of_stock: boolean;
  is_featured: boolean;
};

export function MenuPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catId, setCatId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from("categories").select("id, name, slug, image_url, is_active").order("sort_order"),
      supabase
        .from("products")
        .select("id, category_id, name, base_price, image_url, is_active, out_of_stock, is_featured")
        .order("sort_order"),
    ]);
    if (c.error) toast.error(c.error.message);
    if (p.error) toast.error(p.error.message);
    setCategories((c.data ?? []) as unknown as Category[]);
    setProducts((p.data ?? []) as unknown as Product[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patchProduct(id: string, patch: Partial<Product>) {
    const { error } = await supabase.from("products").update(patch as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    toast.success("Saved");
  }

  async function patchCategory(id: string, patch: Partial<Category>) {
    const { error } = await supabase.from("categories").update(patch as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCategories((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    toast.success("Saved");
  }

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) => (!catId || p.category_id === catId) && (!term || p.name.toLowerCase().includes(term)),
    );
  }, [products, catId, q]);

  const category = categories.find((c) => c.id === catId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dishes…"
          className="max-w-xs"
        />
        <select
          value={catId ?? ""}
          onChange={(e) => setCatId(e.target.value || null)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All sections</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {category && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
          {category.image_url && (
            <img src={category.image_url} alt="" className="h-12 w-16 rounded object-cover" />
          )}
          <span className="text-sm font-medium">{category.name} photo</span>
          <Input
            defaultValue={category.image_url ?? ""}
            placeholder="Image link"
            className="max-w-md"
            onBlur={(e) => {
              if (e.target.value !== (category.image_url ?? ""))
                void patchCategory(category.id, { image_url: e.target.value || null });
            }}
          />
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading menu…</p>}

      <div className="space-y-2">
        {shown.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            {p.image_url && <img src={p.image_url} alt="" className="h-12 w-16 rounded object-cover" />}
            <div className="min-w-40 flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.base_price != null ? formatPrice(p.base_price) : "Priced by option"}
              </p>
            </div>
            <Input
              type="number"
              defaultValue={p.base_price ?? ""}
              placeholder="Price"
              className="w-28"
              onBlur={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                if (v !== p.base_price) void patchProduct(p.id, { base_price: v });
              }}
            />
            <Input
              defaultValue={p.image_url ?? ""}
              placeholder="Photo link"
              className="w-56"
              onBlur={(e) => {
                if (e.target.value !== (p.image_url ?? ""))
                  void patchProduct(p.id, { image_url: e.target.value || null });
              }}
            />
            <button
              onClick={() => void patchProduct(p.id, { out_of_stock: !p.out_of_stock })}
              className={`rounded-full border px-3 py-1 text-xs ${
                p.out_of_stock ? "border-destructive text-destructive" : "border-border"
              }`}
            >
              {p.out_of_stock ? "Out of stock" : "In stock"}
            </button>
            <button
              onClick={() => void patchProduct(p.id, { is_active: !p.is_active })}
              className={`rounded-full border px-3 py-1 text-xs ${
                p.is_active ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {p.is_active ? "Visible" : "Hidden"}
            </button>
            <button
              onClick={() => void patchProduct(p.id, { is_featured: !p.is_featured })}
              className={`rounded-full border px-3 py-1 text-xs ${
                p.is_featured ? "border-secondary text-secondary" : "border-border"
              }`}
            >
              {p.is_featured ? "Featured" : "Feature"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
