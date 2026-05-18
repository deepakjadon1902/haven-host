import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Gallery"
      description="Polished details for this section are landing soon."
    />
  ),
});
