"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Customer,
  Difficulty,
  IngredientId,
  PrepSlot,
  ReadyItem,
  Review,
  StationId,
  Stats,
} from "./types";
import { INGREDIENTS } from "./ingredients";
import { RECIPES, RECIPE_BY_ID } from "./recipes";
import { CUSTOMER_ARCHETYPES } from "./customers";
import { pickReview } from "./reviews";
import { clamp, multisetEqual, randomChoice, uid } from "./util";

/* -----------------------------------------------------------
   Difficulty knobs — tweak here for global balance changes.
----------------------------------------------------------- */
const DIFFICULTY_PROFILES: Record<
  Difficulty,
  { spawnMs: [number, number]; patienceMs: [number, number]; maxQueue: number }
> = {
  cozy: { spawnMs: [16000, 24000], patienceMs: [120000, 160000], maxQueue: 2 },
  normal: { spawnMs: [11000, 18000], patienceMs: [70000, 110000], maxQueue: 3 },
  rush: { spawnMs: [6000, 11000], patienceMs: [45000, 70000], maxQueue: 4 },
};

const STATION_LABEL: Record<StationId, string> = {
  drink: "Drink Bar",
  pastry: "Pastry Counter",
  oven: "Oven",
  scratch: "Scratch Workshop",
  pet: "Pet Treat Nook",
};

interface SupplyOrder {
  id: string;
  items: Partial<Record<IngredientId, number>>;
  arrivesAt: number;
  totalCost: number;
}

interface GameState {
  // setup
  bakeryName: string;
  hasOnboarded: boolean;
  difficulty: Difficulty;

  // economy
  coins: number;
  level: number;
  xp: number;
  unlockedRecipeIds: string[];

  // inventory
  inventory: Record<IngredientId, number>;
  pendingSupply: SupplyOrder[];

  // shop state
  isOpen: boolean;
  customers: Customer[];
  prep: Partial<Record<StationId, PrepSlot>>;
  ready: ReadyItem[];

  // history
  reviews: Review[];
  stats: Stats;

  // session timing
  lastTickAt: number;
  nextSpawnAt: number;

  // actions
  setBakeryName: (n: string) => void;
  setDifficulty: (d: Difficulty) => void;
  finishOnboarding: () => void;
  resetGame: () => void;

  toggleStore: () => void;
  startPrep: (recipeId: string) => boolean;
  collectReady: (stationId: StationId) => void;
  serveCustomer: (customerId: string) => "success" | "wrong" | "missing";
  dismissCustomer: (customerId: string, reason?: "leave" | "expire") => void;

  orderSupplies: (items: Partial<Record<IngredientId, number>>) => void;

  tick: (now: number) => void;
}

function emptyInventory(): Record<IngredientId, number> {
  const inv = {} as Record<IngredientId, number>;
  for (const k of Object.keys(INGREDIENTS) as IngredientId[]) {
    inv[k] = INGREDIENTS[k].startingAmount;
  }
  return inv;
}

function emptyStats(): Stats {
  return {
    ordersCompleted: 0,
    ordersFailed: 0,
    itemsServed: 0,
    streak: 0,
    bestStreak: 0,
    totalEarnings: 0,
    totalTips: 0,
    averageStars: 0,
    reviewsCount: 0,
  };
}

function pickOrder(unlocked: Set<string>, hasPet?: "dog" | "cat"): string[] {
  const candidates = RECIPES.filter(
    (r) => unlocked.has(r.id) && r.category !== "pet",
  );
  const itemCount = Math.random() < 0.55 ? 1 : Math.random() < 0.85 ? 2 : 3;
  const order: string[] = [];
  for (let i = 0; i < itemCount; i++) {
    order.push(randomChoice(candidates).id);
  }
  if (hasPet === "dog") order.push("dog_bone");
  if (hasPet === "cat") order.push("cat_fish");
  return order;
}

