import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Phone,
  User,
  Car,
  Clock,
  PawPrint,
  Calendar,
  Plus,
  Minus,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import type { RoomAvailabilityMap, Room } from "@/types/room";
import { getPublicRoomById, getRoomAvailability } from "@/lib/rooms.functions";
import { savePaymentDraft } from "@/lib/local-store";
import { useAppDataRefresh } from "@/hooks/useAppDataRefresh";
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

  const roomId = search.room;
  const [roomType, setRoomType] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [nights, setNights] = useState(2);
  const [checkIn, setCheckIn] = useState<string>(
    search.date ?? new Date().toISOString().slice(0, 10),
  );
  const [availability, setAvailability] = useState<RoomAvailabilityMap | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const dataRefreshVersion = useAppDataRefresh(5_000);
  const roomTypeId = roomType?.id;

  const maxAdults = roomType?.maxAdults ?? 2;
  const maxChildren = roomType?.maxChildren ?? 0;

  useEffect(() => {
    setCheckIn(search.date ?? new Date().toISOString().slice(0, 10));
  }, [search.date]);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setRoomType(null);
        setRoomLoading(false);
        return;
      }
      setRoomLoading(true);
      try {
        const room = await getPublicRoomById({ id: roomId });
        setRoomType(room);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load room");
        setRoomType(null);
      } finally {
        setRoomLoading(false);
      }
    };
    loadRoom();
  }, [roomId, dataRefreshVersion]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!roomTypeId) return;
      setAvailabilityLoading(true);
      try {
        const days = Math.min(120, Math.max(45, nights + 30));
        const map = await getRoomAvailability({ roomId: roomTypeId, from: checkIn, days });
        setAvailability(map);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load availability");
        setAvailability(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    loadAvailability();
  }, [roomTypeId, checkIn, nights, dataRefreshVersion]);

  const checkOut = useMemo(() => {
    const d = new Date(checkIn + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + nights);
    return d.toISOString().slice(0, 10);
  }, [checkIn, nights]);

  const isDateRangeAvailable = useMemo(() => {
    if (!availability) return null;
    let cur = checkIn;
    while (cur < checkOut) {
      const blocked = availability.blocked[cur];
      const avail = availability.available[cur] ?? 0;
      if (blocked || avail <= 0) return false;
      const d = new Date(cur + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + 1);
      cur = d.toISOString().slice(0, 10);
    }
    return true;
  }, [availability, checkIn, checkOut]);

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

  useEffect(() => {
    if (!user) return;
    form.reset({
      ...form.getValues(),
      fullName: form.getValues("fullName") || user.fullName || "",
      email: form.getValues("email") || user.email || "",
      phone: form.getValues("phone") || user.phone || "",
    });
  }, [form, user]);

  // Sync field arrays with counts
  useEffect(() => {
    const cur = adultsArr.fields.length;
    if (cur < adultsCount)
      for (let i = cur; i < adultsCount; i++)
        adultsArr.append({ name: "", age: 30, gender: "male" });
    if (cur > adultsCount) for (let i = cur - 1; i >= adultsCount; i--) adultsArr.remove(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adultsCount]);

  useEffect(() => {
    const cur = childrenArr.fields.length;
    if (cur < childrenCount)
      for (let i = cur; i < childrenCount; i++)
        childrenArr.append({ name: "", age: 8, gender: "male" });
    if (cur > childrenCount) for (let i = cur - 1; i >= childrenCount; i--) childrenArr.remove(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenCount]);

  const next = async () => {
    let valid = true;
    if (step === 0)
      valid = await form.trigger([
        "fullName",
        "email",
        "phone",
        "transport",
        "arrivalTime",
        "pets",
      ]);
    if (step === 1) valid = await form.trigger(["adults", "children"]);
    if (!valid) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!roomType) return;
    if (isDateRangeAvailable === false) {
      toast.error("Selected dates are not available. Please choose different dates.");
      return;
    }
    const subtotalCents = roomType.pricePerNight * nights * 100;
    const taxesCents = Math.round(subtotalCents * 0.12);
    const totalCents = subtotalCents + taxesCents;

    savePaymentDraft({
      room_id: roomType.id,
      room_type_name: roomType.name,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      adults: data.adults.length,
      children: data.children.length,
      guest_full_name: data.fullName,
      guest_email: data.email,
      guest_phone: data.phone,
      total_cents: totalCents,
      currency: "INR",
    });

    navigate({ to: "/payment" });
  };

  if (roomLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="font-display text-4xl text-black">Loading…</h1>
          <p className="mt-3 text-gray-700">Fetching room details.</p>
        </div>
      </SiteLayout>
    );
  }

  if (!roomType) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="font-display text-4xl text-black">Pick a room first</h1>
          <p className="mt-3 text-gray-700">Open a room and choose dates to start booking.</p>
          <Button asChild className="mt-6 rounded-full font-semibold">
            <Link to="/rooms">Browse rooms</Link>
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
          to="/rooms/$slug"
          params={{ slug: roomType?.slug ?? "" }}
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {roomType?.name}
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <div>
            {isDateRangeAvailable === false ? (
              <div className="mb-4 rounded-2xl border border-red-600/30 bg-red-50 p-4 text-sm text-red-900">
                Selected dates are not available. Pick a different check-in date or reduce nights.
              </div>
            ) : null}
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
                        <Field
                          label="Full name"
                          icon={<User />}
                          error={form.formState.errors.fullName?.message}
                        >
                          <input
                            className={inputCls}
                            placeholder="Your full name"
                            {...form.register("fullName")}
                          />
                        </Field>
                        <Field
                          label="Mobile number"
                          icon={<Phone />}
                          error={form.formState.errors.phone?.message}
                        >
                          <input
                            className={inputCls}
                            placeholder="+91 98765 43210"
                            {...form.register("phone")}
                          />
                        </Field>
                      </Grid>
                      <Field
                        label="Email"
                        icon={<Mail />}
                        error={form.formState.errors.email?.message}
                      >
                        <input
                          className={inputCls}
                          placeholder="you@email.com"
                          {...form.register("email")}
                        />
                      </Field>
                    </Section>

                    <Section title="Travel details">
                      <Grid>
                        <Field label="Transport" icon={<Car />}>
                          <select className={inputCls} {...form.register("transport")}>
                            <option value="personal">Personal vehicle</option>
                            <option value="public">Public transport</option>
                            <option value="shuttle">Hotel shuttle</option>
                          </select>
                        </Field>
                        <Field label="Vehicle number (optional)" icon={<Car />}>
                          <input
                            className={inputCls}
                            placeholder="MH 01 AB 1234"
                            {...form.register("vehicleNumber")}
                          />
                        </Field>
                      </Grid>
                      <Grid>
                        <Field label="Check-in date" icon={<Calendar />}>
                          <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        <Field
                          label="Arrival time"
                          icon={<Clock />}
                          error={form.formState.errors.arrivalTime?.message}
                        >
                          <input
                            type="time"
                            className={inputCls}
                            {...form.register("arrivalTime")}
                          />
                        </Field>
                        <Field label="Nights" icon={<Calendar />}>
                          <Counter value={nights} setValue={setNights} min={1} max={30} />
                        </Field>
                      </Grid>
                    </Section>

                    <Section title="Guest summary">
                      <Grid>
                        <Field label={`Adults (max ${maxAdults})`} icon={<User />}>
                          <Counter
                            value={adultsCount}
                            setValue={setAdultsCount}
                            min={1}
                            max={maxAdults}
                          />
                        </Field>
                        <Field label={`Children (max ${maxChildren})`} icon={<User />}>
                          <Counter
                            value={childrenCount}
                            setValue={setChildrenCount}
                            min={0}
                            max={maxChildren}
                          />
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
                              i === 0
                                ? "bg-gold text-black border-gold"
                                : "border-black/15 text-black/70"
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <Field label="Name on card" error={form.formState.errors.cardName?.message}>
                        <input
                          className={inputCls}
                          placeholder="As printed on card"
                          {...form.register("cardName")}
                        />
                      </Field>
                      <Field label="Card number" error={form.formState.errors.cardNumber?.message}>
                        <input
                          className={inputCls}
                          placeholder="4242 4242 4242 4242"
                          {...form.register("cardNumber")}
                        />
                      </Field>
                      <Grid>
                        <Field
                          label="Expiry (MM/YY)"
                          error={form.formState.errors.cardExpiry?.message}
                        >
                          <input
                            className={inputCls}
                            placeholder="08/28"
                            {...form.register("cardExpiry")}
                          />
                        </Field>
                        <Field label="CVC" error={form.formState.errors.cardCvc?.message}>
                          <input
                            className={inputCls}
                            placeholder="123"
                            {...form.register("cardCvc")}
                          />
                        </Field>
                      </Grid>
                      <p className="text-xs text-gray-700">
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
                  className="rounded-full border-black/15 text-black hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={next}
                    className="rounded-full font-semibold px-6 h-11"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="rounded-full font-semibold px-7 h-11"
                  >
                    Confirm & pay {"\u20B9"}
                    {total.toLocaleString("en-IN")}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-3xl border border-black/10 overflow-hidden bg-white">
              <img src={roomType.coverImage} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold">
                  Maison Noir
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-black">
                  Reservation summary
                </h3>
                <p className="mt-1 text-sm text-gray-700">{roomType.name}</p>
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="text-gray-700/70">Check-in</span> · {checkIn}
                  </p>
                  <p>
                    <span className="text-gray-700/70">Check-out</span> · {checkOut}
                  </p>
                  <p>
                    <span className="text-gray-700/70">Nights</span> · {nights}
                  </p>
                  <p>
                    <span className="text-gray-700/70">Guests</span> · {adultsCount} adults
                    {childrenCount ? `, ${childrenCount} children` : ""}
                  </p>
                </div>
                <div className="mt-5 border-t border-black/10 pt-5 space-y-2 text-sm text-black">
                  <Row
                    label={`₹${roomType.pricePerNight.toLocaleString("en-IN")} × ${nights} nights`}
                    value={`₹${subtotal.toLocaleString("en-IN")}`}
                  />
                  <Row label="Taxes & fees" value={`₹${taxes.toLocaleString("en-IN")}`} />
                </div>
                <div className="mt-4 border-t border-black/10 pt-4 flex items-baseline justify-between text-black">
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
  "w-full bg-white border border-black/15 rounded-xl px-4 h-11 text-sm font-medium text-black outline-none focus:border-gold/60 transition placeholder:text-gray-500";

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
                  : "border-black/15 text-black/40"
            }`}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-sm font-medium ${i <= step ? "text-black" : "text-black/50"}`}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 ${i < step ? "bg-gold" : "bg-black/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-7">
      <h3 className="font-display text-lg font-semibold text-black">{title}</h3>
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
      <span className="text-xs uppercase tracking-widest text-gray-700 font-semibold flex items-center gap-2">
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
    <div className="flex items-center justify-between h-11 px-2 rounded-xl border border-black/15 bg-white">
      <button
        type="button"
        onClick={() => setValue(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="font-semibold text-black">{value}</span>
      <button
        type="button"
        onClick={() => setValue(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-50 disabled:opacity-30"
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
      className="rounded-2xl border border-black/10 bg-white p-4"
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
    <div className="flex justify-between text-gray-700">
      <span>{label}</span>
      <span className="text-black">{value}</span>
    </div>
  );
}
