import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { RoomAvailabilityMap } from "@/types/room";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function AvailabilityCalendar({
  availability,
  value,
  onSelect,
}: {
  availability: RoomAvailabilityMap;
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
    <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold">
          {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="h-9 w-9 grid place-items-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="h-9 w-9 grid place-items-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isPast = cell.isoDate < today;
          const available = availability.available[cell.isoDate] ?? 0;
          const blocked = availability.blocked[cell.isoDate];
          const isSelected = value === cell.isoDate;
          const clickable = !isPast && !blocked && available > 0;
          const label = isPast
            ? ""
            : blocked === "closed"
              ? "Closed"
              : blocked === "maintenance"
                ? "Block"
                : blocked === "booked"
                  ? "Full"
                  : `${available} left`;
          const cls = isPast
            ? "bg-muted/30 text-muted-foreground/50 border-border cursor-not-allowed"
            : blocked
              ? blocked === "booked"
                ? "bg-destructive/10 text-destructive border-destructive/30 cursor-not-allowed"
                : "bg-muted text-muted-foreground border-border cursor-not-allowed"
              : "bg-gold/10 text-foreground border-gold/40 hover:bg-gold/20";
          return (
            <motion.button
              key={cell.isoDate}
              whileHover={clickable ? { scale: 1.04 } : {}}
              disabled={!clickable}
              onClick={() => clickable && onSelect?.(cell.isoDate)}
              className={`aspect-square rounded-xl border text-left p-1.5 md:p-2 flex flex-col transition ${cls} ${
                isSelected ? "ring-2 ring-foreground bg-foreground text-background" : ""
              }`}
            >
              <span className="text-sm font-semibold leading-none">{cell.date.getDate()}</span>
              {label && (
                <span className="mt-auto text-[9px] md:text-[10px] font-medium opacity-80">
                  {label}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend className="bg-gold/40" label="Available" />
        <Legend className="bg-destructive/40" label="Booked" />
        <Legend className="bg-muted" label="Closed / Maintenance" />
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
