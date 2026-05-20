import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Download, Home } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

type Search = { ref?: string; hotel?: string; room?: string };

export const Route = createFileRoute("/booking/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
    hotel: typeof s.hotel === "string" ? s.hotel : undefined,
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  head: () => ({ meta: [{ title: "Booking confirmed — Maison Noir" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { ref } = Route.useSearch();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full gold-gradient border-4 border-yellow-400"
        >
          <Check className="h-12 w-12 text-black" strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 font-display text-4xl font-semibold text-black md:text-5xl"
        >
          Reservation confirmed.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-lg text-gray-700"
        >
          Your booking is confirmed. You can find it anytime under your account.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-5 py-2.5"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-700">Reference</span>
          <span className="font-semibold gold-text">{ref ?? "MN-XXXXXX"}</span>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button className="h-11 rounded-full px-6 font-semibold">
            <Download className="h-4 w-4" /> Download invoice
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 font-semibold border-black/15 text-black hover:bg-gray-50">
            <Link to="/">
              <Home className="h-4 w-4" /> Back home
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

