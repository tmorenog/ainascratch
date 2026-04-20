"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "./ui/Modal";
import { INGREDIENTS, INGREDIENT_LIST } from "@/game/ingredients";
import type { IngredientId, RecipeCategory } from "@/game/types";
import { useGame } from "@/game/store";
import { useT } from "@/game/i18n";

/** Animals + themes for the plush combiner. Pick one of each and the
 *  creator mashes them together into a cute themed plush. */
type PlushOption = { id: string; name: string; emoji: string };

const PLUSH_ANIMALS: PlushOption[] = [
  { id: "bear", name: "Bear", emoji: "🐻" },
  { id: "bunny", name: "Bunny", emoji: "🐰" },
  { id: "cat", name: "Cat", emoji: "🐱" },
  { id: "puppy", name: "Puppy", emoji: "🐶" },
  { id: "fox", name: "Fox", emoji: "🦊" },
  { id: "panda", name: "Panda", emoji: "🐼" },
  { id: "penguin", name: "Penguin", emoji: "🐧" },
  { id: "frog", name: "Frog", emoji: "🐸" },
  { id: "koala", name: "Koala", emoji: "🐨" },
  { id: "tiger", name: "Tiger", emoji: "🐯" },
  { id: "owl", name: "Owl", emoji: "🦉" },
  { id: "unicorn", name: "Unicorn", emoji: "🦄" },
];

