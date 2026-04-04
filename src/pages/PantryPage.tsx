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

const daysUntil = (isoDate: string): number => {
  const expiry = new Date(isoDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86_400_000);
};

export default function PantryPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const loadItems = useCallback(async (): Promise<void> => {
    if (!user) return;

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load pantry.");
    } else {
      setItems((data ?? []) as InventoryItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const lowStock = items.filter((i) => i.quantity < 2).length;

  const expiringSoon = items.filter(
    (i) =>
      i.expiry_date &&
      daysUntil(i.expiry_date) >= 0 &&
      daysUntil(i.expiry_date) <= 7,
  ).length;

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

  const handleSave = async (data: SavePayload): Promise<void> => {
    if (!user) return;

    if (editItem) {
      await supabase
        .from("inventory")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", editItem.id);

      toast.success("Item updated!");
    } else {
      await supabase.from("inventory").insert({ ...data, user_id: user.id });

      toast.success("Ingredient added!");
    }

    setFormOpen(false);
    setEditItem(null);
    loadItems();
  };

  const handleDelete = async (id: number): Promise<void> => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("inventory").delete().eq("id", id);
    toast.success("Item removed");
  };

  const handleUpdateQuantity = async (
    id: number,
    qty: number,
  ): Promise<void> => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );

    await supabase.from("inventory").update({ quantity: qty }).eq("id", id);
  };

  const openAdd = (): void => {
    setEditItem(null);
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-5 px-4 sm:px-0">
        <div className="h-10 rounded-lg w-48 animate-pulse bg-gray-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl animate-pulse bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 sm:px-0">
      {/* Header */}
      <PageHeader
        title="My Pantry"
        subtitle={`${items.length} ingredient${items.length !== 1 ? "s" : ""} stocked`}
      >
        <div className="w-full sm:w-auto">
          <Button
            onClick={openAdd}
            className="text-white w-full sm:w-auto"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </PageHeader>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="pl-10"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="date">Date Added</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      {/* ✅ Mobile: Label + Dropdown */}
      <div className="sm:hidden space-y-1">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Category
        </p>

        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ✅ Desktop: Pills */}
      <div className="hidden sm:flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => {
          const active = selectedCategory === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
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
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat icon={Package} label="Total" value={items.length} />
        <Stat icon={AlertTriangle} label="Low" value={lowStock} />
        <Stat icon={Clock} label="Expiring" value={expiringSoon} />
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No items"
          description="Try adding or searching something else"
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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

      {/* Form */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setFormOpen(false)}
            />
            <InventoryForm
              editItem={editItem}
              onSave={handleSave}
              onClose={() => setFormOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Small reusable stat component */
function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="p-3 sm:p-4 rounded-xl border flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <div>
        <p className="font-bold">{value}</p>
        <p className="text-xs opacity-60">{label}</p>
      </div>
    </div>
  );
}
