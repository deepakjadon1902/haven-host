import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Privacy"
      description="Polished details for this section are landing soon."
    />
  ),
});
