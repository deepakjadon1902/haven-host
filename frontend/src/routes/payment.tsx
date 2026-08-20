import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Building2,
  CreditCard,
  IndianRupee,
  Landmark,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { readPaymentDraft, type PaymentDraft } from "@/lib/local-store";
import { getPublicRoomById } from "@/lib/rooms.functions";
import type { Room } from "@/types/room";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [{ title: "Payment - Maison Noir" }],
  }),
  component: PaymentPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function PaymentPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PaymentDraft | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const d = readPaymentDraft();
    if (!d) {
      navigate({ to: "/booking" });
      return;
    }
    setDraft(d);
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      if (!draft?.room_id) return;
      const r = await getPublicRoomById({ id: draft.room_id }).catch(() => null);
      setRoom(r);
    };
    void load();
  }, [draft?.room_id]);

  const taxesLabel = useMemo(() => {
    if (!draft) return "";
    return "Includes taxes & fees";
  }, [draft]);

  if (!draft) return null;

  const pay = async () => {
    setPaying(true);
    await navigate({ to: "/razorpay-demo" as never });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Secure checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-black md:text-5xl">
            Complete your secure Razorpay payment.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
            Use the Razorpay-style demo checkout for UPI, cards, netbanking, and wallets. Your demo
            booking is confirmed and saved after payment success.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-black/10 bg-white p-7"
          >
            <h2 className="font-display text-xl font-semibold text-black">Reservation summary</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-4">
                <span>Room</span>
                <span className="font-semibold text-black">
                  {room?.name ?? draft.room_type_name}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Dates</span>
                <span className="font-semibold text-black">
                  {draft.check_in} {"->"} {draft.check_out}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Guests</span>
                <span className="font-semibold text-black">{draft.adults + draft.children}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-black/10">
                <span className="font-semibold text-black">Total</span>
                <span className="font-semibold text-black">{formatInr(draft.total_cents)}</span>
              </div>
              <div className="text-xs text-gray-500">{taxesLabel}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-black/10 bg-white p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                  Powered by
                </p>
                <h2 className="font-display text-2xl font-semibold text-black">Razorpay</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-black text-white">
                <IndianRupee className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
              <PaymentChip icon={<CreditCard />} label="Cards" />
              <PaymentChip icon={<Smartphone />} label="UPI" />
              <PaymentChip icon={<Landmark />} label="Netbanking" />
              <PaymentChip icon={<Building2 />} label="Wallets" />
            </div>

            <div className="mt-6 rounded-xl border border-black/10 bg-gray-50 p-4 text-sm text-gray-700">
              <div className="flex items-center gap-2 font-semibold text-black">
                <ShieldCheck className="h-4 w-4 text-gold" />
                Demo payment gateway
              </div>
              <p className="mt-2 text-xs leading-relaxed">
                Opens a dedicated Razorpay demo checkout page with the exact payable amount.
              </p>
            </div>

            <Button
              onClick={pay}
              disabled={paying}
              className="mt-6 h-12 w-full rounded-xl font-semibold"
            >
              {paying ? "Opening Razorpay demo..." : `Pay ${formatInr(draft.total_cents)}`}
            </Button>

            <div className="mt-6 text-center text-xs text-gray-600">
              <Link to="/booking" className="hover:underline">
                Back to checkout
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </SiteLayout>
  );
}

function PaymentChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border border-black/10 bg-white px-3">
      <span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
