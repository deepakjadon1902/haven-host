import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminCancelBooking, adminListBookings } from "@/lib/admin.functions";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type AdminBooking = {
  id: string;
  reference: string;
  hotel_name: string;
  room_type_name: string;
  room_id: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  guest_full_name: string;
  guest_email: string;
  guest_phone: string;
  total_cents: number;
  currency: string;
  status: BookingStatus;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  head: () => ({
    meta: [{ title: "Bookings Management — Admin Panel" }],
  }),
  component: AdminBookings,
});

function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = (await adminListBookings()) as AdminBooking[];
        setBookings(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await adminCancelBooking({ id });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      toast.success("Booking cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
        <p className="text-gray-700">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-black">Bookings Management</h1>
          <div className="text-sm text-gray-700">
            Showing <span className="font-bold text-black">{filtered.length}</span> booking{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              type="button"
              className={`rounded px-4 py-2 font-bold capitalize transition ${
                filter === status ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="px-4 py-3 text-left font-bold text-black">Reference</th>
                <th className="px-4 py-3 text-left font-bold text-black">Guest</th>
                <th className="px-4 py-3 text-left font-bold text-black">Room</th>
                <th className="px-4 py-3 text-left font-bold text-black">Dates</th>
                <th className="px-4 py-3 text-left font-bold text-black">Amount</th>
                <th className="px-4 py-3 text-left font-bold text-black">Status</th>
                <th className="px-4 py-3 text-left font-bold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => {
                const statusClass =
                  b.status === "confirmed"
                    ? "bg-green-200 text-green-900"
                    : b.status === "pending"
                      ? "bg-yellow-200 text-yellow-900"
                      : b.status === "completed"
                        ? "bg-blue-200 text-blue-900"
                        : "bg-red-200 text-red-900";

                return (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-bold text-black">{b.reference}</td>
                    <td className="px-4 py-3 text-black">
                      <div className="font-semibold">{b.guest_full_name}</div>
                      <div className="text-xs text-gray-700">{b.guest_email}</div>
                    </td>
                    <td className="px-4 py-3 text-black">
                      <div className="font-semibold">{b.room_type_name}</div>
                      <div className="text-xs text-gray-700">{b.hotel_name}</div>
                    </td>
                    <td className="px-4 py-3 text-black">
                      <div>{new Date(b.check_in).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-700">→ {new Date(b.check_out).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-black">
                      {"\u20B9"}
                      {(Number(b.total_cents) / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass}`}>{b.status}</span>
                    </td>
                    <td className="flex gap-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(b)}
                        className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={b.status === "cancelled"}
                        onClick={() => cancelBooking(b.id)}
                        className="rounded bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        title="Cancel booking"
                      >
                        Cancel
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-700">
            <p className="text-lg">No {filter !== "all" ? filter : ""} bookings found</p>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-lg border-2 border-black bg-white p-6 text-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-gray-700">Booking</div>
                  <div className="text-2xl font-bold">{selected.reference}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded border border-black/20 p-2 text-black hover:bg-gray-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded border border-black/10 bg-gray-50 p-4">
                  <div className="text-xs font-bold text-gray-700">Guest</div>
                  <div className="mt-1 font-semibold">{selected.guest_full_name}</div>
                  <div className="text-sm text-gray-700">{selected.guest_email}</div>
                  <div className="text-sm text-gray-700">{selected.guest_phone}</div>
                </div>
                <div className="rounded border border-black/10 bg-gray-50 p-4">
                  <div className="text-xs font-bold text-gray-700">Stay</div>
                  <div className="mt-1 font-semibold">{selected.room_type_name}</div>
                  <div className="text-sm text-gray-700">{selected.hotel_name}</div>
                  <div className="mt-2 text-sm text-black">
                    {new Date(selected.check_in).toLocaleDateString()} → {new Date(selected.check_out).toLocaleDateString()} ({selected.nights} night{selected.nights !== 1 ? "s" : ""})
                  </div>
                  <div className="mt-2 text-sm text-black">
                    Guests: {selected.adults} adult{selected.adults !== 1 ? "s" : ""}, {selected.children} child{selected.children !== 1 ? "ren" : ""}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded border border-black/10 bg-gray-50 p-4">
                <div className="text-xs font-bold text-gray-700">Payment</div>
                <div className="mt-1 text-lg font-bold">
                  {"\u20B9"}
                  {(Number(selected.total_cents) / 100).toLocaleString("en-IN")}
                  <span className="ml-2 text-xs font-bold text-gray-700">{selected.currency}</span>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  Status: <span className="font-bold text-black capitalize">{selected.status}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelected(null)}
                  className="border-black/20"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={selected.status === "cancelled"}
                  onClick={async () => {
                    await cancelBooking(selected.id);
                    setSelected(null);
                  }}
                >
                  Cancel booking
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

