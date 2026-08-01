import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Maison Noir" }] }),
  component: FAQPage,
});

function FAQPage() {
  const items = [
    {
      q: "Is availability real-time?",
      a: "Yes — rooms and units are managed in the admin panel, and bookings reduce inventory per day.",
    },
    {
      q: "Can I change my dates after booking?",
      a: "If inventory allows, we’ll help move your dates. Rate differences may apply.",
    },
    {
      q: "Do you allow early check-in?",
      a: "When available. Message us before arrival and we’ll confirm the earliest possible time.",
    },
    {
      q: "How do refunds work?",
      a: "Refund terms depend on the rate type you selected. See Refund Policy for the full outline.",
    },
    {
      q: "Can I request a specific room?",
      a: "You can request preferences (floor, view, quiet corner). We’ll do our best based on availability.",
    },
    {
      q: "Is support available during stays?",
      a: "Yes. You can reach us via email and we respond quickly during daytime hours.",
    },
  ];

  return (
    <ContentPage
      title="FAQ"
      description="Fast answers to the questions we hear most often."
      sections={items.map((x) => ({ title: x.q, body: x.a }))}
    >
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black">Still unsure?</p>
            <p className="mt-1 text-xs text-black/60">
              Send one message and we’ll reply with a clear plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
              <Link to="/contact">Contact support</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-black/15 bg-white text-black hover:bg-black/[0.03]"
            >
              <Link to="/refund-policy">Refund policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </ContentPage>
  );
}
