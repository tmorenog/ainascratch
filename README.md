# 🧁 Aina's Bakery — A Cozy Baking Sim

A warm, whimsical bakery and drink shop simulator built for a kid to love. Choose a silly name, open the shop, bake treats, pour drinks, serve customers (and their pets!), and earn cute reviews.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand**. Runs fully in the browser — no backend, no sign-in, no ads. Progress is saved to `localStorage`.

---

## ▶️ Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```bash
npm run build       # production build
npm start           # run the production build
npm run lint        # ESLint
npm run typecheck   # strict TypeScript
```

---

## 🚀 Deploy to Vercel

This is a zero-config Next.js app. The easiest path:

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Leave the defaults — Vercel auto-detects Next.js.
4. Click **Deploy**.

You can also deploy from the CLI:

```bash
npm i -g vercel
vercel        # follow the prompts
vercel --prod # promote to production
```

Nothing else is required — no env vars, no database.

---

## 🎮 How to play

1. **Name your bakery** (or roll a funny one like "Bunkin Bonuts").
2. **Open the shop** with the green button. Customers will arrive on their own.
3. **Tap a station** (Drink Bar, Pastry Counter, Scratch Workshop, Pet Nook) and pick a recipe to start prepping. Ingredients are used from your pantry.
4. A progress ring shows prep time. When it says **READY!**, tap the station again to move it to the **Ready to serve** tray.
5. Tap **Serve order** on a customer card once you've got all the items they need. Fast + correct = 5 stars + tips.
6. Running low? Open the **🛒 Supermarket** to restock. Deliveries arrive in ~8 seconds.
7. **📖 Recipe book** shows ingredients, steps, and bake times for every recipe (locked recipes reveal as you level up).
8. **⭐ Reviews** shows every customer's reaction and your running stats.
9. **⚙️ Settings** lets you rename the bakery, change pace (Cozy / Just right / Rush), or start fresh.
10. Close the shop any time to restock or breathe. Your save persists automatically.

### Stations

| Station | What it makes |
|---|---|
| 🥤 Drink Bar | hot chocolate, milkshake, smoothie, lemonade, coffee, tea, mocha… |
| 🧁 Pastry Counter | glazed/sprinkle donuts, cupcakes, muffins, cinnamon rolls, butter cookies |
| 🥣 Scratch Workshop | scratch donuts, choc-chip cookies, berry pie, croissants, decorated cakes |
| 🐾 Pet Treat Nook | bone biscuits for dogs, fish cookies for cats |

### Scoring

- **5 ⭐** — correct order served in under 40% of patience.
- **4 ⭐** — correct, under 65%.
- **3 ⭐** — correct, under 85%.
- **2 ⭐** — correct but very slow.
- **1 ⭐** — wrong order or customer left hungry.

Tips scale with stars. Streak counter rewards consecutive correct orders. Level XP unlocks new recipes (e.g. Mocha at Lv 2, Berry Pie at Lv 2, Croissant at Lv 3, Decorated Cake at Lv 4, Berry Glow Smoothie at Lv 3).

---

## 🧩 Project layout

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Fonts, metadata, viewport, global CSS
│   ├── page.tsx            # Entry -> BakeryApp
│   ├── globals.css         # Tailwind + cozy bakery styles (wood, chalkboard, glass case)
│   └── manifest.webmanifest
├── components/
│   ├── BakeryApp.tsx       # Top-level shell + tick loop + modal orchestration
│   ├── Welcome.tsx         # Naming screen + difficulty picker
│   ├── Topbar.tsx          # Bakery sign, coins/level/reviews HUD, open-close button
│   ├── CustomerQueue.tsx   # Customer cards with order, patience, serve button
│   ├── StationGrid.tsx     # 4 prep stations + recipe picker sheet
│   ├── ReadyTray.tsx       # "Ready to serve" glass case
│   ├── InventoryStrip.tsx  # Pantry strip at the bottom
│   ├── RecipeBook.tsx      # Tabbed recipe book modal
│   ├── Supermarket.tsx     # Shopping list + checkout
│   ├── ReviewsPanel.tsx    # Review feed + lifetime stats
│   ├── SettingsPanel.tsx   # Rename, pace, reset
│   ├── foods/FoodArt.tsx   # All food SVGs (donuts, cupcakes, drinks, etc.)
│   └── ui/                 # Modal, ProgressRing/Bar, Stars
├── game/
│   ├── types.ts            # All TypeScript types
│   ├── ingredients.ts      # Ingredient registry
│   ├── recipes.ts          # All 20+ recipes (drinks, pastries, scratch, pet)
│   ├── customers.ts        # Customer archetypes + flavor lines
│   ├── reviews.ts          # Cute review templates + funny-name generator
│   ├── util.ts             # uid, shuffle, multisetEqual…
│   └── store.ts            # Zustand store (state + persist + tick)
└── ...
```

---

## ✍️ Adding new content

### Add a new recipe
1. Open `src/game/recipes.ts` and append a new entry to the `RECIPES` array.
2. Set `station` to `"drink" | "pastry" | "scratch" | "pet"`.
3. List ingredients (must already exist in `src/game/ingredients.ts`) and steps.
4. Set `unlocked: true` for starter recipes or `unlocked: false` + `unlockLevel` for progression.
5. Add a matching SVG in `src/components/foods/FoodArt.tsx` and register it in `FOOD_ART_BY_ID` using the same `id`. (If you skip this step, a plain dough circle renders as a fallback.)

### Add a new ingredient
1. Add it to `src/game/ingredients.ts` with a name, emoji, price, unit, and starting amount.
2. Reference it from any recipe.

### Add a new customer
1. Add to `CUSTOMER_ARCHETYPES` in `src/game/customers.ts`.
2. Give them an emoji, color, and a few flavor lines. Optionally set `hasPet: "dog" | "cat"` so they ask for pet treats.

### Tweak difficulty
- Spawn/patience knobs live at the top of `src/game/store.ts` in `DIFFICULTY_PROFILES`.
- XP curve: `xpForLevel()` also in `src/game/store.ts`.

---

## 🌱 Design values

- **Cozy over competitive.** Customers are patient; running out of stock is never punishing, just a nudge to open the supermarket.
- **Child-friendly everywhere.** No scary mechanics, no failure-state screens, no pay-to-win.
- **Touch-first.** Every interaction is tap-to-trigger. Works on phones, tablets, and desktops.
- **Polished food.** Every recipe has a hand-built SVG with gradients and highlights — no generic emojis where art could go.
- **Save-on-the-fly.** Closing the tab mid-prep is fine; your coins, level, pantry, and reviews persist.

---

Happy baking, Aina! 🧁
