import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, signOut } = useAuth();
  const displayName = user?.fullName || user?.email?.split("@")[0] || "Profile";

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-11 max-w-64 items-center gap-3 rounded-lg border border-black/10 bg-white px-3 text-left shadow-sm transition hover:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-black text-xs font-semibold uppercase text-white">
                    {displayName.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-black">
                      {displayName}
                    </span>
                    <span className="block truncate text-xs text-black/50">{user.email}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-black/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-lg border-black/10 p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <span className="block truncate text-sm font-semibold text-black">
                    {displayName}
                  </span>
                  <span className="block truncate text-xs font-normal text-black/50">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2">
                  <Link to="/profile">
                    <UserRound className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2">
                  <Link to="/my-bookings">
                    <CalendarDays className="h-4 w-4" />
                    My bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-md px-3 py-2 text-red-600 focus:text-red-600"
                  onClick={() => void signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="rounded-lg border-black/15 px-5 font-semibold text-black hover:border-gold hover:text-gold"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-lg bg-black px-5 font-semibold text-white hover:bg-black/90"
              >
                <Link to="/signup">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Link>
              </Button>
            </>
          )}
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
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/5"
                  >
                    <UserRound className="h-4 w-4" />
                    <span className="truncate">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-white/5"
                    onClick={() => void signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
