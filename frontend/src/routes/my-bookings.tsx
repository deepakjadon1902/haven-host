import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getLastBookingEmail, type LocalBooking } from "@/lib/local-store";
import { listBookingsByEmail } from "@/lib/bookings.functions";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [{ title: "My bookings — Maison Noir" }],
  }),
  component: MyBookingsPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `â‚¹${rupees.toLocaleString("en-IN")}`;
}

function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<LocalBooking[]>([]);

  useEffect(() => {
    setEmail(getLastBookingEmail());
  }, []);

  useEffect(() => {
    if (!email.trim()) {
      setRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const next = await listBookingsByEmail(email);
      if (!cancelled) setRows(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [rows]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Maison Noir</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-black md:text-5xl">
            My bookings
          </h1>
          <p className="mt-3 text-sm text-gray-700">
            Enter the same email you used at checkout to see your bookings.
          </p>
        </motion.div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6">
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-700">
            Email
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-black outline-none focus:border-gold"
            />
            <Button asChild className="h-12 rounded-xl font-semibold">
              <Link to="/rooms">Book a room</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {email.trim() && sorted.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-10 text-center text-gray-700">
              No bookings found for <span className="font-semibold text-black">{email.trim()}</span>
              .
            </div>
          ) : null}

          {sorted.map((b) => (
            <Link
              key={b.id}
              to="/my-bookings/$id"
              params={{ id: b.id }}
              className="block rounded-3xl border border-black/10 bg-white p-6 transition hover:border-gold"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-gray-700">
                    Reference
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold text-black">
                    {b.reference}
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{b.room_type_name}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    {b.check_in} â†’ {b.check_out} â€¢ {b.nights} night{b.nights !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gray-700">
                    Total
                  </div>
                  <div className="mt-1 text-lg font-semibold text-black">
                    {formatInr(b.total_cents)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 capitalize">
                    Status: {b.status}
                    {b.payment_status ? ` â€¢ ${b.payment_status}` : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
