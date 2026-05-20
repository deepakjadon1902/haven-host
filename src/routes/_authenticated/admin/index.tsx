import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Package, Settings, ShoppingCart } from "lucide-react";
import { adminDashboardStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
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

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
        <p className="text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-700">
        <p>Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Rooms", value: stats.totalRooms },
    { label: "Total Units (active)", value: stats.totalUnits },
    { label: "Bookings (30d)", value: stats.totalBookings30d },
    { label: "Occupancy Today", value: `${stats.occupancyPct}%` },
    { label: "Revenue (30d)", value: `₹${(stats.revenue30dCents / 100).toLocaleString("en-IN")}` },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-8 text-4xl font-bold text-black">Dashboard</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border-2 border-black bg-white p-6"
            >
              <p className="mb-1 text-sm font-bold text-gray-700">{s.label}</p>
              <p className="text-3xl font-bold text-black">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-lg border-2 border-black bg-white p-6"
        >
          <h2 className="mb-6 text-2xl font-bold text-black">Bookings (Last 14 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="date" stroke="#111827" />
              <YAxis stroke="#111827" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "2px solid #000" }} />
              <Bar dataKey="bookings" fill="#111827" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg border-2 border-black bg-white p-6"
          >
            <h2 className="mb-4 text-2xl font-bold text-black">Upcoming Check-ins</h2>
            {stats.upcoming.length === 0 ? (
              <p className="text-gray-700">No upcoming check-ins.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcoming.map((b) => (
                  <div key={b.id} className="rounded border border-black/10 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-black">{b.reference}</div>
                      <div className="text-xs font-bold text-gray-700 capitalize">{b.status}</div>
                    </div>
                    <div className="mt-1 text-sm text-black">
                      {b.guest_full_name} • {b.room_type_name}
                    </div>
                    <div className="mt-1 text-xs text-gray-700">
                      {new Date(b.check_in).toLocaleDateString()} → {new Date(b.check_out).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border-2 border-black bg-white p-6"
          >
            <h2 className="mb-4 text-2xl font-bold text-black">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                to="/admin/rooms"
                className="flex items-center gap-3 rounded border-2 border-black bg-white px-4 py-3 font-bold text-black hover:bg-gray-50"
              >
                <Package className="h-5 w-5" />
                Manage Rooms
              </Link>
              <Link
                to="/admin/calendar"
                className="flex items-center gap-3 rounded border-2 border-black bg-white px-4 py-3 font-bold text-black hover:bg-gray-50"
              >
                <Calendar className="h-5 w-5" />
                Manage Inventory
              </Link>
              <Link
                to="/admin/bookings"
                className="flex items-center gap-3 rounded border-2 border-black bg-white px-4 py-3 font-bold text-black hover:bg-gray-50"
              >
                <ShoppingCart className="h-5 w-5" />
                View Bookings
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 rounded border-2 border-black bg-white px-4 py-3 font-bold text-black hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

