import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

// Route → page title map
const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pantry": "My Pantry",
  "/recipes": "Recipe Book",
  "/check": "Can I Cook It?",
  "/meal-plan": "Meal Planner",
  "/grocery": "Grocery List",
  "/settings": "Settings",
};

export default function Topbar() {
  const location = useLocation();
  const { user } = useAuth();

  const title = TITLES[location.pathname] ?? "KitchenSync";
  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b shrink-0"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Page title */}
      <h2
        className="font-semibold text-lg"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notification bell (UI only) */}
        <button
          className="p-2 rounded-lg transition-colors relative"
          style={{ color: "var(--text-muted)" }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User avatar → settings */}
        <Link
          to="/settings/profile"
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ml-1"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
