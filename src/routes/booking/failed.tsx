import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MessageCircle, RefreshCcw, X } from "lucide-react";
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
          className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-destructive/40 bg-destructive/10"
        >
          <X className="h-12 w-12 text-destructive" strokeWidth={3} />
        </motion.div>
        <h1 className="mt-8 font-display text-4xl font-semibold text-black md:text-5xl">Payment didn’t go through.</h1>
        <p className="mt-4 text-lg text-gray-700">Your card wasn’t charged. Try again or contact support.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-11 rounded-full px-6 font-semibold">
            <Link to="/booking">
              <RefreshCcw className="h-4 w-4" /> Try again
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 font-semibold border-black/15 text-black hover:bg-gray-50">
            <Link to="/contact">
              <MessageCircle className="h-4 w-4" /> Contact support
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

