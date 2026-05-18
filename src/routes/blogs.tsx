import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/blogs")({
  head: () => ({ meta: [{ title: "Blogs — Maison Noir" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Maison Noir"
      title="Blogs"
      description="Polished details for this section are landing soon."
    />
  ),
});
