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

/** Pet companion — small low-poly dog/cat that stands next to a customer. */
export function makePet(kind: "dog" | "cat"): THREE.Group {
  const g = new THREE.Group();
  const bodyColor = kind === "dog" ? "#a4693b" : "#cfcfcf";
  const bodyM = mat(bodyColor);
  const darkM = mat("#3a1c10");

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.18, 6, 10), bodyM);
  body.rotation.z = Math.PI / 2;
  body.position.set(0, 0.18, 0);
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), bodyM);
  head.position.set(0.18, 0.27, 0);
  g.add(head);

  // ears
  if (kind === "dog") {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 10), bodyM);
    ear.position.set(0.14, 0.42, 0.07);
    ear.rotation.z = -0.4;
    const ear2 = ear.clone();
    ear2.position.z = -0.07;
    g.add(ear, ear2);
  } else {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 10), bodyM);
    ear.position.set(0.17, 0.38, 0.06);
    const ear2 = ear.clone();
    ear2.position.z = -0.06;
    g.add(ear, ear2);
  }

  // legs
  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8);
  const legs: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const l = new THREE.Mesh(legGeo, darkM);
    const x = i < 2 ? 0.1 : -0.1;
    const z = i % 2 === 0 ? 0.06 : -0.06;
    l.position.set(x, 0.07, z);
    legs.push(l);
  }
  g.add(...legs);

  // tail
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.15, 4, 6), bodyM);
  tail.position.set(-0.16, 0.26, 0);
  tail.rotation.z = -0.6;
  g.add(tail);

  // eyes
  const eyeGeo = new THREE.SphereGeometry(0.014, 6, 6);
  const eye1 = new THREE.Mesh(eyeGeo, darkM);
  eye1.position.set(0.28, 0.3, 0.04);
  const eye2 = eye1.clone();
  eye2.position.z = -0.04;
  g.add(eye1, eye2);

  return g;
}
