import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Building2,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel - Haven Host" }],
  }),
  component: AdminShell,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const nav: readonly NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/rooms", label: "Rooms", icon: Package },
  { to: "/admin/calendar", label: "Inventory", icon: Calendar },
  { to: "/admin/bookings", label: "Bookings", icon: ShoppingCart },
  { to: "/admin/partners", label: "Partners", icon: UserPlus },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/partner", label: "Partner panel", icon: Crown },
] as const;

function AdminShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    if (loading) return;

    if (!user || user.role !== "admin") {
      navigate({ to: "/admin/login", search: { redirect: pathname } });
    }
  }, [isLogin, loading, user, navigate, pathname]);

  const active = useMemo(() => {
    return (to: string, exact?: boolean) =>
      exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  }, [pathname]);

  if (isLogin) return <Outlet />;

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen grid place-items-center bg-[#fafafa] text-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/15 border-t-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${
            sidebarOpen ? "w-72" : "w-[88px]"
          } sticky top-0 h-screen border-r border-black/10 bg-white/95 shadow-elegant transition-[width] duration-300`}
        >
          <div className="flex h-16 items-center justify-between gap-3 border-b border-black/10 px-5">
            <Link
              to="/"
              className={`flex items-center gap-2 ${sidebarOpen ? "" : "justify-center w-full"}`}
            >
              <span className="premium-icon grid h-9 w-9 place-items-center rounded-lg">
                <Building2 className="h-5 w-5" />
              </span>
              {sidebarOpen ? (
                <span className="font-display text-base font-semibold tracking-tight">
                  Haven<span className="text-black/50">Admin</span>
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-black hover:bg-black/[0.03]"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          <div className="px-5 py-5">
            <div className={`premium-card rounded-lg p-4 ${sidebarOpen ? "" : "p-3"}`}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-black text-white font-display font-bold">
                  {(user.email ?? "A").toString().charAt(0).toUpperCase()}
                </div>
                {sidebarOpen ? (
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">Administrator</p>
                    <p className="mt-0.5 truncate text-xs text-black/60">{user.email}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <nav className="mt-5 space-y-1.5">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = active(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-black/15 bg-black text-white"
                        : "border-transparent bg-white text-black hover:border-black/10 hover:bg-black/[0.03]"
                    } ${sidebarOpen ? "" : "justify-center px-3"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                );
              })}
            </nav>

            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate({ to: "/admin/login" });
              }}
              className={`mt-6 w-full rounded-lg border-black/15 bg-white text-black hover:bg-black/[0.03] ${
                sidebarOpen ? "" : "px-0"
              }`}
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen ? "Sign out" : null}
            </Button>
          </div>
        </motion.aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 h-16 border-b border-black/10 bg-white/90 backdrop-blur">
            <div className="flex h-full items-center justify-between px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
                  Haven Host
                </p>
                <p className="text-sm font-semibold">Admin</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border-black/15 bg-white text-black hover:bg-black/[0.03]"
                >
                  <Link to="/">View site</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
