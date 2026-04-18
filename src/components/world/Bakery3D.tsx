"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/store";
import {
  CUSTOMER_SLOTS,
  HOTSPOTS,
  INTERACT_RADIUS,
  MAP_H,
  MAP_W,
  PLAYER_START,
  WORLD_MAP,
  isWallAt,
  wallAt,
  type Hotspot,
} from "@/game/world";
import {
  makeCustomerSprite,
  makeFloorCeilingGradients,
  makeTotemSprite,
  makeWallTextures,
  type WallTextureSet,
} from "./textures";
import type { Customer } from "@/game/types";

type InteractHandler = (h: Hotspot) => void;

interface Bakery3DProps {
  onInteract: InteractHandler;
}

const FOV = Math.PI / 3; // 60°
const MOVE_SPEED = 2.6; // units/sec
const STRAFE_SPEED = 2.1;
const ROT_SPEED = 2.4; // rad/sec
const PLAYER_RADIUS = 0.22;

/** Keys we respond to. */
const KEY_MAP: Record<string, string> = {
  w: "forward",
  arrowup: "forward",
  s: "back",
  arrowdown: "back",
  a: "strafeLeft",
  d: "strafeRight",
  arrowleft: "turnLeft",
  arrowright: "turnRight",
  q: "strafeLeft",
  e: "interact",
  " ": "interact",
  enter: "interact",
  shift: "run",
};

interface MoveState {
  forward: number;
  strafe: number; // +1 right, -1 left
  turn: number; // +1 right
  running: boolean;
  wantsInteract: boolean;
}

