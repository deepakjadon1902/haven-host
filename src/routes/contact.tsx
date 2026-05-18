import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Contact"
      description="Polished details for this section are landing soon."
    />
  ),
});
