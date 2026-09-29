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
        <Button
          size="sm"
          onClick={addToCart}
          disabled={product.out_of_stock || price == null}
        >
          <Plus className="h-4 w-4" />
          {product.out_of_stock ? "Unavailable" : "Add"}
        </Button>
      </div>
      </div>
    </article>
  );
}
