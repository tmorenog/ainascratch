/**
 * Static scenery for the 3D bakery: room shell, L-shaped counter with
 * stations, pantry shelf, back door, and the outdoor area you walk into
 * (grass, sidewalk, trees, supermarket facade, ambient NPCs).
 *
 * Each builder returns a THREE.Group ready to add to the scene. Materials
 * created here are kept in `sceneryMaterials` and disposed together.
 */
import * as THREE from "three";
import {
  woodPlankFloorTexture,
  wallpaperTexture,
  counterTopTexture,
  grassTexture,
  sidewalkTexture,
  skyTexture,
  signboardTexture,
} from "./textures3d";
import { ROOM, DOOR_POS, DOOR_SIZE, type Hotspot } from "@/game/world3d";

const sceneryMaterials: THREE.Material[] = [];
function mat(opts: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05, ...opts });
  sceneryMaterials.push(m);
  return m;
}

export function disposeAllSceneryMaterials() {
  sceneryMaterials.forEach((m) => m.dispose());
  sceneryMaterials.length = 0;
}

/* ---------------- ROOM SHELL ---------------- */
export function buildRoom(): THREE.Group {
  const g = new THREE.Group();
  g.name = "room";

  const floorTex = woodPlankFloorTexture();
  floorTex.repeat.set(3, 3);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    mat({ map: floorTex, roughness: 0.7 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  const wallTex = wallpaperTexture();
  wallTex.repeat.set(4, 2);
  const wallM = mat({ map: wallTex });
  const trimM = mat({ color: "#fff7e6", roughness: 0.5 });

  // back wall (with door cutout) — split into 3 panels
  const backY = ROOM.height / 2;
  const doorLeftEdge = DOOR_POS.x - DOOR_SIZE.w / 2;
  const doorRightEdge = DOOR_POS.x + DOOR_SIZE.w / 2;
  const leftPanelWidth = doorLeftEdge - -ROOM.width / 2;
  const rightPanelWidth = ROOM.width / 2 - doorRightEdge;
  if (leftPanelWidth > 0) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(leftPanelWidth, ROOM.height), wallM);
    w.position.set(-ROOM.width / 2 + leftPanelWidth / 2, backY, -ROOM.depth / 2);
    g.add(w);
  }
  if (rightPanelWidth > 0) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(rightPanelWidth, ROOM.height), wallM);
    w.position.set(doorRightEdge + rightPanelWidth / 2, backY, -ROOM.depth / 2);
    g.add(w);
  }
  // top of door (lintel)
  const lintelHeight = ROOM.height - DOOR_SIZE.h;
  if (lintelHeight > 0) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_SIZE.w, lintelHeight), wallM);
    w.position.set(DOOR_POS.x, DOOR_SIZE.h + lintelHeight / 2, -ROOM.depth / 2);
    g.add(w);
  }

  // door frame
  const frameM = mat({ color: "#7c5236" });
  const frameThickness = 0.08;
  const sideHeight = DOOR_SIZE.h;
  const sideGeo = new THREE.BoxGeometry(frameThickness, sideHeight, 0.12);
  const leftFrame = new THREE.Mesh(sideGeo, frameM);
  leftFrame.position.set(doorLeftEdge - frameThickness / 2, sideHeight / 2, -ROOM.depth / 2 + 0.02);
  g.add(leftFrame);
  const rightFrame = new THREE.Mesh(sideGeo, frameM);
  rightFrame.position.set(doorRightEdge + frameThickness / 2, sideHeight / 2, -ROOM.depth / 2 + 0.02);
  g.add(rightFrame);
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_SIZE.w + frameThickness * 2, frameThickness, 0.12),
    frameM,
  );
  topFrame.position.set(DOOR_POS.x, DOOR_SIZE.h + frameThickness / 2, -ROOM.depth / 2 + 0.02);
  g.add(topFrame);
  // door (slightly ajar so the outside peeks through)
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_SIZE.w * 0.96, DOOR_SIZE.h - 0.08, 0.04),
    mat({ color: "#9c6d3f", roughness: 0.6 }),
  );
  door.position.set(DOOR_POS.x - 0.6, (DOOR_SIZE.h - 0.08) / 2, -ROOM.depth / 2 + 0.06);
  door.rotation.y = -0.6;
  g.add(door);
  // doorknob
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 10, 8),
    mat({ color: "#d4a93a", metalness: 0.7, roughness: 0.3 }),
  );
  knob.position.set(DOOR_POS.x - 1.2, 1.1, -ROOM.depth / 2 + 0.1);
  g.add(knob);

  // front wall (window)
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.height), wallM);
  frontWall.position.set(0, backY, ROOM.depth / 2);
  frontWall.rotation.y = Math.PI;
  g.add(frontWall);
  // window glass
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 1.6),
    mat({ color: "#a8d8f0", roughness: 0.2, metalness: 0.0, transparent: true, opacity: 0.55 }),
  );
  glass.position.set(0, 1.7, ROOM.depth / 2 - 0.02);
  glass.rotation.y = Math.PI;
  g.add(glass);
  // window frame
  const winFrame = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.08, 0.06),
    frameM,
  );
  winFrame.position.set(0, 0.85, ROOM.depth / 2 - 0.02);
  g.add(winFrame);
  const winFrame2 = winFrame.clone();
  winFrame2.position.y = 2.55;
  g.add(winFrame2);
  // mullions
  for (let i = -1; i <= 1; i++) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.06), frameM);
    v.position.set(i * 1.0, 1.7, ROOM.depth / 2 - 0.02);
    g.add(v);
  }

  // side walls
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM.height), wallM);
  leftWall.position.set(-ROOM.width / 2, backY, 0);
  leftWall.rotation.y = Math.PI / 2;
  g.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM.height), wallM);
  rightWall.position.set(ROOM.width / 2, backY, 0);
  rightWall.rotation.y = -Math.PI / 2;
  g.add(rightWall);

  // ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    mat({ color: "#fff7e6" }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.height;
  g.add(ceiling);

  // floor trim
  const trimGeo = new THREE.BoxGeometry(ROOM.width, 0.12, 0.04);
  const trim1 = new THREE.Mesh(trimGeo, trimM);
  trim1.position.set(0, 0.06, -ROOM.depth / 2 + 0.02);
  g.add(trim1);
  const trim2 = trim1.clone();
  trim2.position.z = ROOM.depth / 2 - 0.02;
  g.add(trim2);
  const trimGeo2 = new THREE.BoxGeometry(ROOM.depth, 0.12, 0.04);
  const trim3 = new THREE.Mesh(trimGeo2, trimM);
  trim3.rotation.y = Math.PI / 2;
  trim3.position.set(-ROOM.width / 2 + 0.02, 0.06, 0);
  g.add(trim3);
  const trim4 = trim3.clone();
  trim4.position.x = ROOM.width / 2 - 0.02;
  g.add(trim4);

  return g;
}

