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
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { clearPaymentDraft, readPaymentDraft, type PaymentDraft } from "@/lib/local-store";
import { getPublicRoomById } from "@/lib/rooms.functions";
import type { Room } from "@/types/room";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  type RazorpayOrderResponse,
} from "@/lib/payments.functions";

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

type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: "payment.failed", handler: (response: unknown) => void) => void;
    };
  }
}

function PaymentPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PaymentDraft | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [paying, setPaying] = useState(false);
  const [orderState, setOrderState] = useState<RazorpayOrderResponse | null>(null);

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
    void load();
  }, [draft?.room_id]);

  const taxesLabel = useMemo(() => {
    if (!draft) return "";
    return "Includes taxes & fees";
  }, [draft]);

  if (!draft) return null;

  const pay = async () => {
    setPaying(true);
    try {
      const checkout = await ensureRazorpayCheckout();
      const order = orderState ?? (await createRazorpayOrder(draft));
      setOrderState(order);

      const razorpay = new checkout({
        key: order.key_id,
        amount: order.order.amount,
        currency: order.order.currency,
        name: "Haven Host",
        description: order.booking.room_type_name,
        order_id: order.order.id,
        prefill: {
          name: draft.guest_full_name,
          email: draft.guest_email,
          contact: draft.guest_phone,
        },
        notes: {
          booking_id: order.booking.id,
          reference: order.booking.reference,
        },
        theme: { color: "#c8932b" },
        handler: (response) => {
          void verifyPayment(order, response);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      });

      razorpay.on("payment.failed", () => {
        setPaying(false);
        toast.error("Payment failed. Please try another method.");
        navigate({ to: "/booking/failed" });
      });

      razorpay.open();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to start Razorpay checkout");
      setPaying(false);
    }
  };

  const verifyPayment = async (
    order: RazorpayOrderResponse,
    response: RazorpayCheckoutResponse,
  ) => {
    try {
      const verified = await verifyRazorpayPayment({
        booking_id: order.booking.id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      clearPaymentDraft();
      toast.success("Payment verified.");
      navigate({
        to: "/booking/success",
        search: {
          ref: verified.booking.reference,
          hotel: "maison-noir",
          room: draft.room_id,
        } as never,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment verification failed");
      navigate({ to: "/booking/failed" });
    } finally {
      setPaying(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Secure checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-black">
            Complete payment with Razorpay.
          </h1>
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
                Server verified payment
              </div>
              <p className="mt-2 text-xs leading-relaxed">
                Booking is confirmed only after Razorpay signature verification succeeds on the
                backend.
              </p>
            </div>

            <Button
              onClick={pay}
              disabled={paying}
              className="mt-6 h-12 w-full rounded-xl font-semibold"
            >
              {paying ? "Opening Razorpay..." : `Pay ${formatInr(draft.total_cents)}`}
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

function ensureRazorpayCheckout() {
  return new Promise<NonNullable<typeof window.Razorpay>>((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else reject(new Error("Razorpay checkout failed to load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay checkout failed to load")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay checkout failed to load"));
    };
    script.onerror = () => reject(new Error("Razorpay checkout failed to load"));
    document.head.appendChild(script);
  });
}
