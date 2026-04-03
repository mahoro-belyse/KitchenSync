import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ShoppingCart,
  Copy,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { checkPantry } from "@/lib/pantryCheck";
import { scaleIn, staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Recipe, InventoryItem, PantryCheckResult } from "../../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface PantryCheckModalProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PantryCheckModal({
  open,
  onClose,
  recipe,
}: PantryCheckModalProps) {
  const [result, setResult] = useState<PantryCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedToList, setAddedToList] = useState(false);

  // ─── Fetch inventory + run pantry check ──────────────────────────────────
  useEffect(() => {
    if (!open || !recipe) return;

    setLoading(true);
    setResult(null);
    setAddedToList(false);

    const run = async () => {
      try {
        // 1. Fetch recipe ingredients from Supabase
        const { data: ingredients, error: ingError } = await supabase
          .from("recipe_ingredients")
          .select("*")
          .eq("recipe_id", recipe.id);

        if (ingError) throw ingError;

        // 2. Fetch the current user's inventory from Supabase
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: inventory, error: invError } = await supabase
          .from("inventory")
          .select("*")
          .eq("user_id", user.id);

        if (invError) throw invError;

        // 3. Run the pure comparison function (unchanged from your original)
        const res = checkPantry(
          ingredients ?? [],
          (inventory ?? []) as InventoryItem[],
        );
        setResult(res);

        // 4. Fire confetti if all ingredients are available
        if (res.canCook) {
          confetti({
            particleCount: 100,
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

  // ─── Add missing items to Supabase grocery_items ─────────────────────────
  const addToGrocery = async () => {
    if (!result) return;
    setAddingToGrocery(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const rows = result.missingItems.map((item) => ({
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
    } catch (err) {
      console.error("Add to grocery error:", err);
      toast.error("Failed to add items. Please try again.");
    } finally {
      setAddingToGrocery(false);
    }
  };

  // ─── Copy shopping list to clipboard ─────────────────────────────────────
  const copyList = () => {
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

  // ─── Prevent closing while save is in progress ───────────────────────────
  const handleOpenChange = (v: boolean) => {
    if (addingToGrocery) return; // lock modal during async op
    if (!v) onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {recipe?.title}
          </DialogTitle>
        </DialogHeader>

        {/* ── Loading skeletons ── */}
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
                  className="h-10 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Can cook ── */}
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
                className="w-20 h-20 rounded-full bg-[--success-soft] mx-auto flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-[--success]" />
              </motion.div>

              <h3 className="font-display text-2xl font-bold text-[--success]">
                You're all set! 🎉
              </h3>
              <p className="text-[--text-secondary]">
                You have everything to cook{" "}
                <span className="font-semibold text-[--text-primary]">
                  {recipe?.title}
                </span>
                . Time to get cooking!
              </p>

              {/* Available ingredients list */}
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
                    <Check className="w-4 h-4 text-[--success] shrink-0" />
                    <span className="font-mono text-[--text-secondary]">
                      {item.required_qty} {item.unit}
                    </span>
                    <span className="text-[--text-primary]">
                      {item.ingredient_name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Start cooking CTA */}
              <Button
                asChild
                className="mt-2 bg-[--success] hover:bg-[--success]/90 text-white"
                onClick={onClose}
              >
                <Link to="/meal-plan" state={{ recipeId: recipe?.id }}>
                  Start Cooking
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cannot cook ── */}
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
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl bg-[--success-soft] p-4 space-y-2"
                >
                  <h4 className="font-semibold text-sm text-[--success]">
                    ✅ What you have
                  </h4>
                  {result.availableItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[--success] shrink-0" />
                      <span className="font-mono text-[--text-secondary]">
                        {item.required_qty} {item.unit}
                      </span>
                      <span className="text-[--text-primary]">
                        {item.ingredient_name}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Shopping list */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl bg-[--warning-soft] p-4 space-y-2"
              >
                <h4 className="font-semibold text-sm text-[--warning]">
                  🛒 Shopping List
                </h4>
                {result.missingItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-[--danger] shrink-0 mt-0.5" />
                    <span className="text-[--text-primary]">
                      <strong>{item.ingredient_name}</strong>
                      {item.available_qty > 0
                        ? ` — Need ${item.missing_qty} ${item.unit} more (have ${item.available_qty} ${item.unit})`
                        : ` — Need ${item.required_qty} ${item.unit} (not in pantry)`}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-2"
              >
                <Button
                  onClick={addToGrocery}
                  disabled={addingToGrocery || addedToList}
                  className="bg-[--accent] hover:bg-[--accent-hover] text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToGrocery
                    ? "Adding..."
                    : addedToList
                      ? "Added to Grocery List ✓"
                      : "Add Missing Items to Grocery List"}
                </Button>

                <Button variant="outline" onClick={copyList}>
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied! ✓" : "Copy Shopping List"}
                </Button>

                {/* Show "Go to Grocery List" after items are added */}
                <AnimatePresence>
                  {addedToList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full text-[--accent]"
                        onClick={onClose}
                      >
                        <Link to="/grocery">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Go to Grocery List
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
