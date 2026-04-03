import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { getIngredientEmoji } from "@/lib/pantryCheck";
import type { InventoryItem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Days from today until the given ISO date string. Negative = already expired. */
const daysUntil = (isoDate: string): number => {
  const expiry = new Date(isoDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86_400_000);
};

/** Format a date as "Jun 4" using the browser's Intl API — no libraries needed. */
const formatShortDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(isoDate),
  );

// ─── Component ────────────────────────────────────────────────────────────────
export default function InventoryCard({
  item,
  onEdit,
  onDelete,
  onUpdateQuantity,
}: InventoryCardProps) {
  const [editingQty, setEditingQty] = useState<boolean>(false);
  const [qty, setQty] = useState<string>(item.quantity.toString());

  // ── Expiry calculations (no moment) ─────────────────────────────────────
  const daysUntilExpiry = item.expiry_date ? daysUntil(item.expiry_date) : null;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const isLowStock = item.quantity < 2;

  // ── Inline quantity save ─────────────────────────────────────────────────
  const handleQtySave = (): void => {
    const parsed = parseFloat(qty);
    if (!isNaN(parsed) && parsed > 0) onUpdateQuantity(item.id, parsed);
    setEditingQty(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-5 group transition-shadow hover:shadow-md relative"
      style={{
        backgroundColor: "var(--bg-card)",
        border: isLowStock
          ? "1px solid var(--warning)"
          : "1px solid var(--border)",
        // Low-stock pulsing amber border (spec Part 14.3)
        animation: isLowStock
          ? "pulse-amber 2s ease-in-out infinite"
          : undefined,
      }}
    >
      {/* ── Top row: category badge + hover action buttons ── */}
      <div className="flex items-start justify-between">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-secondary)",
          }}
        >
          {item.category}
        </span>

        {/* Edit / delete — fade in on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-label={`Edit ${item.item_name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--danger)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--danger-soft)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-label={`Delete ${item.item_name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Middle: emoji + name + inline qty editor ── */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-2xl select-none" aria-hidden>
          {getIngredientEmoji(item.item_name)}
        </span>
        <div>
          <h3
            className="font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            {item.item_name}
          </h3>

          {editingQty ? (
            /* Inline quantity input — saves on blur or Enter */
            <input
              autoFocus
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onBlur={handleQtySave}
              onKeyDown={(e) => e.key === "Enter" && handleQtySave()}
              className="w-20 px-2 py-0.5 rounded border font-mono text-sm mt-1"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
              min={0.01}
              step={0.01}
            />
          ) : (
            /* Clickable quantity pill — click to edit in-place */
            <button
              onClick={() => setEditingQty(true)}
              className="mt-1 px-2 py-0.5 rounded-full font-mono text-sm transition-colors"
              style={{
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-soft)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
              }
              title="Click to edit quantity"
            >
              {item.quantity} {item.unit}
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom: status badges ── */}
      <div className="mt-3 flex flex-wrap gap-2">
        {/* Low stock */}
        {isLowStock && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: "var(--warning-soft)",
              color: "var(--warning)",
            }}
          >
            Low stock
          </span>
        )}

        {/* Expired */}
        {isExpired && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: "var(--danger-soft)",
              color: "var(--danger)",
            }}
          >
            Expired
          </span>
        )}

        {/* Expiring soon — "Expires in N days" */}
        {isExpiringSoon && !isExpired && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: "var(--warning-soft)",
              color: "var(--warning)",
            }}
          >
            Expires in {daysUntilExpiry} day{daysUntilExpiry === 1 ? "" : "s"}
          </span>
        )}

        {/* Expiry date — green if >7 days away */}
        {daysUntilExpiry !== null && !isExpired && !isExpiringSoon && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
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
