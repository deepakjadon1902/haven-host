import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Refund"
      description="Polished details for this section are landing soon."
    />
  ),
});
