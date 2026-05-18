import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { X, RefreshCcw, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/booking/failed")({
  head: () => ({ meta: [{ title: "Payment failed — Maison Noir" }] }),
  component: FailedPage,
});

function FailedPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto h-24 w-24 rounded-full bg-destructive/20 border border-destructive/40 grid place-items-center"
        >
          <X className="h-12 w-12 text-destructive" strokeWidth={3} />
        </motion.div>
        <h1 className="mt-8 font-display text-4xl md:text-5xl font-semibold">Payment didn't go through.</h1>
        <p className="mt-4 text-white/70 text-lg">
          Your card wasn't charged. Try a different payment method or contact us.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full font-semibold h-11 px-6">
            <Link to="/booking"><RefreshCcw className="h-4 w-4" /> Try again</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full font-semibold h-11 px-6 border-white/20">
            <Link to="/contact"><MessageCircle className="h-4 w-4" /> Contact support</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
