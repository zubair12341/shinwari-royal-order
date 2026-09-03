import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

import logo from "@/assets/logo-shinwari.png";
import { BRAND } from "@/lib/format";

export function Footer() {
  return (
    <footer className="mt-20 bg-secondary text-secondary-foreground">
      <div className="h-1 w-full gold-rule" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt={`${BRAND.name} logo`} loading="lazy" width={56} height={56} className="h-14 w-14" />
            <div>
              <p className="font-display text-xl text-primary">Arabic Shinwari</p>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary-foreground/70">
                {BRAND.slogan}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-secondary-foreground/80">
            Charcoal-fired karahi, hand-pounded spices and Shinwari recipes carried through
            generations. {BRAND.statement}.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg text-primary">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-secondary-foreground/80">
            {[
              { to: "/menu", label: "Full Menu" },
              { to: "/branches", label: "Our Branches" },
              { to: "/reserve", label: "Table Reservation" },
              { to: "/catering", label: "Catering & Events" },
              { to: "/track", label: "Track Your Order" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-primary">Visit Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Neval Hub, River Road
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Metroville SITE Area, Karachi
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Open daily, 12:00 PM – 2:00 AM
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <a href="tel:+923001234567" className="hover:text-primary">
                +92 300 1234567
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-secondary-foreground/60">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
