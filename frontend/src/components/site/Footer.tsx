import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gold-gradient font-display font-bold text-black">
              M
            </span>
            <span className="font-display text-xl font-semibold text-black">
              Maison<span className="gold-text">Noir</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-700">
            A single-hotel booking system with owner-controlled inventory, transparent pricing, and
            calendar-aligned availability.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-black transition hover:border-gold hover:text-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { to: "/rooms", label: "Rooms" },
            { to: "/offers", label: "Offers" },
            { to: "/gallery", label: "Gallery" },
            { to: "/journal", label: "Journal" },
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
            { to: "/legal", label: "Legal" },
            { to: "/terms", label: "Terms" },
            { to: "/privacy", label: "Privacy" },
            { to: "/refund-policy", label: "Refund Policy" },
          ]}
        />
      </div>

      <div className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-gray-700 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Maison Noir. All rights reserved.</p>
          <p>Crafted with care · Vrindavan</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-gold">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-gray-700 transition-colors hover:text-black">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
