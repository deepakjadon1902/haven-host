import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Maison Noir" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <ContentPage
      title="About"
      description="A single-property experience designed around calm: honest inventory, clean pricing, and rooms that feel like a reset."
      sections={[
        {
          title: "One hotel, done properly",
          body: "We focus on one place so every detail stays consistent: rooms, service, and guest communication.",
        },
        {
          title: "Owner-controlled inventory",
          body: "Availability is managed day-by-day — so guests book what’s truly available, with fewer surprises.",
        },
        {
          title: "Modern, human support",
          body: "We keep it simple: message us, get a clear answer, and move on with your trip.",
        },
        {
          title: "Design with restraint",
          body: "Warm materials, clean lines, quiet lighting. Luxury that feels calm instead of loud.",
        },
      ]}
    >
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black">Want the fastest way in?</p>
            <p className="mt-1 text-xs text-black/60">
              Browse rooms, pick dates, and book only what’s live.
            </p>
          </div>
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/rooms">Browse rooms</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  );
}