export function Bakery3D({ onInteract }: Bakery3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState<Hotspot | null>(null);

  // game store reads — we read fresh inside the RAF loop through the zustand getState
  const customers = useGame((s) => s.customers);

  const stateRef = useRef({
    px: PLAYER_START.x,
    py: PLAYER_START.y,
    angle: PLAYER_START.angle,
    lastTs: 0,
    move: {
      forward: 0,
      strafe: 0,
      turn: 0,
      running: false,
      wantsInteract: false,
    } as MoveState,
    // transient touch joystick state
    touchMove: { x: 0, y: 0 },
    touchTurn: { x: 0 },
    textures: null as WallTextureSet | null,
    sprites: new Map<string, HTMLCanvasElement>(),
    floor: null as HTMLCanvasElement | null,
    ceiling: null as HTMLCanvasElement | null,
    // current hotspot being highlighted
    promptId: null as string | null,
  });

  // Initialize textures/sprites on mount
  useEffect(() => {
    const s = stateRef.current;
    s.textures = makeWallTextures();
    // Totem sprites
    for (const h of HOTSPOTS) {
      s.sprites.set(
        h.id,
        makeTotemSprite({ emoji: h.emoji, label: h.label, color: h.color }),
      );
    }
  }, []);

  // Build customer sprites on demand (cached by customer id)
  const customerSpriteRef = useRef(new Map<string, HTMLCanvasElement>());
  useEffect(() => {
    const cache = customerSpriteRef.current;
    const activeIds = new Set(customers.map((c) => c.id));
    for (const key of cache.keys()) {
      if (!activeIds.has(key)) cache.delete(key);
    }
    for (const c of customers) {
      if (!cache.has(c.id)) {
        cache.set(
          c.id,
          makeCustomerSprite({
            emoji: c.emoji,
            color: c.color,
            name: c.name.slice(0, 14),
            hasPet: c.hasPet,
          }),
        );
      }
    }
  }, [customers]);

  // Keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      const action = KEY_MAP[k];
      if (!action) return;
      e.preventDefault();
      const m = stateRef.current.move;
      if (action === "forward") m.forward = 1;
      else if (action === "back") m.forward = -1;
      else if (action === "strafeLeft") m.strafe = -1;
      else if (action === "strafeRight") m.strafe = 1;
      else if (action === "turnLeft") m.turn = -1;
      else if (action === "turnRight") m.turn = 1;
      else if (action === "run") m.running = true;
      else if (action === "interact") m.wantsInteract = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const action = KEY_MAP[k];
      if (!action) return;
      const m = stateRef.current.move;
      if (action === "forward" && m.forward === 1) m.forward = 0;
      else if (action === "back" && m.forward === -1) m.forward = 0;
      else if (action === "strafeLeft" && m.strafe === -1) m.strafe = 0;
      else if (action === "strafeRight" && m.strafe === 1) m.strafe = 0;
      else if (action === "turnLeft" && m.turn === -1) m.turn = 0;
      else if (action === "turnRight" && m.turn === 1) m.turn = 0;
      else if (action === "run") m.running = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    let raf = 0;
    let lastTs = performance.now();

    const resize = () => {
      const parent = canvas.parentElement!;
      const wCSS = parent.clientWidth;
      const hCSS = parent.clientHeight;
      // internal render resolution — keeps raycasting affordable on mobile
      const maxW = 520;
      const scale = Math.min(1, maxW / wCSS);
      canvas.width = Math.floor(wCSS * scale);
      canvas.height = Math.floor(hCSS * scale);
      canvas.style.width = `${wCSS}px`;
      canvas.style.height = `${hCSS}px`;
      // Pre-baked floor/ceiling bands
      const fc = makeFloorCeilingGradients(canvas.width, canvas.height);
      stateRef.current.ceiling = fc.ceiling;
      stateRef.current.floor = fc.floor;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const loop = (ts: number) => {
      const dt = Math.min(0.08, (ts - lastTs) / 1000);
      lastTs = ts;
      update(dt);
      render(ctx, canvas.width, canvas.height);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(dt: number) {
    const s = stateRef.current;
    const m = s.move;
    // fold mobile joysticks into move state
    const jf = -s.touchMove.y;
    const js = s.touchMove.x;
    const jt = s.touchTurn.x;
    const fwd = Math.max(-1, Math.min(1, m.forward + jf));
    const str = Math.max(-1, Math.min(1, m.strafe + js));
    const trn = Math.max(-1, Math.min(1, m.turn + jt));
    const speed = m.running ? MOVE_SPEED * 1.4 : MOVE_SPEED;
    // rotate
    s.angle += trn * ROT_SPEED * dt;
    // move vectors
    const cos = Math.cos(s.angle);
    const sin = Math.sin(s.angle);
    const vx = cos * fwd * speed * dt + Math.cos(s.angle + Math.PI / 2) * str * STRAFE_SPEED * dt;
    const vy = sin * fwd * speed * dt + Math.sin(s.angle + Math.PI / 2) * str * STRAFE_SPEED * dt;
    // X axis collision
    if (!isWallAt(s.px + Math.sign(vx) * PLAYER_RADIUS + vx, s.py)) {
      s.px += vx;
    }
    if (!isWallAt(s.px, s.py + Math.sign(vy) * PLAYER_RADIUS + vy)) {
      s.py += vy;
    }

    // find nearest hotspot for prompt
    let nearest: Hotspot | null = null;
    let bestDist = INTERACT_RADIUS * INTERACT_RADIUS;
    for (const h of HOTSPOTS) {
      const dx = h.x - s.px;
      const dy = h.y - s.py;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        nearest = h;
      }
    }
    if ((nearest?.id ?? null) !== s.promptId) {
      s.promptId = nearest?.id ?? null;
      setPrompt(nearest);
    }

    if (m.wantsInteract) {
      m.wantsInteract = false;
      if (nearest) onInteract(nearest);
    }
  }

  function render(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const s = stateRef.current;
    if (!s.textures || !s.floor || !s.ceiling) return;
    // ceiling + floor
    ctx.drawImage(s.ceiling, 0, 0, w, h / 2);
    ctx.drawImage(s.floor, 0, h / 2, w, h / 2);

    const zbuf = new Float32Array(w);
    const { px, py, angle } = s;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const planeLen = Math.tan(FOV / 2);
    const planeX = -dirY * planeLen;
    const planeY = dirX * planeLen;

    // Cast rays per column
    for (let col = 0; col < w; col++) {
      const cameraX = (2 * col) / w - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;
      let mapX = Math.floor(px);
      let mapY = Math.floor(py);
      const deltaDistX = Math.abs(1 / (rayDirX || 1e-9));
      const deltaDistY = Math.abs(1 / (rayDirY || 1e-9));
      let stepX: number, stepY: number;
      let sideDistX: number, sideDistY: number;
      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (px - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1 - px) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (py - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - py) * deltaDistY;
      }
      let side = 0;
      let hit = 0;
      let safety = 0;
      while (!hit && safety < 64) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        if (mapX < 0 || mapY < 0 || mapX >= MAP_W || mapY >= MAP_H) break;
        if (WORLD_MAP[mapY][mapX] !== 0) hit = WORLD_MAP[mapY][mapX];
        safety++;
      }
      if (!hit) {
        zbuf[col] = Infinity;
        continue;
      }
      const perp = side === 0
        ? (mapX - px + (1 - stepX) / 2) / (rayDirX || 1e-9)
        : (mapY - py + (1 - stepY) / 2) / (rayDirY || 1e-9);
      zbuf[col] = perp;
      const lineH = Math.abs((h / perp) * 1.0);
      const drawStart = Math.max(0, Math.floor(h / 2 - lineH / 2));
      const drawEnd = Math.min(h, Math.floor(h / 2 + lineH / 2));
      // texture
      let wallX = side === 0 ? py + perp * rayDirY : px + perp * rayDirX;
      wallX -= Math.floor(wallX);
      const tex =
        hit === 1
          ? s.textures.plank
          : hit === 2
            ? s.textures.wallpaper
            : hit === 3
              ? s.textures.brick
              : s.textures.window;
      let texX = Math.floor(wallX * tex.width);
      if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
        texX = tex.width - texX - 1;
      }
      // draw texture slice
      ctx.drawImage(
        tex,
        texX,
        0,
        1,
        tex.height,
        col,
        drawStart,
        1,
        drawEnd - drawStart,
      );
      // distance fog (darker on far walls, extra dim on N/S faces)
      const fog = Math.min(0.85, perp / 18 + (side === 1 ? 0.18 : 0));
      if (fog > 0) {
        ctx.fillStyle = `rgba(60, 30, 10, ${fog})`;
        ctx.fillRect(col, drawStart, 1, drawEnd - drawStart);
      }
    }

    // Sprites: totems + customers
    const sprites: Array<{ x: number; y: number; img: HTMLCanvasElement; scale: number }> = [];
    for (const ho of HOTSPOTS) {
      const img = s.sprites.get(ho.id);
      if (img) sprites.push({ x: ho.x, y: ho.y, img, scale: 0.82 });
    }
    // customers
    const liveCustomers = useGame.getState().customers;
    const slots = CUSTOMER_SLOTS;
    liveCustomers.forEach((c, i) => {
      const slot = slots[i] ?? slots[slots.length - 1];
      const img = customerSpriteRef.current.get(c.id);
      if (img) sprites.push({ x: slot.x, y: slot.y, img, scale: 0.95 });
    });

    // compute distances and sort far→near
    const withDist = sprites.map((sp) => {
      const dx = sp.x - px;
      const dy = sp.y - py;
      return { ...sp, d: dx * dx + dy * dy };
    });
    withDist.sort((a, b) => b.d - a.d);
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    for (const sp of withDist) {
      const rx = sp.x - px;
      const ry = sp.y - py;
      const tx = invDet * (dirY * rx - dirX * ry);
      const ty = invDet * (-planeY * rx + planeX * ry);
      if (ty <= 0.05) continue;
      const screenX = Math.floor((w / 2) * (1 + tx / ty));
      const spriteH = Math.abs(h / ty) * sp.scale;
      const spriteW = spriteH * (sp.img.width / sp.img.height);
      // Shift sprite so it rests on the floor
      const vMove = h / 2 + (h / ty) * 0.0; // keep centered
      const drawStartY = Math.floor(vMove - spriteH / 2);
      const drawStartX = Math.floor(screenX - spriteW / 2);
      // column by column z-test
      for (let stripe = 0; stripe < spriteW; stripe++) {
        const col = drawStartX + stripe;
        if (col < 0 || col >= w) continue;
        if (ty >= zbuf[col]) continue;
        const texX = Math.floor((stripe / spriteW) * sp.img.width);
        ctx.drawImage(
          sp.img,
          texX,
          0,
          1,
          sp.img.height,
          col,
          drawStartY,
          1,
          spriteH,
        );
      }
    }

    // Vignette for cozy feel
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(30, 15, 8, 0.45)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Expose ref-based touch joystick controls for mobile
  function handleMoveJoy(dx: number, dy: number) {
    stateRef.current.touchMove = { x: dx, y: dy };
  }
  function handleTurnJoy(dx: number) {
    stateRef.current.touchTurn = { x: dx };
  }
  function triggerInteract() {
    stateRef.current.move.wantsInteract = true;
  }

  return (
    <div className="relative w-full h-full select-none" ref={overlayRef}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-cocoa-600"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Interaction prompt */}
      {prompt && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 bg-cocoa-600/85 text-cream-50 px-4 py-2 rounded-full shadow-bakery font-bold text-sm">
          <span className="mr-1">{prompt.emoji}</span>
          {prompt.prompt}
          <span className="ml-2 opacity-70 text-xs">[E]</span>
        </div>
      )}
      {/* Minimap */}
      <Minimap stateRef={stateRef} />

      {/* Touch controls */}
      <TouchControls
        onMove={handleMoveJoy}
        onTurn={handleTurnJoy}
        onInteract={triggerInteract}
        activePrompt={prompt}
      />
    </div>
  );
}

