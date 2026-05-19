import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, Mail, Phone, User, Car, Clock, PawPrint, Calendar, Plus, Minus,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { findHotel, findRoomType } from "@/data/hotels";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Search = { hotel?: string; room?: string; date?: string };

export const Route = createFileRoute("/booking/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    hotel: typeof s.hotel === "string" ? s.hotel : undefined,
    room: typeof s.room === "string" ? s.room : undefined,
    date: typeof s.date === "string" ? s.date : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reserve — Maison Noir" },
      { name: "description", content: "Complete your reservation in three simple steps." },
    ],
  }),
  component: BookingPage,
});

const guestSchema = z.object({
  name: z.string().min(2, "Required").max(60),
  age: z.coerce.number().int().min(0).max(120),
  gender: z.enum(["male", "female", "other"]),
});

const schema = z.object({
  fullName: z.string().min(2, "Required").max(80),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().min(7, "Required").max(20),
  transport: z.enum(["personal", "public", "shuttle"]),
  vehicleNumber: z.string().max(20).optional().or(z.literal("")),
  arrivalTime: z.string().min(1, "Required"),
  pets: z.enum(["yes", "no"]),
  adults: z.array(guestSchema).min(1, "At least one adult required"),
  children: z.array(guestSchema),
  cardName: z.string().min(2).max(80),
  cardNumber: z.string().regex(/^[0-9 ]{12,19}$/, "16-digit number"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY"),
  cardCvc: z.string().regex(/^\d{3,4}$/, "3-4 digits"),
});

type FormValues = z.infer<typeof schema>;

const steps = ["Stay", "Guests", "Payment"] as const;

function BookingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hotel = useMemo(() => (search.hotel ? findHotel(search.hotel) : undefined), [search.hotel]);
  const roomType = useMemo(
    () => (search.hotel && search.room ? findRoomType(search.hotel, search.room) : undefined),
    [search.hotel, search.room],
  );

  const [step, setStep] = useState(0);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [nights, setNights] = useState(2);

  const maxAdults = roomType?.maxAdults ?? 2;
  const maxChildren = roomType?.maxChildren ?? 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      transport: "personal",
      vehicleNumber: "",
      arrivalTime: "15:00",
      pets: "no",
      adults: Array.from({ length: 2 }, () => ({ name: "", age: 30, gender: "male" as const })),
      children: [],
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const adultsArr = useFieldArray({ control: form.control, name: "adults" });
  const childrenArr = useFieldArray({ control: form.control, name: "children" });

  // Sync field arrays with counts
  useEffect(() => {
    const cur = adultsArr.fields.length;
    if (cur < adultsCount)
      for (let i = cur; i < adultsCount; i++)
        adultsArr.append({ name: "", age: 30, gender: "male" });
    if (cur > adultsCount)
      for (let i = cur - 1; i >= adultsCount; i--) adultsArr.remove(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adultsCount]);

  useEffect(() => {
    const cur = childrenArr.fields.length;
    if (cur < childrenCount)
      for (let i = cur; i < childrenCount; i++)
        childrenArr.append({ name: "", age: 8, gender: "male" });
    if (cur > childrenCount)
      for (let i = cur - 1; i >= childrenCount; i--) childrenArr.remove(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenCount]);

  const next = async () => {
    let valid = true;
    if (step === 0)
      valid = await form.trigger(["fullName", "email", "phone", "transport", "arrivalTime", "pets"]);
    if (step === 1) valid = await form.trigger(["adults", "children"]);
    if (!valid) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) {
      toast.error("Please sign in to confirm your reservation.");
      navigate({ to: "/login", search: { redirect: "/booking" } as never });
      return;
    }
    if (!hotel || !roomType) return;
    const checkIn = search.date ?? new Date().toISOString().slice(0, 10);
    const checkOut = new Date(new Date(checkIn).getTime() + nights * 86400000)
      .toISOString()
      .slice(0, 10);
    const subtotalCents = roomType.pricePerNight * nights * 100;
    const taxesCents = Math.round(subtotalCents * 0.12);
    const totalCents = subtotalCents + taxesCents;

    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        hotel_slug: hotel.slug,
        hotel_name: hotel.name,
        room_type_id: roomType.id,
        room_type_name: roomType.name,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        adults: data.adults.length,
        children: data.children.length,
        guest_full_name: data.fullName,
        guest_email: data.email,
        guest_phone: data.phone,
        pets_allowed: data.pets === "yes",
        subtotal_cents: subtotalCents,
        taxes_cents: taxesCents,
        total_cents: totalCents,
        currency: "INR",
        status: "confirmed",
      })
      .select("reference")
      .single();

    if (error) {
      toast.error(error.message);
      navigate({ to: "/booking/failed" });
      return;
    }
    toast.success("Reservation confirmed.");
    navigate({
      to: "/booking/success",
      search: { ref: inserted.reference, hotel: hotel.slug, room: roomType.id } as never,
    });
  };

  if (!hotel || !roomType) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="font-display text-4xl">Pick a room first</h1>
          <p className="mt-3 text-white/65">Open a hotel and choose a room type to start booking.</p>
          <Button asChild className="mt-6 rounded-full font-semibold">
            <Link to="/hotels">Browse hotels</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const subtotal = roomType.pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-10 lg:py-14">
        <Link
          to="/hotels/$hotelId"
          params={{ hotelId: hotel.slug }}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {hotel.name}
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <div>
            <Stepper step={step} />

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.section
                    key="s0"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="space-y-6"
                  >
                    <Section title="Main details">
                      <Grid>
                        <Field label="Full name" icon={<User />} error={form.formState.errors.fullName?.message}>
                          <input className={inputCls} placeholder="Your full name" {...form.register("fullName")} />
                        </Field>
                        <Field label="Mobile number" icon={<Phone />} error={form.formState.errors.phone?.message}>
                          <input className={inputCls} placeholder="+91 98765 43210" {...form.register("phone")} />
                        </Field>
                      </Grid>
                      <Field label="Email" icon={<Mail />} error={form.formState.errors.email?.message}>
                        <input className={inputCls} placeholder="you@email.com" {...form.register("email")} />
                      </Field>
                    </Section>

                    <Section title="Travel details">
                      <Grid>
                        <Field label="Transport" icon={<Car />}>
                          <select className={inputCls + " [color-scheme:dark]"} {...form.register("transport")}>
                            <option value="personal">Personal vehicle</option>
                            <option value="public">Public transport</option>
                            <option value="shuttle">Hotel shuttle</option>
                          </select>
                        </Field>
                        <Field label="Vehicle number (optional)" icon={<Car />}>
                          <input className={inputCls} placeholder="MH 01 AB 1234" {...form.register("vehicleNumber")} />
                        </Field>
                      </Grid>
                      <Grid>
                        <Field label="Arrival time" icon={<Clock />} error={form.formState.errors.arrivalTime?.message}>
                          <input type="time" className={inputCls + " [color-scheme:dark]"} {...form.register("arrivalTime")} />
                        </Field>
                        <Field label="Nights" icon={<Calendar />}>
                          <Counter value={nights} setValue={setNights} min={1} max={30} />
                        </Field>
                      </Grid>
                    </Section>

                    <Section title="Guest summary">
                      <Grid>
                        <Field label={`Adults (max ${maxAdults})`} icon={<User />}>
                          <Counter value={adultsCount} setValue={setAdultsCount} min={1} max={maxAdults} />
                        </Field>
                        <Field label={`Children (max ${maxChildren})`} icon={<User />}>
                          <Counter value={childrenCount} setValue={setChildrenCount} min={0} max={maxChildren} />
                        </Field>
                      </Grid>
                      <Field label="Travelling with a pet?" icon={<PawPrint />}>
                        <select
                          className={inputCls + " [color-scheme:dark]"}
                          disabled={!roomType.petsAllowed}
                          {...form.register("pets")}
                        >
                          <option value="no">No</option>
                          <option value="yes" disabled={!roomType.petsAllowed}>
                            Yes {roomType.petsAllowed ? "" : "(not allowed in this room)"}
                          </option>
                        </select>
                      </Field>
                    </Section>
                  </motion.section>
                )}

                {step === 1 && (
                  <motion.section
                    key="s1"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="space-y-6"
                  >
                    <Section title={`Adults (${adultsArr.fields.length})`}>
                      <div className="space-y-3">
                        {adultsArr.fields.map((f, i) => (
                          <GuestRow key={f.id} idx={i} kind="adults" form={form} />
                        ))}
                      </div>
                    </Section>
                    {childrenArr.fields.length > 0 && (
                      <Section title={`Children (${childrenArr.fields.length})`}>
                        <div className="space-y-3">
                          {childrenArr.fields.map((f, i) => (
                            <GuestRow key={f.id} idx={i} kind="children" form={form} />
                          ))}
                        </div>
                      </Section>
                    )}
                  </motion.section>
                )}

                {step === 2 && (
                  <motion.section
                    key="s2"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="space-y-6"
                  >
                    <Section title="Payment method">
                      <div className="flex flex-wrap gap-2 mb-5">
                        {["Card", "UPI", "Razorpay", "PayPal", "Wallet"].map((p, i) => (
                          <span
                            key={p}
                            className={`px-4 h-10 rounded-full border text-sm font-semibold inline-flex items-center ${
                              i === 0 ? "bg-gold text-black border-gold" : "border-white/15 text-white/70"
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <Field label="Name on card" error={form.formState.errors.cardName?.message}>
                        <input className={inputCls} placeholder="As printed on card" {...form.register("cardName")} />
                      </Field>
                      <Field label="Card number" error={form.formState.errors.cardNumber?.message}>
                        <input className={inputCls} placeholder="4242 4242 4242 4242" {...form.register("cardNumber")} />
                      </Field>
                      <Grid>
                        <Field label="Expiry (MM/YY)" error={form.formState.errors.cardExpiry?.message}>
                          <input className={inputCls} placeholder="08/28" {...form.register("cardExpiry")} />
                        </Field>
                        <Field label="CVC" error={form.formState.errors.cardCvc?.message}>
                          <input className={inputCls} placeholder="123" {...form.register("cardCvc")} />
                        </Field>
                      </Grid>
                      <p className="text-xs text-white/50">
                        This is a demo. No real charges are made.
                      </p>
                    </Section>
                  </motion.section>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="rounded-full border-white/15"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={next} className="rounded-full font-semibold px-6 h-11">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="rounded-full font-semibold px-7 h-11"
                  >
                    Confirm & pay ₹{total.toLocaleString("en-IN")}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-3xl border border-white/10 overflow-hidden">
              <img src={hotel.heroImage} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold">{hotel.city}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{hotel.name}</h3>
                <p className="mt-1 text-sm text-white/65">{roomType.name}</p>
                <div className="mt-4 text-sm text-white/70 space-y-1">
                  {search.date && (
                    <p><span className="text-white/50">Check-in</span> · {search.date}</p>
                  )}
                  <p><span className="text-white/50">Nights</span> · {nights}</p>
                  <p><span className="text-white/50">Guests</span> · {adultsCount} adults{childrenCount ? `, ${childrenCount} children` : ""}</p>
                </div>
                <div className="mt-5 border-t border-white/10 pt-5 space-y-2 text-sm">
                  <Row label={`₹${roomType.pricePerNight.toLocaleString("en-IN")} × ${nights} nights`} value={`₹${subtotal.toLocaleString("en-IN")}`} />
                  <Row label="Taxes & fees" value={`₹${taxes.toLocaleString("en-IN")}`} />
                </div>
                <div className="mt-4 border-t border-white/10 pt-4 flex items-baseline justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-2xl gold-text font-semibold">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

const inputCls =
  "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 h-11 text-sm font-medium outline-none focus:border-gold/60 focus:bg-white/[0.06] transition placeholder:text-white/35";

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3 flex-1">
          <div
            className={`h-9 w-9 rounded-full grid place-items-center text-sm font-semibold border transition ${
              i < step
                ? "bg-gold border-gold text-black"
                : i === step
                  ? "border-gold text-gold"
                  : "border-white/15 text-white/40"
            }`}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-sm font-medium ${i <= step ? "text-white" : "text-white/45"}`}>{s}</span>
          {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-gold" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 p-6 md:p-7 bg-card/40">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/55 font-semibold flex items-center gap-2">
        {icon && <span className="text-gold [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span>}
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </label>
  );
}

function Counter({
  value,
  setValue,
  min,
  max,
}: {
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between h-11 px-2 rounded-xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setValue(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => setValue(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function GuestRow({
  idx,
  kind,
  form,
}: {
  idx: number;
  kind: "adults" | "children";
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const errs = form.formState.errors[kind]?.[idx];
  const label = kind === "adults" ? "Adult" : "Child";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]"
    >
      <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
        {label} {idx + 1}
      </p>
      <div className="grid sm:grid-cols-[1.4fr_0.6fr_0.8fr] gap-3">
        <div>
          <input
            placeholder="Name"
            className={inputCls}
            {...form.register(`${kind}.${idx}.name` as const)}
          />
          {errs?.name && <p className="mt-1 text-xs text-destructive">{errs.name.message}</p>}
        </div>
        <div>
          <input
            type="number"
            placeholder="Age"
            className={inputCls}
            {...form.register(`${kind}.${idx}.age` as const)}
          />
          {errs?.age && <p className="mt-1 text-xs text-destructive">{errs.age.message}</p>}
        </div>
        <select
          className={inputCls + " [color-scheme:dark]"}
          {...form.register(`${kind}.${idx}.gender` as const)}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-white/70">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
