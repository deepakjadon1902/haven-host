import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { clearPaymentDraft, readPaymentDraft, type PaymentDraft } from "@/lib/local-store";
import { createBooking } from "@/lib/bookings.functions";
import { getPublicRoomById } from "@/lib/rooms.functions";
import type { Room } from "@/types/room";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [{ title: "Payment  — Maison Noir" }],
  }),
  component: PaymentPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `â‚¹${rupees.toLocaleString("en-IN")}`;
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
      const r = await getPublicRoomById({ id: draft.room_id });
      setRoom(r);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [draft?.room_id]);

  const taxesLabel = useMemo(() => {
    if (!draft) return "";
    // 12% taxes from booking page; show it as info only
    return "Includes taxes & fees";
  }, [draft]);

  if (!draft) return null;

  const pay = async () => {
    setPaying(true);
    try {
      // Simulated payment gateway success
      const inserted = await createBooking({
        hotel_name: "Maison Noir",
        room_type_name: draft.room_type_name,
        room_id: draft.room_id,
        check_in: draft.check_in,
        check_out: draft.check_out,
        nights: draft.nights,
        adults: draft.adults,
        children: draft.children,
        guest_full_name: draft.guest_full_name,
        guest_email: draft.guest_email,
        guest_phone: draft.guest_phone,
        total_cents: draft.total_cents,
        currency: draft.currency,
        status: "confirmed",
        payment_status: "paid",
        payment_reference: `PAY-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
      });
      clearPaymentDraft();
      toast.success("Payment successful.");
      navigate({
        to: "/booking/success",
        search: { ref: inserted.reference, hotel: "maison-noir", room: draft.room_id } as never,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
      navigate({ to: "/booking/failed" });
    } finally {
      setPaying(false);
    }
  };

  const fail = () => {
    clearPaymentDraft();
    navigate({ to: "/booking/failed" });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-semibold text-black">Payment gateway</h1>
          <p className="mt-2 text-sm text-gray-700">
            This is a demo gateway for the frontend-only app. Click Pay to confirm the booking.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-black/10 bg-white p-8"
          >
            <h2 className="font-display text-xl font-semibold text-black">Order summary</h2>
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
                  {draft.check_in} â†’ {draft.check_out}
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
            className="rounded-3xl border border-black/10 bg-white p-8"
          >
            <h2 className="font-display text-xl font-semibold text-black">Pay securely</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Encrypted checkout (demo)
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gold" /> UPI / Card / Netbanking (simulated)
              </div>
            </div>

            <Button
              onClick={pay}
              disabled={paying}
              className="mt-6 h-12 w-full rounded-xl font-semibold"
            >
              {paying ? "Processing..." : `Pay ${formatInr(draft.total_cents)}`}
            </Button>

            <Button
              onClick={fail}
              variant="outline"
              className="mt-3 h-12 w-full rounded-xl font-semibold border-black/15 text-black hover:bg-gray-50"
            >
              <XCircle className="h-4 w-4" /> Simulate failure
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