/* ---------------- L-COUNTER + STATIONS ---------------- */
export function buildCounter(): THREE.Group {
  const g = new THREE.Group();
  g.name = "counter";

  const baseM = mat({ color: "#f9e3b6", roughness: 0.6 });
  const topTex = counterTopTexture();
  const topM = mat({ map: topTex, roughness: 0.45 });

  // Long horizontal arm of the L (along the back wall side, but pulled in)
  // runs from x = -3.5 to x = 3.5 at z = -3.0
  const longLength = 7.5;
  const counterDepth = 0.9;
  const counterHeight = 1.0;

  const longBase = new THREE.Mesh(
    new THREE.BoxGeometry(longLength, counterHeight, counterDepth),
    baseM,
  );
  longBase.position.set(0, counterHeight / 2, -3.0);
  longBase.castShadow = longBase.receiveShadow = true;
  g.add(longBase);
  const longTop = new THREE.Mesh(
    new THREE.BoxGeometry(longLength + 0.04, 0.05, counterDepth + 0.04),
    topM,
  );
  longTop.position.set(0, counterHeight + 0.025, -3.0);
  g.add(longTop);

  // Short arm of the L coming forward at x = -3.0, runs to z = 0
  const shortLength = 3.0;
  const shortBase = new THREE.Mesh(
    new THREE.BoxGeometry(counterDepth, counterHeight, shortLength),
    baseM,
  );
  shortBase.position.set(-3.0, counterHeight / 2, -3.0 + counterDepth / 2 + shortLength / 2);
  shortBase.castShadow = shortBase.receiveShadow = true;
  g.add(shortBase);
  const shortTop = new THREE.Mesh(
    new THREE.BoxGeometry(counterDepth + 0.04, 0.05, shortLength + 0.04),
    topM,
  );
  shortTop.position.set(-3.0, counterHeight + 0.025, -3.0 + counterDepth / 2 + shortLength / 2);
  g.add(shortTop);

  // Service counter at the front (where customers come) — separate small bump-out
  const svcBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, counterHeight, counterDepth),
    baseM,
  );
  svcBase.position.set(0, counterHeight / 2, 1.2);
  svcBase.castShadow = svcBase.receiveShadow = true;
  g.add(svcBase);
  const svcTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.64, 0.05, counterDepth + 0.04),
    topM,
  );
  svcTop.position.set(0, counterHeight + 0.025, 1.2);
  g.add(svcTop);

  // Cake display dome on the service counter
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    mat({ color: "#cfe9ff", transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.05 }),
  );
  dome.position.set(-0.7, counterHeight + 0.05, 1.2);
  g.add(dome);
  const cake = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.18, 18),
    mat({ color: "#ffd5b8" }),
  );
  cake.position.set(-0.7, counterHeight + 0.13, 1.2);
  g.add(cake);
  const cakeTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.04, 18),
    mat({ color: "#ec4899" }),
  );
  cakeTop.position.set(-0.7, counterHeight + 0.24, 1.2);
  g.add(cakeTop);

  // Tip jar on the service counter
  const tipJar = makeTipJar();
  tipJar.position.set(0.8, counterHeight + 0.03, 1.2);
  g.add(tipJar);

  return g;
}

