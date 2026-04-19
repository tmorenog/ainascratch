"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DIALOG_OPTIONS, DIALOG_RESPONSES } from "@/game/world3d";
import { RECIPES } from "@/game/recipes";
import { customerReply } from "@/game/chat";
import { useT } from "@/game/i18n";
import { useGame } from "@/game/store";
import type { Customer, Recipe } from "@/game/types";

const CATEGORY_EMOJI: Record<Recipe["category"], string> = {
  drink: "🥤",
  pastry: "🧁",
  scratch: "🥧",
  pet: "🦴",
};

function recipeById(id: string, custom: Recipe[]): Recipe | undefined {
  return RECIPES.find((r) => r.id === id) ?? custom.find((r) => r.id === id);
}

function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * Dialog choice overlay shown when the player greets a customer. Picking
 * a line triggers a cute response from the customer, then closes.
 */
export function DialogPanel({
  customer,
  onClose,
  onServe,
  onCatch,
  canServe,
}: {
  customer: Customer | null;
  onClose: () => void;
  onServe: (
    upcharge: number,
  ) => "success" | "success-gift" | "wrong" | "missing" | "refused";
  onCatch: () => "caught" | "escaped" | "missing";
  canServe: boolean;
}) {
  const t = useT();
  const customRecipes = useGame((s) => s.customRecipes);
  type ChatMessage = { from: "you" | "them"; text: string };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [outcome, setOutcome] = useState<
    | null
    | { kind: "accepted" | "refused" | "gift"; extra: number; petKind?: "dog" | "cat" }
    | { kind: "caught" | "escaped"; extra: number }
  >(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  if (!customer) return null;

  const pick = (id: (typeof DIALOG_OPTIONS)[number]["id"]) => {
    const lines = DIALOG_RESPONSES[id];
    const line = lines[Math.floor(Math.random() * lines.length)];
    const prompt = DIALOG_OPTIONS.find((o) => o.id === id)?.label ?? "";
    setMessages((m) => [
      ...m,
      { from: "you", text: prompt },
      { from: "them", text: line },
    ]);
  };

  function sendDraft() {
    const text = draft.trim();
    if (!text) return;
    const reply = customerReply(text, customer!, orderEntries);
    setMessages((m) => [
      ...m,
      { from: "you", text },
      { from: "them", text: reply },
    ]);
    setDraft("");
  }

  // Group the customer's order by recipe id so "2x Lemonade" reads nicely.
  const orderCounts = new Map<string, number>();
  for (const id of customer.order) {
    orderCounts.set(id, (orderCounts.get(id) ?? 0) + 1);
  }
  const orderEntries = Array.from(orderCounts.entries()).map(([id, count]) => {
    const r = recipeById(id, customRecipes);
    return {
      id,
      count,
      name: r?.name ?? id,
      category: r?.category ?? "pastry",
    };
  });
  const orderPhrase = joinWithAnd(
    orderEntries.map((o) => (o.count > 1 ? `${o.count} ${o.name}s` : `a ${o.name}`)),
  );

  // Fair price for this order — used to calculate "haggle" options.
  const basePrice = customer.order.reduce(
    (sum, id) => sum + (recipeById(id, customRecipes)?.price ?? 0),
    0,
  );
  const smallBump = Math.max(1, Math.round(basePrice * 0.25));
  const mediumBump = Math.max(2, Math.round(basePrice * 0.6));
  const daringBump = Math.max(4, basePrice);
  const serveOptions: { extra: number; label: string; chance: string; tone: string }[] = [
    { extra: 0, label: t("serveFor", { price: basePrice }), chance: "100%", tone: "mint" },
    {
      extra: smallBump,
      label: t("tryExtra", { extra: smallBump }),
      chance: "~80%",
      tone: "sun",
    },
    {
      extra: mediumBump,
      label: t("tryExtra", { extra: mediumBump }),
      chance: "~50%",
      tone: "berry",
    },
    {
      extra: daringBump,
      label: t("dareExtra", { extra: daringBump }),
      chance: "~15%",
      tone: "cocoa",
    },
  ];

  function handleServe(extra: number) {
    const result = onServe(extra);
    if (result === "refused") {
      setOutcome({ kind: "refused", extra });
      // Fade the broken heart away first, then dismiss the panel.
      setTimeout(() => setOutcome(null), 1100);
      setTimeout(onClose, 1600);
    } else if (result === "success-gift") {
      setOutcome({
        kind: "gift",
        extra,
        petKind: customer?.hasPet ?? "dog",
      });
      // Give this one a little longer — it's a special moment.
      setTimeout(() => setOutcome(null), 2100);
      setTimeout(onClose, 2400);
    } else if (result === "success" || result === "wrong") {
      setOutcome({ kind: "accepted", extra });
      setTimeout(() => setOutcome(null), 800);
      setTimeout(onClose, 1100);
    }
  }

  function handleCatch() {
    const result = onCatch();
    if (result === "caught" || result === "escaped") {
      setOutcome({ kind: result, extra: 0 });
      setTimeout(() => setOutcome(null), 1000);
      setTimeout(onClose, 1400);
    }
  }

  const stolenRecipe = customer.stolenRecipeId
    ? recipeById(customer.stolenRecipeId, customRecipes)
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-cocoa-900/30"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-cream-50 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-5 shadow-bakery relative"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{customer.emoji}</div>
            <div>
              <div className="font-bold text-cocoa-800">
                {customer.isRobber ? "🚨 Robber!" : customer.name}
              </div>
              <div className="text-xs text-cocoa-500 italic">
                &ldquo;{customer.greeting}&rdquo;
              </div>
            </div>
          </div>

          {customer.isRobber ? (
            <div className="rounded-2xl bg-berry-100 border-2 border-berry-500 p-4 mb-3 text-center">
              <div className="text-4xl mb-1">🏃‍♂️💨</div>
              <div className="font-black text-berry-700 mb-1">
                {t("robberSwiped", {
                  item: stolenRecipe ? stolenRecipe.name : "a treat",
                })}
              </div>
              <div className="text-xs text-cocoa-600 mb-3">{t("robberQuick")}</div>
              <button
                onClick={handleCatch}
                disabled={!!outcome}
                className="w-full py-3 rounded-xl bg-berry-500 text-white font-black shadow-bakery disabled:opacity-50"
              >
                {t("grabThemBtn")} <span className="text-xs opacity-80">(70%)</span>
              </button>
              <button
                onClick={onClose}
                disabled={!!outcome}
                className="w-full mt-2 py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
              >
                {t("letThemGo")}
              </button>
              {/* Outcome overlay handled at the bottom of the panel */}
            </div>
          ) : (
          <>
          {/* Specific order — clearly list what the customer wants. */}
          <div className="rounded-2xl bg-berry-100/60 border border-berry-200 p-3 mb-3">
            <div className="text-xs font-bold text-berry-700 uppercase tracking-wide mb-1">
              {t("theirOrder")}
            </div>
            <div className="text-sm text-cocoa-800 mb-2">
              &ldquo;Could I please get {orderPhrase}?&rdquo;
            </div>
            <ul className="flex flex-wrap gap-2">
              {orderEntries.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-1 bg-white rounded-full px-2.5 py-1 text-xs text-cocoa-700 border border-cocoa-200"
                >
                  <span>{CATEGORY_EMOJI[o.category as Recipe["category"]]}</span>
                  <span className="font-bold">
                    {o.count > 1 ? `${o.count}× ` : ""}
                    {o.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat transcript */}
          <div
            ref={scrollRef}
            className="rounded-2xl bg-cream-100/70 border border-cocoa-200 p-3 mb-3 max-h-52 overflow-y-auto flex flex-col gap-2"
          >
            {messages.length === 0 ? (
              <div className="text-xs text-cocoa-500 italic text-center py-2">
                {t("sayHi", { name: customer.name })}
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.from === "you"
                        ? "bg-berry-500 text-white"
                        : "bg-white text-cocoa-800 border border-cocoa-200"
                    }`}
                  >
                    {m.from === "them" && (
                      <span className="font-bold mr-1">{customer.name}:</span>
                    )}
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-2 mb-3">
            {DIALOG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => pick(opt.id)}
                className="px-2.5 py-1.5 rounded-full bg-white hover:bg-cream-100 border border-cocoa-200 text-xs text-cocoa-800"
              >
                <span className="mr-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Free-text input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendDraft();
            }}
            className="flex gap-2 mb-3"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Type to ${customer.name}…`}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-cocoa-200 text-sm text-cocoa-800 focus:outline-none focus:border-berry-400"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                draft.trim()
                  ? "bg-berry-500 text-white"
                  : "bg-cream-100 text-cocoa-400"
              }`}
            >
              Send
            </button>
          </form>

          {/* Serve + haggle options. Asking for extra is risky — the
              customer might refuse the price and walk out! */}
          {canServe ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-cocoa-500">
                {t("chargeThem")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {serveOptions.map((opt) => {
                  const toneClass =
                    opt.tone === "mint"
                      ? "bg-mint-500 text-white"
                      : opt.tone === "sun"
                        ? "bg-sun-400 text-cocoa-800"
                        : opt.tone === "berry"
                          ? "bg-berry-500 text-white"
                          : "bg-cocoa-700 text-cream-50";
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleServe(opt.extra)}
                      disabled={!!outcome}
                      className={`rounded-xl py-2 px-3 text-sm font-bold shadow-bakery ${toneClass} disabled:opacity-50`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[10px] opacity-80 font-normal">
                        accept {opt.chance}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={onClose}
                disabled={!!outcome}
                className="w-full py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
              >
                {t("close")}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
              >
                {t("close")}
              </button>
              <button
                disabled
                className="flex-1 py-2 rounded-xl font-bold bg-cream-100 text-cocoa-400"
              >
                {t("keepPrepping")}
              </button>
            </div>
          )}
          </>
          )}

          {/* Outcome flash overlay (shared by serve + catch flows) */}
          <AnimatePresence>
            {outcome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  className={`rounded-2xl px-6 py-4 text-center shadow-bakery ${
                    outcome.kind === "accepted" ||
                    outcome.kind === "caught" ||
                    outcome.kind === "gift"
                      ? "bg-mint-500 text-white"
                      : "bg-berry-600 text-white"
                  }`}
                >
                  <div className="text-3xl mb-1">
                    {outcome.kind === "accepted"
                      ? "🪙"
                      : outcome.kind === "caught"
                        ? "🦸"
                        : outcome.kind === "escaped"
                          ? "🏃‍♂️💨"
                          : outcome.kind === "gift"
                            ? outcome.petKind === "cat"
                              ? "🐱💝"
                              : "🐶💝"
                            : "💔"}
                  </div>
                  <div className="font-black text-lg">
                    {outcome.kind === "accepted"
                      ? outcome.extra > 0
                        ? t("paidExtra", { extra: outcome.extra })
                        : t("paid")
                      : outcome.kind === "caught"
                        ? t("gotEm")
                        : outcome.kind === "escaped"
                          ? t("theyGotAway")
                          : outcome.kind === "gift"
                            ? t("leftPet", { pet: outcome.petKind ?? "pet" })
                            : t("tooExpensive")}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
