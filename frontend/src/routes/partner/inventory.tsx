import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { partnerInventory, partnerRooms, partnerSetInventory } from "@/lib/partner.functions";

export const Route = createFileRoute("/partner/inventory")({
  component: PartnerInventory,
});

type InventoryOverride = { date: string; status: "closed" | "maintenance"; note: string | null };

function isoDate(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function PartnerInventory() {
  const rooms = partnerRooms();
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? "");
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [overrides, setOverrides] = useState<InventoryOverride[]>([]);
  const [roomMeta, setRoomMeta] = useState<{ name: string; total_units: number } | null>(null);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [status, setStatus] = useState<"open" | "closed" | "maintenance">("open");
  const [note, setNote] = useState("");

  const range = useMemo(
    () => ({ from: isoDate(startOfMonth(currentMonth)), to: isoDate(endOfMonth(currentMonth)) }),
    [currentMonth],
  );

  const load = () => {
    if (!selectedRoomId) return;
    const data = partnerInventory({ roomId: selectedRoomId, from: range.from, to: range.to });
    setOverrides((data.inventory ?? []) as InventoryOverride[]);
    setRoomMeta(data.room ?? null);
  };

  useEffect(load, [selectedRoomId, range.from, range.to]);

  const overridesByDate = useMemo(() => {
    const map = new Map<string, InventoryOverride>();
    overrides.forEach((row) => map.set(row.date, row));
    return map;
  }, [overrides]);

  const days = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const last = endOfMonth(currentMonth);
    const out: Array<{ day: number; dateIso: string } | null> = [];
    for (let i = 0; i < first.getDay(); i++) out.push(null);
    for (let day = 1; day <= last.getDate(); day++) {
      out.push({ day, dateIso: isoDate(new Date(first.getFullYear(), first.getMonth(), day)) });
    }
    return out;
  }, [currentMonth]);

  const save = () => {
    if (!editDate || !selectedRoomId) return;
    partnerSetInventory({
      roomId: selectedRoomId,
      date: editDate,
      status,
      note: note.trim() || undefined,
    });
    load();
    setEditDate(null);
    toast.success("Inventory updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Partner inventory
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Inventory calendar</h1>
        <p className="mt-2 text-sm text-black/60">
          Manage open, closed and maintenance dates only for your own hotel rooms.
        </p>
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <select
            value={selectedRoomId}
            onChange={(event) => setSelectedRoomId(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm font-semibold"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-44 text-center font-display text-xl font-semibold">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </p>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {roomMeta ? (
          <p className="mb-4 text-sm text-black/60">
            {roomMeta.name} · {roomMeta.total_units} units
          </p>
        ) : null}

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-bold">
              {day}
            </div>
          ))}
          {days.map((item, index) => {
            if (!item) return <div key={index} className="aspect-square" />;
            const override = overridesByDate.get(item.dateIso);
            const state = override?.status ?? "open";
            const cls =
              state === "open"
                ? "border-green-500 bg-green-50"
                : state === "maintenance"
                  ? "border-red-500 bg-red-50"
                  : "border-black bg-black text-white";
            return (
              <button
                key={item.dateIso}
                type="button"
                onClick={() => {
                  setEditDate(item.dateIso);
                  setStatus(override?.status ?? "open");
                  setNote(override?.note ?? "");
                }}
                className={`aspect-square rounded-xl border-2 text-sm font-bold ${cls}`}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </section>

      {editDate ? (
        <section className="rounded-3xl border border-black/10 bg-white p-6">
          <h2 className="font-display text-2xl font-semibold">Edit {editDate}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(["open", "maintenance", "closed"] as const).map((option) => (
              <label
                key={option}
                className="rounded-xl border border-black/10 p-3 text-sm font-semibold capitalize"
              >
                <input
                  type="radio"
                  checked={status === option}
                  onChange={() => setStatus(option)}
                  className="mr-2 accent-black"
                />
                {option}
              </label>
            ))}
          </div>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note"
            className="mt-4 h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
          />
          <div className="mt-5 flex gap-3">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setEditDate(null)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
