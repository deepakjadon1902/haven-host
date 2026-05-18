import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RoomType, RoomStatus } from "@/types/hotel";
import { motion } from "framer-motion";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const iso = (d: Date) => d.toISOString().slice(0, 10);

function aggregate(roomType: RoomType, date: string): { status: RoomStatus; available: number } {
  let avail = 0;
  for (const r of roomType.rooms) {
    const s = r.calendar[date];
    if (!s || s === "available") avail++;
  }
  if (avail === 0) return { status: "booked", available: 0 };
  return { status: "available", available: avail };
}

const statusStyle: Record<RoomStatus | "past", string> = {
  available: "bg-gold/15 text-gold border-gold/40 hover:bg-gold/25",
  booked: "bg-destructive/15 text-destructive border-destructive/30 cursor-not-allowed",
  closed: "bg-white/5 text-white/40 border-white/10 cursor-not-allowed",
  maintenance: "bg-white/5 text-white/40 border-white/10 cursor-not-allowed",
  past: "bg-white/[0.02] text-white/25 border-white/5 cursor-not-allowed",
};

export function AvailabilityCalendar({
  roomType,
  value,
  onSelect,
}: {
  roomType: RoomType;
  value?: string;
  onSelect?: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const startDay = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: ({ date: Date; isoDate: string } | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      cells.push({ date, isoDate: iso(date) });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const today = iso(new Date());

  return (
    <div className="rounded-3xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold">
          {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="h-9 w-9 grid place-items-center rounded-full border border-white/10 hover:border-gold hover:text-gold transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="h-9 w-9 grid place-items-center rounded-full border border-white/10 hover:border-gold hover:text-gold transition"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-[11px] uppercase tracking-widest text-white/45 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isPast = cell.isoDate < today;
          const { status, available } = aggregate(roomType, cell.isoDate);
          const effective: keyof typeof statusStyle = isPast ? "past" : status;
          const isSelected = value === cell.isoDate;
          const clickable = effective === "available";
          return (
            <motion.button
              key={cell.isoDate}
              whileHover={clickable ? { scale: 1.04 } : {}}
              disabled={!clickable}
              onClick={() => clickable && onSelect?.(cell.isoDate)}
              className={`aspect-square rounded-xl border text-left p-1.5 md:p-2 flex flex-col transition ${
                statusStyle[effective]
              } ${isSelected ? "ring-2 ring-gold bg-gold text-black" : ""}`}
            >
              <span className="text-sm font-semibold leading-none">{cell.date.getDate()}</span>
              {effective === "available" && (
                <span className="mt-auto text-[9px] md:text-[10px] font-medium opacity-80">
                  {available} left
                </span>
              )}
              {effective === "booked" && !isPast && (
                <span className="mt-auto text-[9px] md:text-[10px] font-medium">Full</span>
              )}
              {effective === "closed" && (
                <span className="mt-auto text-[9px] md:text-[10px] font-medium">Closed</span>
              )}
              {effective === "maintenance" && (
                <span className="mt-auto text-[9px] md:text-[10px] font-medium">Block</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/60">
        <Legend className="bg-gold/40" label="Available" />
        <Legend className="bg-destructive/40" label="Booked" />
        <Legend className="bg-white/15" label="Closed / Maintenance" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${className}`} />
      <span>{label}</span>
    </div>
  );
}
