import * as THREE from "three";
import type { CustomerLookData } from "@/game/types";

/**
 * Procedural low-poly human figures. Each figure is a group of simple
 * meshes (head sphere, torso box, limbs) with customizable skin / hair /
 * shirt colors. No emojis, no sprites — all geometry with smooth shading
 * so it looks cohesive in the 3D scene.
 *
 * The figure returns an object with:
 *   - `root`: THREE.Group, positioned with its feet at y=0
 *   - `update(t)`: advance an idle breathing / sway animation
 */
export interface CharacterFigure {
  root: THREE.Group;
  update: (time: number) => void;
  setSpeaking: (on: boolean) => void;
  dispose: () => void;
}

interface CharacterOptions {
  skin: string;
  shirt: string;
  pants: string;
  hair: string;
  hairStyle?: CustomerLookData["hair"] | "chef";
  apron?: boolean; // renders a chef apron over the shirt
  name?: string;
  scale?: number;
  /**
   * If true, the figure is built for a seated pose: standing legs + shoes
   * are replaced with horizontal thighs extending forward (+Z) from the
   * hips and short shins hanging down from the knees. Callers then place
   * the root so the hips sit on a chair seat.
   */
  seated?: boolean;
}

const materials: THREE.MeshStandardMaterial[] = [];

function mat(color: THREE.ColorRepresentation, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0.02,
    ...extra,
  });
  materials.push(m);
  return m;
}

export function disposeAllSharedMaterials() {
  materials.forEach((m) => m.dispose());
  materials.length = 0;
}

/**
 * Build a CharacterFigure. Call update(t) each frame to drive the idle
 * breathing + subtle sway animation.
 */
