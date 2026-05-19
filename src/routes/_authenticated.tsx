import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, User as UserIcon, CalendarCheck, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const nav = [
  { to: "/account", label: "Profile", icon: UserIcon },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/saved", label: "Saved", icon: Heart },
] as const;

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: pathname } });
    }
  }, [loading, user, navigate, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        <section className="mx-auto max-w-7xl px-5 lg:px-8 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12"
          >
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-28 self-start">
              <div className="rounded-3xl border border-white/10 p-6 bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gold-gradient grid place-items-center text-black font-display font-bold text-lg">
                    {(user.user_metadata?.full_name ?? user.email ?? "M")
                      .toString()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {user.user_metadata?.full_name || "Member"}
                    </p>
                    <p className="text-xs text-white/55 truncate">{user.email}</p>
                  </div>
                </div>
                <nav className="mt-6 space-y-1">
                  {nav.map((item) => {
                    const active = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition ${
                          active
                            ? "bg-gold/10 text-gold border border-gold/30"
                            : "text-white/75 hover:bg-white/5"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                  className="mt-6 w-full rounded-xl border-white/15 text-white/80 hover:text-white"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </aside>

            <div className="min-w-0">
              <Outlet />
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}