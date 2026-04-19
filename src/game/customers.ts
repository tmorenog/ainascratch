import type { CustomerArchetype, CustomerLookData } from "./types";

/**
 * Customer archetypes. Names are intentionally simple and modern, the kind
 * of names a kid hears at school. Each archetype has a head shape, hair,
 * skin tone, and shirt color used by the SVG sprite renderer.
 */
export interface CustomerArchetypeFull extends CustomerArchetype {
  look: CustomerLookData;
}

export const CUSTOMER_ARCHETYPES: CustomerArchetypeFull[] = [
  {
    id: "miles",
    name: "Miles",
    emoji: "🧒",
    color: "#ffd6a5",
    flavorLines: [
      "I biked all the way here for this!",
      "I'll have something sweet please!",
      "Make it extra yummy!",
    ],
    look: { hair: "short", hairColor: "#3a2418", skin: "#f6c89c", shirt: "#3aa1d0" },
  },
  {
    id: "lilly",
    name: "Lilly",
    emoji: "👧",
    color: "#fbb6ce",
    flavorLines: [
      "Today's a special day!",
      "I want something pink!",
      "Extra sprinkles, pretty please?",
    ],
    look: { hair: "long", hairColor: "#7a4520", skin: "#fbd6b2", shirt: "#e87aa0", cheek: "#f5b7c8" },
  },
  {
    id: "bobby",
    name: "Bobby",
    emoji: "👦",
    color: "#bee3f8",
    flavorLines: [
      "I'm in a teeny tiny rush!",
      "Just grabbing breakfast!",
      "Quick quick please!",
    ],
    look: { hair: "buzz", hairColor: "#2b1c12", skin: "#e8b988", shirt: "#7c5236" },
  },
  {
    id: "sam",
    name: "Sam",
    emoji: "🧑",
    color: "#cbd5e0",
    flavorLines: [
      "Need... coffee... please.",
      "Mmm, whatever's warm.",
      "Coffee emergency!",
    ],
    look: { hair: "short", hairColor: "#1f1a14", skin: "#d49671", shirt: "#5b6770" },
  },
  {
    id: "ava",
    name: "Ava",
    emoji: "👩",
    color: "#fde68a",
    flavorLines: [
      "My pup wants a treat too!",
      "She'll do a trick for a bone!",
      "Don't forget her, please!",
    ],
    hasPet: "dog",
    look: { hair: "ponytail", hairColor: "#caa05a", skin: "#fbd6b2", shirt: "#f5b93b" },
  },
  {
    id: "noah",
    name: "Noah",
    emoji: "🧑‍🦰",
    color: "#c4b5fd",
    flavorLines: [
      "Mittens insists on a fish cookie.",
      "Cat first, then me!",
      "We're regulars, you know.",
    ],
    hasPet: "cat",
    look: { hair: "curly", hairColor: "#c2531e", skin: "#f3c8a4", shirt: "#a78bfa" },
  },
  {
    id: "mia",
    name: "Mia",
    emoji: "🧑‍🎤",
    color: "#fbcfe8",
    flavorLines: [
      "Extra icing, always extra icing!",
      "If it sparkles, I'll buy it!",
      "Make it pretty, please!",
    ],
    look: { hair: "puff", hairColor: "#2c1a14", skin: "#a87146", shirt: "#ec4899", cheek: "#f5b7c8" },
  },
  {
    id: "liam",
    name: "Liam",
    emoji: "🧑‍🌾",
    color: "#bbf7d0",
    flavorLines: [
      "Got a long hike ahead!",
      "Something hearty, please!",
      "Need fuel for the trail!",
    ],
    look: { hair: "short", hairColor: "#3a2418", skin: "#e8b988", shirt: "#4ec47e" },
  },
  {
    id: "sophie",
    name: "Sophie",
    emoji: "🧑‍🦱",
    color: "#fef08a",
    flavorLines: [
      "A spot of tea would be lovely.",
      "Something gentle, please!",
      "Can I have it warm?",
    ],
    look: { hair: "curly", hairColor: "#5a3922", skin: "#fbd6b2", shirt: "#fde047" },
  },
  {
    id: "lucas",
    name: "Lucas",
    emoji: "🧒🏽",
    color: "#fda4af",
    flavorLines: [
      "I'll have my usual!",
      "One of everything!",
      "Surprise me?",
    ],
    look: { hair: "short", hairColor: "#1f1a14", skin: "#a87146", shirt: "#fb7185" },
  },
  {
    id: "emma",
    name: "Emma",
    emoji: "👧🏼",
    color: "#a7f3d0",
    flavorLines: [
      "Dad said I could pick anything!",
      "I'm celebrating today!",
      "What's the prettiest one?",
    ],
    look: { hair: "bun", hairColor: "#caa05a", skin: "#f6c89c", shirt: "#34d399", cheek: "#f5b7c8" },
  },
];
