import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Offers — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Offers"
      description="Polished details for this section are landing soon."
    />
  ),
});