function makeTipJar(): THREE.Group {
  const g = new THREE.Group();
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.08, 0.22, 18),
    mat({
      color: "#dbeeff",
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.55,
    }),
  );
  jar.position.y = 0.11;
  g.add(jar);
  // coins inside
  const coinM = mat({ color: "#f5b93b", roughness: 0.4, metalness: 0.5 });
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 12), coinM);
    c.position.y = 0.02 + i * 0.013;
    c.rotation.x = Math.random() * 0.2;
    g.add(c);
  }
  // label
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.05),
    mat({ color: "#fff" }),
  );
  label.position.set(0, 0.13, 0.08);
  g.add(label);
  return g;
}

/* ---------------- STATION SIGNBOARDS ---------------- */
export function buildStationSignboards(stations: Hotspot[]): THREE.Group {
  const g = new THREE.Group();
  g.name = "signs";
  const accents: Record<string, string> = {
    drink: "#3aa1d0",
    pastry: "#e87aa0",
    scratch: "#9c6d3f",
    pet: "#7bc97b",
  };
  for (const s of stations) {
    if (s.kind !== "station" || !s.stationId) continue;
    const tex = signboardTexture(s.label, accents[s.stationId] ?? "#888");
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.35),
      mat({ map: tex, side: THREE.DoubleSide }),
    );
    // Mount the sign on the wall-side above each station
    if (s.stationId === "pet") {
      // pet is on the left arm of the L
      sign.position.set(-3.6, 1.9, s.position[2]);
      sign.rotation.y = Math.PI / 2;
    } else {
      sign.position.set(s.position[0], 1.9, -3.55);
    }
    g.add(sign);
  }
  return g;
}