function Minimap({
  stateRef,
}: {
  stateRef: React.MutableRefObject<{
    px: number;
    py: number;
    angle: number;
    lastTs: number;
    move: MoveState;
    touchMove: { x: number; y: number };
    touchTurn: { x: number };
    textures: WallTextureSet | null;
    sprites: Map<string, HTMLCanvasElement>;
    floor: HTMLCanvasElement | null;
    ceiling: HTMLCanvasElement | null;
    promptId: string | null;
  }>;
}) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const cell = 8;
    cv.width = MAP_W * cell;
    cv.height = MAP_H * cell;
    const loop = () => {
      ctx.fillStyle = "rgba(253, 246, 230, 0.85)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          const v = wallAt(x + 0.1, y + 0.1);
          if (v === 0) continue;
          ctx.fillStyle = v === 4 ? "#aee4ff" : "#7c5236";
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      // hotspots
      for (const h of HOTSPOTS) {
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.arc(h.x * cell, h.y * cell, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // player
      const s = stateRef.current;
      ctx.fillStyle = "#d24268";
      ctx.beginPath();
      ctx.arc(s.px * cell, s.py * cell, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d24268";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.px * cell, s.py * cell);
      ctx.lineTo(
        s.px * cell + Math.cos(s.angle) * 8,
        s.py * cell + Math.sin(s.angle) * 8,
      );
      ctx.stroke();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

  return (
    <div className="absolute top-2 left-2 md:top-3 md:left-3 p-1 rounded-xl bg-cream-50/90 border border-cream-200 shadow-soft">
      <canvas ref={cvRef} className="block rounded-md" />
    </div>
  );
}

/* ------------- Touch joysticks ------------- */

function TouchControls({
  onMove,
  onTurn,
  onInteract,
  activePrompt,
}: {
  onMove: (dx: number, dy: number) => void;
  onTurn: (dx: number) => void;
  onInteract: () => void;
  activePrompt: Hotspot | null;
}) {
  return (
    <>
      <Joystick
        className="absolute bottom-4 left-4"
        size={120}
        onChange={(dx, dy) => onMove(dx, dy)}
      />
      <Joystick
        className="absolute bottom-4 right-4"
        size={120}
        mode="turn"
        onChange={(dx) => onTurn(dx)}
      />
      <button
        className={`absolute bottom-36 right-6 rounded-full w-16 h-16 text-2xl font-black shadow-bakery border-2 transition ${
          activePrompt
            ? "bg-mint-500 text-white border-white animate-wiggle"
            : "bg-cream-100 text-cocoa-400 border-cream-200"
        }`}
        onClick={onInteract}
        aria-label="Interact"
      >
        E
      </button>
    </>
  );
}

function Joystick({
  className,
  size,
  onChange,
  mode = "move",
}: {
  className?: string;
  size: number;
  onChange: (dx: number, dy: number) => void;
  mode?: "move" | "turn";
}) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const active = useRef<{ id: number; cx: number; cy: number } | null>(null);

  useEffect(() => {
    const el = baseRef.current;
    if (!el) return;
    const max = size / 2 - 14;

    const reset = () => {
      if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
      if (mode === "move") onChange(0, 0);
      else onChange(0, 0);
    };

    const start = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      active.current = { id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (!active.current || active.current.id !== e.pointerId) return;
      const dx = e.clientX - active.current.cx;
      const dy = e.clientY - active.current.cy;
      const d = Math.hypot(dx, dy);
      const k = d > max ? max / d : 1;
      const nx = dx * k;
      const ny = dy * k;
      if (knobRef.current) knobRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      if (mode === "turn") onChange(nx / max, 0);
      else onChange(nx / max, ny / max);
    };
    const end = (e: PointerEvent) => {
      if (!active.current || active.current.id !== e.pointerId) return;
      el.releasePointerCapture(e.pointerId);
      active.current = null;
      reset();
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", end);
    return () => {
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("pointerleave", end);
    };
  }, [size, onChange, mode]);

  return (
    <div
      ref={baseRef}
      className={`md:hidden touch-none rounded-full bg-cream-100/60 border border-cream-200 shadow-soft backdrop-blur ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <div
        ref={knobRef}
        className="w-7 h-7 rounded-full bg-cocoa-400 shadow-soft absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs text-cocoa-400 font-bold pointer-events-none">
        {mode === "move" ? "MOVE" : "LOOK"}
      </div>
    </div>
  );
}