export function makeCharacter(opts: CharacterOptions): CharacterFigure {
  const scale = opts.scale ?? 1;
  const root = new THREE.Group();
  root.name = opts.name ?? "character";

  const skinM = mat(opts.skin);
  const shirtM = mat(opts.shirt);
  const pantsM = mat(opts.pants);
  const hairM = mat(opts.hair);
  const apronM = mat("#fff4df", { roughness: 0.95 });
  const eyeM = mat("#1a1008");
  const cheekM = mat("#f5b7c8", { transparent: true, opacity: 0.55 });
  const mouthM = mat("#3a1c10");

  if (opts.seated) {
    // ---- Seated thighs (horizontal) + shins (vertical) ----
    // Thigh runs from hip (local z≈0) forward to the knee at z≈+0.32,
    // resting at seat height. Shins drop straight down from the knees.
    const thighGeo = new THREE.BoxGeometry(0.15, 0.12, 0.34);
    const shinGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.36, 10);
    const shoeM = mat("#3f2614");
    const shoeGeo = new THREE.BoxGeometry(0.15, 0.05, 0.2);
    for (const side of [-1, 1]) {
      const thigh = new THREE.Mesh(thighGeo, pantsM);
      thigh.position.set(0.11 * side, 0.77, 0.18);
      thigh.castShadow = true;
      root.add(thigh);
      const shin = new THREE.Mesh(shinGeo, pantsM);
      shin.position.set(0.11 * side, 0.55, 0.33);
      shin.castShadow = true;
      root.add(shin);
      const shoe = new THREE.Mesh(shoeGeo, shoeM);
      shoe.position.set(0.11 * side, 0.39, 0.4);
      root.add(shoe);
    }
  } else {
    // ---- Legs ----
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.75, 12);
    const leftLeg = new THREE.Mesh(legGeo, pantsM);
    leftLeg.position.set(-0.11, 0.375, 0);
    leftLeg.castShadow = true;
    const rightLeg = leftLeg.clone();
    rightLeg.position.set(0.11, 0.375, 0);
    root.add(leftLeg, rightLeg);

    // ---- Shoes ----
    const shoeGeo = new THREE.BoxGeometry(0.17, 0.06, 0.22);
    const shoeM = mat("#3f2614");
    const leftShoe = new THREE.Mesh(shoeGeo, shoeM);
    leftShoe.position.set(-0.11, 0.03, 0.03);
    const rightShoe = leftShoe.clone();
    rightShoe.position.x = 0.11;
    root.add(leftShoe, rightShoe);
  }

  // ---- Torso ----
  const torsoGeo = new THREE.BoxGeometry(0.46, 0.55, 0.26);
  // Rounded corners via chamfer: quick scale-based trick
  (torsoGeo as THREE.BoxGeometry).translate(0, 0, 0);
  const torso = new THREE.Mesh(torsoGeo, shirtM);
  torso.position.set(0, 1.03, 0);
  torso.castShadow = true;
  root.add(torso);

  // ---- Apron ----
  if (opts.apron) {
    const apronGeo = new THREE.BoxGeometry(0.42, 0.72, 0.04);
    const apron = new THREE.Mesh(apronGeo, apronM);
    apron.position.set(0, 0.82, 0.14);
    root.add(apron);
    // apron strap (subtle)
    const strapGeo = new THREE.BoxGeometry(0.04, 0.34, 0.02);
    const leftStrap = new THREE.Mesh(strapGeo, apronM);
    leftStrap.position.set(-0.14, 1.28, 0.15);
    leftStrap.rotation.z = -0.15;
    const rightStrap = leftStrap.clone();
    rightStrap.position.x = 0.14;
    rightStrap.rotation.z = 0.15;
    root.add(leftStrap, rightStrap);
  }

  // ---- Arms ----
  const upperArmGeo = new THREE.CapsuleGeometry(0.07, 0.28, 6, 10);
  const leftArm = new THREE.Mesh(upperArmGeo, shirtM);
  leftArm.position.set(-0.3, 1.05, 0);
  leftArm.castShadow = true;
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.3;
  root.add(leftArm, rightArm);

  // hands
  const handGeo = new THREE.SphereGeometry(0.08, 14, 12);
  const leftHand = new THREE.Mesh(handGeo, skinM);
  leftHand.position.set(-0.3, 0.82, 0);
  const rightHand = leftHand.clone();
  rightHand.position.x = 0.3;
  root.add(leftHand, rightHand);

  // ---- Neck ----
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.08, 10), skinM);
  neck.position.set(0, 1.35, 0);
  root.add(neck);

  // ---- Head ----
  const head = new THREE.Group();
  head.position.set(0, 1.47, 0);
  root.add(head);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 22, 20), skinM);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Cheeks
  const cheekGeo = new THREE.SphereGeometry(0.03, 8, 6);
  const leftCheek = new THREE.Mesh(cheekGeo, cheekM);
  leftCheek.position.set(-0.08, -0.02, 0.12);
  const rightCheek = leftCheek.clone();
  rightCheek.position.x = 0.08;
  head.add(leftCheek, rightCheek);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.017, 8, 6);
  const leftEye = new THREE.Mesh(eyeGeo, eyeM);
  leftEye.position.set(-0.05, 0.02, 0.12);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.05;
  head.add(leftEye, rightEye);

  // Mouth
  const mouthGeo = new THREE.TorusGeometry(0.025, 0.008, 6, 14, Math.PI);
  const mouth = new THREE.Mesh(mouthGeo, mouthM);
  mouth.position.set(0, -0.05, 0.13);
  mouth.rotation.x = Math.PI;
  head.add(mouth);

  // ---- Hair ----
  addHair(head, hairM, opts.hairStyle ?? "short");

  // ---- Speech bubble (hidden by default) ----
  const bubble = makeSpeechBubble();
  bubble.position.set(0.0, 1.95, 0);
  bubble.visible = false;
  root.add(bubble);

  root.scale.setScalar(scale);

  const update = (time: number) => {
    // gentle idle breathing sway
    const t = time * 0.001;
    torso.position.y = 1.03 + Math.sin(t * 2) * 0.008;
    head.position.y = 1.47 + Math.sin(t * 2) * 0.012;
    head.rotation.y = Math.sin(t * 0.7) * 0.08;
    leftArm.rotation.z = 0.05 + Math.sin(t * 1.4) * 0.04;
    rightArm.rotation.z = -0.05 - Math.sin(t * 1.4) * 0.04;
    bubble.rotation.y = Math.sin(t * 0.5) * 0.1;
    bubble.position.y = 1.95 + Math.sin(t * 1.5) * 0.02;
  };

  const setSpeaking = (on: boolean) => {
    bubble.visible = on;
  };

  const dispose = () => {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose();
      }
    });
  };

  return { root, update, setSpeaking, dispose };
}