function spawnCustomer(unlockedRecipeIds: string[], difficulty: Difficulty): Customer {
  const archetype = randomChoice(CUSTOMER_ARCHETYPES);
  const [pMin, pMax] = DIFFICULTY_PROFILES[difficulty].patienceMs;
  const order = pickOrder(new Set(unlockedRecipeIds), archetype.hasPet);
  return {
    id: uid("cust"),
    archetypeId: archetype.id,
    name: archetype.name,
    emoji: archetype.emoji,
    color: archetype.color,
    hasPet: archetype.hasPet,
    greeting: randomChoice(archetype.flavorLines),
    arrivedAt: Date.now(),
    patienceMs: Math.round(pMin + Math.random() * (pMax - pMin)) +
      // longer orders get a little more patience
      (order.length - 1) * 18000,
    order,
  };
}

function nextSpawnDelay(difficulty: Difficulty): number {
  const [a, b] = DIFFICULTY_PROFILES[difficulty].spawnMs;
  return Math.round(a + Math.random() * (b - a));
}

function computeStars(servedAt: number, customer: Customer, correct: boolean): number {
  if (!correct) return 1;
  const elapsed = servedAt - customer.arrivedAt;
  const ratio = elapsed / customer.patienceMs;
  if (ratio < 0.4) return 5;
  if (ratio < 0.65) return 4;
  if (ratio < 0.85) return 3;
  return 2;
}

function xpForLevel(level: number): number {
  return 30 + level * 25;
}

