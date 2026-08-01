import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgePercent, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/site/ContentPage";
import type { ComponentType } from "react";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Offers — Maison Noir" }] }),
  component: OffersPage,
});

function OffersPage() {
  return (
    <ContentPage
      title="Offers"
      description="Seasonal rates, quiet upgrades, and small rituals — crafted to make a stay feel effortless."
      sections={[
        {
          title: "Member rates",
          body: "Members occasionally see private pricing and early access windows. Sign up for calm benefits and faster checkout.",
        },
        {
          title: "Long-stay ease",
          body: "Staying a little longer often unlocks softer nightly pricing — ideal for slow weekends and reset trips.",
        },
        {
          title: "Last-minute calm",
          body: "If inventory allows, we sometimes publish short-window rates for travelers who can book quickly.",
        },
        {
          title: "Celebration notes",
          body: "Anniversaries, birthdays, proposals — tell us once and we’ll add the quiet details that matter.",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <OfferCard
          icon={BadgePercent}
          title="Signature savings"
          body="A light rate reduction with flexible check-in windows when available."
        />
        <OfferCard
          icon={CalendarDays}
          title="Midweek serenity"
          body="Best for deep rest: fewer arrivals, calmer corridors, and slower mornings."
        />
        <OfferCard
          icon={Sparkles}
          title="Room upgrade moments"
          body="Occasional complimentary upgrades when inventory is generous — never promised, always appreciated."
        />
      </div>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black">See what’s available today</p>
            <p className="mt-1 text-xs text-black/60">
              Offers are tied to inventory — live availability always wins.
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

function OfferCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-7">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-black">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  );
}
