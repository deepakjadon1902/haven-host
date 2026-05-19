import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2, Trash2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { findHotel } from "@/data/hotels";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved hotels — Maison Noir" }] }),
  component: SavedPage,
});

function SavedPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("saved_hotels").select("hotel_slug");
      setSlugs((data ?? []).map((r) => r.hotel_slug));
      setLoading(false);
    })();
  }, [user]);

  const remove = async (slug: string) => {
    if (!user) return;
    const { error } = await supabase.from("saved_hotels").delete().eq("user_id", user.id).eq("hotel_slug", slug);
    if (error) return toast.error(error.message);
    setSlugs((s) => s.filter((x) => x !== slug));
    toast.success("Removed from saved.");
  };

  const hotels = slugs.map((s) => findHotel(s)).filter((h): h is NonNullable<ReturnType<typeof findHotel>> => Boolean(h));

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Wishlist</p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Saved hotels</h1>
      <p className="mt-2 text-white/65 max-w-xl">Stays you've bookmarked for later.</p>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : hotels.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 p-10 text-center">
          <Heart className="h-10 w-10 text-gold mx-auto" />
          <h3 className="mt-4 font-display text-xl font-semibold">Nothing saved yet</h3>
          <p className="mt-2 text-white/60">Tap the heart on any hotel to save it for later.</p>
          <Button asChild className="mt-6 rounded-full font-semibold">
            <Link to="/hotels">Discover hotels <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {hotels.map((h) => (
            <div key={h.slug} className="group rounded-2xl border border-white/10 overflow-hidden bg-card">
              <Link to="/hotels/$hotelId" params={{ hotelId: h.slug }}>
                <img src={h.heroImage} alt={h.name} className="aspect-[5/3] w-full object-cover transition group-hover:scale-105" />
              </Link>
              <div className="p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-gold font-semibold">{h.city}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold truncate">{h.name}</h3>
                </div>
                <button
                  onClick={() => remove(h.slug)}
                  className="shrink-0 h-9 w-9 grid place-items-center rounded-full border border-white/10 hover:border-destructive hover:text-destructive transition"
                  aria-label="Remove from saved"
                >
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