import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Package, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import InventoryCard from "@/components/pantry/InventoryCard";
import InventoryForm, {
  type SavePayload,
} from "@/components/pantry/InventoryForm";
import { staggerContainer } from "@/lib/motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { InventoryItem } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Meat",
  "Seafood",
  "Grains",
  "Spices",
  "Condiments",
  "Beverages",
  "Snacks",
  "Other",
] as const;

type SortOption = "name" | "date" | "quantity";

// ─── Helper — days until expiry (native, no moment) ───────────────────────────
const daysUntil = (isoDate: string): number => {
  const expiry = new Date(isoDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86_400_000);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PantryPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  // ── Fetch inventory ──────────────────────────────────────────────────────
  const loadItems = useCallback(async (): Promise<void> => {
    if (!user) return;

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load pantry.");
      console.error("PantryPage load error:", error);
    } else {
      setItems((data ?? []) as InventoryItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const lowStock = items.filter((i) => i.quantity < 2).length;
  const expiringSoon = items.filter(
    (i) =>
      i.expiry_date &&
      daysUntil(i.expiry_date) >= 0 &&
      daysUntil(i.expiry_date) <= 7,
  ).length;

  // ── Client-side filter + sort ────────────────────────────────────────────
  const filteredItems = items
    .filter(
      (i) =>
        (!search || i.item_name.toLowerCase().includes(search.toLowerCase())) &&
        (selectedCategory === "All" || i.category === selectedCategory),
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.item_name.localeCompare(b.item_name);
      if (sortBy === "date")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortBy === "quantity") return a.quantity - b.quantity;
      return 0;
    });

  // ── Save (add or edit) ───────────────────────────────────────────────────
  const handleSave = async (data: SavePayload): Promise<void> => {
    if (!user) return;

    if (editItem) {
      const { error } = await supabase
        .from("inventory")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", editItem.id);

      if (error) {
        toast.error("Failed to update item.");
        return;
      }
      toast.success("Item updated!");
    } else {
      const { error } = await supabase
        .from("inventory")
        .insert({ ...data, user_id: user.id });

      if (error) {
        toast.error("Failed to add item.");
        return;
      }
      toast.success("Ingredient added!");
    }

    setFormOpen(false);
    setEditItem(null);
    loadItems();
  };

  // ── Delete — optimistic ───────────────────────────────────────────────────
  const handleDelete = async (id: number): Promise<void> => {
    setItems((prev) => prev.filter((i) => i.id !== id));

    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete item.");
      loadItems();
    } else {
      toast.success("Item removed");
    }
  };

  // ── Update quantity — optimistic ──────────────────────────────────────────
  const handleUpdateQuantity = async (
    id: number,
    qty: number,
  ): Promise<void> => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: qty })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update quantity.");
      loadItems();
    }
  };

  const openAdd = (): void => {
    setEditItem(null);
    setFormOpen(true);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="h-10 rounded-lg w-48 animate-pulse"
          style={{ backgroundColor: "var(--bg-surface)" }}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl animate-pulse"
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
        title="My Pantry"
        subtitle={`${items.length} ingredient${items.length !== 1 ? "s" : ""} stocked`}
      >
        <Button
          onClick={openAdd}
          className="text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </PageHeader>

      {/* ── Search + sort ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="pl-10"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        {/* Sort select — full width on mobile, fixed width on sm+ */}
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger
            className="w-full sm:w-44"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="date">Date Added</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Category filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const active = selectedCategory === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0"
              style={{
                backgroundColor: active ? "var(--accent)" : "var(--bg-surface)",
                color: active ? "#fff" : "var(--text-secondary)",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* ── Mini stat cards ── */}
      {/* FIX: was `grid-cols-3` with no mobile breakpoint — now 1 col on xs, 3 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--accent-soft)" }}
          >
            <Package className="w-5 h-5" style={{ color: "var(--accent)" }} />
          </div>
          <div className="min-w-0">
            <p
              className="font-mono text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {items.length}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total items
            </p>
          </div>
        </div>

        {/* Low stock */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--warning-soft)" }}
          >
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: "var(--warning)" }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="font-mono text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {lowStock}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Low stock
            </p>
          </div>
        </div>

        {/* Expiring soon */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--danger-soft)" }}
          >
            <Clock className="w-5 h-5" style={{ color: "var(--danger)" }} />
          </div>
          <div className="min-w-0">
            <p
              className="font-mono text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {expiringSoon}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Expiring soon
            </p>
          </div>
        </div>
      </div>

      {/* ── Item grid ── */}
      {filteredItems.length === 0 && items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Your pantry is empty"
          description="Start by adding the ingredients you have at home"
          actionLabel="Add First Item"
          onAction={openAdd}
        />
      ) : filteredItems.length === 0 ? (
        <p
          className="text-center py-8"
          style={{ color: "var(--text-secondary)" }}
        >
          No items match your search.
        </p>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={(itm) => {
                  setEditItem(itm);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Inventory form drawer + backdrop ── */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              onClick={() => {
                setFormOpen(false);
                setEditItem(null);
              }}
            />
            <InventoryForm
              key="form"
              editItem={editItem}
              onSave={handleSave}
              onClose={() => {
                setFormOpen(false);
                setEditItem(null);
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
