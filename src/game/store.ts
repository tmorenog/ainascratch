"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Lang } from "./i18n";
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
  scratch: "Bakery Oven",
  pet: "Pet Treat Nook",
};

interface SupplyOrder {
  id: string;
  items: Partial<Record<IngredientId, number>>;
  arrivesAt: number;
  totalCost: number;
}

export interface LevelUpEvent {
  id: string;
  level: number;
  unlockedRecipeIds: string[];
  at: number;
}

export interface TipEvent {
  id: string;
  amount: number;
  customerName: string;
  at: number;
}

export interface PlacedFurniture {
  id: string; // instance id
  kind: string; // catalog id
  x: number;
  z: number;
  rot: number;
}

export interface GiftedPet {
  id: string;
  kind: "dog" | "cat";
  giverName: string;
  at: number;
}

interface GameState {
  // setup
  bakeryName: string;
  hasOnboarded: boolean;
  difficulty: Difficulty;
  language: Lang;

  // economy
  coins: number;
  level: number;
  xp: number;
  unlockedRecipeIds: string[];
  tipJar: number; // running total visible in the cute tip jar

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

  // ephemeral events for celebrations / animations
  levelUps: LevelUpEvent[]; // pending toasts
  tipEvents: TipEvent[]; // pending coin tosses

  // furniture placed in the 3D bakery (persists)
  furniture: PlacedFurniture[];

  // Pets gifted by 5-star customers who loved the food. Persisted.
  giftedPets: GiftedPet[];

  // session timing
  lastTickAt: number;
  nextSpawnAt: number;

  // actions
  setBakeryName: (n: string) => void;
  setDifficulty: (d: Difficulty) => void;
  setLanguage: (l: Lang) => void;
  finishOnboarding: () => void;
  resetGame: () => void;

  toggleStore: () => void;
  startPrep: (recipeId: string) => boolean;
  collectReady: (stationId: StationId) => void;
  serveCustomer: (
    customerId: string,
    upcharge?: number,
  ) =>
    | "success"
    | "success-gift"
    | "wrong"
    | "missing"
    | "refused";
  catchRobber: (customerId: string) => "caught" | "escaped" | "missing";
  dismissCustomer: (customerId: string, reason?: "leave" | "expire") => void;
  acknowledgeLevelUp: (id: string) => void;
  acknowledgeTip: (id: string) => void;

  orderSupplies: (items: Partial<Record<IngredientId, number>>) => void;

  buyFurniture: (kind: string, x: number, z: number, rot: number, price: number) => boolean;
  removeFurniture: (id: string) => void;

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
    look: archetype.look,
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
      language: "en" as Lang,

      coins: 30,
      level: 1,
      xp: 0,
      unlockedRecipeIds: initialUnlocked,
      tipJar: 0,

      inventory: emptyInventory(),
      pendingSupply: [],

      isOpen: false,
      customers: [],
      prep: {},
      ready: [],

      reviews: [],
      stats: emptyStats(),
      levelUps: [],
      tipEvents: [],
      furniture: [],
      giftedPets: [],

      lastTickAt: Date.now(),
      nextSpawnAt: Date.now() + 4000,

      setBakeryName: (n) => set({ bakeryName: n.trim().slice(0, 36) || "Sweet Spot" }),
      setDifficulty: (d) => set({ difficulty: d }),
      setLanguage: (l) => set({ language: l }),
      finishOnboarding: () => set({ hasOnboarded: true }),

      resetGame: () =>
        set({
          bakeryName: "",
          hasOnboarded: false,
          difficulty: "cozy",
          language: get().language,
          coins: 30,
          level: 1,
          xp: 0,
          unlockedRecipeIds: initialUnlocked,
          tipJar: 0,
          inventory: emptyInventory(),
          pendingSupply: [],
          isOpen: false,
          customers: [],
          prep: {},
          ready: [],
          reviews: [],
          stats: emptyStats(),
          levelUps: [],
          tipEvents: [],
          furniture: [],
          giftedPets: [],
          lastTickAt: Date.now(),
          nextSpawnAt: Date.now() + 4000,
        }),

      buyFurniture: (kind, x, z, rot, price) => {
        const s = get();
        if (s.coins < price) return false;
        set({
          coins: s.coins - price,
          furniture: [
            ...s.furniture,
            { id: uid("fur"), kind, x, z, rot },
          ],
        });
        return true;
      },
      removeFurniture: (id) =>
        set((s) => ({ furniture: s.furniture.filter((f) => f.id !== id) })),

      acknowledgeLevelUp: (id) =>
        set((s) => ({ levelUps: s.levelUps.filter((e) => e.id !== id) })),
      acknowledgeTip: (id) =>
        set((s) => ({ tipEvents: s.tipEvents.filter((e) => e.id !== id) })),

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