const PLUSH_THEMES: PlushOption[] = [
  { id: "pineapple", name: "Pineapple", emoji: "🍍" },
  { id: "donut", name: "Donut", emoji: "🍩" },
  { id: "cupcake", name: "Cupcake", emoji: "🧁" },
  { id: "strawberry", name: "Strawberry", emoji: "🍓" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈" },
  { id: "cloud", name: "Cloud", emoji: "☁️" },
  { id: "star", name: "Star", emoji: "⭐" },
  { id: "croissant", name: "Croissant", emoji: "🥐" },
  { id: "coffee", name: "Coffee", emoji: "☕" },
  { id: "lemon", name: "Lemon", emoji: "🍋" },
  { id: "flower", name: "Flower", emoji: "🌸" },
  { id: "heart", name: "Heart", emoji: "💖" },
  { id: "watermelon", name: "Watermelon", emoji: "🍉" },
  { id: "cherry", name: "Cherry", emoji: "🍒" },
  { id: "mushroom", name: "Mushroom", emoji: "🍄" },
  { id: "moon", name: "Moon", emoji: "🌙" },
];

const CATEGORIES: {
  id: RecipeCategory;
  labelKey:
    | "drinks"
    | "pastries"
    | "baked"
    | "petTreats"
    | "everyoneSafe"
    | "plushies";
  emoji: string;
}[] = [
  { id: "drink", labelKey: "drinks", emoji: "🥤" },
  { id: "pastry", labelKey: "pastries", emoji: "🧁" },
  { id: "scratch", labelKey: "baked", emoji: "🥣" },
  { id: "pet", labelKey: "petTreats", emoji: "🐾" },
  { id: "safe", labelKey: "everyoneSafe", emoji: "🌱" },
  { id: "plush", labelKey: "plushies", emoji: "🧸" },
];

/** Ingredients people and pets can all enjoy — no nuts, no chocolate,
 *  no caffeine, no pet-only mix. When the chef picks the Everyone-Safe
 *  category, the ingredient grid is filtered to just these. */
const EVERYONE_SAFE_INGREDIENTS: IngredientId[] = [
  "flour",
  "sugar",
  "butter",
  "eggs",
  "milk",
  "yeast",
  "fruit",
  "tea_leaves",
  "icing",
  "lemon",
  "cinnamon",
  "pineapple",
];

// A small emoji palette grouped by vibe. Chef can type their own too.
const EMOJI_OPTIONS = [
  "🍰", "🥧", "🍪", "🧁", "🍩", "🍫", "🍭", "🍬",
  "🥐", "🥯", "🍞", "🎂", "🥮", "🍮", "🍨", "🍧",
  "🥤", "🧃", "🧋", "☕", "🍵", "🍹", "🍨", "🥛",
  "🍓", "🫐", "🍋", "🍊", "🍑", "🥥", "🍍", "🍒",
  "🐾", "🦴", "🐟", "🐾",
];

export function RecipeCreator({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addCustomRecipe = useGame((s) => s.addCustomRecipe);
  const t = useT();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍰");
  const [category, setCategory] = useState<RecipeCategory>("drink");
  const [amounts, setAmounts] = useState<Partial<Record<IngredientId, number>>>(
    {},
  );
  const [description, setDescription] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  // Plush combiner picks — only meaningful when category === "plush".
  const [plushAnimal, setPlushAnimal] = useState<string | null>(null);
  const [plushTheme, setPlushTheme] = useState<string | null>(null);

  // When the player picks an animal + theme for a plush, auto-fill the
  // name / emoji / description so they don't have to type anything.
  useEffect(() => {
    if (category !== "plush") return;
    const animal = PLUSH_ANIMALS.find((a) => a.id === plushAnimal);
    const theme = PLUSH_THEMES.find((t) => t.id === plushTheme);
    if (!animal || !theme) return;
    setName(`${theme.name} ${animal.name} Plush`);
    setEmoji(`${theme.emoji}${animal.emoji}`);
    setDescription(
      `A squishy ${animal.name.toLowerCase()} with a ${theme.name.toLowerCase()} twist — totally huggable.`,
    );
  }, [category, plushAnimal, plushTheme]);

  // Suggested price: 2x total ingredient cost, rounded to nearest dollar.
  const ingredientCost = useMemo(() => {
    return (Object.entries(amounts) as [IngredientId, number][]).reduce(
      (s, [k, n]) => s + INGREDIENTS[k].pricePerUnit * (n ?? 0),
      0,
    );
  }, [amounts]);
  const [price, setPrice] = useState<number>(6);
  // Prep time: scales with ingredient count (each adds ~2s, minimum 5s).
  const ingredientCount = useMemo(
    () =>
      (Object.values(amounts) as number[]).reduce(
        (s, n) => s + (n ?? 0),
        0,
      ),
    [amounts],
  );
  // Plushies are always a 5.5s wrap-at-the-pastry-counter loop, ingredients
  // or not. For everything else, prep time scales with the number of picks.
  const autoPrepMs =
    category === "plush"
      ? 5500
      : Math.max(5000, 4000 + ingredientCount * 1500);

  // Re-suggest price when ingredient cost changes meaningfully. Plushies
  // suggest a flat price since they have no ingredients.
  const suggestedPrice =
    category === "plush" ? 20 : Math.max(3, Math.round(ingredientCost * 2));

  const hasIngredient = ingredientCount > 0;
  const plushPicked =
    category === "plush" && plushAnimal !== null && plushTheme !== null;
  const canSave =
    name.trim().length > 0 && (plushPicked || hasIngredient);

  function bump(id: IngredientId, delta: number) {
    setAmounts((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? 0;
      const val = Math.max(0, Math.min(4, cur + delta));
      if (val === 0) delete next[id];
      else next[id] = val;
      return next;
    });
  }

  function reset() {
    setName("");
    setEmoji("🍰");
    setCategory("drink");
    setAmounts({});
    setDescription("");
    setIsSpecial(false);
    setIsRecommended(false);
    setPrice(6);
    setPlushAnimal(null);
    setPlushTheme(null);
  }

  function handleSave() {
    if (!canSave) return;
    addCustomRecipe({
      name: name.trim(),
      emoji,
      category,
      ingredients: amounts,
      price,
      prepMs: autoPrepMs,
      description: description.trim(),
      isSpecial,
      isRecommended,
      plushAnimal: category === "plush" ? plushAnimal ?? undefined : undefined,
      plushTheme: category === "plush" ? plushTheme ?? undefined : undefined,
    });
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${emoji} ${t("inventRecipeTitle")}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Preview card */}
        <div className="rounded-2xl bg-cream-100 border border-cream-200 p-3 flex items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-soft flex items-center justify-center text-5xl">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl text-cocoa-600 truncate">
              {name || t("recipePlaceholder")}
            </div>
            <div className="text-xs text-cocoa-400 truncate">
              {description || t("recipeDescPlaceholder")}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="chip !py-0 !px-2">🪙 ${price}</span>
              <span className="chip !py-0 !px-2">
                ⏱ {Math.round(autoPrepMs / 1000)}s
              </span>
              {category === "safe" && (
                <span className="chip !py-0 !px-2 bg-mint-100 text-mint-700 border-mint-200">
                  🌱 {t("everyoneSafe")}
                </span>
              )}
              {isSpecial && (
                <span className="chip !py-0 !px-2 bg-amber-100 text-amber-700 border-amber-200">
                  ⭐ {t("special")}
                </span>
              )}
              {isRecommended && (
                <span className="chip !py-0 !px-2 bg-mint-100 text-mint-700 border-mint-200">
                  👍 {t("recommended")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
            {t("recipeName")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            placeholder={t("recipePlaceholder")}
            className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-cocoa-700 font-bold focus:outline-none focus:ring-2 focus:ring-cocoa-300"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
            {t("recipeCategory")}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    // Switching to Everyone-Safe drops any already-picked
                    // ingredients that aren't on the allergy-friendly list.
                    if (c.id === "safe") {
                      setAmounts((prev) => {
                        const next: Partial<Record<IngredientId, number>> = {};
                        for (const k of EVERYONE_SAFE_INGREDIENTS) {
                          if (prev[k] != null) next[k] = prev[k];
                        }
                        return next;
                      });
                    }
                    // Switching to plushie: ingredients become irrelevant;
                    // prime the price and let the combiner pickers drive
                    // the name/emoji.
                    if (c.id === "plush") {
                      setAmounts({});
                      setPrice(20);
                      setName("");
                      setPlushAnimal(null);
                      setPlushTheme(null);
                    }
                  }}
                  className={`rounded-xl p-2 border-2 text-center transition ${
                    active
                      ? "border-cocoa-400 bg-cream-100 shadow-soft"
                      : "border-cream-200 bg-white/70 hover:bg-cream-100"
                  }`}
                >
                  <div className="text-2xl">{c.emoji}</div>
                  <div className="text-[11px] font-bold text-cocoa-500 mt-0.5">
                    {t(c.labelKey)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emoji picker — skipped for plushes since the combiner
            auto-builds the icon from animal + theme. */}
        {category !== "plush" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
              {t("recipeIcon")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((em, i) => (
                <button
                  key={`${em}-${i}`}
                  onClick={() => setEmoji(em)}
                  className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition ${
                    emoji === em
                      ? "bg-cocoa-400 ring-2 ring-cocoa-400"
                      : "bg-white hover:bg-cream-100 border border-cream-200"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Plushie combiner — only shown for the plush category. */}
        {category === "plush" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
                Pick an animal 🐾
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {PLUSH_ANIMALS.map((a) => {
                  const active = plushAnimal === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setPlushAnimal(a.id)}
                      className={`rounded-xl p-2 border-2 text-center transition ${
                        active
                          ? "border-berry-400 bg-berry-50 shadow-soft"
                          : "border-cream-200 bg-white/70 hover:bg-cream-100"
                      }`}
                    >
                      <div className="text-2xl">{a.emoji}</div>
                      <div className="text-[11px] font-bold text-cocoa-500 mt-0.5">
                        {a.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
                Pick a theme 🎀
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {PLUSH_THEMES.map((th) => {
                  const active = plushTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setPlushTheme(th.id)}
                      className={`rounded-xl p-2 border-2 text-center transition ${
                        active
                          ? "border-berry-400 bg-berry-50 shadow-soft"
                          : "border-cream-200 bg-white/70 hover:bg-cream-100"
                      }`}
                    >
                      <div className="text-2xl">{th.emoji}</div>
                      <div className="text-[11px] font-bold text-cocoa-500 mt-0.5">
                        {th.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm text-cocoa-500">
              {plushPicked ? (
                <>
                  🧸 Combining{" "}
                  <span className="font-bold">
                    {PLUSH_THEMES.find((th) => th.id === plushTheme)?.name}
                  </span>{" "}
                  +{" "}
                  <span className="font-bold">
                    {PLUSH_ANIMALS.find((a) => a.id === plushAnimal)?.name}
                  </span>{" "}
                  → a one-of-a-kind themed plush!
                </>
              ) : (
                <>Pick an animal and a theme to combine them into a custom plush.</>
              )}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {category !== "plush" && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
            {t("recipeIngredients")}
          </label>
          {category === "safe" && (
            <div className="mb-2 text-[11px] text-mint-700 bg-mint-50 border border-mint-200 rounded-lg px-2 py-1">
              🌱 {t("safeFilterHint")}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INGREDIENT_LIST.filter((ing) =>
              category === "safe"
                ? EVERYONE_SAFE_INGREDIENTS.includes(ing.id)
                : true,
            ).map((ing) => {
              const n = amounts[ing.id] ?? 0;
              return (
                <div
                  key={ing.id}
                  className={`rounded-xl border p-2 flex items-center gap-2 ${
                    n > 0
                      ? "bg-cream-100 border-cocoa-200"
                      : "bg-white border-cream-200"
                  }`}
                >
                  <span className="text-2xl">{ing.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-cocoa-700 truncate">
                      {ing.name}
                    </div>
                    <div className="text-[10px] text-cocoa-400">
                      ${ing.pricePerUnit}/{ing.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => bump(ing.id, -1)}
                      disabled={n <= 0}
                      className="w-7 h-7 rounded-lg bg-cream-200 text-cocoa-600 font-bold disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="tabular-nums w-4 text-center font-bold text-cocoa-700">
                      {n}
                    </span>
                    <button
                      onClick={() => bump(ing.id, 1)}
                      disabled={n >= 4}
                      className="w-7 h-7 rounded-lg bg-cream-200 text-cocoa-600 font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-cocoa-400 mt-1">
            {t("ingredientCostHint", {
              cost: ingredientCost,
              suggested: suggestedPrice,
            })}
          </div>
        </div>
        )}

        {/* Price + description + flags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
              {t("recipePrice")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={30}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1"
              />
              <div className="w-14 text-right font-bold text-cocoa-600 tabular-nums">
                ${price}
              </div>
              <button
                onClick={() => setPrice(suggestedPrice)}
                className="text-[11px] px-2 py-1 rounded-lg bg-cream-200 text-cocoa-600 font-bold"
              >
                {t("useSuggested")}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-1">
              {t("recipeDesc")}
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 120))}
              placeholder={t("recipeDescPlaceholder")}
              className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-cocoa-700 focus:outline-none focus:ring-2 focus:ring-cocoa-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            className={`flex items-center gap-2 rounded-xl border-2 p-2 cursor-pointer transition ${
              isSpecial
                ? "border-amber-400 bg-amber-50"
                : "border-cream-200 bg-white/70 hover:bg-cream-100"
            }`}
          >
            <input
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
              className="scale-125"
            />
            <span className="text-xl">⭐</span>
            <span className="flex-1">
              <span className="block font-bold text-cocoa-700">
                {t("markSpecial")}
              </span>
              <span className="block text-[11px] text-cocoa-400">
                {t("markSpecialBlurb")}
              </span>
            </span>
          </label>
          <label
            className={`flex items-center gap-2 rounded-xl border-2 p-2 cursor-pointer transition ${
              isRecommended
                ? "border-mint-400 bg-mint-50"
                : "border-cream-200 bg-white/70 hover:bg-cream-100"
            }`}
          >
            <input
              type="checkbox"
              checked={isRecommended}
              onChange={(e) => setIsRecommended(e.target.checked)}
              className="scale-125"
            />
            <span className="text-xl">👍</span>
            <span className="flex-1">
              <span className="block font-bold text-cocoa-700">
                {t("markRecommended")}
              </span>
              <span className="block text-[11px] text-cocoa-400">
                {t("markRecommendedBlurb")}
              </span>
            </span>
          </label>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="btn-primary disabled:opacity-50"
          >
            {t("addToMenu")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