/* ---------------- STATION PROPS (visual only) ---------------- */
export function buildStationProps(): THREE.Group {
  const g = new THREE.Group();
  g.name = "stationProps";
  const counterTopY = 1.05;

  // Drink Bar — coffee machine + cups
  const drinkX = 2.5;
  const machine = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.5, 0.32),
    mat({ color: "#3a4f63", roughness: 0.4, metalness: 0.4 }),
  );
  machine.position.set(drinkX, counterTopY + 0.25, -3.0);
  g.add(machine);
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8),
    mat({ color: "#888", metalness: 0.7 }),
  );
  spout.position.set(drinkX, counterTopY + 0.05, -2.85);
  g.add(spout);
  for (let i = 0; i < 3; i++) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.035, 0.06, 12),
      mat({ color: "#fff" }),
    );
    cup.position.set(drinkX - 0.3 + i * 0.1, counterTopY + 0.03, -2.75);
    g.add(cup);
  }

  // Pastry — display case + treats
  const pastryX = 0.0;
  const display = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.3, 0.5),
    mat({ color: "#cfe9ff", transparent: true, opacity: 0.4, roughness: 0.1 }),
  );
  display.position.set(pastryX, counterTopY + 0.15, -3.0);
  g.add(display);
  const colors = ["#ec4899", "#f59e0b", "#a855f7"];
  for (let i = 0; i < 3; i++) {
    const treat = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 10),
      mat({ color: colors[i] }),
    );
    treat.position.set(pastryX - 0.3 + i * 0.3, counterTopY + 0.07, -3.0);
    g.add(treat);
  }

  // Scratch — mixer + bowl
  const scratchX = -2.5;
  const mixerBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.16, 0.28),
    mat({ color: "#d6708d" }),
  );
  mixerBase.position.set(scratchX, counterTopY + 0.08, -3.0);
  g.add(mixerBase);
  const mixerArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.32, 0.08),
    mat({ color: "#d6708d" }),
  );
  mixerArm.position.set(scratchX - 0.1, counterTopY + 0.32, -3.0);
  g.add(mixerArm);
  const mixerHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.1, 0.16),
    mat({ color: "#d6708d" }),
  );
  mixerHead.position.set(scratchX, counterTopY + 0.46, -3.0);
  g.add(mixerHead);
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.1, 0.1, 18),
    mat({ color: "#dddddd", metalness: 0.5 }),
  );
  bowl.position.set(scratchX + 0.15, counterTopY + 0.05, -3.0);
  g.add(bowl);

  // Pet nook — dog bone + cat fish on the short L arm
  const petZ = -1.4;
  const bone = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat({ color: "#fff4df" }));
  bone.position.set(-3.0, counterTopY + 0.04, petZ - 0.1);
  g.add(bone);
  const fish = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), mat({ color: "#f59e0b" }));
  fish.position.set(-3.0, counterTopY + 0.04, petZ + 0.1);
  fish.rotation.z = Math.PI / 2;
  g.add(fish);

  return g;
}

/* ---------------- PANTRY SHELF ---------------- */
export function buildPantry(): THREE.Group {
  const g = new THREE.Group();
  g.name = "pantry";
  const woodM = mat({ color: "#7c5236" });
  // Shelf stands at x ~ +4 against the back wall
  const x = 4.0;
  const z = -3.8;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.05), woodM);
  back.position.set(x, 1.1, z - 0.15);
  g.add(back);
  // sides
  const sideGeo = new THREE.BoxGeometry(0.05, 2.2, 0.4);
  const left = new THREE.Mesh(sideGeo, woodM);
  left.position.set(x - 0.75, 1.1, z);
  const right = new THREE.Mesh(sideGeo, woodM);
  right.position.set(x + 0.75, 1.1, z);
  g.add(left, right);
  // shelves with jars
  const shelfGeo = new THREE.BoxGeometry(1.5, 0.04, 0.4);
  const jarColors = ["#fff", "#f5b93b", "#7c5236", "#ec4899", "#a855f7", "#34d399"];
  for (let i = 0; i < 4; i++) {
    const y = 0.4 + i * 0.55;
    const shelf = new THREE.Mesh(shelfGeo, woodM);
    shelf.position.set(x, y, z);
    g.add(shelf);
    // jars on each shelf
    for (let j = 0; j < 4; j++) {
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.22, 14),
        mat({ color: jarColors[(i + j) % jarColors.length], roughness: 0.4 }),
      );
      jar.position.set(x - 0.55 + j * 0.36, y + 0.13, z);
      g.add(jar);
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.03, 14),
        mat({ color: "#5c3a22" }),
      );
      lid.position.set(jar.position.x, y + 0.26, z);
      g.add(lid);
    }
  }
  return g;
}

