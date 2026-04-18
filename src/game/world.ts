/**
 * Bakery world: map grid + sprite hotspots.
 *
 * Grid cells:
 *   0 = empty floor
 *   1 = wood plank wall
 *   2 = cream wallpaper wall (with hearts)
 *   3 = brick wall
 *   4 = window (still blocks movement)
 *
 * Cells are 1x1 world units. Player moves continuously through cell centers.
 */

import type { StationId } from "@/game/types";

export const WORLD_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 4, 4, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const MAP_W = WORLD_MAP[0].length;
export const MAP_H = WORLD_MAP.length;

export function isWallAt(x: number, y: number): boolean {
  const mx = Math.floor(x);
  const my = Math.floor(y);
  if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) return true;
  return WORLD_MAP[my][mx] !== 0;
}

export function wallAt(x: number, y: number): number {
  const mx = Math.floor(x);
  const my = Math.floor(y);
  if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) return 1;
  return WORLD_MAP[my][mx];
}

export type HotspotKind = "station" | "pantry" | "supermarket" | "counter" | "bulletin";

export interface Hotspot {
  id: string;
  kind: HotspotKind;
  x: number; // world coords (can be fractional)
  y: number;
  stationId?: StationId;
  label: string;
  emoji: string;
  color: string;
  prompt: string;
}

/**
 * Station totems + special interaction spots. Positions are chosen inside
 * WORLD_MAP. The player walks within INTERACT_RADIUS and presses E to trigger.
 */
export const HOTSPOTS: Hotspot[] = [
  {
    id: "st-drink",
    kind: "station",
    stationId: "drink",
    x: 3.5,
    y: 3.5,
    label: "Drink Bar",
    emoji: "🥤",
    color: "#ea5d7c",
    prompt: "Pour a drink",
  },
  {
    id: "st-pastry",
    kind: "station",
    stationId: "pastry",
    x: 6.5,
    y: 3.5,
    label: "Pastry Counter",
    emoji: "🧁",
    color: "#dab577",
    prompt: "Decorate a pastry",
  },
  {
    id: "st-scratch",
    kind: "station",
    stationId: "scratch",
    x: 9.5,
    y: 3.5,
    label: "Scratch Oven",
    emoji: "🥣",
    color: "#c98933",
    prompt: "Bake from scratch",
  },
  {
    id: "st-pet",
    kind: "station",
    stationId: "pet",
    x: 12.5,
    y: 3.5,
    label: "Pet Nook",
    emoji: "🐾",
    color: "#86d8a6",
    prompt: "Make pet treats",
  },
  {
    id: "pantry",
    kind: "pantry",
    x: 2.5,
    y: 8.5,
    label: "Pantry Shelf",
    emoji: "🧺",
    color: "#c1955a",
    prompt: "Restock ingredients",
  },
  {
    id: "supermarket",
    kind: "supermarket",
    x: 13.5,
    y: 8.5,
    label: "Supermarket Kiosk",
    emoji: "🛒",
    color: "#4ec47e",
    prompt: "Order supplies",
  },
  {
    id: "counter",
    kind: "counter",
    x: 7.5,
    y: 9.2,
    label: "Service Counter",
    emoji: "🔔",
    color: "#f5b93b",
    prompt: "Ring the bell / serve",
  },
  {
    id: "bulletin",
    kind: "bulletin",
    x: 13.5,
    y: 2.5,
    label: "Recipe Board",
    emoji: "📖",
    color: "#7c5236",
    prompt: "Open the recipe book",
  },
];

export const INTERACT_RADIUS = 1.4;

// Where customer sprites line up just behind the counter, visible when player approaches.
export const CUSTOMER_SLOTS: Array<{ x: number; y: number }> = [
  { x: 7.5, y: 9.6 },
  { x: 6.1, y: 9.55 },
  { x: 8.9, y: 9.55 },
  { x: 4.7, y: 9.5 },
  { x: 10.3, y: 9.5 },
];

export const PLAYER_START = { x: 7.5, y: 6.5, angle: Math.PI / 2 };
