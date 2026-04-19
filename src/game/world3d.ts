/**
 * World constants for the 3D bakery. All dimensions are in metres.
 *
 * Layout (seen from above, +X right, +Z forward/into the bakery):
 *
 *     ~~~~~~~~~~~~~~~~~~~~~~~~  back wall
 *     |  🚪 door   |  shelves  |
 *     |                        |
 *     |                        |
 *     |   ┌──  L-counter  ──┐  |
 *     |   │   drink pastry │  |
 *     |   │   scratch pet  │  |
 *     |   └─┐  service     │  |
 *     |     │              │  |
 *     |     └──────────────┘  |
 *     |                        |
 *     ~~~~~~~~~~~~~~~~~~~~~~~~  front wall (entry)
 */

export const ROOM = {
  width: 14, // X
  depth: 13, // Z
  height: 3.6,
};

export const DOOR_POS = { x: -3.0, z: -ROOM.depth / 2 + 0.02 }; // back wall -Z
export const DOOR_SIZE = { w: 1.6, h: 2.4 };

export const PLAYER = {
  eyeHeight: 1.55,
  radius: 0.32,
  walkSpeed: 2.6,
  runSpeed: 4.0,
  reachDistance: 2.2,
};

export const FOV_DEG = 70;

export interface Hotspot {
  id: string;
  kind: "station" | "pantry" | "supermarket" | "counter-customer" | "door";
  position: [number, number, number];
  facing: number; // yaw in radians the player should face to interact
  label: string;
  prompt: string;
  stationId?: "drink" | "pastry" | "scratch" | "pet";
}

/**
 * Hotspot positions are anchored to counter surfaces. The interact radius
 * is generous so a kid can stand "near enough" rather than pixel-perfect.
 */
export const HOTSPOTS: Hotspot[] = [
  {
    id: "drink",
    kind: "station",
    stationId: "drink",
    position: [2.5, 0, -3.2],
    facing: 0,
    label: "Drink Bar",
    prompt: "Make a drink",
  },
  {
    id: "pastry",
    kind: "station",
    stationId: "pastry",
    position: [0.0, 0, -3.2],
    facing: 0,
    label: "Pastry Counter",
    prompt: "Decorate a pastry",
  },
  {
    id: "scratch",
    kind: "station",
    stationId: "scratch",
    position: [-2.5, 0, -3.2],
    facing: 0,
    label: "Bakery Oven",
    prompt: "Bake something fresh",
  },
  {
    id: "pet",
    kind: "station",
    stationId: "pet",
    position: [-4.0, 0, -1.4],
    facing: Math.PI / 2, // face +X (the counter runs along -X wall)
    label: "Pet Nook",
    prompt: "Make pet treats",
  },
  {
    id: "pantry",
    kind: "pantry",
    position: [4.0, 0, -3.8],
    facing: 0,
    label: "Pantry Shelf",
    prompt: "Check the pantry",
  },
  {
    id: "door",
    kind: "door",
    position: [DOOR_POS.x, 0, DOOR_POS.z + 0.4],
    facing: Math.PI, // turn around to go through
    label: "Back Door",
    prompt: "Step out back",
  },
  {
    // Standing in front of the cashier's register inside the supermarket.
    // The cashier counter is at (DOOR_POS.x + 1.6, -ROOM.depth/2 - 31.4); we
    // put the hotspot just in front of it so the player has to physically
    // walk up to the counter to pay.
    id: "supermarket",
    kind: "supermarket",
    position: [DOOR_POS.x + 1.6, 0, -ROOM.depth / 2 - 30.7],
    facing: Math.PI,
    label: "Supermarket",
    prompt: "Pay the cashier",
  },
  {
    id: "counter-customer",
    kind: "counter-customer",
    position: [0, 0, 1.6],
    facing: Math.PI,
    label: "Service Counter",
    prompt: "Greet the customer",
  },
];

export type FurnitureId =
  | "round_table"
  | "cafe_chair"
  | "planter"
  | "bunting"
  | "pendant_light"
  | "rug";

export interface FurnitureCatalogEntry {
  id: FurnitureId;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export const FURNITURE_CATALOG: FurnitureCatalogEntry[] = [
  {
    id: "round_table",
    name: "Cafe Table",
    description: "A cozy little wooden table for customers to sit at.",
    price: 12,
    icon: "🪑",
  },
  {
    id: "cafe_chair",
    name: "Cafe Chair",
    description: "Pairs nicely with a table and a warm drink.",
    price: 6,
    icon: "🪑",
  },
  {
    id: "planter",
    name: "Flower Planter",
    description: "Bright flowers that always make customers smile.",
    price: 8,
    icon: "🌼",
  },
  {
    id: "rug",
    name: "Soft Rug",
    description: "A warm woven rug in cream and berry tones.",
    price: 10,
    icon: "🧵",
  },
  {
    id: "bunting",
    name: "Paper Bunting",
    description: "Hangs overhead and makes every day feel like a party.",
    price: 5,
    icon: "🎉",
  },
  {
    id: "pendant_light",
    name: "Pendant Light",
    description: "A cozy glowing bulb hung from the ceiling.",
    price: 14,
    icon: "💡",
  },
];

/**
 * Dialog options shown when the player greets a customer. Picking one
 * triggers a response line from the customer (based on the mood shift) and
 * then the player can serve them.
 */
export interface DialogOption {
  id: "warm" | "quick" | "upsell" | "joke";
  label: string;
  emoji: string;
}

export const DIALOG_OPTIONS: DialogOption[] = [
  { id: "warm", label: "Hi! So nice to see you today!", emoji: "💛" },
  { id: "quick", label: "Coming right up!", emoji: "⚡" },
  { id: "upsell", label: "Would you like a drink with that?", emoji: "🥤" },
  { id: "joke", label: "Why did the cookie cry? It was feeling crumby.", emoji: "😜" },
];

export const DIALOG_RESPONSES: Record<DialogOption["id"], string[]> = {
  warm: [
    "Aww, thanks! You always make my day.",
    "You're the best — I walk here for the smiles!",
    "Your bakery feels like a hug.",
  ],
  quick: [
    "Yes please, hurry hurry!",
    "Great — I'm starving!",
    "Bless you, I'm running late.",
  ],
  upsell: [
    "Oh! Yes, that sounds perfect.",
    "Hmm, just the treat today, thanks!",
    "Sure, why not — I'm celebrating!",
  ],
  joke: [
    "Hahaha, that's terrible. I love it.",
    "Okay okay, I'll be here all week.",
    "You're too funny. I'm telling everyone.",
  ],
};
