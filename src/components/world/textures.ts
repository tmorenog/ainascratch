/**
 * Procedural textures for the bakery interior. All drawn to offscreen
 * canvases at boot so the raycaster can sample them without any external
 * image assets.
 *
 * Each texture is a square 64x64 canvas; the raycaster reads the column
 * at fractional hit position and scales it into place.
 */

export interface WallTextureSet {
  plank: HTMLCanvasElement; // 1
  wallpaper: HTMLCanvasElement; // 2
  brick: HTMLCanvasElement; // 3
  window: HTMLCanvasElement; // 4
}

function newTexture(size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

export function makeWallTextures(): WallTextureSet {
  return {
    plank: makePlank(),
    wallpaper: makeWallpaper(),
    brick: makeBrick(),
    window: makeWindow(),
  };
}

function makePlank(): HTMLCanvasElement {
  const c = newTexture(64);
  const g = c.getContext("2d")!;
  // vertical planks
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, "#a4693b");
  grad.addColorStop(1, "#6b3d1b");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  // grain stripes
  for (let y = 0; y < 64; y += 1) {
    g.fillStyle = `rgba(60,30,10,${0.05 + (y % 7) * 0.01})`;
    g.fillRect(0, y, 64, 1);
  }
  // plank separators
  g.fillStyle = "rgba(40, 20, 8, 0.7)";
  for (const py of [10, 26, 44, 58]) {
    g.fillRect(0, py, 64, 1);
  }
  // subtle highlights
  for (const py of [11, 27, 45, 59]) {
    g.fillStyle = "rgba(255, 220, 170, 0.18)";
    g.fillRect(0, py, 64, 1);
  }
  // knots
  for (let i = 0; i < 4; i++) {
    const kx = 8 + Math.floor(Math.random() * 48);
    const ky = 4 + Math.floor(Math.random() * 56);
    const r = 1.5 + Math.random() * 1.5;
    const rad = g.createRadialGradient(kx, ky, 0, kx, ky, r);
    rad.addColorStop(0, "rgba(30,15,6,0.9)");
    rad.addColorStop(1, "rgba(30,15,6,0)");
    g.fillStyle = rad;
    g.fillRect(kx - r, ky - r, r * 2, r * 2);
  }
  return c;
}

function makeWallpaper(): HTMLCanvasElement {
  const c = newTexture(64);
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, "#fff0d0");
  grad.addColorStop(1, "#f6dca7");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  // thin vertical pinstripes
  g.fillStyle = "rgba(180, 120, 60, 0.18)";
  for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 1, 64);
  // hearts pattern
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = col * 16 + (row % 2 ? 8 : 0) + 8;
      const y = row * 16 + 10;
      drawHeart(g, x, y, 3, "#e87aa0");
    }
  }
  // molding
  g.fillStyle = "#7c5236";
  g.fillRect(0, 0, 64, 2);
  g.fillRect(0, 62, 64, 2);
  return c;
}

function drawHeart(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y + r);
  g.bezierCurveTo(x, y, x - r * 1.5, y - r * 0.4, x - r * 1.5, y + r * 0.3);
  g.bezierCurveTo(x - r * 1.5, y + r * 1.2, x, y + r * 1.5, x, y + r * 2);
  g.bezierCurveTo(x, y + r * 1.5, x + r * 1.5, y + r * 1.2, x + r * 1.5, y + r * 0.3);
  g.bezierCurveTo(x + r * 1.5, y - r * 0.4, x, y, x, y + r);
  g.fill();
}

