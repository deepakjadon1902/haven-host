import { createFileRoute, useNavigate, Outlet, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, Calendar, ShoppingCart, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — Maison Noir" }],
  }),
  component: AdminLayout,
});

interface AdminLayoutProps {
  children?: React.ReactNode;
}

function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    if (user.role !== "admin") {
      navigate({ to: "/" });
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-black">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Package, label: "Rooms", path: "/admin/rooms" },
    { icon: Calendar, label: "Calendar", path: "/admin/calendar" },
    { icon: ShoppingCart, label: "Bookings", path: "/admin/bookings" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-black text-white border-r border-gray-300 flex flex-col transition-all duration-300`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="font-display text-xl font-bold text-yellow-500">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                activeOptions={{ exact: item.path === "/admin" }}
                activeProps={{
                  className: "bg-yellow-500 text-black",
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="mb-3 text-xs text-gray-400">
              <p className="truncate">{user?.email}</p>
            </div>
          )}
          <Button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 justify-center bg-red-600 hover:bg-red-700 text-white border-0"
          >
            <LogOut size={16} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
