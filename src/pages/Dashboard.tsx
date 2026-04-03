import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  BookOpen,
  CalendarDays,
  ShoppingCart,
  ChefHat,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/motion";
import { checkPantry } from "@/lib/pantryCheck";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type {
  InventoryItem,
  Recipe,
  MealPlan,
  GroceryItem,
  RecipeIngredient,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: RecipeIngredient[];
}

// ─── Date helpers (replacing moment) ─────────────────────────────────────────

/** "Sunday, June 15, 2025" */
const formatFullDate = (): string =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

/** ISO string of Monday 00:00:00 of the current week */
const getWeekStart = (): string => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // adjust so Monday = start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** ISO string of Sunday 23:59:59 of the current week */
const getWeekEnd = (): string => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day; // adjust so Sunday = end
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

/** "2 minutes ago", "3 days ago", etc. */
const timeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60_000) return rtf.format(-Math.floor(diff / 1_000), "seconds");
  if (abs < 3_600_000) return rtf.format(-Math.floor(diff / 60_000), "minutes");
  if (abs < 86_400_000)
    return rtf.format(-Math.floor(diff / 3_600_000), "hours");
  if (abs < 2_592_000_000)
    return rtf.format(-Math.floor(diff / 86_400_000), "days");
  return rtf.format(-Math.floor(diff / 2_592_000_000), "months");
};

/** "Good morning / afternoon / evening, [name]" */
const getGreeting = (name: string): string => {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name} ☀️`;
  if (h < 17) return `Good afternoon, ${name} 🌤`;
  return `Good evening, ${name} 🌙`;
};

// ─── Stat card config ─────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  accentBg: string;
  accentColor: string;
  to: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [cookableRecipes, setCookableRecipes] = useState<
    RecipeWithIngredients[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load all dashboard data in parallel ────────────────────────────────────
  const load = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const weekStart = getWeekStart();
      const weekEnd = getWeekEnd();

      const [invRes, recRes, mpRes, giRes] = await Promise.all([
        supabase.from("inventory").select("*").eq("user_id", user.id),
        supabase
          .from("recipes")
          .select("*, recipe_ingredients(*)")
          .eq("user_id", user.id),
        supabase
          .from("meal_plans")
          .select("*")
          .eq("user_id", user.id)
          .gte("planned_date", weekStart)
          .lte("planned_date", weekEnd),
        supabase
          .from("grocery_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_checked", false),
      ]);

      if (invRes.error) throw invRes.error;
      if (recRes.error) throw recRes.error;
      if (mpRes.error) throw mpRes.error;
      if (giRes.error) throw giRes.error;

      const inv = (invRes.data ?? []) as InventoryItem[];
      const rec = (recRes.data ?? []) as RecipeWithIngredients[];

      setInventory(inv);
      setRecipes(rec);
      setMealPlans(mpRes.data ?? []);
      setGroceryItems(giRes.data ?? []);

      // Determine which recipes can be cooked right now
      const cookable = rec.filter((r) => {
        if (!r.recipe_ingredients?.length) return false;
        return checkPantry(r.recipe_ingredients, inv).canCook;
      });
      setCookableRecipes(cookable.slice(0, 3));
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "Chef";
  const lowStockItems = inventory.filter((i) => i.quantity < 2);
  const recentItems = [...inventory]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const stats: StatCard[] = [
    {
      label: "Pantry Items",
      value: inventory.length,
      icon: Package,
      accentBg: "var(--accent-soft)",
      accentColor: "var(--accent)",
      to: "/pantry",
    },
    {
      label: "Saved Recipes",
      value: recipes.length,
      icon: BookOpen,
      accentBg: "var(--success-soft)",
      accentColor: "var(--success)",
      to: "/recipes",
    },
    {
      label: "This Week's Meals",
      value: mealPlans.length,
      icon: CalendarDays,
      accentBg: "var(--warning-soft)",
      accentColor: "var(--warning)",
      to: "/meal-plan",
    },
    {
      label: "Shopping Items",
      value: groceryItems.length,
      icon: ShoppingCart,
      accentBg: "var(--bg-surface)",
      accentColor: "var(--text-secondary)",
      to: "/grocery",
    },
  ];

  // ── Delete inventory item (optimistic) ─────────────────────────────────────
  const deleteInventoryItem = async (id: number): Promise<void> => {
    // Optimistic update — remove immediately from UI
    setInventory((prev) => prev.filter((i) => i.id !== id));

    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      console.error("Delete failed:", error);
      // Rollback on failure
      load();
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="h-10 rounded-lg w-72 animate-pulse"
          style={{ backgroundColor: "var(--bg-surface)" }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: "var(--bg-surface)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          backgroundColor: "var(--danger-soft)",
          border: "1px solid var(--danger)",
        }}
      >
        <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>
          {error}
        </p>
        <button
          onClick={load}
          className="text-sm underline"
          style={{ color: "var(--danger)" }}
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ── Greeting header ── */}
      <motion.div {...fadeUp}>
        <h1
          className="font-display text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {getGreeting(firstName)}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>{formatFullDate()}</p>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={staggerItem}>
              <Link to={stat.to} className="block">
                <div
                  className="rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: stat.accentBg }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: stat.accentColor }}
                    />
                  </div>
                  <p
                    className="font-mono text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── What can you cook today? ── */}
      {cookableRecipes.length > 0 && (
        <motion.div {...fadeUp} className="space-y-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2
              className="font-display text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              What can you cook today?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cookableRecipes.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={
                    r.image_url ??
                    "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80"
                  }
                  alt={r.title}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <h3
                    className="font-display font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.title}
                  </h3>
                  <span
                    className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "var(--success-soft)",
                      color: "var(--success)",
                    }}
                  >
                    Ready to Cook ✅
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Empty cookable state ── */}
      {cookableRecipes.length === 0 && recipes.length > 0 && (
        <motion.div
          {...fadeUp}
          className="rounded-2xl p-6 text-center"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <ChefHat
            className="w-8 h-8 mx-auto mb-2"
            style={{ color: "var(--text-muted)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>
            Add more ingredients to your pantry to unlock recipes you can cook
            today.
          </p>
          <Button asChild variant="outline" className="mt-3">
            <Link to="/pantry">Go to Pantry</Link>
          </Button>
        </motion.div>
      )}

      {/* ── Low stock alert ── */}
      {lowStockItems.length > 0 && (
        <motion.div
          {...fadeUp}
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--warning-soft)",
            border: "1px solid var(--warning)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: "var(--warning)" }}
            />
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--warning)" }}
            >
              Low Stock Alert
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You're running low on{" "}
            <strong>
              {lowStockItems
                .slice(0, 3)
                .map((i) => i.item_name)
                .join(", ")}
            </strong>
            {lowStockItems.length > 3 &&
              ` and ${lowStockItems.length - 3} more items`}
            .
          </p>
        </motion.div>
      )}

      {/* ── Recent pantry activity ── */}
      {recentItems.length > 0 && (
        <motion.div {...fadeUp} className="space-y-3">
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Pantry Activity
          </h2>
          <div
            className="rounded-2xl overflow-hidden divide-y"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderColor: "var(--border)",
            }}
          >
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 py-3 group"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <span
                    className="font-medium text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.item_name}
                  </span>
                  <span
                    className="text-sm ml-2 font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {timeAgo(item.created_at)}
                  </span>
                  <button
                    onClick={() => deleteInventoryItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--danger)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                    aria-label={`Delete ${item.item_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
