import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, HeartHandshake, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/company")({
  head: () => ({ meta: [{ title: "Company — Maison Noir" }] }),
  component: CompanyPage,
});

function CompanyPage() {
  const values = [
    {
      icon: Sparkles,
      title: "Quiet luxury",
      body: "Crafted details, calm service, and the kind of comfort that doesn’t show off.",
    },
    {
      icon: Shield,
      title: "Transparency",
      body: "Clear pricing, clear terms, and availability that matches reality.",
    },
    {
      icon: HeartHandshake,
      title: "Care-first hospitality",
      body: "Warm, human support — before you book, during the stay, and after.",
    },
  ];

  return (
    <ContentPage
      title="Company"
      description="Maison Noir is built for a single thing: a clean, calm hotel booking experience with owner-controlled inventory."
      sections={[
        {
          title: "What we do",
          body: "We curate rooms, keep availability honest, and make booking feel simple — with no surprises at checkout.",
        },
        {
          title: "Where we’re going",
          body: "A tighter guest experience: faster bookings, better confirmations, and a journal that makes travel feel intentional.",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="rounded-3xl border border-black/10 bg-white p-7">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-black">
                {v.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{v.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Partnerships & media</p>
              <p className="mt-1 text-xs text-black/60">
                For collaborations, events, or press enquiries.
              </p>
            </div>
          </div>
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  );
}
