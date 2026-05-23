import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /rooms and /rooms/$slug
export const Route = createFileRoute("/rooms")({
  component: RoomsLayout,
});

function RoomsLayout() {
  return <Outlet />;
}
