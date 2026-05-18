import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "Faq — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Faq"
      description="Polished details for this section are landing soon."
    />
  ),
});
