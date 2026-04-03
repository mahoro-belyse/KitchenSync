import { useState } from 'react';
import { X, Plus, Minus, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────
const CUISINES = [
  'Italian', 'Mexican', 'Japanese', 'Indian', 'Mediterranean',
  'American', 'French', 'Thai', 'Chinese', 'Middle Eastern', 'African', 'Other',
] as const;

const UNITS = [
  'kg', 'g', 'L', 'ml', 'cups', 'pieces',
  'tbsp', 'tsp', 'oz', 'lbs', 'bunches', 'cans',
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

// Draft ingredient row while the form is being filled in
interface IngredientDraft {
  ingredient_name: string;
  required_qty: string;   // string while in the input, parsed to number on save
  unit: string;
}

// What gets passed to onSave — matches Supabase insert shape
export interface RecipeSavePayload {
  title: string;
  description: string | null;
  cuisine: string;
  prep_time: number | null;
  servings: number;
  image_url: string | null;
  ingredients: {
    ingredient_name: string;
    required_qty: number;
    unit: string;
  }[];
}

interface RecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: RecipeSavePayload) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyIngredient = (): IngredientDraft => ({
  ingredient_name: '',
  required_qty: '',
  unit: 'pieces',
});

const resetForm = {
  title: '',
  description: '',
  cuisine: 'Other' as string,
  prepTime: '',
  servings: 2,
  imageUrl: '',
  ingredients: [emptyIngredient()],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecipeForm({ open, onClose, onSave }: RecipeFormProps) {
  const [title,       setTitle]       = useState<string>(resetForm.title);
  const [description, setDescription] = useState<string>(resetForm.description);
  const [cuisine,     setCuisine]     = useState<string>(resetForm.cuisine);
  const [prepTime,    setPrepTime]    = useState<string>(resetForm.prepTime);
  const [servings,    setServings]    = useState<number>(resetForm.servings);
  const [imageUrl,    setImageUrl]    = useState<string>(resetForm.imageUrl);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([emptyIngredient()]);
  const [saving,      setSaving]      = useState<boolean>(false);
  const [imgError,    setImgError]    = useState<boolean>(false);

  // ── Ingredient list helpers ───────────────────────────────────────────────
  const addIngredient = (): void =>
    setIngredients((prev) => [...prev, emptyIngredient()]);

  const removeIngredient = (idx: number): void => {
    if (ingredients.length > 1)
      setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateIngredient = (
    idx: number,
    field: keyof IngredientDraft,
    value: string
  ): void => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };

  // ── Reset all fields ─────────────────────────────────────────────────────
  const reset = (): void => {
    setTitle('');       setDescription('');
    setCuisine('Other'); setPrepTime('');
    setServings(2);     setImageUrl('');
    setIngredients([emptyIngredient()]);
    setImgError(false);
  };

  // ── Validate + save ───────────────────────────────────────────────────────
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      toast.error('Recipe title is required');
      return;
    }

    const validIngredients = ingredients.filter(
      (i) => i.ingredient_name.trim() && i.required_qty
    );
    if (validIngredients.length === 0) {
      toast.error('Add at least one ingredient with a name and quantity');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title:       title.trim(),
        description: description.trim() || null,
        cuisine,
        prep_time:   prepTime ? parseInt(prepTime, 10) : null,
        servings,
        image_url:   imageUrl.trim() || null,
        ingredients: validIngredients.map((i) => ({
          ingredient_name: i.ingredient_name.trim(),
          required_qty:    parseFloat(i.required_qty),
          unit:            i.unit,
        })),
      });
      reset();
    } finally {
      setSaving(false);
    }
  };

  // ── Close guard — prevent close while saving ──────────────────────────────
  const handleOpenChange = (v: boolean): void => {
    if (saving) return;
    if (!v) onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="font-display text-xl"
            style={{ color: 'var(--text-primary)' }}
          >
            New Recipe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">

          {/* ── Title ── */}
          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>
              Recipe Title <span style={{ color: 'var(--danger)' }}>*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pasta Primavera"
              className="mt-1.5"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* ── Description ── */}
          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              maxLength={200}
              className="mt-1.5 resize-none"
              rows={2}
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {description.length}/200
            </p>
          </div>

          {/* ── Cuisine + Prep time ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Cuisine</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger
                  className="mt-1.5"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUISINES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>
                Prep Time (min)
              </Label>
              <Input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="30"
                className="mt-1.5 font-mono"
                min={1}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* ── Servings + Image URL ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Servings</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="h-9 w-9"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span
                  className="font-mono text-lg w-8 text-center"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {servings}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setServings((s) => Math.min(20, s + 1))}
                  className="h-9 w-9"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>
                Image URL{' '}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  (optional)
                </span>
              </Label>
              <Input
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImgError(false);
                }}
                placeholder="https://..."
                className="mt-1.5"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              {/* ── Live image preview (spec Part 17.7) ── */}
              {imageUrl && (
                <div
                  className="mt-2 w-full h-24 rounded-lg overflow-hidden border flex items-center justify-center"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  {imgError ? (
                    <div className="flex flex-col items-center gap-1">
                      <ImageOff
                        className="w-6 h-6"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Invalid image URL
                      </span>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Recipe preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Ingredients ── */}
          <div>
            <Label
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Ingredients
            </Label>

            <div className="space-y-3 mt-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  {/* Name */}
                  <Input
                    value={ing.ingredient_name}
                    onChange={(e) =>
                      updateIngredient(idx, 'ingredient_name', e.target.value)
                    }
                    placeholder="Ingredient"
                    className="flex-1"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {/* Quantity */}
                  <Input
                    type="number"
                    value={ing.required_qty}
                    onChange={(e) =>
                      updateIngredient(idx, 'required_qty', e.target.value)
                    }
                    placeholder="Qty"
                    className="w-20 font-mono"
                    min={0.01}
                    step={0.01}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {/* Unit */}
                  <Select
                    value={ing.unit}
                    onValueChange={(v) => updateIngredient(idx, 'unit', v)}
                  >
                    <SelectTrigger
                      className="w-24"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Remove row */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(idx)}
                    disabled={ingredients.length <= 1}
                    className="h-9 w-9"
                    style={{ color: 'var(--danger)' }}
                    aria-label="Remove ingredient"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addIngredient}
              className="mt-3"
              style={{
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* ── Footer buttons ── */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {saving ? 'Saving...' : 'Save Recipe'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