      serveCustomer: (customerId, upcharge = 0) => {
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

        // earnings (base)
        const basePay = customer.order.reduce(
          (sum, id) => sum + (RECIPE_BY_ID[id]?.price ?? 0),
          0,
        );

        // If the player asked for more than the fair price, roll a dice:
        // bigger the surcharge, less likely the customer accepts. A refused
        // haggle walks the customer out WITHOUT consuming the tray items
        // (so the bakes can still be served to someone else).
        const safeUpcharge = Math.max(0, Math.round(upcharge));
        if (safeUpcharge > 0) {
          const ratio = safeUpcharge / Math.max(1, basePay);
          const chance = Math.max(0.1, Math.min(0.95, 1 - ratio * 0.85));
          const accepted = Math.random() < chance;
          if (!accepted) {
            const review: Review = {
              id: uid("rev"),
              customerName: customer.name,
              customerEmoji: customer.emoji,
              stars: 1,
              tip: 0,
              text: `Too expensive — ${customer.name} walked out.`,
              at: now,
            };
            const reviewsCount = s.stats.reviewsCount + 1;
            const averageStars =
              (s.stats.averageStars * s.stats.reviewsCount + 1) / reviewsCount;
            set({
              customers: s.customers.filter((c) => c.id !== customerId),
              reviews: [review, ...s.reviews].slice(0, 60),
              stats: {
                ...s.stats,
                ordersFailed: s.stats.ordersFailed + 1,
                streak: 0,
                reviewsCount,
                averageStars,
              },
            });
            return "refused";
          }
        }

        // remove served ready items
        const newReady = tray.filter((_, i) => !usedIndices.includes(i));
        const newCustomers = s.customers.filter((c) => c.id !== customerId);

        // Fair service still earns a tip; haggled-and-accepted service
        // replaces the tip with the upcharge (fair trade for the risk).
        const tip =
          correct && safeUpcharge === 0
            ? Math.round(basePay * (stars / 5) * 0.6)
            : 0;
        const earnings = basePay + tip + safeUpcharge;

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

        // xp / level up — also queue a celebration toast if level changes
        let xp = s.xp + (correct ? 8 + customer.order.length * 3 : 2);
        let level = s.level;
        let unlockedRecipeIds = [...s.unlockedRecipeIds];
        const levelUps = [...s.levelUps];
        while (xp >= xpForLevel(level)) {
          xp -= xpForLevel(level);
          level += 1;
          const newlyUnlocked: string[] = [];
          for (const r of RECIPES) {
            if (r.unlockLevel === level && !unlockedRecipeIds.includes(r.id)) {
              unlockedRecipeIds.push(r.id);
              newlyUnlocked.push(r.id);
            }
          }
          levelUps.push({
            id: uid("lvl"),
            level,
            unlockedRecipeIds: newlyUnlocked,
            at: now,
          });
        }

        // queue a tip event so the tip jar can animate a coin toss
        const tipEvents = [...s.tipEvents];
        if (tip > 0) {
          tipEvents.push({
            id: uid("tip"),
            amount: tip,
            customerName: customer.name,
            at: now,
          });
        }

        // Pet gift: if the customer brought a pet, got a perfect 5-star
        // review, and the order was right, there's a small chance they're
        // so smitten they leave the pet with you as a bakery friend. It
        // persists and sits on the service counter.
        let giftedPets = s.giftedPets;
        let gifted = false;
        if (
          correct &&
          stars >= 5 &&
          customer.hasPet &&
          Math.random() < 0.25
        ) {
          giftedPets = [
            ...s.giftedPets,
            {
              id: uid("pet"),
              kind: customer.hasPet,
              giverName: customer.name,
              at: now,
            },
          ];
          gifted = true;
        }

        set({
          customers: newCustomers,
          ready: newReady,
          coins: s.coins + earnings,
          tipJar: s.tipJar + tip,
          reviews: [review, ...s.reviews].slice(0, 60),
          stats,
          xp,
          level,
          unlockedRecipeIds,
          levelUps,
          tipEvents,
          giftedPets,
        });
        if (gifted) return "success-gift";
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

      catchRobber: (customerId) => {
        const s = get();
        const customer = s.customers.find((c) => c.id === customerId);
        if (!customer || !customer.isRobber) return "missing";
        // 70% chance of catching — a kind but jittery villain, basically.
        const caught = Math.random() < 0.7;
        const now = Date.now();
        const stolenId = customer.stolenRecipeId;
        const recipe = stolenId ? RECIPE_BY_ID[stolenId] : undefined;
        if (caught) {
          const bounty = 4 + Math.floor(Math.random() * 5); // $4-$8 bravery bonus
          const restored: ReadyItem | null = stolenId
            ? { id: uid("rdy"), recipeId: stolenId, finishedAt: now }
            : null;
          const review: Review = {
            id: uid("rev"),
            customerName: customer.name,
            customerEmoji: "🦸",
            stars: 5,
            tip: bounty,
            text: recipe
              ? `You caught a robber and saved the ${recipe.name}!`
              : "You caught a robber! Bravo, baker!",
            at: now,
          };
          const reviewsCount = s.stats.reviewsCount + 1;
          const averageStars =
            (s.stats.averageStars * s.stats.reviewsCount + 5) / reviewsCount;
          set({
            customers: s.customers.filter((c) => c.id !== customerId),
            ready: restored ? [...s.ready, restored] : s.ready,
            coins: s.coins + bounty,
            tipJar: s.tipJar + bounty,
            reviews: [review, ...s.reviews].slice(0, 60),
            stats: {
              ...s.stats,
              totalEarnings: s.stats.totalEarnings + bounty,
              totalTips: s.stats.totalTips + bounty,
              reviewsCount,
              averageStars,
            },
          });
          return "caught";
        }
        // Escaped with the goods
        const review: Review = {
          id: uid("rev"),
          customerName: customer.name,
          customerEmoji: "🏃‍♂️",
          stars: 1,
          tip: 0,
          text: recipe
            ? `A robber got away with a ${recipe.name}!`
            : "A robber escaped!",
          at: now,
        };
        const reviewsCount = s.stats.reviewsCount + 1;
        const averageStars =
          (s.stats.averageStars * s.stats.reviewsCount + 1) / reviewsCount;
        set({
          customers: s.customers.filter((c) => c.id !== customerId),
          reviews: [review, ...s.reviews].slice(0, 60),
          stats: {
            ...s.stats,
            ordersFailed: s.stats.ordersFailed + 1,
            streak: 0,
            reviewsCount,
            averageStars,
          },
        });
        return "escaped";
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
              customerEmoji: c.isRobber ? "🏃‍♂️" : c.emoji,
              stars: 1,
              tip: 0,
              text: c.isRobber
                ? "A robber got away with a treat!"
                : "I waited too long and had to go!",
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
        const readyAfter: ReadyItem[] = updates.ready ?? s.ready;
        const queueLimit = DIFFICULTY_PROFILES[s.difficulty].maxQueue;
        if (s.isOpen && now >= s.nextSpawnAt && customersAfter.length < queueLimit) {
          let c = spawnCustomer(s.unlockedRecipeIds, s.difficulty);
          // Once in a while (25/65 ≈ 38%) a "customer" is actually a robber
          // who grabs one ready item off the tray and bolts. We only swap
          // them in if there's something to steal, otherwise they'd be a
          // very confused robber. Robbers also have a shorter patience.
          if (readyAfter.length > 0 && Math.random() < 25 / 65) {
            const stealIdx = Math.floor(Math.random() * readyAfter.length);
            const stolen = readyAfter[stealIdx];
            updates.ready = readyAfter.filter((_, i) => i !== stealIdx);
            c = {
              ...c,
              isRobber: true,
              stolenRecipeId: stolen.recipeId,
              order: [],
              emoji: "🎭",
              name: "Sneaky Stranger",
              greeting: "Oh nothing, just browsing… *grabs treat and bolts*",
              patienceMs: 9000,
              look: {
                ...(c.look ?? {
                  hair: "short",
                  hairColor: "#1a1008",
                  skin: "#f3c8a4",
                  shirt: "#202020",
                }),
                hair: "short",
                hairColor: "#1a1008",
                shirt: "#1a1a1a",
              },
            };
          }
          // Robbers barge to the front of the queue so the player can
          // actually catch them before they time out (~9s).
          updates.customers = c.isRobber ? [c, ...customersAfter] : [...customersAfter, c];
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
      // Bump whenever we add recipes or ingredients so returning players
      // automatically get the new menu + a full inventory slot list.
      version: 5,
      migrate: (persisted, _version) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        // Merge in any newly-unlocked recipes that weren't in the save.
        const savedUnlocked = new Set(p.unlockedRecipeIds ?? []);
        for (const id of initialUnlocked) savedUnlocked.add(id);
        // Make sure every ingredient key exists on the inventory.
        const mergedInventory = {
          ...emptyInventory(),
          ...(p.inventory ?? {}),
        } as Record<IngredientId, number>;
        return {
          ...p,
          unlockedRecipeIds: Array.from(savedUnlocked),
          inventory: mergedInventory,
          giftedPets: p.giftedPets ?? [],
          language: p.language ?? ("en" as Lang),
        } as GameState;
      },
      partialize: (s) => ({
        bakeryName: s.bakeryName,
        hasOnboarded: s.hasOnboarded,
        difficulty: s.difficulty,
        language: s.language,
        coins: s.coins,
        level: s.level,
        xp: s.xp,
        unlockedRecipeIds: s.unlockedRecipeIds,
        tipJar: s.tipJar,
        inventory: s.inventory,
        reviews: s.reviews.slice(0, 30),
        stats: s.stats,
        furniture: s.furniture,
        giftedPets: s.giftedPets,
      }),
    },
  ),
);

export const STATION_LABELS = STATION_LABEL;
export const DIFFICULTY_PROFILES_PUBLIC = DIFFICULTY_PROFILES;
