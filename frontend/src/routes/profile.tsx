import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Hotel,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { listCurrentUserBookings } from "@/lib/profile.functions";
import type { LocalBooking } from "@/lib/local-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile - Haven Host" },
      { name: "description", content: "Manage your Haven Host account and bookings." },
    ],
  }),
  component: ProfilePage,
});

type FormState = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `Rs ${rupees.toLocaleString("en-IN")}`;
}

function ProfilePage() {
  const { user, loading, signOut, refreshUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, navigate, user]);

  useEffect(() => {
    void refreshUser().catch(() => undefined);
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || user.email.split("@")[0],
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    setBookingsLoading(true);
    listCurrentUserBookings(user.email)
      .then((rows) => {
        if (!cancelled) setBookings(rows);
      })
      .catch((error) => {
        if (!cancelled)
          toast.error(error instanceof Error ? error.message : "Failed to load bookings");
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const stats = useMemo(() => {
    const totalSpent = bookings.reduce((sum, b) => sum + (b.total_cents ?? 0), 0);
    const upcoming = bookings.filter(
      (b) => b.status !== "cancelled" && b.check_in >= todayIso(),
    ).length;
    return { totalSpent, upcoming };
  }, [bookings]);

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <p className="text-sm text-gray-700">Loading profile...</p>
        </div>
      </SiteLayout>
    );
  }

  const displayName = user.fullName || user.email.split("@")[0];

  const saveProfile = async () => {
    if (form.fullName.trim().length < 2) {
      toast.error("Full name is required.");
      return;
    }
    setSaving(true);
    const result = await updateProfile({
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      country: form.country,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setEditing(false);
    toast.success("Profile updated.");
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Account</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-black md:text-5xl">
              Your profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              Manage your saved details and review every booking connected to this account.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg border-black/15 font-semibold"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-black/10 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-lg bg-black text-2xl font-semibold uppercase text-white">
                  {displayName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-2xl font-semibold text-black">
                    {displayName}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 truncate text-sm text-gray-700">
                    <Mail className="h-4 w-4 shrink-0 text-gold" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <InfoLine icon={ShieldCheck} label="Role" value={user.role} />
                <InfoLine icon={Phone} label="Phone" value={user.phone || "Not added"} />
                <InfoLine
                  icon={MapPin}
                  label="Location"
                  value={[user.city, user.country].filter(Boolean).join(", ") || "Not added"}
                />
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard icon={CalendarDays} label="Bookings" value={String(bookings.length)} />
              <StatCard icon={CheckCircle2} label="Upcoming" value={String(stats.upcoming)} />
              <StatCard icon={Hotel} label="Total spent" value={formatInr(stats.totalSpent)} />
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-lg border border-black/10 bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black">
                    Personal details
                  </h2>
                  <p className="mt-1 text-sm text-gray-700">
                    These details are saved to your account and used to speed up future bookings.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={editing ? "outline" : "default"}
                  className="rounded-lg font-semibold"
                  onClick={() => setEditing((v) => !v)}
                >
                  <Edit3 className="h-4 w-4" />
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    value={form.fullName}
                    disabled={!editing}
                    onChange={(e) => setForm((v) => ({ ...v, fullName: e.target.value }))}
                    className="profile-input"
                  />
                </Field>
                <Field label="Email">
                  <input value={user.email} disabled className="profile-input bg-gray-50" />
                </Field>
                <Field label="Phone">
                  <input
                    value={form.phone}
                    disabled={!editing}
                    onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
                    className="profile-input"
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="City">
                  <input
                    value={form.city}
                    disabled={!editing}
                    onChange={(e) => setForm((v) => ({ ...v, city: e.target.value }))}
                    className="profile-input"
                    placeholder="Jaipur"
                  />
                </Field>
                <Field label="Country">
                  <input
                    value={form.country}
                    disabled={!editing}
                    onChange={(e) => setForm((v) => ({ ...v, country: e.target.value }))}
                    className="profile-input"
                    placeholder="India"
                  />
                </Field>
                <Field label="Address">
                  <input
                    value={form.address}
                    disabled={!editing}
                    onChange={(e) => setForm((v) => ({ ...v, address: e.target.value }))}
                    className="profile-input"
                    placeholder="Street, area, landmark"
                  />
                </Field>
              </div>

              {editing ? (
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    disabled={saving}
                    className="rounded-lg bg-black font-semibold text-white hover:bg-black/90"
                    onClick={saveProfile}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black">
                    Booking history
                  </h2>
                  <p className="mt-1 text-sm text-gray-700">
                    All reservations linked to {user.email}.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border-black/15 font-semibold"
                >
                  <Link to="/rooms">Book again</Link>
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                {bookingsLoading ? (
                  <div className="rounded-lg border border-black/10 p-8 text-center text-sm text-gray-700">
                    Loading bookings...
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="rounded-lg border border-black/10 p-8 text-center text-sm text-gray-700">
                    No bookings found for this account.
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      to="/my-bookings/$id"
                      params={{ id: booking.id }}
                      className="block rounded-lg border border-black/10 p-4 transition hover:border-gold"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                            {booking.reference}
                          </div>
                          <div className="mt-1 font-display text-xl font-semibold text-black">
                            {booking.room_type_name}
                          </div>
                          <div className="mt-1 text-sm text-gray-700">
                            {booking.check_in} to {booking.check_out} / {booking.nights} night
                            {booking.nights !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <div className="text-sm font-semibold text-black">
                            {formatInr(booking.total_cents)}
                          </div>
                          <div className="mt-1 text-xs capitalize text-gray-600">
                            {booking.status} / {booking.payment_status}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </SiteLayout>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-black/10 p-3">
      <Icon className="h-4 w-4 shrink-0 text-gold" />
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-600">{label}</div>
        <div className="truncate text-sm font-semibold capitalize text-black">{value}</div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-600">
        <Icon className="h-4 w-4 text-gold" />
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-black">{value}</div>
    </div>
  );
}
