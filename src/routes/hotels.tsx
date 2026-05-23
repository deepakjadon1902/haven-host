import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hotels")({
  component: () => {
    if (typeof window !== "undefined") {
      window.location.replace("/rooms");
    }
    return null;
  },
});
