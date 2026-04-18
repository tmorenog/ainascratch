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

The game is played in **first-person** — you physically walk around the bakery, Doom-style, and walk up to stations, the pantry, and the service counter to interact.

### Controls

**Desktop:**

| Key | Action |
|---|---|
| `W` / `↑` | Walk forward |
| `S` / `↓` | Walk back |
| `A` / `Q` | Strafe left |
| `D` | Strafe right |
| `←` / `→` | Turn |
| `Shift` | Run |
| `E` / `Space` / `Enter` | Interact with the highlighted thing |

**Mobile / tablet:** two on-screen joysticks — left to move, right to turn — and a big green **E** button to interact.

### The bakery has 8 hotspots

Walk close to any of these. A prompt appears in the middle of the screen telling you what pressing `E` will do.

| Hotspot | What happens |
|---|---|
| 🥤 Drink Bar totem | Opens the drink station's recipe picker |
| 🧁 Pastry Counter totem | Opens the pastry station's recipe picker |
| 🥣 Scratch Oven totem | Opens the scratch-bake station's recipe picker |
| 🐾 Pet Nook totem | Opens the pet-treat station's recipe picker |
| 🧺 Pantry Shelf | Shows current ingredients + link to the supermarket |
| 🛒 Supermarket Kiosk | Orders supplies (deliveries arrive in ~8s) |
| 🔔 Service Counter | Serve waiting customers; open/close the shop |
| 📖 Recipe Board | Opens the full recipe book |

### Game loop

1. **Name your bakery** on the welcome screen (or roll a funny one).
2. Walk to the 🔔 **Service Counter** and tap **Open Shop**. Customers walk up and queue as sprites right at your counter.
3. Walk to a station, press `E`, and choose a recipe. Ingredients are spent from your pantry; a progress ring ticks down.
4. When the station is **READY!**, walk back and press `E` again to plate the treat onto the ready tray.
5. Walk to the 🔔 counter and tap **Serve order** on a customer whose order you have on the tray. Fast + correct = 5 stars + tips.
6. Low on flour? Walk to the 🛒 kiosk to restock. Deliveries show up automatically.
7. Levels unlock fancier recipes (Mocha at Lv 2, Berry Pie at Lv 2, Croissant at Lv 3, Decorated Cake at Lv 4…).

Your save persists automatically in `localStorage`.

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
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Fonts, metadata, viewport, global CSS
│   ├── page.tsx                # Entry -> BakeryApp
│   ├── globals.css             # Tailwind + cozy bakery styles
│   └── manifest.webmanifest
├── components/
│   ├── BakeryApp.tsx           # Top-level shell + tick loop + modal orchestration
│   ├── Welcome.tsx             # Naming screen + pace picker
│   ├── Topbar.tsx              # Bakery sign + HUD
│   ├── StationPicker.tsx       # Recipe picker bottom-sheet for one station
│   ├── CounterPanel.tsx        # Serve customers + open/close shop
│   ├── PantryPanel.tsx         # Pantry view with link to supermarket
│   ├── Supermarket.tsx         # Shopping list + checkout
│   ├── RecipeBook.tsx          # Tabbed recipe book modal
│   ├── ReviewsPanel.tsx        # Review feed + lifetime stats
│   ├── SettingsPanel.tsx       # Rename, pace, reset
│   ├── foods/FoodArt.tsx       # All food SVGs
│   ├── ui/                     # Modal, ProgressRing/Bar, Stars
│   └── world/
│       ├── Bakery3D.tsx        # Raycaster canvas + controls + minimap + joysticks
│       └── textures.ts         # Procedural wall/sprite textures
├── game/
│   ├── types.ts                # TypeScript types
│   ├── ingredients.ts          # Ingredient registry
│   ├── recipes.ts              # All recipes (drinks/pastries/scratch/pet)
│   ├── customers.ts            # Customer archetypes
│   ├── reviews.ts              # Review templates + funny-name generator
│   ├── world.ts                # 3D map grid + hotspot positions
│   ├── util.ts                 # uid, shuffle, multisetEqual…
│   └── store.ts                # Zustand store (state + persist + tick)
```

### The 3D engine

`components/world/Bakery3D.tsx` is a self-contained raycasting engine:
- Grid-based DDA ray stepping per column (classic Wolf/Doom technique)
- Wall slice texture mapping with per-face shading and distance fog
- Billboard sprites (totems + customers) with per-column z-buffer
- Vignette overlay for warmth
- Pre-baked procedural textures in `textures.ts` (no image assets)
- 60 Hz `requestAnimationFrame` loop; internal render width capped at 520px and upscaled, so mobile stays smooth
- Keyboard (WASD / arrows) + dual touch joysticks + context-sensitive interact button

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
