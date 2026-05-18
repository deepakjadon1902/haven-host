import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10 bg-[color-mix(in_oklab,var(--surface)_60%,black)]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl gold-gradient grid place-items-center text-black font-display font-bold">
              M
            </span>
            <span className="font-display text-xl font-semibold">
              Maison<span className="gold-text">Noir</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-white/70 max-w-sm leading-relaxed">
            A curated collection of design-led hotels. Real-time inventory, transparent rates,
            zero noise — the way booking should feel.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-10 w-10 grid place-items-center rounded-full border border-white/10 hover:border-gold hover:text-gold transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { to: "/hotels", label: "All Hotels" },
            { to: "/offers", label: "Offers" },
            { to: "/gallery", label: "Gallery" },
            { to: "/blogs", label: "Journal" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/faq", label: "FAQ" },
            { to: "/testimonials", label: "Testimonials" },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { to: "/terms", label: "Terms" },
            { to: "/privacy", label: "Privacy" },
            { to: "/refund", label: "Refund Policy" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Maison Noir Hospitality. All rights reserved.</p>
          <p>Crafted with care · Vrindavan · Marrakech · Kyoto · Positano</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold tracking-widest uppercase text-gold">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-white/75 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
