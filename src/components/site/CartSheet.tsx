import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { lines, setQty, remove, subtotal } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetTitle className="font-display text-xl">Your Order</SheetTitle>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="-mx-2 flex-1 space-y-3 overflow-y-auto px-2">
              {lines.map((l) => (
                <div key={l.key} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium leading-tight">{l.name}</p>
                      {l.variant_name && (
                        <p className="text-xs text-muted-foreground">{l.variant_name}</p>
                      )}
                      <p className="mt-1 text-sm text-accent-foreground">
                        {formatPrice(l.unit_price)}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(l.key)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${l.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(l.key, l.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(l.key, l.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="font-semibold">{formatPrice(l.unit_price * l.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg">{formatPrice(subtotal)}</span>
              </div>
              <Button asChild className="w-full" size="lg" onClick={() => onOpenChange(false)}>
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
