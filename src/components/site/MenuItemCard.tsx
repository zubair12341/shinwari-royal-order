import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { MenuProduct } from "@/lib/menu.functions";

export function MenuItemCard({
  product,
  fallbackImage,
}: {
  product: MenuProduct;
  fallbackImage?: string | null | undefined;
}) {
  const { add } = useCart();
  const variants = product.product_variants ?? [];
  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const price = variant ? variant.price : product.base_price;
  const image = product.image_url || fallbackImage || null;

  const badges = [
    product.is_chef_special && "Chef's Special",
    product.is_bestseller && "Bestseller",
    product.is_popular && "Popular",
    product.is_new && "New",
  ].filter(Boolean) as string[];

  function addToCart() {
    if (price == null) {
      toast.error("Please choose an option first");
      return;
    }
    add({
      product_id: product.id,
      variant_id: variant?.id ?? null,
      name: product.name,
      variant_name: variant?.name ?? null,
      unit_price: Number(price),
    });
    toast.success(`${product.name} added to your order`);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      {image && (
        <img
          src={image}
          alt={product.name}
          width={1024}
          height={683}
          loading="lazy"
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg leading-snug">{product.name}</h3>
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
          )}
          {product.includes && product.includes.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Includes: {product.includes.join(", ")}
            </p>
          )}
        </div>
        <span className="shrink-0 font-display text-lg text-secondary">
          {price != null ? formatPrice(price) : product.price_note || "—"}
        </span>
      </div>

      {badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <Badge key={b} variant="secondary" className="text-[10px] uppercase tracking-wide">
              {b}
            </Badge>
          ))}
        </div>
      )}

      {variants.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                v.id === variantId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {v.name} · {formatPrice(v.price)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        {product.price_note && variants.length === 0 && (
          <span className="text-xs text-muted-foreground">{product.price_note}</span>
        )}
        <Button
          size="sm"
          className="ml-auto"
          onClick={addToCart}
          disabled={product.out_of_stock || price == null}
        >
          <Plus className="h-4 w-4" />
          {product.out_of_stock ? "Unavailable" : "Add"}
        </Button>
      </div>
    </article>
  );
}
