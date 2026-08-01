import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — Maison Noir" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <ContentPage
      title="Terms"
      description="A readable outline of how the site works, what to expect when booking, and how we handle changes."
      sections={[
        {
          title: "Bookings",
          body: "A booking is confirmed once payment is completed and you receive a confirmation message with reference.",
        },
        {
          title: "Pricing",
          body: "Rates, taxes, and totals are displayed before confirmation. Seasonal pricing may apply based on dates selected.",
        },
        {
          title: "Changes & cancellations",
          body: "Change and cancellation rules depend on the booking type selected at checkout. See Refund Policy for details.",
        },
        {
          title: "Use of the website",
          body: "Please use the website responsibly. Misuse, automated scraping, or abusive behavior may result in restricted access.",
        },
      ]}
    />
  );
}
