import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({ meta: [{ title: "Refund Policy — Maison Noir" }] }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <ContentPage
      title="Refund Policy"
      description="Clear, predictable rules — with real humans available when plans change."
      sections={[
        {
          title: "Cancellations",
          body: "Most stays support free cancellation within a defined window. If your booking is non-refundable, we clearly mark it before payment.",
        },
        {
          title: "Date changes",
          body: "If inventory allows, we’ll help you shift dates. Rate differences may apply depending on season and room type.",
        },
        {
          title: "No-shows",
          body: "No-shows may be charged for the first night (or as listed at checkout). We recommend contacting us as early as possible.",
        },
        {
          title: "Refund timelines",
          body: "Once approved, refunds typically reflect back based on your bank/payment method processing times.",
        },
      ]}
    >
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <p className="text-sm leading-relaxed text-gray-700">
          For the exact refund rules tied to your reservation, check your confirmation email or
          message support with your booking reference.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/contact">Contact support</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-black/15 bg-white text-black hover:bg-black/[0.03]"
          >
            <Link to="/legal">Back to legal</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  );
}
