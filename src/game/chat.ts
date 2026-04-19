/**
 * Tiny offline "chat" engine for customer conversations. There's no LLM
 * involved — we just scan the player's message for keywords and pick a
 * friendly procedural reply from a pool. It feels responsive without
 * needing an API key or a network call.
 */
import type { Customer, Recipe } from "./types";

type OrderEntry = {
  id: string;
  count: number;
  name: string;
  category: Recipe["category"];
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

export function customerReply(
  rawText: string,
  customer: Customer,
  orderEntries: OrderEntry[],
): string {
  const text = rawText.toLowerCase().trim();
  if (!text) return "...hmm?";

  const name = customer.name;
  const firstItem = orderEntries[0]?.name ?? "treat";
  const orderPhrase =
    orderEntries.length === 0
      ? "my order"
      : orderEntries.length === 1
        ? orderEntries[0].name
        : `my ${orderEntries.map((o) => o.name).join(" and ")}`;
  const hasPet = customer.hasPet;

  // --- Recipe-specific shout-outs: if they mention an item we sell, react.
  for (const entry of orderEntries) {
    if (text.includes(entry.name.toLowerCase())) {
      return pick([
        `Yes! The ${entry.name} is exactly what I came for.`,
        `Oh you remembered! The ${entry.name}, please!`,
        `A ${entry.name} would make my whole day.`,
      ]);
    }
  }

  // --- Simple greetings
  if (includesAny(text, ["hi", "hello", "hey", "hiya", "yo", "good morning", "howdy"])) {
    return pick([
      `Hi! I'm ${name}. Smells amazing in here!`,
      `Hello! Ohhh I've been looking forward to this.`,
      `Hey! Your bakery always makes me smile.`,
    ]);
  }

  // --- "How are you" style
  if (includesAny(text, ["how are you", "how's it going", "how r u", "how are u", "you doing", "u doing"])) {
    return pick([
      `Great now that I'm here! Hungry though.`,
      `Wonderful — everything smells like butter and sugar.`,
      `Tired but happy! A ${firstItem} will fix that.`,
    ]);
  }

  // --- Compliments
  if (
    includesAny(text, [
      "cute",
      "nice",
      "beautiful",
      "pretty",
      "lovely",
      "awesome",
      "cool",
      "amazing",
      "love",
      "great",
    ])
  ) {
    return pick([
      `Oh stop it — you're too kind!`,
      `Aww thank you! You're the real star.`,
      `You just made my day!`,
      `Can I live here? It's so lovely.`,
    ]);
  }

  // --- Weather / day
  if (includesAny(text, ["weather", "sunny", "rain", "cold", "hot", "day", "today", "morning", "afternoon", "evening"])) {
    return pick([
      `Perfect bakery weather, isn't it?`,
      `Any day with a ${firstItem} is a good day.`,
      `Honestly? I'm just happy I came in here.`,
    ]);
  }

  // --- Joke
  if (includesAny(text, ["joke", "funny", "haha", "lol", "silly"])) {
    return pick([
      `Haha! Okay — why did the baker go to therapy? Too much kneading.`,
      `Hah! You should have a comedy hour on Fridays.`,
      `You're too funny. I'm telling everyone.`,
    ]);
  }

  // --- Pet chatter
  if (includesAny(text, ["dog", "puppy", "doggy", "cat", "kitty", "pet", "pup"])) {
    if (hasPet === "dog") {
      return pick([
        `This is Biscuit — she's been SO patient for her treat.`,
        `He says hi back, in his own tail-wagging way.`,
        `Careful, one scratch and she's your best friend forever.`,
      ]);
    }
    if (hasPet === "cat") {
      return pick([
        `Mittens is judging you. In a loving way.`,
        `She only pretends to be aloof, I promise.`,
        `If you have a fishy treat, you're her favorite person.`,
      ]);
    }
    return pick([
      `Awww I love the pets around here. So cute.`,
      `One day I'll bring my cat. She'd love it here.`,
      `Cutest customers you've got, honestly.`,
    ]);
  }

  // --- Question about recommendations / what should I get
  if (
    includesAny(text, [
      "recommend",
      "what should",
      "what do you",
      "favorite",
      "best",
      "popular",
      "what's good",
      "whats good",
    ])
  ) {
    return pick([
      `You tell me! You're the baker — surprise me with a ${firstItem}.`,
      `I'd say anything fresh from the oven — but really I came for the ${firstItem}.`,
      `Honestly? The ${firstItem} has been on my mind since yesterday.`,
    ]);
  }

  // --- Thanks / goodbye
  if (
    includesAny(text, [
      "thank",
      "thx",
      "ty",
      "bye",
      "later",
      "see ya",
      "see you",
      "take care",
    ])
  ) {
    return pick([
      `You're the sweetest — see you soon!`,
      `Thank YOU! I'll bring a friend next time.`,
      `Bye! Save me a corner by the window.`,
    ]);
  }

  // --- Money / price
  if (includesAny(text, ["price", "cost", "how much", "pay", "money", "expensive", "cheap"])) {
    return pick([
      `Worth every coin — trust me.`,
      `Don't worry, I brought my tip jar on legs.`,
      `I'd pay double for this place.`,
    ]);
  }

  // --- Apology
  if (includesAny(text, ["sorry", "oops", "my bad", "wait"])) {
    return pick([
      `No worries! I've got all the time in the world.`,
      `It's fine! Take your time.`,
      `No rush — good bakes take a minute.`,
    ]);
  }

  // --- Yes/no/maybe
  if (/^(yes|yep|yeah|ok|okay|sure|cool|yay)\b/.test(text)) {
    return pick([
      `Yay!`,
      `You got it.`,
      `Perfect — thank you!`,
    ]);
  }
  if (/^(no|nope|nah)\b/.test(text)) {
    return pick([
      `Oh okay, no biggie!`,
      `That's alright — next time!`,
    ]);
  }

  // --- Questions (ends with ?)
  if (text.endsWith("?")) {
    return pick([
      `Hmm, good question. Could I get my ${firstItem} first and think?`,
      `I don't know — does a ${firstItem} answer it?`,
      `Let me chew on it… literally, with a ${firstItem}.`,
    ]);
  }

  // --- Fallback: friendly, references their order
  const flavor = [
    `I'm really just here for ${orderPhrase}, honestly.`,
    `Mmmm, can't wait for my ${firstItem}.`,
    `Hehe, anyway — one ${firstItem}, please!`,
    `I could stay here all day. It's so cozy.`,
    `You've got magic hands, you know.`,
  ];
  return pick(flavor);
}
