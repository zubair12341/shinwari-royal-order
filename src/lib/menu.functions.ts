import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type Branch = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  address: string | null;
  area: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  maps_url: string | null;
  opening_time: string | null;
  closing_time: string | null;
  delivery_available: boolean;
  pickup_available: boolean;
  delivery_fee: number;
  is_open: boolean;
};

export type Variant = { id: string; name: string; price: number; sort_order: number };

export type MenuProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  includes: string[] | null;
  base_price: number | null;
  price_note: string | null;
  image_url: string | null;
  is_popular: boolean;
  is_chef_special: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  out_of_stock: boolean;
  category_id: string;
  sort_order: number;
  product_variants: Variant[];
};

export type MenuCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  products: MenuProduct[];
};

export const getBranches = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("branches")
    .select(
      "id, slug, name, short_name, address, area, city, phone, whatsapp, maps_url, opening_time, closing_time, delivery_available, pickup_available, delivery_fee, is_open",
    )
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Branch[];
});

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [cats, prods] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select(
        "id, slug, name, description, includes, base_price, price_note, image_url, is_popular, is_chef_special, is_bestseller, is_new, out_of_stock, category_id, sort_order, product_variants(id, name, price, sort_order, is_active)",
      )
      .eq("is_active", true)
      .order("sort_order"),
  ]);
  if (cats.error) throw new Error(cats.error.message);
  if (prods.error) throw new Error(prods.error.message);

  const byCat = new Map<string, MenuProduct[]>();
  for (const raw of prods.data ?? []) {
    const p = raw as unknown as MenuProduct & {
      product_variants: (Variant & { is_active: boolean })[];
    };
    const product: MenuProduct = {
      ...p,
      product_variants: (p.product_variants ?? [])
        .filter((v) => v.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(({ id, name, price, sort_order }) => ({ id, name, price: Number(price), sort_order })),
    };
    const list = byCat.get(product.category_id) ?? [];
    list.push(product);
    byCat.set(product.category_id, list);
  }

  return ((cats.data ?? []) as unknown as MenuCategory[])
    .map((c) => ({ ...c, products: byCat.get(c.id) ?? [] }))
    .filter((c) => c.products.length > 0);
});

export const getFeatured = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select(
      "id, slug, name, description, base_price, price_note, image_url, is_popular, is_chef_special, is_bestseller, category_id, product_variants(id, name, price, sort_order, is_active)",
    )
    .eq("is_active", true)
    .or("is_featured.eq.true,is_chef_special.eq.true,is_bestseller.eq.true")
    .order("sort_order")
    .limit(8);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MenuProduct[];
});
