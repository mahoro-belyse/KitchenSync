export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  dietary_preferences: string[];
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  user_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  category: string;
  expiry_date: string | null;
  created_at: string;
}

export interface Recipe {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: number | null;
  servings: number;
  cuisine: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_name: string;
  required_qty: number;
  unit: string;
}

export interface MealPlan {
  id: number;
  user_id: string;
  recipe_id: number | null;
  planned_date: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  notes: string | null;
  created_at: string;
}

export interface GroceryItem {
  id: number;
  user_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  is_checked: boolean;
  source: string;
  created_at: string;
}

export interface ShoppingListItem {
  ingredient_name: string;
  required_qty: number;
  available_qty: number;
  missing_qty: number;
  unit: string;
}

export interface PantryCheckResult {
  canCook: boolean;
  missingItems: ShoppingListItem[];
  availableItems: RecipeIngredient[];
}

export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: RecipeIngredient[];
}