function makeBrick(): HTMLCanvasElement {
  const c = newTexture(64);
  const g = c.getContext("2d")!;
  g.fillStyle = "#4a2c1a";
  g.fillRect(0, 0, 64, 64);
  // brick rows
  const rows = 8;
  const h = 64 / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 8;
    for (let x = -16; x < 80; x += 16) {
      const bx = x + offset;
      const by = r * h;
      const grad = g.createLinearGradient(bx, by, bx, by + h);
      grad.addColorStop(0, "#b9664a");
      grad.addColorStop(1, "#7a3a26");
      g.fillStyle = grad;
      g.fillRect(bx + 0.5, by + 0.5, 15, h - 1);
      // highlight
      g.fillStyle = "rgba(255,200,170,0.15)";
      g.fillRect(bx + 0.5, by + 0.5, 15, 1);
    }
  }
  return c;
}

function makeWindow(): HTMLCanvasElement {
  const c = newTexture(64);
  const g = c.getContext("2d")!;
  // frame
  g.fillStyle = "#fbf3e1";
  g.fillRect(0, 0, 64, 64);
  // sky
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, "#aee4ff");
  grad.addColorStop(1, "#e9f8ff");
  g.fillStyle = grad;
  g.fillRect(6, 6, 52, 52);
  // sun
  g.fillStyle = "#fff0a8";
  g.beginPath();
  g.arc(46, 18, 7, 0, Math.PI * 2);
  g.fill();
  // cloud
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(16, 24, 5, 0, Math.PI * 2);
  g.arc(22, 22, 6, 0, Math.PI * 2);
  g.arc(28, 24, 5, 0, Math.PI * 2);
  g.fill();
  // hills
  g.fillStyle = "#9ad99a";
  g.beginPath();
  g.moveTo(6, 46);
  g.quadraticCurveTo(24, 36, 34, 44);
  g.quadraticCurveTo(48, 32, 58, 44);
  g.lineTo(58, 58);
  g.lineTo(6, 58);
  g.fill();
  // mullions
  g.fillStyle = "#7c5236";
  g.fillRect(0, 0, 64, 6);
  g.fillRect(0, 58, 64, 6);
  g.fillRect(0, 0, 6, 64);
  g.fillRect(58, 0, 6, 64);
  g.fillRect(30, 6, 4, 52);
  g.fillRect(6, 30, 52, 4);
  return c;
}

/* ---------------- Sprite rendering ----------------- */

/**
 * Renders a circular totem sprite: a rounded pedestal with an emoji and a
 * short label. Returns an HTMLCanvasElement ready to be billboarded.
 */