function addHair(head: THREE.Group, hairM: THREE.Material, style: string) {
  switch (style) {
    case "chef": {
      // chef hat
      const hatBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.05, 18),
        hairM,
      );
      hatBase.position.y = 0.15;
      const hatPoof = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 14), hairM);
      hatPoof.position.y = 0.25;
      head.add(hatBase, hatPoof);
      return;
    }
    case "short": {
      const h = new THREE.Mesh(
        new THREE.SphereGeometry(0.148, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairM,
      );
      h.position.y = 0.03;
      head.add(h);
      return;
    }
    case "buzz": {
      const h = new THREE.Mesh(
        new THREE.SphereGeometry(0.144, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.4),
        hairM,
      );
      h.position.y = 0.05;
      head.add(h);
      return;
    }
    case "long": {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.148, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairM,
      );
      cap.position.y = 0.03;
      head.add(cap);
      const strands = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.12, 0.35, 18, 1, true),
        hairM,
      );
      strands.position.y = -0.12;
      head.add(strands);
      return;
    }
    case "ponytail": {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.148, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairM,
      );
      cap.position.y = 0.03;
      head.add(cap);
      const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.22, 6, 10), hairM);
      tail.position.set(0, -0.05, -0.16);
      tail.rotation.x = 0.6;
      head.add(tail);
      return;
    }
    case "bun": {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.148, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairM,
      );
      cap.position.y = 0.03;
      head.add(cap);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), hairM);
      bun.position.set(0, 0.18, -0.02);
      head.add(bun);
      return;
    }
    case "curly": {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), hairM);
        puff.position.set(
          Math.cos(a) * 0.13,
          0.1 + Math.sin(a * 3) * 0.03,
          Math.sin(a) * 0.13,
        );
        head.add(puff);
      }
      return;
    }
    case "puff": {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), hairM);
      puff.position.y = 0.1;
      puff.scale.y = 0.8;
      head.add(puff);
      return;
    }
  }
}