const initialUnlocked = RECIPES.filter((r) => r.unlocked).map((r) => r.id);

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      bakeryName: "",
      hasOnboarded: false,
      difficulty: "cozy",

      coins: 30,
      level: 1,
      xp: 0,
      unlockedRecipeIds: initialUnlocked,

      inventory: emptyInventory(),
      pendingSupply: [],

      isOpen: false,
      customers: [],
      prep: {},
      ready: [],

      reviews: [],
      stats: emptyStats(),

      lastTickAt: Date.now(),
      nextSpawnAt: Date.now() + 4000,

      setBakeryName: (n) => set({ bakeryName: n.trim().slice(0, 36) || "Sweet Spot" }),
      setDifficulty: (d) => set({ difficulty: d }),
      finishOnboarding: () => set({ hasOnboarded: true }),

      resetGame: () =>
        set({
          bakeryName: "",
          hasOnboarded: false,
          difficulty: "cozy",
          coins: 30,
          level: 1,
          xp: 0,
          unlockedRecipeIds: initialUnlocked,
          inventory: emptyInventory(),
          pendingSupply: [],
          isOpen: false,
          customers: [],
          prep: {},
          ready: [],
          reviews: [],
          stats: emptyStats(),
          lastTickAt: Date.now(),
          nextSpawnAt: Date.now() + 4000,
        }),

      toggleStore: () => {
        const s = get();
        const opening = !s.isOpen;
        set({
          isOpen: opening,
          nextSpawnAt: Date.now() + (opening ? 2500 : 0),
        });
      },

      startPrep: (recipeId) => {
        const s = get();
        const recipe = RECIPE_BY_ID[recipeId];
        if (!recipe) return false;
        if (!s.unlockedRecipeIds.includes(recipeId)) return false;
        if (s.prep[recipe.station]) return false;
        // check ingredients
        for (const [k, v] of Object.entries(recipe.ingredients) as [IngredientId, number][]) {
          if ((s.inventory[k] ?? 0) < v) return false;
        }
        const inv = { ...s.inventory };
        for (const [k, v] of Object.entries(recipe.ingredients) as [IngredientId, number][]) {
          inv[k] = inv[k] - v;
        }
        const now = Date.now();
        set({
          inventory: inv,
          prep: {
            ...s.prep,
            [recipe.station]: {
              recipeId,
              startedAt: now,
              endsAt: now + recipe.prepMs,
            },
          },
        });
        return true;
      },

      collectReady: (stationId) => {
        const s = get();
        const slot = s.prep[stationId];
        if (!slot) return;
        if (Date.now() < slot.endsAt) return;
        const newReady: ReadyItem = {
          id: uid("rdy"),
          recipeId: slot.recipeId,
          finishedAt: Date.now(),
        };
        const nextPrep = { ...s.prep };
        delete nextPrep[stationId];
        set({
          prep: nextPrep,
          ready: [...s.ready, newReady],
        });
      },

      serveCustomer: (customerId) => {
        const s = get();
        const customer = s.customers.find((c) => c.id === customerId);
        if (!customer) return "missing";
        // try to find ready items that match the order (multiset)
        const wanted = [...customer.order];
        const tray = [...s.ready];
        const usedIndices: number[] = [];

        for (const recipeId of wanted) {
          const idx = tray.findIndex(
            (item, i) => item.recipeId === recipeId && !usedIndices.includes(i),
          );
          if (idx === -1) {
            return "missing"; // not enough yet
          }
          usedIndices.push(idx);
        }

        const usedItemsRecipes = usedIndices.map((i) => tray[i].recipeId);
        const correct = multisetEqual(usedItemsRecipes, customer.order);
        const now = Date.now();
        const stars = computeStars(now, customer, correct);
        // remove served ready items
        const newReady = tray.filter((_, i) => !usedIndices.includes(i));
        const newCustomers = s.customers.filter((c) => c.id !== customerId);

        // earnings
        const basePay = customer.order.reduce(
          (sum, id) => sum + (RECIPE_BY_ID[id]?.price ?? 0),
          0,
        );
        const tip = correct ? Math.round(basePay * (stars / 5) * 0.6) : 0;
        const earnings = basePay + tip;

        // review
        const review: Review = {
          id: uid("rev"),
          customerName: customer.name,
          customerEmoji: customer.emoji,
          stars,
          tip,
          text: pickReview(stars),
          at: now,
        };

        // stats
        const reviewsCount = s.stats.reviewsCount + 1;
        const averageStars =
          (s.stats.averageStars * s.stats.reviewsCount + stars) / reviewsCount;
        const newStreak = correct ? s.stats.streak + 1 : 0;
        const stats: Stats = {
          ordersCompleted: s.stats.ordersCompleted + (correct ? 1 : 0),
          ordersFailed: s.stats.ordersFailed + (correct ? 0 : 1),
          itemsServed: s.stats.itemsServed + customer.order.length,
          streak: newStreak,
          bestStreak: Math.max(s.stats.bestStreak, newStreak),
          totalEarnings: s.stats.totalEarnings + earnings,
          totalTips: s.stats.totalTips + tip,
          averageStars,
          reviewsCount,
        };

        // xp / level up
        let xp = s.xp + (correct ? 8 + customer.order.length * 3 : 2);
        let level = s.level;
        let unlockedRecipeIds = [...s.unlockedRecipeIds];
        while (xp >= xpForLevel(level)) {
          xp -= xpForLevel(level);
          level += 1;
          // unlock anything tied to new level
          for (const r of RECIPES) {
            if (r.unlockLevel === level && !unlockedRecipeIds.includes(r.id)) {
              unlockedRecipeIds.push(r.id);
            }
          }
        }

        set({
          customers: newCustomers,
          ready: newReady,
          coins: s.coins + earnings,
          reviews: [review, ...s.reviews].slice(0, 60),
          stats,
          xp,
          level,
          unlockedRecipeIds,
        });
        return correct ? "success" : "wrong";
      },

      dismissCustomer: (customerId, reason = "leave") => {
        const s = get();
        const customer = s.customers.find((c) => c.id === customerId);
        if (!customer) return;
        const stars = 1;
        const review: Review = {
          id: uid("rev"),
          customerName: customer.name,
          customerEmoji: customer.emoji,
          stars,
          tip: 0,
          text:
            reason === "expire"
              ? "I waited too long and had to go!"
              : "I changed my mind. Maybe next time.",
          at: Date.now(),
        };
        const reviewsCount = s.stats.reviewsCount + 1;
        const averageStars =
          (s.stats.averageStars * s.stats.reviewsCount + stars) / reviewsCount;
        set({
          customers: s.customers.filter((c) => c.id !== customerId),
          reviews: [review, ...s.reviews].slice(0, 60),
          stats: {
            ...s.stats,
            ordersFailed: s.stats.ordersFailed + 1,
            streak: 0,
            averageStars,
            reviewsCount,
          },
        });
      },

      orderSupplies: (items) => {
        const s = get();
        const cost = (Object.entries(items) as [IngredientId, number][]).reduce(
          (sum, [k, qty]) => sum + (INGREDIENTS[k].pricePerUnit * (qty ?? 0)),
          0,
        );
        if (cost <= 0 || cost > s.coins) return;
        const order: SupplyOrder = {
          id: uid("supply"),
          items,
          arrivesAt: Date.now() + 8000, // 8s delivery to feel real but not punishing
          totalCost: cost,
        };
        set({
          coins: s.coins - cost,
          pendingSupply: [...s.pendingSupply, order],
        });
      },

      tick: (now) => {
        const s = get();
        const updates: Partial<GameState> = { lastTickAt: now };

        // Process supply deliveries
        const arriving = s.pendingSupply.filter((o) => now >= o.arrivesAt);
        if (arriving.length) {
          const inv = { ...s.inventory };
          for (const o of arriving) {
            for (const [k, qty] of Object.entries(o.items) as [IngredientId, number][]) {
              inv[k] = (inv[k] ?? 0) + (qty ?? 0);
            }
          }
          updates.inventory = inv;
          updates.pendingSupply = s.pendingSupply.filter((o) => now < o.arrivesAt);
        }

        // Customers leaving from impatience
        const survivors: Customer[] = [];
        const leftReviews: Review[] = [];
        for (const c of s.customers) {
          if (now - c.arrivedAt > c.patienceMs) {
            leftReviews.push({
              id: uid("rev"),
              customerName: c.name,
              customerEmoji: c.emoji,
              stars: 1,
              tip: 0,
              text: "I waited too long and had to go!",
              at: now,
            });
          } else {
            survivors.push(c);
          }
        }
        if (leftReviews.length) {
          const reviewsCount = s.stats.reviewsCount + leftReviews.length;
          const totalStars =
            s.stats.averageStars * s.stats.reviewsCount + leftReviews.length * 1;
          updates.customers = survivors;
          updates.reviews = [...leftReviews, ...s.reviews].slice(0, 60);
          updates.stats = {
            ...s.stats,
            ordersFailed: s.stats.ordersFailed + leftReviews.length,
            streak: 0,
            averageStars: totalStars / reviewsCount,
            reviewsCount,
          };
        }

        // Spawn new customers if open
        const customersAfter = updates.customers ?? s.customers;
        const queueLimit = DIFFICULTY_PROFILES[s.difficulty].maxQueue;
        if (s.isOpen && now >= s.nextSpawnAt && customersAfter.length < queueLimit) {
          const c = spawnCustomer(s.unlockedRecipeIds, s.difficulty);
          updates.customers = [...customersAfter, c];
          updates.nextSpawnAt = now + nextSpawnDelay(s.difficulty);
        } else if (s.isOpen && customersAfter.length >= queueLimit) {
          // Push spawn out a bit while queue is full
          updates.nextSpawnAt = now + 3000;
        }

        set(updates as GameState);
      },
    }),
    {
      name: "ainas-bakery-save-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        bakeryName: s.bakeryName,
        hasOnboarded: s.hasOnboarded,
        difficulty: s.difficulty,
        coins: s.coins,
        level: s.level,
        xp: s.xp,
        unlockedRecipeIds: s.unlockedRecipeIds,
        inventory: s.inventory,
        reviews: s.reviews.slice(0, 30),
        stats: s.stats,
      }),
    },
  ),
);

export const STATION_LABELS = STATION_LABEL;
export const DIFFICULTY_PROFILES_PUBLIC = DIFFICULTY_PROFILES;
