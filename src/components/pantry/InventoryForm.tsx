import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slideInRight } from "@/lib/motion";
import { autoCategoryDetect } from "@/lib/pantryCheck";
import { toast } from "sonner";
import type { InventoryItem } from "@/types";

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

const CATEGORIES = [
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

// ─── Types ────────────────────────────────────────────────────────────────────
export type SavePayload = Omit<InventoryItem, "id" | "user_id" | "created_at">;

interface InventoryFormProps {
  onSave: (payload: SavePayload) => Promise<void>;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InventoryForm({
  onSave,
  onClose,
  editItem = null,
}: InventoryFormProps) {
  const [name, setName] = useState<string>(editItem?.item_name ?? "");
  const [quantity, setQuantity] = useState<string>(
    editItem?.quantity?.toString() ?? "",
  );
  const [unit, setUnit] = useState<string>(editItem?.unit ?? "pieces");
  const [category, setCategory] = useState<string>(
    editItem?.category ?? "Other",
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    editItem?.expiry_date ? editItem.expiry_date.split("T")[0] : "",
  );
  const [saving, setSaving] = useState<boolean>(false);

  // ── Auto-detect category from item name (new items only) ─────────────────
  useEffect(() => {
    if (name && !editItem) {
      const suggested = autoCategoryDetect(name);
      if (suggested !== "Other") setCategory(suggested);
    }
  }, [name, editItem]);

  // ── Validate + save ───────────────────────────────────────────────────────
  const handleSave = async (): Promise<void> => {
    if (!name.trim()) {
      toast.error("Item name is required");
      return;
    }
    const parsedQty = parseFloat(quantity);
    if (!quantity || isNaN(parsedQty) || parsedQty <= 0) {
      toast.error("Enter a valid quantity greater than 0");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        item_name: name.trim(),
        quantity: parsedQty,
        unit,
        category,
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      {...slideInRight}
      className="fixed inset-y-0 right-0 w-full max-w-md shadow-2xl z-50 flex flex-col"
      style={{
        backgroundColor: "var(--bg-card)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between p-6 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {editItem ? "Edit Item" : "Add to Pantry"}
        </h2>
        <button
          onClick={onClose}
          disabled={saving}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Form fields ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Item name */}
        <div>
          <Label style={{ color: "var(--text-secondary)" }}>
            Item Name <span style={{ color: "var(--danger)" }}>*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Tomatoes"
            className="mt-1.5"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            autoFocus={!editItem}
          />
        </div>

        {/* Quantity + Unit row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label style={{ color: "var(--text-secondary)" }}>
              Quantity <span style={{ color: "var(--danger)" }}>*</span>
            </Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              min={0.01}
              step={0.01}
              className="mt-1.5 font-mono"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <Label style={{ color: "var(--text-secondary)" }}>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger
                className="mt-1.5"
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
          </div>
        </div>

        {/* Category */}
        <div>
          <Label style={{ color: "var(--text-secondary)" }}>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              className="mt-1.5"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <SelectValue />
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

        {/* Expiry date (optional) */}
        <div>
          <Label style={{ color: "var(--text-secondary)" }}>
            Expiry Date{" "}
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              (optional)
            </span>
          </Label>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="mt-1.5"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* ── Footer buttons ── */}
      <div
        className="p-6 border-t flex gap-3 shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <Button
          variant="outline"
          onClick={onClose}
          disabled={saving}
          className="flex-1"
          style={{
            borderColor: "var(--border-strong)",
            color: "var(--text-primary)",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {saving ? "Saving..." : editItem ? "Update Item" : "Save Item"}
        </Button>
      </div>
    </motion.div>
  );
}
