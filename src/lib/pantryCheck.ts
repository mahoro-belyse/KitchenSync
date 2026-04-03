import type {
  InventoryItem,
  RecipeIngredient,
  PantryCheckResult,
  ShoppingListItem,
} from "@/types";

export const checkPantry = (
  ingredients: RecipeIngredient[],
  inventory: InventoryItem[],
): PantryCheckResult => {
  const missingItems: ShoppingListItem[] = [];
  const availableItems: RecipeIngredient[] = [];

  /** Normalize quantities to a common base unit for comparison. */
  const normalizeQty = (qty: number, unit: string): number => {
    if (unit === "kg") return qty * 1000; // → grams
    if (unit === "L") return qty * 1000; // → millilitres
    return qty;
  };

  ingredients.forEach((ingredient) => {
    const pantryItem = inventory.find(
      (item) =>
        item.item_name.toLowerCase().trim() ===
        ingredient.ingredient_name.toLowerCase().trim(),
    );

    const rawAvailable = pantryItem?.quantity ?? 0;
    const rawRequired = ingredient.required_qty;

    const available = normalizeQty(
      rawAvailable,
      pantryItem?.unit ?? ingredient.unit,
    );
    const required = normalizeQty(rawRequired, ingredient.unit);

    if (!pantryItem || available < required) {
      missingItems.push({
        ingredient_name: ingredient.ingredient_name,
        required_qty: rawRequired,
        available_qty: rawAvailable,
        missing_qty: parseFloat(
          Math.max(0, rawRequired - rawAvailable).toFixed(2),
        ),
        unit: ingredient.unit,
      });
    } else {
      availableItems.push(ingredient);
    }
  });

  return {
    canCook: missingItems.length === 0,
    missingItems,
    availableItems,
  };
};

// ─── getIngredientEmoji ───────────────────────────────────────────────────────
/**
 * Returns a relevant emoji for a pantry item based on its name.
 * Falls back to 🥄 for unrecognised ingredients.
 */
export const getIngredientEmoji = (name: string): string => {
  const lower = name.toLowerCase();

  const emojiMap: Record<string, string> = {
    tomato: "🍅",
    chicken: "🍗",
    milk: "🥛",
    egg: "🥚",
    bread: "🍞",
    butter: "🧈",
    salt: "🧂",
    sugar: "🍚",
    "olive oil": "🫙",
    onion: "🧅",
    garlic: "🧄",
    lemon: "🍋",
    carrot: "🥕",
    spinach: "🥬",
    apple: "🍎",
    banana: "🍌",
    rice: "🍚",
    pasta: "🍝",
    cheese: "🧀",
    pepper: "🌶️",
    potato: "🥔",
    corn: "🌽",
    broccoli: "🥦",
    mushroom: "🍄",
    fish: "🐟",
    shrimp: "🦐",
    beef: "🥩",
    pork: "🥩",
    avocado: "🥑",
    cucumber: "🥒",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lower.includes(key)) return emoji;
  }

  return "🥄";
};

// ─── autoCategoryDetect ───────────────────────────────────────────────────────
/**
 * Suggests a pantry category from an ingredient name using keyword matching.
 * Used in InventoryForm to auto-fill the Category field as the user types.
 * Returns 'Other' if no keywords match.
 */

type Category =
  | "Meat"
  | "Seafood"
  | "Dairy"
  | "Fruits"
  | "Vegetables"
  | "Grains"
  | "Spices"
  | "Condiments"
  | "Beverages"
  | "Other";

interface CategoryRule {
  keywords: string[];
  category: Category;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage"],
    category: "Meat",
  },
  {
    keywords: ["fish", "shrimp", "salmon", "tuna", "cod", "crab"],
    category: "Seafood",
  },
  {
    keywords: ["milk", "cheese", "yogurt", "cream", "butter", "egg"],
    category: "Dairy",
  },
  {
    keywords: [
      "apple",
      "banana",
      "orange",
      "grape",
      "berry",
      "lemon",
      "lime",
      "mango",
      "peach",
    ],
    category: "Fruits",
  },
  {
    keywords: [
      "tomato",
      "onion",
      "garlic",
      "pepper",
      "carrot",
      "potato",
      "spinach",
      "broccoli",
      "lettuce",
      "cucumber",
      "corn",
      "mushroom",
      "celery",
      "avocado",
    ],
    category: "Vegetables",
  },
  {
    keywords: [
      "rice",
      "pasta",
      "flour",
      "bread",
      "oat",
      "cereal",
      "quinoa",
      "noodle",
    ],
    category: "Grains",
  },
  {
    keywords: [
      "salt",
      "pepper",
      "cumin",
      "paprika",
      "oregano",
      "basil",
      "thyme",
      "cinnamon",
      "turmeric",
      "chili",
    ],
    category: "Spices",
  },
  {
    keywords: [
      "ketchup",
      "mustard",
      "mayo",
      "soy sauce",
      "vinegar",
      "olive oil",
      "honey",
    ],
    category: "Condiments",
  },
  {
    keywords: ["water", "juice", "coffee", "tea", "soda", "wine", "beer"],
    category: "Beverages",
  },
];

export const autoCategoryDetect = (name: string): Category => {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.category;
  }
  return "Other";
};
