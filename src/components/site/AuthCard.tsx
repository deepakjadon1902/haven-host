import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/95" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="h-10 w-10 rounded-xl gold-gradient grid place-items-center text-black font-display font-bold">
              M
            </span>
            <span className="font-display text-xl font-semibold">
              Maison<span className="gold-text">Noir</span>
            </span>
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
            Maison Noir Membership
          </p>
          <h2 className="mt-4 font-display text-4xl xl:text-5xl font-semibold leading-tight">
            Quiet luxury, on your terms.
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Save itineraries, unlock member rates, and revisit every reservation in one place.
          </p>
        </motion.div>
        <div className="relative z-10 text-xs text-white/45">
          © {new Date().getFullYear()} Maison Noir Collection
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <span className="h-9 w-9 rounded-xl gold-gradient grid place-items-center text-black font-display font-bold">
              M
            </span>
            <span className="font-display text-lg font-semibold">
              Maison<span className="gold-text">Noir</span>
            </span>
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold">{title}</h1>
          <p className="mt-2 text-white/65">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-white/65">{footer}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}

export const authInputCls =
  "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 h-12 text-sm font-medium outline-none focus:border-gold/60 focus:bg-white/[0.06] transition placeholder:text-white/35";
