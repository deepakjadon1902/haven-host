import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/legal")({
  head: () => ({ meta: [{ title: "Legal — Maison Noir" }] }),
  component: LegalPage,
});

function LegalPage() {
  const items = [
    {
      to: "/terms",
      icon: Scale,
      title: "Terms of Service",
      body: "What to expect when you browse, book, and manage reservations.",
    },
    {
      to: "/privacy",
      icon: ShieldCheck,
      title: "Privacy Policy",
      body: "How we collect, use, and protect your data with care.",
    },
    {
      to: "/refund-policy",
      icon: FileText,
      title: "Refund Policy",
      body: "Clear rules for cancellations, changes, and refunds.",
    },
  ];

  return (
    <ContentPage
      title="Legal"
      description="Simple, readable policies — written so you can understand them quickly."
      sections={[
        {
          title: "Plain language",
          body: "We keep policy text short and clear. If something isn’t clear, we’ll explain it.",
        },
        {
          title: "No surprises",
          body: "The goal is fewer disputes and smoother stays. Transparent terms are part of that.",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="group rounded-3xl border border-black/10 bg-white p-7 hover:bg-black/[0.03]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-black/25 transition group-hover:text-black/50" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-black">
                {it.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{it.body}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black">Need clarification?</p>
            <p className="mt-1 text-xs text-black/60">
              We’ll reply quickly with the exact policy section and a clear answer.
            </p>
          </div>
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  );
}
