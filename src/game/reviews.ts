/**
 * Cute, child-friendly review templates indexed by star rating.
 * Pick one randomly when a customer leaves.
 */
export const REVIEW_TEMPLATES: Record<number, string[]> = {
  5: [
    "Best bakery in the whole world!! ✨",
    "I'm telling ALL my friends. So yummy!",
    "I think I felt a sparkle in my mouth!",
    "Perfect, perfect, perfect. 💛",
    "My pup did a happy dance! 🐶",
    "Even better than grandma's! (Don't tell her.)",
  ],
  4: [
    "Really tasty! I'll be back tomorrow.",
    "So warm and cozy in here. Yum!",
    "Almost perfect — I licked the plate.",
    "Friendly service and a delicious treat!",
  ],
  3: [
    "Pretty good! A little slow but tasty.",
    "Nice treat, but I waited a bit.",
    "I had to wait, but it hit the spot.",
  ],
  2: [
    "Hmm, took ages. The treat was okay.",
    "I almost left, but I'm glad I stayed.",
    "A little too slow for me today.",
  ],
  1: [
    "Oh no… that wasn't what I ordered. 😢",
    "I had to leave hungry. Sad face.",
    "Maybe next time! It got too busy.",
  ],
};

export function pickReview(stars: number): string {
  const pool = REVIEW_TEMPLATES[Math.max(1, Math.min(5, Math.round(stars)))];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const FUNNY_NAMES = [
  "Bunkin Bonuts",
  "The Doughy Wonder",
  "Aina's Sweet Spot",
  "The Whisk Taker",
  "Loaf at First Sight",
  "Crumb Together",
  "Pie in the Sky",
  "Sugar & Spice & Everything Nice",
  "Knead a Hug",
  "Roll With It Bakery",
  "Flour Power",
  "Donut Worry Bakery",
  "Bread Pitt's",
  "Holey Donuts",
  "Loafs & Kisses",
  "Muffin But Trouble",
  "The Cozy Crumb",
  "Whisk-y Business",
  "Just Loafing Around",
  "Baking Bad",
];

export function pickFunnyName(): string {
  return FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
}
