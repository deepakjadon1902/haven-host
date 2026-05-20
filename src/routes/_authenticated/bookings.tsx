import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CalendarCheck, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "My bookings — Maison Noir" }] }),
  component: BookingsPage,
});

type Booking = {
  id: string;
  reference: string;
  hotel_slug: string;
  hotel_name: string;
  room_type_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  total_cents: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

function BookingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, reference, hotel_slug, hotel_name, room_type_name, check_in, check_out, nights, adults, children, total_cents, currency, status, created_at")
        .order("created_at", { ascending: false });
      if (data) setRows(data as Booking[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Itinerary</p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Your bookings</h1>
      <p className="mt-2 text-white/65 max-w-xl">Every confirmed stay lives here.</p>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings…
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 p-10 text-center">
          <CalendarCheck className="h-10 w-10 text-gold mx-auto" />
          <h3 className="mt-4 font-display text-xl font-semibold">No bookings yet</h3>
          <p className="mt-2 text-white/60">Reserve your first Maison Noir stay.</p>
          <Button asChild className="mt-6 rounded-full font-semibold">
            <Link to="/rooms">Browse rooms <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map((b) => (
            <div key={b.id} className="rounded-2xl border border-white/10 bg-card p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gold font-semibold">
                  <span>{b.reference}</span>
                  <StatusPill status={b.status} />
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold truncate">{b.hotel_name}</h3>
                <p className="text-sm text-white/60 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" /> {b.room_type_name}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <Cell label="Check-in" value={b.check_in} />
                <Cell label="Check-out" value={b.check_out} />
                <Cell label="Guests" value={`${b.adults}${b.children ? ` + ${b.children}` : ""}`} />
              </div>
              <div className="lg:text-right">
                <p className="text-[11px] uppercase tracking-widest text-white/50">Total</p>
                <p className="font-display text-xl font-semibold gold-text">
                  ₹{(b.total_cents / 100).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/45">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: Booking["status"] }) {
  const map: Record<Booking["status"], string> = {
    confirmed: "bg-gold/15 text-gold border-gold/30",
    pending: "bg-white/5 text-white/60 border-white/15",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    completed: "bg-white/5 text-white/60 border-white/15",
  };
  return <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${map[status]}`}>{status}</span>;
}
