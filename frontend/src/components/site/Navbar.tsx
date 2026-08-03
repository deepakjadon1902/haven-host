import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, LogIn, Menu, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { to: "/hotels", label: "Hotels" },
  { to: "/rooms", label: "Rooms" },
  { to: "/my-bookings", label: "My bookings" },
  { to: "/offers", label: "Offers" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-black/10"
          : "bg-white/85 backdrop-blur border-b border-black/10"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="premium-icon h-9 w-9 rounded-lg">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="font-display text-lg lg:text-xl font-semibold tracking-tight">
            Haven<span className="gold-text">Host</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-gold" : "text-black/70 hover:text-black"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-px bg-gold"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-lg px-5 font-semibold border-black/15 hover:border-gold text-black hover:text-gold"
          >
            <Link to="/login">
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-lg px-5 font-semibold bg-black text-white hover:bg-black/90"
          >
            <Link to="/signup">
              <UserPlus className="h-4 w-4" />
              Sign up
            </Link>
          </Button>
        </div>

        <button
          className="lg:hidden h-10 w-10 grid place-items-center rounded-lg border border-black/10 bg-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden glass-strong border-t border-white/10"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5"
              >
                Sign up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
