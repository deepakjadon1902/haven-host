import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  LockKeyhole,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearPaymentDraft,
  createBooking as createLocalBooking,
  readPaymentDraft,
  type PaymentDraft,
} from "@/lib/local-store";
import { getPublicRoomById } from "@/lib/rooms.functions";
import type { Room } from "@/types/room";

export const Route = createFileRoute("/razorpay-demo")({
  head: () => ({ meta: [{ title: "Razorpay Demo Checkout" }] }),
  component: RazorpayDemoPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function RazorpayDemoPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PaymentDraft | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [method, setMethod] = useState("UPI");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    const next = readPaymentDraft();
    if (!next) {
      navigate({ to: "/payment" });
      return;
    }
    setDraft(next);
  }, [navigate]);

  useEffect(() => {
    if (!draft?.room_id) return;
    getPublicRoomById({ id: draft.room_id })
      .then(setRoom)
      .catch(() => setRoom(null));
  }, [draft?.room_id]);

  const reference = useMemo(() => `HH-${Date.now().toString(36).toUpperCase()}`, []);

  if (!draft) return null;

  const completePayment = () => {
    setStatus("processing");
    window.setTimeout(() => {
      setStatus("success");
      const booking = createLocalBooking({
        hotel_name: room?.hotelName ?? "Maison Noir",
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
        reference,
        payment_status: "paid",
        payment_reference: `demo_pay_${Date.now().toString(36)}`,
      });
      clearPaymentDraft();
      toast.success("Demo payment confirmed.");
      window.setTimeout(() => {
        navigate({
          to: "/booking/success",
          search: {
            id: booking.id,
            ref: booking.reference,
            hotel: "maison-noir",
            room: draft.room_id,
          } as never,
        });
      }, 900);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#17233c]">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[#0b72e7] px-10 py-12 text-white lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                Haven Host
              </p>
              <h1 className="font-display text-2xl font-semibold">Demo payment</h1>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-sm font-medium text-white/75">Payable amount</p>
            <div className="mt-3 font-display text-6xl font-semibold">
              {formatInr(draft.total_cents)}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              This is a Razorpay-style demo checkout. No real money is charged.
            </p>
          </div>

          <div className="mt-16 rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/65">
              Reservation
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Room" value={room?.name ?? draft.room_type_name} light />
              <Row label="Dates" value={`${draft.check_in} → ${draft.check_out}`} light />
              <Row label="Guests" value={`${draft.adults + draft.children}`} light />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(23,35,60,0.18)]"
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0b72e7]">
                    Razorpay Demo
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {formatInr(draft.total_cents)}
                  </h2>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0b72e7] text-white">
                  <LockKeyhole className="h-5 w-5" />
                </span>
              </div>
            </div>

            {status === "success" ? (
              <div className="px-6 py-12 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white"
                >
                  <Check className="h-10 w-10" strokeWidth={3} />
                </motion.div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950">Payment successful</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Booking confirmed. Redirecting to your confirmation page.
                </p>
              </div>
            ) : (
              <div className="px-6 py-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">Merchant</span>
                    <span className="font-bold text-slate-950">Haven Host</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">Order ID</span>
                    <span className="font-bold text-slate-950">{reference}</span>
                  </div>
                </div>

                <p className="mt-6 text-sm font-bold text-slate-950">Choose payment method</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { label: "UPI", icon: <Smartphone /> },
                    { label: "Card", icon: <CreditCard /> },
                    { label: "Netbanking", icon: <Landmark /> },
                    { label: "Wallet", icon: <WalletCards /> },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setMethod(item.label)}
                      className={`flex h-14 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-bold transition ${
                        method === item.label
                          ? "border-[#0b72e7] bg-blue-50 text-[#0b72e7]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="[&_svg]:h-4 [&_svg]:w-4">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <BadgeCheck className="h-4 w-4" />
                    Demo payment confirmation
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                    Click Pay to simulate a successful Razorpay payment and save this booking.
                  </p>
                </div>

                <Button
                  onClick={completePayment}
                  disabled={status === "processing"}
                  className="mt-6 h-12 w-full rounded-2xl bg-[#0b72e7] text-base font-bold text-white hover:bg-[#0966cf]"
                >
                  {status === "processing" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing payment
                    </>
                  ) : (
                    `Pay ${formatInr(draft.total_cents)}`
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/payment" })}
                  className="mt-4 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel payment
                </button>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value, light }: { label: string; value: string; light?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={light ? "text-white/65" : "text-slate-500"}>{label}</span>
      <span className={light ? "font-semibold text-white" : "font-semibold text-slate-950"}>
        {value}
      </span>
    </div>
  );
}
