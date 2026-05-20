import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: NonNullable<unknown> & { rpc: (fn: string, params: unknown) => Promise<{ data: unknown; error: { message: string } | null }> }, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin access required");
}

const roomSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(4000).default(""),
  price_per_night_cents: z.number().int().min(0).max(100_000_000),
  max_adults: z.number().int().min(1).max(20),
  max_children: z.number().int().min(0).max(20),
  pets_allowed: z.boolean(),
  size: z.string().max(40).optional().nullable(),
  bed_type: z.string().max(60).optional().nullable(),
  amenities: z.array(z.string().min(1).max(80)).max(40).default([]),
  images: z.array(z.string().url().max(800)).max(20).default([]),
  cover_image: z.string().url().max(800).optional().nullable(),
  total_units: z.number().int().min(1).max(500),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(10_000).default(0),
});

export const adminListRooms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => roomSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { data: row, error } = await supabase.from("rooms").insert(data).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), patch: roomSchema.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { data: row, error } = await supabase
      .from("rooms")
      .update(data.patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("rooms").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* Inventory */

export const adminListInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        roomId: z.string().uuid(),
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const [inv, bks, room] = await Promise.all([
      supabase
        .from("room_inventory")
        .select("date, status, note")
        .eq("room_id", data.roomId)
        .gte("date", data.from)
        .lte("date", data.to),
      supabase
        .from("bookings")
        .select("check_in, check_out, status, reference, guest_full_name")
        .eq("room_id", data.roomId)
        .neq("status", "cancelled"),
      supabase.from("rooms").select("total_units, name").eq("id", data.roomId).single(),
    ]);
    if (inv.error) throw new Error(inv.error.message);
    if (bks.error) throw new Error(bks.error.message);
    if (room.error) throw new Error(room.error.message);
    return { inventory: inv.data ?? [], bookings: bks.data ?? [], room: room.data };
  });

export const adminSetInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        roomId: z.string().uuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        status: z.enum(["closed", "maintenance", "open"]),
        note: z.string().max(280).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    if (data.status === "open") {
      const { error } = await supabase
        .from("room_inventory")
        .delete()
        .eq("room_id", data.roomId)
        .eq("date", data.date);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await supabase
      .from("room_inventory")
      .upsert(
        { room_id: data.roomId, date: data.date, status: data.status, note: data.note ?? null },
        { onConflict: "room_id,date" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* Bookings */

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, reference, hotel_name, room_type_name, room_id, check_in, check_out, nights, adults, children, guest_full_name, guest_email, guest_phone, total_cents, currency, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* Dashboard */

export const adminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);

    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [bookingsAgg, upcoming, rooms] = await Promise.all([
      supabase
        .from("bookings")
        .select("total_cents, status, created_at, check_in")
        .gte("created_at", thirtyDaysAgo),
      supabase
        .from("bookings")
        .select("id, reference, guest_full_name, room_type_name, check_in, check_out, status")
        .gte("check_in", today)
        .neq("status", "cancelled")
        .order("check_in", { ascending: true })
        .limit(10),
      supabase.from("rooms").select("id, name, total_units, active"),
    ]);

    if (bookingsAgg.error) throw new Error(bookingsAgg.error.message);
    if (upcoming.error) throw new Error(upcoming.error.message);
    if (rooms.error) throw new Error(rooms.error.message);

    const recent = bookingsAgg.data as Array<{ total_cents: number; status: string; created_at: string; check_in: string }>;
    const revenue30dCents = recent
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + Number(b.total_cents ?? 0), 0);
    const totalBookings30d = recent.filter((b) => b.status !== "cancelled").length;

    // Build last 14 days bookings count chart
    const byDay: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      byDay[d] = 0;
    }
    for (const b of recent) {
      const d = b.created_at.slice(0, 10);
      if (d in byDay) byDay[d]++;
    }
    const chart = Object.entries(byDay).map(([date, count]) => ({ date, count }));

    const totalUnits = (rooms.data as Array<{ total_units: number; active: boolean }>)
      .filter((r) => r.active)
      .reduce((s, r) => s + r.total_units, 0);

    // occupancy today
    const { data: todayBookings } = await supabase
      .from("bookings")
      .select("id")
      .lte("check_in", today)
      .gt("check_out", today)
      .neq("status", "cancelled");
    const occupiedToday = (todayBookings ?? []).length;
    const occupancyPct = totalUnits > 0 ? Math.round((occupiedToday / totalUnits) * 100) : 0;

    return {
      revenue30dCents,
      totalBookings30d,
      upcoming: upcoming.data ?? [],
      chart,
      totalUnits,
      occupiedToday,
      occupancyPct,
      totalRooms: (rooms.data ?? []).length,
    };
  });

/* Hotel settings */

const settingsSchema = z.object({
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  city: z.string().min(1).max(80),
  country: z.string().min(1).max(80),
  address: z.string().min(1).max(280),
  description: z.string().min(1).max(2000),
  hero_image: z.string().url().max(800),
  contact_email: z.string().email().max(255),
  contact_phone: z.string().min(4).max(40),
});

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("hotel_settings").update(data).eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });