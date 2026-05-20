import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2, Trash2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Room } from "@/types/room";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved rooms — MaisonNoir" }] }),
  component: SavedPage,
});

function SavedPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: saved } = await supabase.from("saved_hotels").select("hotel_slug");
      const slugs = (saved ?? []).map((r) => r.hotel_slug);
      if (slugs.length === 0) { setLoading(false); return; }
      const { data: rs } = await supabase.from("rooms").select("id, slug, name, description, price_per_night_cents, max_adults, max_children, pets_allowed, size, bed_type, amenities, images, cover_image, total_units, active, sort_order").in("slug", slugs);
      setRooms((rs ?? []).map((r) => ({
        id: r.id, slug: r.slug, name: r.name, description: r.description ?? "",
        pricePerNightCents: Number(r.price_per_night_cents), pricePerNight: Math.round(Number(r.price_per_night_cents)/100),
        maxAdults: r.max_adults, maxChildren: r.max_children, petsAllowed: r.pets_allowed,
        size: r.size, bedType: r.bed_type, amenities: r.amenities ?? [], images: r.images ?? [],
        coverImage: r.cover_image ?? (r.images?.[0] ?? ""), totalUnits: r.total_units, active: r.active, sortOrder: r.sort_order,
      })));
      setLoading(false);
    })();
  }, [user]);

  const remove = async (slug: string) => {
    if (!user) return;
    const { error } = await supabase.from("saved_hotels").delete().eq("user_id", user.id).eq("hotel_slug", slug);
    if (error) return toast.error(error.message);
    setRooms((s) => s.filter((x) => x.slug !== slug));
    toast.success("Removed.");
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Wishlist</p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Saved rooms</h1>
      <p className="mt-2 text-muted-foreground max-w-xl">Rooms you've bookmarked for later.</p>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
          <Heart className="h-10 w-10 text-gold mx-auto" />
          <h3 className="mt-4 font-display text-xl font-semibold">Nothing saved yet</h3>
          <p className="mt-2 text-muted-foreground">Browse rooms to add one to your list.</p>
          <Button asChild className="mt-6 rounded-full font-semibold">
            <Link to="/rooms">Browse rooms <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {rooms.map((r) => (
            <div key={r.slug} className="group rounded-2xl border border-border overflow-hidden bg-card">
              <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                {r.coverImage && <img src={r.coverImage} alt={r.name} className="aspect-[5/3] w-full object-cover transition group-hover:scale-105" />}
              </Link>
              <div className="p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold truncate">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">₹{r.pricePerNight.toLocaleString("en-IN")} / night</p>
                </div>
                <button onClick={() => remove(r.slug)} className="shrink-0 h-9 w-9 grid place-items-center rounded-full border border-border hover:border-destructive hover:text-destructive transition" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
