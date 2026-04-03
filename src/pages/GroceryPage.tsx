import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { GroceryItem } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const UNITS = [
  "kg",
  "g",
  "L",
  "ml",
  "cups",
  "pieces",
  "tbsp",
  "tsp",
  "oz",
  "lbs",
  "bunches",
  "cans",
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function GroceryPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);

  // Inline add-form state
  const [newName, setNewName] = useState<string>("");
  const [newQty, setNewQty] = useState<string>("");
  const [newUnit, setNewUnit] = useState<string>("pieces");

  // ── Fetch grocery list ──────────────────────────────────────────────────
  const load = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (err) {
      setError("Failed to load grocery list. Please try again.");
      console.error("GroceryPage load error:", err);
    } else {
      setItems((data ?? []) as GroceryItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const checkedCount = items.filter((i) => i.is_checked).length;
  const uncheckedCount = items.length - checkedCount;
  const progress =
    items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  // ── Toggle checked — optimistic ──────────────────────────────────────────
  const toggleCheck = async (item: GroceryItem): Promise<void> => {
    const newChecked = !item.is_checked;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, is_checked: newChecked } : i,
      ),
    );

    const { error: err } = await supabase
      .from("grocery_items")
      .update({ is_checked: newChecked })
      .eq("id", item.id);

    if (err) {
      // Rollback
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_checked: item.is_checked } : i,
        ),
      );
      toast.error("Failed to update item.");
    }
  };

  // ── Add item — optimistic ────────────────────────────────────────────────
  const addItem = async (): Promise<void> => {
    if (!newName.trim() || !newQty || !user) return;

    const parsed = parseFloat(newQty);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }

    setAdding(true);

    const payload = {
      user_id: user.id,
      item_name: newName.trim(),
      quantity: parsed,
      unit: newUnit,
      is_checked: false,
      source: "manual" as const,
    };

    // Optimistic — add a temp item immediately
    const tempId = Date.now(); // temporary numeric id
    setItems((prev) => [
      ...prev,
      { ...payload, id: tempId, created_at: new Date().toISOString() },
    ]);
    setNewName("");
    setNewQty("");

    const { data, error: err } = await supabase
      .from("grocery_items")
      .insert(payload)
      .select()
      .single();

    if (err) {
      // Rollback temp item
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      toast.error("Failed to add item.");
    } else {
      // Replace temp item with real Supabase row (has correct id)
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? (data as GroceryItem) : i)),
      );
      toast.success("Item added!");
    }

    setAdding(false);
  };

  // ── Delete item — optimistic ─────────────────────────────────────────────
  const deleteItem = async (id: number): Promise<void> => {
    // Snapshot for rollback
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.id !== id));

    const { error: err } = await supabase
      .from("grocery_items")
      .delete()
      .eq("id", id);

    if (err) {
      setItems(snapshot);
      toast.error("Failed to delete item.");
    }
  };

  // ── Clear all checked items ──────────────────────────────────────────────
  const clearChecked = async (): Promise<void> => {
    const checked = items.filter((i) => i.is_checked);
    if (!checked.length || !user) return;

    // Optimistic
    setItems((prev) => prev.filter((i) => !i.is_checked));

    const { error: err } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", user.id)
      .eq("is_checked", true);

    if (err) {
      load(); // Full reload on failure
      toast.error("Failed to clear items.");
    } else {
      toast.success(
        `${checked.length} item${checked.length !== 1 ? "s" : ""} cleared`,
      );
    }
  };

  // ── Share / copy list ────────────────────────────────────────────────────
  const shareList = (): void => {
    const unchecked = items.filter((i) => !i.is_checked);
    const text =
      "Grocery List:\n" +
      unchecked
        .map((i) => `• ${i.quantity} ${i.unit} ${i.item_name}`)
        .join("\n");

    if (navigator.share) {
      navigator.share({ title: "Grocery List", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("List copied to clipboard!");
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="h-10 rounded-lg w-48 animate-pulse"
          style={{ backgroundColor: "var(--bg-surface)" }}
        />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ backgroundColor: "var(--bg-surface)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader
        title="Grocery List"
        subtitle={`${uncheckedCount} item${uncheckedCount !== 1 ? "s" : ""} left to buy`}
      >
        <Button
          variant="outline"
          onClick={shareList}
          style={{
            borderColor: "var(--border-strong)",
            color: "var(--text-primary)",
          }}
        >
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
        {checkedCount > 0 && (
          <Button
            variant="outline"
            onClick={clearChecked}
            style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear Checked
          </Button>
        )}
      </PageHeader>

      {/* ── Progress bar ── */}
      {items.length > 0 && (
        <motion.div {...fadeUp}>
          <Progress value={progress} className="h-2" />
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {checkedCount} of {items.length} items purchased
          </p>
        </motion.div>
      )}

      {/* ── Empty state ── */}
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your grocery list is empty"
          description="Check your pantry against a recipe to auto-fill this list."
        />
      ) : (
        /* ── Items list ── */
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="rounded-2xl overflow-hidden divide-y"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <AnimatePresence>
            {[...items]
              // Unchecked first, checked at the bottom
              .sort((a, b) => Number(a.is_checked) - Number(b.is_checked))
              .map((item) => (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  exit={{ opacity: 0, x: -100, height: 0 }}
                  layout
                  className="flex items-center gap-3 px-5 py-3 group transition-opacity"
                  style={{
                    opacity: item.is_checked ? 0.5 : 1,
                    borderColor: "var(--border)",
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={item.is_checked}
                    onCheckedChange={() => toggleCheck(item)}
                  />

                  {/* Name + qty */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-medium text-sm"
                      style={{
                        color: item.is_checked
                          ? "var(--text-muted)"
                          : "var(--text-primary)",
                        textDecoration: item.is_checked
                          ? "line-through"
                          : "none",
                      }}
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

                  {/* Source badge */}
                  {item.source !== "manual" && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs hidden sm:inline"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {item.source}
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => deleteItem(item.id)}
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
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Inline add form ── */}
      <motion.div
        {...fadeUp}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Add Item
        </p>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Item name"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <Input
            type="number"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            placeholder="Qty"
            className="w-20 font-mono"
            min={0.01}
            step={0.01}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <Select value={newUnit} onValueChange={setNewUnit}>
            <SelectTrigger
              className="w-24"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addItem}
            disabled={adding || !newName.trim() || !newQty}
            className="text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
