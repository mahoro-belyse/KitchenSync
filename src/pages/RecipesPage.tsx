import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeForm, {
  type RecipeSavePayload,
} from "@/components/recipes/RecipeForm";
import PantryCheckModal from "@/components/check/PantryCheckModal";
import { staggerContainer } from "@/lib/motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { RecipeWithIngredients, InventoryItem } from "@/types";

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecipesPage() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [checkRecipe, setCheckRecipe] = useState<RecipeWithIngredients | null>(
    null,
  );

  // ── Fetch recipes (with ingredients) + inventory in parallel ─────────────
  const load = useCallback(async (): Promise<void> => {
    if (!user) return;

    const [recRes, invRes] = await Promise.all([
      supabase
        .from("recipes")
        .select("*, recipe_ingredients(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("inventory").select("*").eq("user_id", user.id),
    ]);

    if (recRes.error) {
      toast.error("Failed to load recipes.");
      console.error(recRes.error);
    } else {
      setRecipes((recRes.data ?? []) as RecipeWithIngredients[]);
    }

    if (!invRes.error) {
      setInventory((invRes.data ?? []) as InventoryItem[]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

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

  // ── Save recipe — two-step Supabase insert (spec Part 6.4) ───────────────
  const handleSave = async (data: RecipeSavePayload): Promise<void> => {
    if (!user) return;

    // Step 1 — insert the recipe row
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        cuisine: data.cuisine,
        prep_time: data.prep_time,
        servings: data.servings,
        image_url: data.image_url,
      })
      .select()
      .single();

    if (recipeError || !recipe) {
      toast.error("Failed to save recipe.");
      console.error(recipeError);
      return;
    }

    // Step 2 — insert all ingredient rows linked to the new recipe
    if (data.ingredients.length > 0) {
      const ingredientRows = data.ingredients.map((ing) => ({
        recipe_id: recipe.id,
        ingredient_name: ing.ingredient_name,
        required_qty: ing.required_qty,
        unit: ing.unit,
      }));

      const { error: ingError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientRows);

      if (ingError) {
        // Recipe was saved but ingredients failed — still show partial success
        toast.error(
          "Recipe saved but ingredients failed. Please edit and re-add them.",
        );
        console.error(ingError);
        setFormOpen(false);
        load();
        return;
      }
    }

    toast.success("Recipe saved!");
    setFormOpen(false);
    load();
  };

  // ── Delete recipe — optimistic (cascade deletes ingredients via FK) ───────
  const handleDelete = async (id: number): Promise<void> => {
    // Optimistic
    setRecipes((prev) => prev.filter((r) => r.id !== id));

    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete recipe.");
      load(); // rollback via reload
    } else {
      toast.success("Recipe deleted");
    }
  };

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

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader
        title="Recipe Book"
        subtitle={`${recipes.length} recipe${recipes.length !== 1 ? "s" : ""} saved`}
      >
        <Button
          onClick={() => setFormOpen(true)}
          className="text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus className="w-4 h-4 mr-2" /> New Recipe
        </Button>
      </PageHeader>

      {/* ── Search bar ── */}
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

      {/* ── Empty state or grid ── */}
      {filtered.length === 0 && recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your recipe book is empty"
          description="Add your first recipe and start cooking!"
          actionLabel="Add First Recipe"
          onAction={() => setFormOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <p
          className="text-center py-8"
          style={{ color: "var(--text-secondary)" }}
        >
          No recipes match your search.
        </p>
      ) : (
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
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Modals ── */}
      <RecipeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <PantryCheckModal
        open={!!checkRecipe}
        onClose={() => setCheckRecipe(null)}
        recipe={checkRecipe}
      />
    </div>
  );
}
