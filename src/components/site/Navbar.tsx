import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
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
          <span className="h-9 w-9 rounded-xl gold-gradient grid place-items-center text-black font-display font-bold">
            M
          </span>
          <span className="font-display text-lg lg:text-xl font-semibold tracking-tight">
            Maison<span className="gold-text">Noir</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
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
          <button
            aria-label="Search"
            className="h-10 w-10 grid place-items-center rounded-full border border-black/15 hover:border-gold hover:text-gold transition"
          >
            <Search className="h-4 w-4" />
          </button>
          {user ? (
            <Button asChild variant="outline" className="rounded-full px-5 font-semibold border-black/15 hover:border-gold text-black hover:text-gold">
              <Link to="/account"><User className="h-4 w-4" /> Account</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="rounded-full px-5 font-semibold border-black/15 hover:border-gold text-black hover:text-gold">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild className="rounded-full px-5 font-semibold">
            <Link to="/rooms">Book a stay</Link>
          </Button>
        </div>

        <button
          className="lg:hidden h-10 w-10 grid place-items-center rounded-full border border-white/10"
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
                to={user ? "/account" : "/login"}
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5"
              >
                {user ? "My account" : "Sign in"}
              </Link>
              <Button asChild className="mt-2 rounded-full font-semibold">
                <Link to="/rooms">Book a stay</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
