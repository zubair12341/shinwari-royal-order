import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon, Phone, ShoppingBag } from "lucide-react";
import { useState } from "react";

import logo from "@/assets/logo-shinwari.png";
import { CartSheet } from "@/components/site/CartSheet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { BRAND } from "@/lib/format";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/branches", label: "Branches" },
  { to: "/reserve", label: "Reserve" },
  { to: "/catering", label: "Catering" },
  { to: "/track", label: "Track Order" },
  { to: "/admin", label: "Staff" },
] as const;

export function Header() {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-secondary text-secondary-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt={`${BRAND.name} logo`} width={48} height={48} className="h-10 w-10 md:h-12 md:w-12" />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base tracking-wide text-primary md:text-lg">
              Arabic Shinwari
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-secondary-foreground/70">
              {BRAND.slogan}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground/85 transition-colors hover:bg-white/10 hover:text-primary [&.active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <a
            href="tel:+923001234567"
            className="hidden items-center gap-2 text-sm text-secondary-foreground/85 hover:text-primary md:flex"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <Button
            variant="default"
            size="sm"
            className="relative"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-semibold text-secondary-foreground ring-2 ring-primary">
                {count}
              </span>
            )}
          </Button>

          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-secondary-foreground" aria-label="Open menu">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-lg">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setNavOpen(false)}
                    className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted [&.active]:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
