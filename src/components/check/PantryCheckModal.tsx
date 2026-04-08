import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ShoppingCart,
  Copy,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { checkPantry } from "@/lib/pantryCheck";
import { scaleIn, staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Recipe, InventoryItem, PantryCheckResult } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecipeIngredientRaw {
  id: number;
  recipe_id: number;
  ingredient_name: string;
  required_qty: number;
  unit: string;
}

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: RecipeIngredientRaw[];
}

interface PantryCheckModalProps {
  open: boolean;
  onClose: () => void;
  recipe: RecipeWithIngredients | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PantryCheckModal({
  open,
  onClose,
  recipe,
}: PantryCheckModalProps) {
  const [result, setResult] = useState<PantryCheckResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToGrocery, setAddingToGrocery] = useState<boolean>(false);
  const [addedToList, setAddedToList] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // ── On open: fetch inventory, check existing grocery items, run pantry check ──
  useEffect(() => {
    if (!open || !recipe) return;
    setLoading(true);
    setResult(null);
    setAddedToList(false);

    const run = async (): Promise<void> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Fetch inventory + existing grocery items in parallel
        const [invRes, groceryRes] = await Promise.all([
          supabase.from("inventory").select("*").eq("user_id", user.id),
          supabase
            .from("grocery_items")
            .select("item_name, source")
            .eq("user_id", user.id)
            .eq("source", "recipe-check"),
        ]);

        if (invRes.error) throw invRes.error;
        if (groceryRes.error) throw groceryRes.error;

        const inventory = (invRes.data ?? []) as InventoryItem[];
        const existingInCart = new Set(
          (groceryRes.data ?? []).map((g) => g.item_name.toLowerCase().trim()),
        );

        const ingredients = recipe.recipe_ingredients ?? [];
        const res = checkPantry(ingredients as any, inventory);
        setResult(res);

        // ── Key logic: if ALL missing items are already in the grocery list → disable button ──
        if (res.missingItems.length > 0) {
          const allAlreadyAdded = res.missingItems.every((item) =>
            existingInCart.has(item.ingredient_name.toLowerCase().trim()),
          );
          if (allAlreadyAdded) setAddedToList(true);
        }

        if (res.canCook) {
          confetti({
            particleCount: 120,
            spread: 70,
            colors: ["#E8643A", "#2D6A4F", "#B7791F"],
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error("Pantry check error:", err);
        toast.error("Failed to check pantry. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [open, recipe]);

  // ── Add missing items → grocery_items (skips already-added ones) ──────────
  const addToGrocery = async (): Promise<void> => {
    if (!result || addedToList || addingToGrocery) return;
    setAddingToGrocery(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Re-check which items are ALREADY in the grocery list right now
      const { data: existing } = await supabase
        .from("grocery_items")
        .select("item_name")
        .eq("user_id", user.id)
        .eq("source", "recipe-check");

      const alreadyThere = new Set(
        (existing ?? []).map((g) => g.item_name.toLowerCase().trim()),
      );

      // Only insert items that aren't already in the list
      const toInsert = result.missingItems.filter(
        (item) => !alreadyThere.has(item.ingredient_name.toLowerCase().trim()),
      );

      if (toInsert.length === 0) {
        toast.info("All missing items are already in your grocery list.");
        setAddedToList(true);
        return;
      }

      const rows = toInsert.map((item) => ({
        user_id: user.id,
        item_name: item.ingredient_name,
        quantity: item.missing_qty,
        unit: item.unit,
        is_checked: false,
        source: "recipe-check",
      }));

      const { error } = await supabase.from("grocery_items").insert(rows);
      if (error) throw error;

      toast.success(
        `${rows.length} item${rows.length !== 1 ? "s" : ""} added to your grocery list!`,
      );
      setAddedToList(true);
    } catch {
      toast.error("Failed to add items. Please try again.");
    } finally {
      setAddingToGrocery(false);
    }
  };

  // ── Copy list ─────────────────────────────────────────────────────────────
  const copyList = (): void => {
    if (!result || !recipe) return;
    const text =
      `Shopping List for ${recipe.title}:\n` +
      result.missingItems
        .map((i) => `• ${i.missing_qty} ${i.unit} ${i.ingredient_name}`)
        .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (v: boolean): void => {
    if (addingToGrocery) return;
    if (!v) onClose();
  };

  // ─── Button label logic ───────────────────────────────────────────────────
  const groceryBtnLabel = (): string => {
    if (addingToGrocery) return "Adding...";
    if (addedToList) return "Already in Grocery List ✓";
    return "Add Missing Items to Grocery List";
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="font-display text-xl"
            style={{ color: "var(--text-primary)" }}
          >
            {recipe?.title}
          </DialogTitle>
        </DialogHeader>

        {/* ── Loading ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 py-4"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg animate-pulse"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Can cook ✅ ── */}
        <AnimatePresence>
          {result?.canCook && (
            <motion.div
              key="can-cook"
              {...scaleIn}
              className="text-center py-6 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: "var(--success-soft)" }}
              >
                <CheckCircle
                  className="w-10 h-10"
                  style={{ color: "var(--success)" }}
                />
              </motion.div>

              <h3
                className="font-display text-2xl font-bold"
                style={{ color: "var(--success)" }}
              >
                You're all set! 🎉
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                You have everything to cook{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {recipe?.title}
                </span>
                . Time to get cooking!
              </p>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="text-left space-y-2 mt-4"
              >
                {result.availableItems.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--success)" }}
                    />
                    <span
                      className="font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.required_qty} {item.unit}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {item.ingredient_name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white mt-2"
                style={{ backgroundColor: "var(--success)" }}
              >
                Start Cooking
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cannot cook ❌ ── */}
        <AnimatePresence>
          {result && !result.canCook && (
            <motion.div
              key="cannot-cook"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-2"
            >
              {/* What you have */}
              {result.availableItems.length > 0 && (
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{
                    backgroundColor: "var(--success-soft)",
                    border: "1px solid var(--success)",
                  }}
                >
                  <h4
                    className="font-semibold text-sm"
                    style={{ color: "var(--success)" }}
                  >
                    ✅ What you have
                  </h4>
                  {result.availableItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--success)" }}
                      />
                      <span
                        className="font-mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.required_qty} {item.unit}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {item.ingredient_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shopping list */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  backgroundColor: "var(--warning-soft)",
                  border: "1px solid var(--warning)",
                }}
              >
                <h4
                  className="font-semibold text-sm"
                  style={{ color: "var(--warning)" }}
                >
                  🛒 Shopping List
                </h4>
                {result.missingItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <X
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--danger)" }}
                    />
                    <span style={{ color: "var(--text-primary)" }}>
                      <strong>{item.ingredient_name}</strong>
                      {item.available_qty > 0
                        ? ` — Need ${item.missing_qty} ${item.unit} more (have ${item.available_qty} ${item.unit})`
                        : ` — Need ${item.required_qty} ${item.unit} (not in pantry)`}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Action buttons ── */}
              <div className="flex flex-col gap-2 pt-1">
                {/* ADD TO GROCERY — disabled + different style when already added */}
                <button
                  onClick={addToGrocery}
                  disabled={addingToGrocery || addedToList}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
                  style={{
                    backgroundColor: addedToList
                      ? "var(--success)" // green when done
                      : "var(--accent)", // terracotta when ready
                    opacity: addedToList ? 0.75 : 1,
                    cursor:
                      addedToList || addingToGrocery
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingToGrocery ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {groceryBtnLabel()}
                </button>

                {/* Already-added explanation */}
                <AnimatePresence>
                  {addedToList && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-center px-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      These items are already in your grocery list. Go shop! 🛍️
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* COPY */}
                <button
                  onClick={copyList}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--bg-surface)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied! ✓" : "Copy Shopping List"}
                </button>

                {/* GO TO GROCERY LIST — always shown after adding */}
                <AnimatePresence>
                  {addedToList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Link
                        to="/grocery"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                        style={{
                          color: "var(--accent)",
                          border: "1px solid var(--accent)",
                          backgroundColor: "var(--accent-soft)",
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Grocery List
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
