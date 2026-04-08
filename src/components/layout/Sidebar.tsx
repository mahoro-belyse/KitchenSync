import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChefHat,
  LayoutDashboard,
  Package,
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  { to: "/", icon: ChefHat, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pantry", icon: Package, label: "Pantry" },
  { to: "/recipes", icon: BookOpen, label: "Recipes" },

  { to: "/meal-plan", icon: CalendarDays, label: "Meal Plan" },
  { to: "/grocery", icon: ShoppingCart, label: "Grocery List" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Persist collapsed state in localStorage
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );

  // Profile data from Supabase (avatar, full_name, email fallback)
  const [profile, setProfile] = useState<Profile | null>(null);

  // ── Fetch profile from Supabase profiles table ──────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) setProfile(data as Profile);
    };

    fetchProfile();
  }, [user]);

  // ── Persist collapsed state ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // ── Supabase sign-out → redirect to landing ──────────────────────────────
  const handleLogout = async () => {
    await signOut(); // supabase.auth.signOut() via AuthContext
    navigate("/", { replace: true }); // React Router — no window.location hack
  };

  // ── Display name / initials ──────────────────────────────────────────────
  const displayName = profile?.full_name || user?.email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden border-r shrink-0"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
        // Subtle vertical stripe texture (spec Part 3.1)
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px)",
        backgroundSize: "40px 100%",
        backgroundBlendMode: "overlay",
        opacity: 1,
      }}
    >
      {/* ── Logo ── */}
      <div className="p-4 flex items-center gap-3 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="font-display text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            KitchenSync
          </motion.span>
        )}
      </div>

      {/* ── User avatar + name → links to /settings ── */}
      {user && (
        <Link
          to="/settings/profile"
          className="mx-3 mb-2 p-2 rounded-xl flex items-center gap-3 transition-colors hover:opacity-80"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          {/* Avatar: show image if available, else initials */}
          <div className="shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden min-w-0"
            >
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {displayName}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {user.email}
              </p>
            </motion.div>
          )}
        </Link>
      )}

      {/* ── Main nav items ── */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={({ isActive }) => ({
              backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {({ isActive }) => (
              <>
                {/* Sliding active indicator — Framer Motion layoutId ── */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ backgroundColor: "var(--accent)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{ color: "inherit" }}
                />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom section: Settings + Theme + Logout + Collapse ── */}
      <div className="px-3 pb-4 space-y-1 shrink-0">
        {/* Settings link */}
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={({ isActive }) => ({
            backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
            color: isActive ? "var(--accent)" : "var(--text-secondary)",
          })}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* Theme toggle + logout row */}
        <div className="flex items-center justify-between px-3 py-1">
          <ThemeToggle />
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--danger)" }}
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          )}
        </div>

        {/* Collapsed logout (icon only) */}
        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 transition-colors hover:opacity-80"
            style={{ color: "var(--danger)" }}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Collapse / expand toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center py-2 rounded-xl transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
