import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  CalendarDays,
  MoreHorizontal,
  ChefHat,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavTab {
  to: string;
  icon: LucideIcon;
  label: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const tabs: NavTab[] = [
  { to: "/", icon: ChefHat, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pantry", icon: Package, label: "Pantry" },
  { to: "/recipes", icon: BookOpen, label: "Recipes" },
  { to: "/meal-plan", icon: CalendarDays, label: "Meals" },
];

const moreItems: NavTab[] = [
  { to: "/grocery", icon: ShoppingCart, label: "Grocery List" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MobileNav() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // ── Supabase sign-out → redirect to landing ──
  const handleLogout = async () => {
    await signOut(); // supabase.auth.signOut() via AuthContext
    navigate("/", { replace: true });
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {/* ── Main tabs ── */}
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-muted)",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── "More" sheet trigger ── */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center gap-1 px-3 py-1.5 transition-colors"
              style={{ color: "var(--text-muted)" }}
              aria-label="More navigation options"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>

          {/* ── Bottom sheet content ── */}
          <SheetContent
            side="bottom"
            className="rounded-t-2xl pb-8"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="space-y-1 pt-2">
              {/* More nav items */}
              {moreItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? "var(--accent)" : "var(--text-primary)",
                    backgroundColor: isActive
                      ? "var(--accent-soft)"
                      : "transparent",
                  })}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}

              {/* Divider */}
              <div
                className="my-2 h-px"
                style={{ backgroundColor: "var(--border)" }}
              />

              {/* ── Logout button → supabase.auth.signOut() ── */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full hover:opacity-80"
                style={{ color: "var(--danger)" }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
