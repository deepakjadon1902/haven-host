import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, Package, Settings, ShoppingCart } from "lucide-react";
import { adminDashboardStats } from "@/lib/admin.functions";
import { hotels } from "@/data/hotels";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard — Admin Panel" }],
  }),
  component: AdminDashboard,
});

type Stats = Awaited<ReturnType<typeof adminDashboardStats>>;

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.chart.map((x) => ({
      date: x.date.slice(5), // MM-DD
      bookings: x.count,
    }));
  }, [stats]);
  const maxBookings = Math.max(1, ...chartData.map((x) => x.bookings));

  if (loading) {
    return (
      <div className="grid place-items-center rounded-3xl border border-black/10 bg-white p-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/15 border-t-black" />
        <p className="mt-3 text-sm text-black/60">Loading dashboard…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-10 text-center text-sm text-black/70">
        Failed to load statistics.
      </div>
    );
  }

  const statCards = [
    { label: "Partner hotels", value: hotels.length },
    { label: "Total rooms", value: stats.totalRooms },
    { label: "Units (active)", value: stats.totalUnits },
    { label: "Bookings (30d)", value: stats.totalBookings30d },
    { label: "Occupancy today", value: `${stats.occupancyPct}%` },
    { label: "Revenue (30d)", value: `₹${(stats.revenue30dCents / 100).toLocaleString("en-IN")}` },
  ];

  const quick = [
    { to: "/admin/rooms", label: "Manage rooms", icon: Package },
    { to: "/admin/calendar", label: "Manage inventory", icon: Calendar },
    { to: "/admin/bookings", label: "View bookings", icon: ShoppingCart },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
            Overview
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/60">
            A calm, high-signal view of rooms, bookings, and occupancy. Use Quick Actions to jump
            straight into admin tasks.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-black/10 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
              {s.label}
            </p>
            <p className="mt-3 font-display text-3xl font-semibold text-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-black/10 bg-white p-6 lg:col-span-2"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-black">
              Bookings (last 14 days)
            </h2>
            <div className="text-xs font-semibold uppercase tracking-wider text-black/50">
              Trend
            </div>
          </div>
          <div className="flex h-80 items-end gap-3 border-b border-l border-black/10 px-3 pt-8">
            {chartData.map((item) => (
              <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-60 w-full items-end rounded-t-lg bg-black/[0.03]">
                  <div
                    className="w-full rounded-t-lg bg-black transition-[height]"
                    style={{ height: `${Math.max(6, (item.bookings / maxBookings) * 100)}%` }}
                    title={`${item.bookings} bookings`}
                  />
                </div>
                <span className="text-[11px] font-medium text-black/55">{item.date}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-3xl border border-black/10 bg-white p-6"
        >
          <h2 className="font-display text-xl font-semibold tracking-tight text-black">
            Quick actions
          </h2>
          <div className="mt-5 grid gap-2.5">
            {quick.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-black/[0.03]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  {q.label}
                </Link>
              );
            })}
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-black/10 bg-white p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-black">
            Upcoming check-ins
          </h2>
          <div className="text-xs font-semibold uppercase tracking-wider text-black/50">
            {stats.upcoming.length} arrivals
          </div>
        </div>

        {stats.upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-black/60">No upcoming check-ins.</p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stats.upcoming.map((b) => (
              <div key={b.id} className="rounded-2xl border border-black/10 bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-black">{b.reference}</div>
                  <div className="rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-black/60">
                    {b.status}
                  </div>
                </div>
                <div className="mt-2 text-sm text-black">
                  {b.guest_full_name} <span className="text-black/35">•</span> {b.room_type_name}
                </div>
                <div className="mt-1.5 text-xs text-black/60">
                  {new Date(b.check_in).toLocaleDateString()} →{" "}
                  {new Date(b.check_out).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
