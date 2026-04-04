import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { getIngredientEmoji } from "@/lib/pantryCheck";
import type { InventoryItem } from "@/types";

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const daysUntil = (isoDate: string): number => {
  const expiry = new Date(isoDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86_400_000);
};

const formatShortDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));

export default function InventoryCard({
  item,
  onEdit,
  onDelete,
  onUpdateQuantity,
}: InventoryCardProps) {
  const [editingQty, setEditingQty] = useState(false);
  const [qty, setQty] = useState(item.quantity.toString());

  const daysUntilExpiry = item.expiry_date ? daysUntil(item.expiry_date) : null;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const isLowStock = item.quantity < 2;

  const handleQtySave = () => {
    const parsed = parseFloat(qty);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateQuantity(item.id, parsed);
    }
    setEditingQty(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-4 sm:p-5 group transition-shadow hover:shadow-md"
      style={{
        backgroundColor: "var(--bg-card)",
        border: isLowStock
          ? "1px solid var(--warning)"
          : "1px solid var(--border)",
      }}
    >
      {/* Top */}
      <div className="flex items-center justify-between">
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-secondary)",
          }}
        >
          {item.category}
        </span>

        {/* 🔥 FIX: always visible on mobile, hover on desktop */}
        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-lg"
            style={{ color: "var(--danger)" }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-2xl">{getIngredientEmoji(item.item_name)}</span>

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm sm:text-base truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {item.item_name}
          </h3>

          {editingQty ? (
            <input
              autoFocus
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onBlur={handleQtySave}
              onKeyDown={(e) => e.key === "Enter" && handleQtySave()}
              className="w-20 mt-1 px-2 py-1 rounded border text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-primary)",
              }}
            />
          ) : (
            <button
              onClick={() => setEditingQty(true)}
              className="mt-1 px-2 py-0.5 rounded-full text-xs sm:text-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-secondary)",
              }}
            >
              {item.quantity} {item.unit}
            </button>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-3 flex flex-wrap gap-2">
        {isLowStock && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: "var(--warning-soft)",
              color: "var(--warning)",
            }}
          >
            Low stock
          </span>
        )}

        {isExpired && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: "var(--danger-soft)",
              color: "var(--danger)",
            }}
          >
            Expired
          </span>
        )}

        {isExpiringSoon && !isExpired && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: "var(--warning-soft)",
              color: "var(--warning)",
            }}
          >
            {daysUntilExpiry}d left
          </span>
        )}

        {daysUntilExpiry !== null && !isExpired && !isExpiringSoon && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: "var(--success-soft)",
              color: "var(--success)",
            }}
          >
            Exp. {formatShortDate(item.expiry_date!)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
