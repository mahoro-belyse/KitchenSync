import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecipeWithIngredients } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecipeCardProps {
  recipe: RecipeWithIngredients;
  readinessScore: number; // 0–100 — % of ingredient names found in pantry
  onCheckPantry: (recipe: RecipeWithIngredients | null) => void;
  onDelete: (id: number) => void;
}

// ─── Helper — score → color tokens ───────────────────────────────────────────
const scoreStyle = (
  score: number,
): { backgroundColor: string; color: string } => {
  if (score >= 80)
    return { backgroundColor: "var(--success-soft)", color: "var(--success)" };
  if (score >= 40)
    return { backgroundColor: "var(--warning-soft)", color: "var(--warning)" };
  return { backgroundColor: "var(--danger-soft)", color: "var(--danger)" };
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecipeCard({
  recipe,
  readinessScore,
  onCheckPantry,
  onDelete,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const ingredients = recipe.recipe_ingredients ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl overflow-hidden group transition-shadow hover:shadow-lg"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* ── Recipe image + overlays ── */}
      <div className="relative overflow-hidden">
        <img
          src={
            recipe.image_url ||
            "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80"
          }
          alt={recipe.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Readiness score badge — top right */}
        <div className="absolute top-3 right-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold font-mono"
            style={scoreStyle(readinessScore)}
          >
            {readinessScore}%
          </span>
        </div>

        {/* Delete button — top left, hover reveal */}
        <button
          onClick={() => onDelete(recipe.id)}
          className="absolute top-3 left-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--bg-card) 80%, transparent)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--danger-soft)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              "color-mix(in srgb, var(--bg-card) 80%, transparent)")
          }
          aria-label={`Delete ${recipe.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--danger)" }} />
        </button>
      </div>

      {/* ── Card body ── */}
      <div className="p-4 space-y-3">
        {/* Title + meta row */}
        <div>
          <h3
            className="font-display text-lg font-semibold leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {recipe.title}
          </h3>

          <div
            className="flex items-center flex-wrap gap-3 mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {recipe.cuisine && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                }}
              >
                {recipe.cuisine}
              </span>
            )}
            {recipe.prep_time != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono">{recipe.prep_time}</span>min
              </span>
            )}
            {recipe.servings != null && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span className="font-mono">{recipe.servings}</span>
              </span>
            )}
          </div>
        </div>

        {/* Expandable ingredient list */}
        {ingredients.length > 0 && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              {ingredients.length} ingredient
              {ingredients.length !== 1 ? "s" : ""}
              {expanded ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.ul
                  key="ingredients"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-1 overflow-hidden"
                >
                  {ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="text-xs flex items-center gap-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "var(--text-muted)" }}
                      />
                      <span className="font-mono">
                        {ing.required_qty} {ing.unit}
                      </span>
                      {ing.ingredient_name}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Check Pantry CTA */}
        <Button
          onClick={() => onCheckPantry(recipe)}
          className="w-full text-white"
          style={{ backgroundColor: "var(--accent)" }}
          size="sm"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          Check Pantry
        </Button>
      </div>
    </motion.div>
  );
}
