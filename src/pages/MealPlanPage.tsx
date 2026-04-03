import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fadeUp } from "@/lib/motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { MealPlan, Recipe } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
interface AddModalState {
  date: Date;
  mealType: MealType;
}

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

// ─── Meal type accent colours ─────────────────────────────────────────────────
const MEAL_COLORS: Record<MealType, { bg: string; text: string }> = {
  Breakfast: { bg: "var(--warning-soft)", text: "var(--warning)" },
  Lunch: { bg: "var(--success-soft)", text: "var(--success)" },
  Dinner: { bg: "var(--accent-soft)", text: "var(--accent)" },
  Snack: { bg: "var(--bg-surface)", text: "var(--text-secondary)" },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
const fmtWeekday = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
const fmtDay = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(d);
const fmtShort = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    d,
  );
const fmtLong = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
const toYMD = (d: Date) => d.toISOString().split("T")[0];
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// ─── Component ────────────────────────────────────────────────────────────────
export default function MealPlanPage() {
  const { user } = useAuth();

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date()),
  );
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addModal, setAddModal] = useState<AddModalState | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string>("");
  const [customMeal, setCustomMeal] = useState<string>("");
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  // Mobile: which day is expanded (index 0-6), default today or 0
  const [expandedDay, setExpandedDay] = useState<number>(() => {
    const today = new Date();
    const start = getWeekStart(today);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
    return Math.max(0, Math.min(6, diff));
  });

  const days: Date[] = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i),
  );
  const weekEnd = addDays(weekStart, 6);

  const load = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    const [mpRes, recRes] = await Promise.all([
      supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .gte("planned_date", toYMD(weekStart))
        .lte("planned_date", toYMD(weekEnd)),
      supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("title"),
    ]);
    setPlans((mpRes.data ?? []) as MealPlan[]);
    setRecipes((recRes.data ?? []) as Recipe[]);
    setLoading(false);
  }, [user, weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const getMeals = (date: Date, mealType: MealType): MealPlan[] =>
    plans.filter(
      (p) =>
        p.planned_date.split("T")[0] === toYMD(date) &&
        p.meal_type === mealType,
    );

  const getDayMealCount = (date: Date): number =>
    plans.filter((p) => p.planned_date.split("T")[0] === toYMD(date)).length;

  const handleAddMeal = async (): Promise<void> => {
    if (!addModal || !user) return;
    setSaving(true);
    const recipe = recipes.find((r) => String(r.id) === selectedRecipe);
    const { error } = await supabase.from("meal_plans").insert({
      user_id: user.id,
      planned_date: toYMD(addModal.date),
      meal_type: addModal.mealType,
      recipe_id: recipe?.id ?? null,
      notes: useCustom ? customMeal : null,
    });
    if (error) {
      toast.error("Failed to add meal.");
    } else {
      toast.success("Meal added!");
      setAddModal(null);
      setSelectedRecipe("");
      setCustomMeal("");
      setUseCustom(false);
      load();
    }
    setSaving(false);
  };

  const handleRemoveMeal = async (id: number): Promise<void> => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from("meal_plans").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove meal.");
      load();
    }
  };

  const handleClearWeek = async (): Promise<void> => {
    if (!user || !plans.length) return;
    const snapshot = plans;
    setPlans([]);
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", user.id)
      .gte("planned_date", toYMD(weekStart))
      .lte("planned_date", toYMD(weekEnd));
    if (error) {
      setPlans(snapshot);
      toast.error("Failed to clear week.");
    } else {
      toast.success("Week cleared");
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-0">
        <div
          className="h-10 rounded-lg w-64 animate-pulse"
          style={{ backgroundColor: "var(--bg-surface)" }}
        />
        <div
          className="h-64 sm:h-96 rounded-2xl animate-pulse"
          style={{ backgroundColor: "var(--bg-surface)" }}
        />
      </div>
    );
  }

  // ── Shared meal slot renderer ─────────────────────────────────────────────
  const renderMealSlot = (d: Date, mealType: MealType, compact = false) => {
    const meals = getMeals(d, mealType);
    const colors = MEAL_COLORS[mealType];
    return (
      <div
        className={`rounded-xl ${compact ? "p-1.5 min-h-[60px]" : "p-2 min-h-[72px]"}`}
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {meals.map((m) => {
          const recipe = recipes.find((r) => r.id === m.recipe_id);
          const label = recipe?.title ?? m.notes ?? "Meal";
          return (
            <div
              key={m.id}
              className="flex items-center gap-1 p-1.5 rounded-lg text-xs font-medium mb-1 group"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <span className="truncate flex-1 text-[10px] sm:text-xs">
                {label}
              </span>
              <button
                onClick={() => handleRemoveMeal(m.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                aria-label={`Remove ${label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        <button
          onClick={() => setAddModal({ date: d, mealType })}
          className="w-full p-1 rounded-lg border border-dashed text-xs transition-colors flex items-center justify-center gap-1"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          aria-label={`Add ${mealType}`}
        >
          <Plus className="w-3 h-3" />
          {!compact && (
            <span className="hidden sm:inline text-[10px]">Add</span>
          )}
        </button>
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Header ── */}
      <div>
        <h1
          className="font-display text-2xl sm:text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Meal Planner
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Week of {fmtShort(weekStart)} – {fmtLong(weekEnd)}
        </p>
      </div>

      {/* ── Week navigation ── */}
      <motion.div {...fadeUp} className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          style={{ borderColor: "var(--border-strong)" }}
          aria-label="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          onClick={() => setWeekStart(getWeekStart(new Date()))}
          style={{
            borderColor: "var(--border-strong)",
            color: "var(--text-primary)",
          }}
        >
          This Week
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          style={{ borderColor: "var(--border-strong)" }}
          aria-label="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="outline"
          onClick={handleClearWeek}
          className="text-xs sm:text-sm"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          <Trash2 className="w-3.5 h-3.5 sm:mr-2" />
          <span className="hidden sm:inline">Clear Week</span>
        </Button>
      </motion.div>

      <div className="md:hidden space-y-2">
        {days.map((d, idx) => {
          const isToday = isSameDay(d, new Date());
          const isExpanded = expandedDay === idx;
          const mealCount = getDayMealCount(d);

          return (
            <div
              key={toYMD(d)}
              className="rounded-2xl overflow-hidden"
              style={{
                border: isToday
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
              }}
            >
              {/* Day header — tap to expand */}
              <button
                onClick={() => setExpandedDay(isExpanded ? -1 : idx)}
                className="w-full flex items-center justify-between px-4 py-3"
                style={{
                  backgroundColor: isToday
                    ? "var(--accent-soft)"
                    : "var(--bg-card)",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Day pill */}
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isToday
                        ? "var(--accent)"
                        : "var(--bg-surface)",
                      color: isToday ? "#fff" : "var(--text-primary)",
                    }}
                  >
                    <span className="text-[10px] font-medium leading-none">
                      {fmtWeekday(d)}
                    </span>
                    <span className="font-mono text-base font-bold leading-none mt-0.5">
                      {fmtDay(d)}
                    </span>
                  </div>
                  {/* Label */}
                  <div className="text-left">
                    <p
                      className="font-semibold text-sm"
                      style={{
                        color: isToday
                          ? "var(--accent)"
                          : "var(--text-primary)",
                      }}
                    >
                      {fmtShort(d)}
                      {isToday && (
                        <span className="ml-2 text-xs font-normal">Today</span>
                      )}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {mealCount === 0
                        ? "No meals planned"
                        : `${mealCount} meal${mealCount !== 1 ? "s" : ""} planned`}
                    </p>
                  </div>
                </div>

                {/* Expand indicator + meal dots */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {MEAL_TYPES.map((mt) => {
                      const has = getMeals(d, mt).length > 0;
                      return has ? (
                        <div
                          key={mt}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: MEAL_COLORS[mt].text }}
                        />
                      ) : null;
                    })}
                  </div>
                  <ChevronRight
                    className="w-4 h-4 transition-transform duration-200 shrink-0"
                    style={{
                      color: "var(--text-muted)",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
              </button>

              {/* Expanded meal slots */}
              {isExpanded && (
                <div
                  className="px-3 pb-3 pt-1 grid grid-cols-2 gap-2"
                  style={{ backgroundColor: "var(--bg-card)" }}
                >
                  {MEAL_TYPES.map((mealType) => (
                    <div key={mealType}>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wide mb-1 px-0.5"
                        style={{ color: MEAL_COLORS[mealType].text }}
                      >
                        {mealType}
                      </p>
                      {renderMealSlot(d, mealType, true)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-8 gap-1.5">
            {/* Empty corner */}
            <div className="p-2" />

            {/* Day headers */}
            {days.map((d) => {
              const isToday = isSameDay(d, new Date());
              return (
                <div
                  key={toYMD(d)}
                  className="p-2 text-center rounded-xl"
                  style={{
                    backgroundColor: isToday
                      ? "var(--accent)"
                      : "var(--bg-surface)",
                    color: isToday ? "#fff" : "var(--text-primary)",
                  }}
                >
                  <p className="text-xs font-medium">{fmtWeekday(d)}</p>
                  <p className="font-mono text-lg font-bold">{fmtDay(d)}</p>
                </div>
              );
            })}

            {/* Meal type rows */}
            {MEAL_TYPES.map((mealType) => (
              <div key={mealType} className="contents">
                {/* Row label */}
                <div className="flex items-center py-2 px-1">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: MEAL_COLORS[mealType].text }}
                  >
                    {mealType}
                  </span>
                </div>
                {/* Cells */}
                {days.map((d) => (
                  <div key={`${toYMD(d)}-${mealType}`}>
                    {renderMealSlot(d, mealType)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add meal modal ── */}
      <Dialog
        open={!!addModal}
        onOpenChange={(v) => {
          if (!saving && !v) setAddModal(null);
        }}
      >
        <DialogContent
          className="w-[calc(100vw-2rem)] sm:w-full max-w-md rounded-2xl"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Add Meal
              {addModal && (
                <span
                  className="ml-2 text-sm font-normal"
                  style={{ color: "var(--text-muted)" }}
                >
                  {addModal.mealType} · {fmtShort(addModal.date)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Toggle */}
            <div className="flex gap-2">
              {(["From Recipes", "Custom Meal"] as const).map((label) => {
                const isCustom = label === "Custom Meal";
                const active = useCustom === isCustom;
                return (
                  <button
                    key={label}
                    onClick={() => setUseCustom(isCustom)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: active
                        ? "var(--accent)"
                        : "var(--bg-surface)",
                      color: active ? "#fff" : "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {useCustom ? (
              <div>
                <Label style={{ color: "var(--text-secondary)" }}>
                  Meal Name
                </Label>
                <Input
                  value={customMeal}
                  onChange={(e) => setCustomMeal(e.target.value)}
                  placeholder="e.g., Leftovers"
                  className="mt-1.5"
                  autoFocus
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            ) : (
              <div>
                <Label style={{ color: "var(--text-secondary)" }}>
                  Select Recipe
                </Label>
                {recipes.length === 0 ? (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No recipes yet.{" "}
                    <a
                      href="/recipes"
                      className="underline"
                      style={{ color: "var(--accent)" }}
                    >
                      Add one first.
                    </a>
                  </p>
                ) : (
                  <Select
                    value={selectedRecipe}
                    onValueChange={setSelectedRecipe}
                  >
                    <SelectTrigger
                      className="mt-1.5"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <SelectValue placeholder="Choose a recipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <Button
              onClick={handleAddMeal}
              disabled={
                saving || (useCustom ? !customMeal.trim() : !selectedRecipe)
              }
              className="w-full text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {saving ? "Adding..." : "Add Meal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