function makeSpeechBubble(): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  roundRect(g, 10, 10, 236, 90, 24);
  g.fill();
  g.strokeStyle = "rgba(124,82,54,0.5)";
  g.lineWidth = 4;
  roundRect(g, 10, 10, 236, 90, 24);
  g.stroke();
  // tail
  g.beginPath();
  g.moveTo(100, 100);
  g.lineTo(120, 124);
  g.lineTo(140, 100);
  g.closePath();
  g.fillStyle = "#fff";
  g.fill();
  g.stroke();
  // dots
  g.fillStyle = "#7c5236";
  [70, 128, 186].forEach((x) => {
    g.beginPath();
    g.arc(x, 55, 10, 0, Math.PI * 2);
    g.fill();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.8, 0.4, 1);
  return sprite;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Pet companion — a very cute low-poly dog/cat. Big sparkly eyes, rosy
 * cheeks, tiny smile, floppy dog ears or pointy pink-lined cat ears,
 * whiskers for the cat and a pink tongue for the dog. The head and tail
 * are exposed via `group.userData.pet` so the game can bob/wag them
 * when the player pets them. */
export function makePet(kind: "dog" | "cat"): THREE.Group {
  const g = new THREE.Group();
  const bodyColor = kind === "dog" ? "#c79162" : "#f6f4ec";
  const bellyColor = kind === "dog" ? "#ecd9b9" : "#ffffff";
  const earAccent = kind === "dog" ? "#8b5a2b" : "#e5e1d3";
  const bodyM = mat(bodyColor);
  const bellyM = mat(bellyColor);
  const earAccentM = mat(earAccent);
  const darkM = mat("#1c110a");
  const whiteM = mat("#ffffff");
  const softPinkM = mat("#ffbad1");
  const hotPinkM = mat("#ff5e85");

  // ---- BODY ----
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.18, 10, 14), bodyM);
  body.rotation.z = Math.PI / 2;
  body.position.set(-0.02, 0.2, 0);
  g.add(body);
  // lighter tummy patch
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), bellyM);
  belly.position.set(-0.02, 0.14, 0);
  belly.scale.set(1.1, 0.55, 0.55);
  g.add(belly);

  // ---- HEAD (in its own group so we can bob it when petted) ----
  const head = new THREE.Group();
  head.position.set(0.18, 0.33, 0);
  g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), bodyM);
  skull.scale.set(1, 0.98, 1);
  head.add(skull);

  // Rosy cheeks — two little pink circles on the face
  const cheekGeo = new THREE.CircleGeometry(0.03, 16);
  const cheekM = mat("#ff92ae");
  const cheekL = new THREE.Mesh(cheekGeo, cheekM);
  cheekL.position.set(0.11, -0.01, 0.1);
  cheekL.rotation.y = Math.PI / 2;
  head.add(cheekL);
  const cheekR = cheekL.clone();
  cheekR.position.z = -0.1;
  head.add(cheekR);

  // Huge anime eyes — dark ovals
  const eyeGeo = new THREE.SphereGeometry(0.04, 14, 12);
  const eyeL = new THREE.Mesh(eyeGeo, darkM);
  eyeL.position.set(0.14, 0.04, 0.07);
  eyeL.scale.set(0.45, 1, 1);
  head.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.07;
  head.add(eyeR);
  // Two sparkly highlights per eye — big + small
  const shineA = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), whiteM);
  shineA.position.set(0.158, 0.055, 0.078);
  shineA.scale.set(0.55, 1.1, 1.1);
  const shineB = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), whiteM);
  shineB.position.set(0.158, 0.02, 0.063);
  head.add(shineA, shineB);
  const shineA2 = shineA.clone();
  shineA2.position.z = -0.078;
  const shineB2 = shineB.clone();
  shineB2.position.z = -0.063;
  head.add(shineA2, shineB2);

  // Button nose — pink for cat, dark for dog
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 14, 12),
    kind === "cat" ? hotPinkM : darkM,
  );
  nose.position.set(0.18, -0.02, 0);
  nose.scale.set(0.9, 0.7, 1.1);
  head.add(nose);

  // Tiny smile — a thin half-torus on the front of the face
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.025, 0.005, 8, 16, Math.PI),
    darkM,
  );
  smile.position.set(0.172, -0.065, 0);
  smile.rotation.y = -Math.PI / 2; // face +X
  smile.rotation.z = Math.PI; // arc opens upward => smile
  head.add(smile);

  if (kind === "dog") {
    // Floppy squishable ears on the sides of the head
    const earGeo = new THREE.SphereGeometry(0.075, 14, 12);
    const earL = new THREE.Mesh(earGeo, earAccentM);
    earL.position.set(-0.02, 0.05, 0.14);
    earL.scale.set(0.55, 1.3, 0.85);
    earL.rotation.x = 0.25;
    head.add(earL);
    const earR = earL.clone();
    earR.position.z = -0.14;
    earR.rotation.x = -0.25;
    head.add(earR);
    // Little pink tongue sticking out under the smile
    const tongue = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 12, 10),
      hotPinkM,
    );
    tongue.position.set(0.185, -0.085, 0);
    tongue.scale.set(0.7, 0.55, 1.3);
    head.add(tongue);
    // A marking spot on the left side of the face for character
    const spot = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 10),
      earAccentM,
    );
    spot.position.set(0.05, 0.08, 0.11);
    spot.scale.set(0.5, 0.8, 0.5);
    head.add(spot);
  } else {
    // Pointy cat ears with pink insides
    const earGeo = new THREE.ConeGeometry(0.05, 0.12, 12);
    const earL = new THREE.Mesh(earGeo, bodyM);
    earL.position.set(-0.02, 0.16, 0.09);
    head.add(earL);
    const earR = earL.clone();
    earR.position.z = -0.09;
    head.add(earR);
    const innerGeo = new THREE.ConeGeometry(0.028, 0.08, 12);
    const innerL = new THREE.Mesh(innerGeo, softPinkM);
    innerL.position.set(-0.01, 0.15, 0.09);
    head.add(innerL);
    const innerR = innerL.clone();
    innerR.position.z = -0.09;
    head.add(innerR);
    // Whiskers — three on each side
    const whiskerM = mat("#fdf6de");
    const whiskerGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.11, 4);
    for (const side of [1, -1]) {
      for (const dy of [0.015, -0.005, -0.025]) {
        const w = new THREE.Mesh(whiskerGeo, whiskerM);
        w.position.set(0.17, dy, 0.055 * side);
        w.rotation.z = Math.PI / 2;
        w.rotation.y = side > 0 ? 0.35 : -0.35;
        head.add(w);
      }
    }
  }

  // ---- LEGS ----
  const legGeo = new THREE.CylinderGeometry(0.032, 0.028, 0.14, 10);
  for (let i = 0; i < 4; i++) {
    const l = new THREE.Mesh(legGeo, bodyM);
    const x = i < 2 ? 0.1 : -0.12;
    const z = i % 2 === 0 ? 0.07 : -0.07;
    l.position.set(x, 0.07, z);
    g.add(l);
  }

  // ---- TAIL (own group so we can wag it) ----
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.17, 0.22, 0);
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.14, 6, 10), bodyM);
  if (kind === "dog") {
    tail.position.set(-0.02, 0.06, 0);
    tail.rotation.z = -0.9;
  } else {
    tail.position.set(-0.02, 0.08, 0);
    tail.rotation.z = -0.5;
    tail.rotation.x = 0.4;
  }
  tailGroup.add(tail);
  g.add(tailGroup);

  // ---- COLLAR with a tiny charm ----
  const collarColor = kind === "dog" ? "#d72a58" : "#ffa4c6";
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.015, 10, 24),
    mat(collarColor),
  );
  collar.position.set(0.09, 0.24, 0);
  collar.rotation.y = Math.PI / 2;
  g.add(collar);
  const charm = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 12, 10),
    mat("#ffd64a"),
  );
  charm.position.set(0.115, 0.15, 0);
  g.add(charm);

  // Expose the movable bits so the game loop can animate them when petted.
  g.userData.pet = { kind, head, tail: tailGroup, skull };
  g.userData.kind = "pet";

  return g;
}
