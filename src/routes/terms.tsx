import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Terms"
      description="Polished details for this section are landing soon."
    />
  ),
});