export function makeTotemSprite({
  emoji,
  label,
  color,
  size = 160,
}: {
  emoji: string;
  label: string;
  color: string;
  size?: number;
}): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = Math.floor(size * 1.5);
  const g = c.getContext("2d")!;
  // base shadow
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.beginPath();
  g.ellipse(size / 2, size * 1.42, size / 3, size / 16, 0, 0, Math.PI * 2);
  g.fill();
  // pedestal
  const base = size * 1.25;
  const pedW = size * 0.75;
  const grad = g.createLinearGradient(0, base - size * 0.5, 0, base);
  grad.addColorStop(0, "#a47551");
  grad.addColorStop(1, "#5a3922");
  g.fillStyle = grad;
  roundRect(g, (size - pedW) / 2, base - size * 0.5, pedW, size * 0.55, 10);
  g.fill();
  // sign
  const signY = size * 0.2;
  const signH = size * 0.9;
  const signW = size * 0.85;
  const signX = (size - signW) / 2;
  const signGrad = g.createLinearGradient(0, signY, 0, signY + signH);
  signGrad.addColorStop(0, color);
  signGrad.addColorStop(1, shade(color, -0.35));
  g.fillStyle = signGrad;
  roundRect(g, signX, signY, signW, signH, 18);
  g.fill();
  // inner highlight
  g.fillStyle = "rgba(255,255,255,0.35)";
  roundRect(g, signX + 6, signY + 6, signW - 12, signH / 2 - 10, 12);
  g.fill();
  // emoji
  g.font = `${Math.floor(size * 0.45)}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(emoji, size / 2, signY + signH / 2);
  // label
  g.font = `700 ${Math.floor(size * 0.12)}px ui-sans-serif, system-ui, sans-serif`;
  g.fillStyle = "#3f2614";
  g.fillText(label, size / 2, base - size * 0.08);
  return c;
}

/**
 * Render a customer billboard: head emoji + colored torso.
 */
export function makeCustomerSprite({
  emoji,
  color,
  name,
  size = 140,
  hasPet,
}: {
  emoji: string;
  color: string;
  name: string;
  size?: number;
  hasPet?: "dog" | "cat";
}): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = Math.floor(size * 1.6);
  const g = c.getContext("2d")!;
  // shadow
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.beginPath();
  g.ellipse(size / 2, size * 1.55, size / 3.4, size / 18, 0, 0, Math.PI * 2);
  g.fill();
  // torso
  const torsoY = size * 0.85;
  const torsoH = size * 0.6;
  const torsoW = size * 0.7;
  const torsoX = (size - torsoW) / 2;
  const grad = g.createLinearGradient(0, torsoY, 0, torsoY + torsoH);
  grad.addColorStop(0, color);
  grad.addColorStop(1, shade(color, -0.3));
  g.fillStyle = grad;
  roundRect(g, torsoX, torsoY, torsoW, torsoH, 16);
  g.fill();
  // head circle
  const headR = size * 0.36;
  g.fillStyle = "#ffe2c2";
  g.beginPath();
  g.arc(size / 2, torsoY - headR * 0.1, headR, 0, Math.PI * 2);
  g.fill();
  // emoji face
  g.font = `${Math.floor(size * 0.5)}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(emoji, size / 2, torsoY - headR * 0.12);
  // name tag
  g.font = `700 ${Math.floor(size * 0.11)}px ui-sans-serif, system-ui, sans-serif`;
  g.fillStyle = "#fff";
  const tagW = g.measureText(name).width + 14;
  const tagX = size / 2 - tagW / 2;
  const tagY = torsoY + torsoH + 2;
  g.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(g, tagX, tagY, tagW, 18, 8);
  g.fill();
  g.fillStyle = "#fff";
  g.fillText(name, size / 2, tagY + 9);
  // pet emoji
  if (hasPet) {
    const pet = hasPet === "dog" ? "🐶" : "🐱";
    g.font = `${Math.floor(size * 0.28)}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
    g.fillText(pet, size * 0.85, torsoY + torsoH * 0.7);
  }
  return c;
}

export function makeFloorCeilingGradients(w: number, h: number) {
  // Returns pre-drawn floor + ceiling canvases (horizontal bands) for fast blit.
  const ceiling = document.createElement("canvas");
  ceiling.width = 1;
  ceiling.height = Math.floor(h / 2);
  const gc = ceiling.getContext("2d")!;
  const gg = gc.createLinearGradient(0, 0, 0, ceiling.height);
  gg.addColorStop(0, "#f3e4c0");
  gg.addColorStop(1, "#fcefd5");
  gc.fillStyle = gg;
  gc.fillRect(0, 0, 1, ceiling.height);

  const floor = document.createElement("canvas");
  floor.width = 1;
  floor.height = Math.ceil(h / 2);
  const fc = floor.getContext("2d")!;
  const fg = fc.createLinearGradient(0, 0, 0, floor.height);
  fg.addColorStop(0, "#b47138");
  fg.addColorStop(1, "#7a4620");
  fc.fillStyle = fg;
  fc.fillRect(0, 0, 1, floor.height);
  return { ceiling, floor };
}

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function shade(hex: string, amt: number): string {
  const { r, g, b } = parseColor(hex);
  const f = 1 + amt;
  const nr = Math.max(0, Math.min(255, Math.round(r * f)));
  const ng = Math.max(0, Math.min(255, Math.round(g * f)));
  const nb = Math.max(0, Math.min(255, Math.round(b * f)));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

function parseColor(hex: string): { r: number; g: number; b: number } {
  const s = hex.replace("#", "");
  const v = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
