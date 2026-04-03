import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import RecipeCard from "@/components/recipes/RecipeCard";
import PantryCheckModal from "@/components/check/PantryCheckModal";
import { staggerContainer } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { RecipeWithIngredients, InventoryItem } from "@/types";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckPage() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [checkRecipe, setCheckRecipe] = useState<RecipeWithIngredients | null>(
    null,
  );

  // ── Fetch recipes (with ingredients) + inventory in parallel ─────────────
  useEffect(() => {
    if (!user) return;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const [recipesRes, inventoryRes] = await Promise.all([
          // Fetch recipes joined with their ingredients
          supabase
            .from("recipes")
            .select("*, recipe_ingredients(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          // Fetch current pantry inventory
          supabase.from("inventory").select("*").eq("user_id", user.id),
        ]);

        if (recipesRes.error) throw recipesRes.error;
        if (inventoryRes.error) throw inventoryRes.error;

        setRecipes((recipesRes.data ?? []) as RecipeWithIngredients[]);
        setInventory((inventoryRes.data ?? []) as InventoryItem[]);
      } catch (err) {
        console.error("CheckPage load error:", err);
        setError("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  // ── Readiness score — % of ingredient names found in pantry ──────────────
  const getReadinessScore = (recipe: RecipeWithIngredients): number => {
    const ingredients = recipe.recipe_ingredients ?? [];
    if (!ingredients.length) return 0;

    const matched = ingredients.filter((ing) =>
      inventory.some(
        (i) =>
          i.item_name.toLowerCase().trim() ===
          ing.ingredient_name.toLowerCase().trim(),
      ),
    ).length;

    return Math.round((matched / ingredients.length) * 100);
  };

  // ── Client-side search filter ─────────────────────────────────────────────
  const filtered = recipes.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="h-10 rounded-lg w-48 animate-pulse"
          style={{ backgroundColor: "var(--bg-surface)" }}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl animate-pulse"
              style={{ backgroundColor: "var(--bg-surface)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Can I Cook It?"
          subtitle="Select any recipe to instantly check if you have everything you need."
        />
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
            onClick={() => window.location.reload()}
            className="text-sm underline"
            style={{ color: "var(--danger)" }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Can I Cook It?"
        subtitle="Select any recipe to instantly check if you have everything you need."
      />

      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="pl-10"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title={search ? "No recipes match your search" : "No recipes yet"}
          description={
            search
              ? "Try a different search term."
              : "Add recipes first, then come back to check what you can cook."
          }
        />
      ) : (
        /* Recipe grid */
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                readinessScore={getReadinessScore(recipe)}
                onCheckPantry={setCheckRecipe}
                onDelete={() => {}} // deletion not available on this page
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pantry check modal */}
      <PantryCheckModal
        open={!!checkRecipe}
        onClose={() => setCheckRecipe(null)}
        recipe={checkRecipe}
      />
    </div>
  );
}