/* ---------------- BACK DOOR / OUTDOOR AREA ---------------- */
export function buildOutdoors(): THREE.Group {
  const g = new THREE.Group();
  g.name = "outdoors";

  // Outdoor area extends behind the bakery: from z = -ROOM.depth/2 - 30 to z = -ROOM.depth/2
  const grassTex = grassTexture();
  grassTex.repeat.set(20, 20);
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    mat({ map: grassTex, roughness: 0.95 }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, -0.005, -ROOM.depth / 2 - 30);
  grass.receiveShadow = true;
  g.add(grass);

  // Sidewalk path from back door straight back to supermarket
  const sidewalkTex = sidewalkTexture();
  sidewalkTex.repeat.set(2, 12);
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 30),
    mat({ map: sidewalkTex, roughness: 0.9 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(DOOR_POS.x, 0.001, -ROOM.depth / 2 - 15);
  g.add(path);

  // Sky dome (back-facing so it shows from inside)
  const skyTex = skyTexture();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(80, 24, 16),
    mat({ map: skyTex, side: THREE.BackSide }),
  );
  sky.position.set(0, 0, 0);
  g.add(sky);

  // Trees scattered along the path
  for (let i = 0; i < 14; i++) {
    const z = -ROOM.depth / 2 - 4 - i * 2;
    const sideX = (i % 2 === 0 ? -1 : 1) * (3 + Math.random() * 4);
    g.add(makeTree(DOOR_POS.x + sideX, z));
  }
  // a few extras farther out
  for (let i = 0; i < 8; i++) {
    g.add(
      makeTree(
        -20 + Math.random() * 40,
        -ROOM.depth / 2 - 10 - Math.random() * 25,
      ),
    );
  }

  // Bakery exterior back wall (so there's a visible building behind us)
  const exteriorM = mat({ color: "#fbe4c0", roughness: 0.7 });
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM.width, ROOM.height, 0.2),
    exteriorM,
  );
  back.position.set(0, ROOM.height / 2, -ROOM.depth / 2 - 0.12);
  g.add(back);
  // pitched roof over the bakery
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(ROOM.width * 0.8, 1.6, 4),
    mat({ color: "#a04848" }),
  );
  roof.position.set(0, ROOM.height + 0.8, -ROOM.depth / 2);
  roof.rotation.y = Math.PI / 4;
  g.add(roof);

  // Supermarket facade at the end of the path
  g.add(buildSupermarket(DOOR_POS.x, -ROOM.depth / 2 - 30));

  // Birds (animated sprites)
  for (let i = 0; i < 5; i++) {
    g.add(makeBirdSprite(-10 + i * 5, 6 + Math.random() * 2, -ROOM.depth / 2 - 10 - Math.random() * 15));
  }

  // Other pedestrians (very simple, moving along the sidewalk)
  // Just decorative — actual movement done in scene update.
  return g;
}

function makeTree(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 1.6, 10),
    mat({ color: "#7c5236" }),
  );
  trunk.position.y = 0.8;
  trunk.castShadow = true;
  g.add(trunk);
  // canopy: 3 stacked spheres
  const greens = ["#4ec47e", "#3e8a3a", "#5fbf67"];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 + Math.random() * 0.2, 14, 12),
      mat({ color: greens[i % 3], roughness: 0.85 }),
    );
    s.position.set(
      Math.cos(i * 2.1) * 0.25,
      1.7 + i * 0.45,
      Math.sin(i * 2.1) * 0.25,
    );
    s.castShadow = true;
    g.add(s);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(0.85 + Math.random() * 0.4);
  return g;
}

function makeBirdSprite(x: number, y: number, z: number): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 32;
  const g = c.getContext("2d")!;
  g.strokeStyle = "#222";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(4, 18);
  g.quadraticCurveTo(16, 4, 30, 18);
  g.quadraticCurveTo(44, 4, 60, 18);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 2;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(0.9, 0.45, 1);
  sprite.position.set(x, y, z);
  // tag for animation in scene
  (sprite as THREE.Sprite & { _birdSeed?: number })._birdSeed = Math.random() * Math.PI * 2;
  sprite.name = "bird";
  return sprite;
}

function buildSupermarket(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  // building
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4, 6),
    mat({ color: "#e0d8c8" }),
  );
  wall.position.set(0, 2, -3);
  wall.castShadow = wall.receiveShadow = true;
  g.add(wall);
  // roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.3, 6.4),
    mat({ color: "#8a4d3a" }),
  );
  roof.position.set(0, 4.2, -3);
  g.add(roof);
  // door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.4, 0.06),
    mat({ color: "#3a2a18" }),
  );
  door.position.set(0, 1.2, 0.05);
  g.add(door);
  // windows
  for (const wx of [-2.5, 2.5]) {
    const w = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.4, 0.06),
      mat({ color: "#a8d8f0", roughness: 0.2, transparent: true, opacity: 0.6 }),
    );
    w.position.set(wx, 2.1, 0.05);
    g.add(w);
  }
  // signboard
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#3aa1d0";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#fff";
  ctx.font = "800 64px 'Fraunces', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SUPERMARKET", 256, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 1.2),
    mat({ map: tex, side: THREE.DoubleSide }),
  );
  sign.position.set(0, 3.4, 0.06);
  g.add(sign);

  // awning
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.08, 0.8),
    mat({ color: "#ef476f" }),
  );
  awning.position.set(0, 2.55, 0.45);
  g.add(awning);

  g.position.set(x, 0, z);
  return g;
}
