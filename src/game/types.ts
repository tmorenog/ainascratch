/**
 * Core type definitions for the bakery simulator.
 * Recipes, ingredients, customers, and shared game state live here.
 */

export type IngredientId =
  | "flour"
  | "sugar"
  | "butter"
  | "eggs"
  | "milk"
  | "chocolate"
  | "yeast"
  | "fruit"
  | "coffee_beans"
  | "tea_leaves"
  | "icing"
  | "lemon"
  | "cinnamon"
  | "pet_mix";

export type StationId = "drink" | "pastry" | "oven" | "scratch" | "pet";

export type RecipeCategory = "drink" | "pastry" | "scratch" | "pet";

export interface Ingredient {
  id: IngredientId;
  name: string;
  emoji: string;
  pricePerUnit: number;
  unit: string;
  startingAmount: number;
  petSafe?: boolean;
}

export interface RecipeStep {
  label: string;
  durationMs: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  station: StationId;
  ingredients: Partial<Record<IngredientId, number>>;
  steps: RecipeStep[];
  prepMs: number;
  price: number;
  unlocked: boolean;
  unlockLevel?: number;
  description: string;
  funFact?: string;
}

export interface CustomerArchetype {
  id: string;
  name: string;
  emoji: string;
  color: string;
  hasPet?: "dog" | "cat";
  flavorLines: string[];
}

export type CustomerMood = "happy" | "okay" | "grumpy";

export interface Customer {
  id: string;
  archetypeId: string;
  name: string;
  emoji: string;
  color: string;
  hasPet?: "dog" | "cat";
  greeting: string;
  arrivedAt: number;
  patienceMs: number;
  order: string[]; // recipe ids requested
  served?: boolean;
  mood?: CustomerMood;
}

export interface ReadyItem {
  id: string;
  recipeId: string;
  finishedAt: number;
}

export interface PrepSlot {
  recipeId: string;
  startedAt: number;
  endsAt: number;
}

export interface Review {
  id: string;
  customerName: string;
  customerEmoji: string;
  stars: number; // 1..5
  text: string;
  tip: number;
  at: number;
}

export interface Stats {
  ordersCompleted: number;
  ordersFailed: number;
  itemsServed: number;
  streak: number;
  bestStreak: number;
  totalEarnings: number;
  totalTips: number;
  averageStars: number;
  reviewsCount: number;
}

export type Difficulty = "cozy" | "normal" | "rush";
