import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Maison Noir" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      description="We collect only what we need to provide bookings, support, and a smoother experience."
      sections={[
        {
          title: "What we collect",
          body: "Basic contact details, booking details, and payment-related metadata required to process reservations.",
        },
        {
          title: "How we use it",
          body: "To confirm bookings, provide support, share important stay updates, and improve the booking flow.",
        },
        {
          title: "Sharing",
          body: "We do not sell your personal data. We share only with essential service providers needed to process bookings.",
        },
        {
          title: "Your choices",
          body: "You can request data access or deletion by contacting support. We’ll respond with clear next steps.",
        },
      ]}
    />
  );
}
