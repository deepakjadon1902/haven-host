import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Room } from "@/types/room";
import { adminListInventory, adminListRooms, adminSetInventory } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [{ title: "Inventory Calendar — Admin Panel" }],
  }),
  component: AdminCalendar,
});

type InventoryOverride = { date: string; status: "closed" | "maintenance"; note: string | null };
type BookingLite = { check_in: string; check_out: string; reference: string; guest_full_name: string; status: string };

function isoDate(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function dateInRange(iso: string, from: string, to: string) {
  return iso >= from && iso <= to;
}

function AdminCalendar() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryOverrides, setInventoryOverrides] = useState<InventoryOverride[]>([]);
  const [bookings, setBookings] = useState<BookingLite[]>([]);
  const [roomMeta, setRoomMeta] = useState<{ name: string; total_units: number } | null>(null);

  const [editDate, setEditDate] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"open" | "closed" | "maintenance">("open");
  const [editNote, setEditNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await adminListRooms();
        setRooms(data);
        setSelectedRoomId((prev) => prev || data[0]?.id || "");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load rooms");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const range = useMemo(() => {
    const from = isoDate(startOfMonth(currentMonth));
    const to = isoDate(endOfMonth(currentMonth));
    return { from, to };
  }, [currentMonth]);

  useEffect(() => {
    if (!selectedRoomId) return;
    const fetchInventory = async () => {
      setInventoryLoading(true);
      try {
        const data = await adminListInventory({ roomId: selectedRoomId, from: range.from, to: range.to });
        setInventoryOverrides((data.inventory ?? []) as InventoryOverride[]);
        setBookings((data.bookings ?? []) as BookingLite[]);
        setRoomMeta(data.room ?? null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load inventory");
      } finally {
        setInventoryLoading(false);
      }
    };
    fetchInventory();
  }, [selectedRoomId, range.from, range.to]);

  const overridesByDate = useMemo(() => {
    const map = new Map<string, InventoryOverride>();
    for (const o of inventoryOverrides) map.set(o.date, o);
    return map;
  }, [inventoryOverrides]);

  const bookingsCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bookings) {
      const from = b.check_in;
      const toExclusive = b.check_out;
      let cursor = from;
      while (cursor < toExclusive) {
        if (dateInRange(cursor, range.from, range.to)) {
          map.set(cursor, (map.get(cursor) ?? 0) + 1);
        }
        const d = new Date(cursor + "T00:00:00Z");
        d.setUTCDate(d.getUTCDate() + 1);
        cursor = d.toISOString().slice(0, 10);
      }
    }
    return map;
  }, [bookings, range.from, range.to]);

  const totalUnits = roomMeta?.total_units ?? 0;

  const days = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const last = endOfMonth(currentMonth);
    const firstWeekday = first.getDay(); // 0..6, Sunday start
    const totalDays = last.getDate();

    const out: Array<{ day: number; dateIso: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(first.getFullYear(), first.getMonth(), day);
      out.push({ day, dateIso: isoDate(d) });
    }
    return out;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const openEditor = (dateIso: string) => {
    const override = overridesByDate.get(dateIso);
    const booked = (bookingsCountByDate.get(dateIso) ?? 0) >= totalUnits && totalUnits > 0;
    if (booked) return;

    setEditDate(dateIso);
    if (!override) {
      setEditStatus("open");
      setEditNote("");
    } else {
      setEditStatus(override.status);
      setEditNote(override.note ?? "");
    }
  };

  const saveOverride = async () => {
    if (!editDate || !selectedRoomId) return;
    setSaving(true);
    try {
      await adminSetInventory({
        roomId: selectedRoomId,
        date: editDate,
        status: editStatus,
        note: editNote.trim() ? editNote.trim() : undefined,
      });

      const data = await adminListInventory({ roomId: selectedRoomId, from: range.from, to: range.to });
      setInventoryOverrides((data.inventory ?? []) as InventoryOverride[]);
      setBookings((data.bookings ?? []) as BookingLite[]);
      setRoomMeta(data.room ?? null);

      toast.success("Inventory updated");
      setEditDate(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update inventory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-8 text-4xl font-bold text-black">Inventory Calendar</h1>

        {/* Room Selector */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-bold text-black">Select Room</label>
          {loadingRooms ? (
            <div className="text-gray-700">Loading rooms...</div>
          ) : (
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="rounded border-2 border-black bg-white px-4 py-2 text-black"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          )}
          {roomMeta && (
            <div className="mt-2 text-sm text-gray-700">
              <span className="font-semibold text-black">{roomMeta.name}</span> • {roomMeta.total_units} unit{roomMeta.total_units !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border-2 border-black bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(startOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)))}
                className="rounded border-2 border-black p-2 hover:bg-gray-100"
                type="button"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} className="text-black" />
              </button>
              <button
                onClick={() => setCurrentMonth(startOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)))}
                className="rounded border-2 border-black p-2 hover:bg-gray-100"
                type="button"
                aria-label="Next month"
              >
                <ChevronRight size={20} className="text-black" />
              </button>
            </div>
          </div>

          {inventoryLoading ? (
            <div className="py-10 text-center text-gray-700">Loading inventory...</div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 text-center font-bold text-black">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((item, idx) => {
                  if (!item) return <div key={idx} className="aspect-square" />;

                  const override = overridesByDate.get(item.dateIso);
                  const bookedCount = bookingsCountByDate.get(item.dateIso) ?? 0;
                  const fullyBooked = totalUnits > 0 && bookedCount >= totalUnits;

                  const state = override
                    ? override.status
                    : fullyBooked
                      ? "booked"
                      : "open";

                  const dotClass =
                    state === "open"
                      ? "bg-green-600"
                      : state === "booked"
                        ? "bg-yellow-500"
                        : "bg-red-600";

                  const borderClass =
                    state === "open"
                      ? "border-green-600"
                      : state === "booked"
                        ? "border-yellow-500"
                        : "border-red-600";

                  const title =
                    state === "open"
                      ? totalUnits > 0
                        ? `${totalUnits - bookedCount}/${totalUnits} available`
                        : "Available"
                      : state === "booked"
                        ? "Fully booked (read-only)"
                        : override?.status === "maintenance"
                          ? "Maintenance"
                          : "Closed";

                  return (
                    <button
                      key={item.dateIso}
                      type="button"
                      title={title}
                      onClick={() => openEditor(item.dateIso)}
                      disabled={state === "booked"}
                      className={`group relative aspect-square w-full rounded border-2 bg-white font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 ${borderClass}`}
                    >
                      {item.day}
                      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${dotClass}`} />
                        {state === "open" && totalUnits > 0 && (
                          <span className="text-[10px] font-bold text-black/80">{Math.max(0, totalUnits - bookedCount)}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-green-600" />
                  <span className="font-medium text-black">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-yellow-500" />
                  <span className="font-medium text-black">Fully booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-red-600" />
                  <span className="font-medium text-black">Closed/Maintenance</span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Editor */}
        {editDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-lg border-2 border-black bg-gray-50 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-black">Edit {editDate}</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Set an override for this date. “Open” removes any override.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditDate(null)}
                className="rounded border border-black/20 p-2 text-black hover:bg-white"
                aria-label="Close editor"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded border border-black/20 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="status"
                  value="open"
                  checked={editStatus === "open"}
                  onChange={() => setEditStatus("open")}
                  className="accent-black"
                />
                <span className="font-semibold text-black">Open</span>
              </label>
              <label className="flex items-center gap-2 rounded border border-black/20 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="status"
                  value="maintenance"
                  checked={editStatus === "maintenance"}
                  onChange={() => setEditStatus("maintenance")}
                  className="accent-black"
                />
                <span className="font-semibold text-black">Maintenance</span>
              </label>
              <label className="flex items-center gap-2 rounded border border-black/20 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="status"
                  value="closed"
                  checked={editStatus === "closed"}
                  onChange={() => setEditStatus("closed")}
                  className="accent-black"
                />
                <span className="font-semibold text-black">Closed</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-black">Note (optional)</label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full rounded border-2 border-black bg-white px-3 py-2 text-black"
                placeholder="e.g., AC maintenance"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={saveOverride}
                disabled={saving}
                className="rounded bg-black px-6 py-2 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditDate(null)}
                className="rounded bg-gray-200 px-6 py-2 font-bold text-black hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 rounded-lg border-2 border-black bg-gray-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-black">Notes</h3>
          <ul className="list-disc space-y-2 pl-5 text-black">
            <li>Yellow “fully booked” days are derived from bookings and are read-only.</li>
            <li>Red days are overrides you set (maintenance/closed).</li>
            <li>Open removes the override and returns to automatic availability.</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

