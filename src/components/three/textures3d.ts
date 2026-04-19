/**
 * Shared texture-canvas helpers for the 3D bakery. Kept tiny: every
 * texture is drawn procedurally onto a 2D canvas and wrapped in a
 * THREE.CanvasTexture so we ship zero image assets.
 */
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

function cachedTex(key: string, builder: () => HTMLCanvasElement): THREE.Texture {
  const existing = cache.get(key);
  if (existing) return existing;
  const canvas = builder();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache.set(key, tex);
  return tex;
}

export function woodPlankFloorTexture(): THREE.Texture {
  return cachedTex("woodFloor", () => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#b9824f");
    grad.addColorStop(1, "#8b5a2b");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    // horizontal planks
    for (let y = 0; y < 512; y += 64) {
      g.fillStyle = "rgba(0,0,0,0.2)";
      g.fillRect(0, y, 512, 2);
    }
    // grain
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 6 + Math.random() * 40;
      g.fillStyle = `rgba(60,30,10,${0.02 + Math.random() * 0.04})`;
      g.fillRect(x, y, w, 1);
    }
    // knots
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 3 + Math.random() * 5;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, "rgba(40, 20, 8, 0.7)");
      grd.addColorStop(1, "rgba(40, 20, 8, 0)");
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return c;
  });
}

export function wallpaperTexture(): THREE.Texture {
  return cachedTex("wallpaper", () => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#fff0d0");
    grad.addColorStop(1, "#f4d9a3");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    // vertical stripes
    g.fillStyle = "rgba(180,120,60,0.14)";
    for (let x = 0; x < 256; x += 24) g.fillRect(x, 0, 2, 256);
    // tiny hearts
    for (let r = 0; r < 4; r++) {
      for (let col = 0; col < 8; col++) {
        const hx = col * 32 + (r % 2 ? 16 : 0) + 16;
        const hy = r * 64 + 24;
        drawHeart(g, hx, hy, 4, "#e87aa0");
      }
    }
    return c;
  });
}

export function counterTopTexture(): THREE.Texture {
  return cachedTex("counterTop", () => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#f3e0c2");
    grad.addColorStop(1, "#c19659");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const w = 10 + Math.random() * 30;
      g.fillStyle = `rgba(60,30,10,${0.02 + Math.random() * 0.05})`;
      g.fillRect(x, y, w, 1);
    }
    return c;
  });
}

export function grassTexture(): THREE.Texture {
  return cachedTex("grass", () => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#6bbf63");
    grad.addColorStop(1, "#4b9848");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      g.fillStyle = `rgba(46,90,36,${0.08 + Math.random() * 0.15})`;
      g.fillRect(x, y, 1, 2 + Math.random() * 2);
    }
    // daisies
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(x, y, 1.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#f5b93b";
      g.beginPath();
      g.arc(x, y, 0.6, 0, Math.PI * 2);
      g.fill();
    }
    return c;
  });
}

export function sidewalkTexture(): THREE.Texture {
  return cachedTex("sidewalk", () => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#c9c6bf";
    g.fillRect(0, 0, 256, 256);
    // speckle
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      g.fillStyle = `rgba(60,60,60,${0.1 + Math.random() * 0.15})`;
      g.fillRect(x, y, 1, 1);
    }
    // joints
    g.strokeStyle = "#777472";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, 128);
    g.lineTo(256, 128);
    g.moveTo(128, 0);
    g.lineTo(128, 256);
    g.stroke();
    return c;
  });
}

export function skyTexture(): THREE.Texture {
  return cachedTex("sky", () => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#8ecfff");
    grad.addColorStop(0.6, "#cfe9ff");
    grad.addColorStop(1, "#fff6dc");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    // clouds
    g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * 512;
      const y = 40 + Math.random() * 200;
      g.fillStyle = "rgba(255,255,255,0.7)";
      for (let j = 0; j < 6; j++) {
        g.beginPath();
        g.arc(x + j * 18, y + Math.sin(j) * 6, 18 + Math.random() * 10, 0, Math.PI * 2);
        g.fill();
      }
    }
    // sun
    const sunG = g.createRadialGradient(400, 90, 5, 400, 90, 80);
    sunG.addColorStop(0, "#fff6a8");
    sunG.addColorStop(1, "rgba(255,246,168,0)");
    g.fillStyle = sunG;
    g.fillRect(300, 10, 200, 200);
    return c;
  });
}

export function signboardTexture(label: string, accent: string): THREE.Texture {
  const key = `sign-${label}-${accent}`;
  return cachedTex(key, () => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = accent;
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "rgba(0,0,0,0.08)";
    g.fillRect(0, 106, 512, 22);
    g.fillStyle = "rgba(255,255,255,0.3)";
    g.fillRect(0, 0, 512, 22);
    g.fillStyle = "#fff";
    g.font = "800 52px 'Fraunces', ui-serif, Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, 256, 64);
    return c;
  });
}

function drawHeart(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y + r);
  g.bezierCurveTo(x, y, x - r * 1.5, y - r * 0.4, x - r * 1.5, y + r * 0.3);
  g.bezierCurveTo(x - r * 1.5, y + r * 1.2, x, y + r * 1.5, x, y + r * 2);
  g.bezierCurveTo(x, y + r * 1.5, x + r * 1.5, y + r * 1.2, x + r * 1.5, y + r * 0.3);
  g.bezierCurveTo(x + r * 1.5, y - r * 0.4, x, y, x, y + r);
  g.fill();
}

export function heartTexture(): THREE.Texture {
  return cachedTex("heart", () => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 128, 128);
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#ff7fa9");
    grad.addColorStop(1, "#e51a5f");
    g.fillStyle = grad;
    g.strokeStyle = "#ffffff";
    g.lineWidth = 6;
    const cx = 64, top = 38, r = 22;
    g.beginPath();
    g.moveTo(cx, top + r);
    g.bezierCurveTo(cx, top, cx - r * 1.5, top, cx - r * 1.5, top + r * 0.7);
    g.bezierCurveTo(cx - r * 1.5, top + r * 1.7, cx, top + r * 2.3, cx, top + r * 3);
    g.bezierCurveTo(cx, top + r * 2.3, cx + r * 1.5, top + r * 1.7, cx + r * 1.5, top + r * 0.7);
    g.bezierCurveTo(cx + r * 1.5, top, cx, top, cx, top + r);
    g.closePath();
    g.fill();
    g.stroke();
    return c;
  });
}

export function disposeAllCachedTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
