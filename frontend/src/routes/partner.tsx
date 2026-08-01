import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPartnerSession, signOutPartner } from "@/lib/partner-session";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [{ title: "Partner Panel - Haven Host" }],
  }),
  component: PartnerShell,
});

const nav = [
  { to: "/partner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/partner/rooms", label: "My rooms", icon: Package },
  { to: "/partner/inventory", label: "Inventory", icon: CalendarDays },
  { to: "/partner/bookings", label: "Bookings", icon: ShoppingCart },
  { to: "/partner/profile", label: "Profile", icon: Settings },
] as const;

function PartnerShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState(() => getPartnerSession());
  const isLogin = pathname === "/partner/login";

  useEffect(() => {
    const current = getPartnerSession();
    setSession(current);
    if (!isLogin && !current) navigate({ to: "/partner/login" });
  }, [isLogin, navigate, pathname]);

  if (isLogin) return <Outlet />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="sticky top-0 h-screen w-72 border-r border-black/10 bg-white/95 p-5 shadow-elegant">
          <Link to="/" className="flex items-center gap-2">
            <span className="premium-icon grid h-10 w-10 place-items-center rounded-lg">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">
              Partner<span className="text-black/45">Panel</span>
            </span>
          </Link>

          <div className="premium-card mt-8 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-black text-white">
                <Building2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{session.hotelName}</p>
                <p className="truncate text-xs text-black/55">{session.email}</p>
              </div>
            </div>
            <p className="mt-3 rounded-md bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black">
              {session.subscriptionTier} subscription
            </p>
          </div>

          <nav className="mt-6 space-y-1.5">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-transparent text-black hover:border-black/10 hover:bg-black/[0.03]"
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
            className="mt-6 w-full rounded-lg border-black/15 bg-white"
            onClick={() => {
              signOutPartner();
              navigate({ to: "/partner/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 h-16 border-b border-black/10 bg-white/90 backdrop-blur">
            <div className="flex h-full items-center justify-between px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
                  Haven Host
                </p>
                <p className="text-sm font-semibold">{session.hotelName}</p>
              </div>
              <Button asChild variant="outline" className="rounded-lg border-black/15 bg-white">
                <Link to="/rooms" search={{ hotel: session.hotelId } as never}>
                  View public listing
                </Link>
              </Button>
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
