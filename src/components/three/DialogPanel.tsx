"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DIALOG_OPTIONS, DIALOG_RESPONSES } from "@/game/world3d";
import { RECIPES } from "@/game/recipes";
import { customerReply } from "@/game/chat";
import type { Customer, Recipe } from "@/game/types";

const CATEGORY_EMOJI: Record<Recipe["category"], string> = {
  drink: "🥤",
  pastry: "🧁",
  scratch: "🥧",
  pet: "🦴",
};

function recipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
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
  canServe,
}: {
  customer: Customer | null;
  onClose: () => void;
  onServe: () => void;
  canServe: boolean;
}) {
  type ChatMessage = { from: "you" | "them"; text: string };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
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
    const r = recipeById(id);
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
          className="bg-cream-50 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-5 shadow-bakery"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{customer.emoji}</div>
            <div>
              <div className="font-bold text-cocoa-800">{customer.name}</div>
              <div className="text-xs text-cocoa-500 italic">
                &ldquo;{customer.greeting}&rdquo;
              </div>
            </div>
          </div>

          {/* Specific order — clearly list what the customer wants. */}
          <div className="rounded-2xl bg-berry-100/60 border border-berry-200 p-3 mb-3">
            <div className="text-xs font-bold text-berry-700 uppercase tracking-wide mb-1">
              Their order
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
                Say hi to {customer.name}!
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

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
            >
              Close
            </button>
            <button
              onClick={onServe}
              disabled={!canServe}
              className={`flex-1 py-2 rounded-xl font-bold ${
                canServe
                  ? "bg-berry-500 text-white"
                  : "bg-cream-100 text-cocoa-400"
              }`}
            >
              {canServe ? "Serve order" : "Keep prepping"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
