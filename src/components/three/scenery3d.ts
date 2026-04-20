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
import {
  ROOM,
  DOOR_POS,
  DOOR_SIZE,
  BASEMENT,
  VET_CENTER,
  type Hotspot,
} from "@/game/world3d";
import { makeCharacter, type CharacterFigure } from "./characters";

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

  // ceiling — a box pulled slightly below the wall tops so there is no
  // z-fighting seam and so the ceiling has a bit of thickness visible at
  // the edges. A subtle warm-cream color catches light from the pendants.
  const ceilY = ROOM.height - 0.02;
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM.width - 0.02, 0.06, ROOM.depth - 0.02),
    mat({ color: "#fff1d6", roughness: 0.9 }),
  );
  ceiling.position.set(0, ceilY + 0.03, 0);
  ceiling.receiveShadow = true;
  g.add(ceiling);

  // Wooden beams across the ceiling — warmth and depth so it's not flat.
  const beamM = mat({ color: "#7c5236", roughness: 0.75 });
  for (const bz of [-3.5, 0, 3.5]) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM.width - 0.2, 0.16, 0.22),
      beamM,
    );
    beam.position.set(0, ceilY - 0.09, bz);
    g.add(beam);
  }

  // Pendant lamps hanging under the same points where the point lights sit.
  const lampCoords: [number, number][] = [
    [-3, -1], [3, -1], [0, 1.5], [-5, 2], [5, 2],
  ];
  for (const [lx, lz] of lampCoords) {
    g.add(makePendantLamp(lx, ceilY, lz));
  }

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

function makePendantLamp(x: number, ceilY: number, z: number): THREE.Group {
  const g = new THREE.Group();
  // ceiling rose where the cord meets the ceiling
  const rose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.03, 12),
    mat({ color: "#5a4030", roughness: 0.7 }),
  );
  rose.position.set(x, ceilY - 0.015, z);
  g.add(rose);
  // cord
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6),
    mat({ color: "#2a2118" }),
  );
  cord.position.set(x, ceilY - 0.31, z);
  g.add(cord);
  // brass-ish shade (cone)
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.24, 18, 1, true),
    mat({ color: "#d7884a", roughness: 0.55, metalness: 0.3, side: THREE.DoubleSide }),
  );
  shade.position.set(x, ceilY - 0.58, z);
  shade.rotation.x = Math.PI;
  g.add(shade);
  // glowing bulb
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 12),
    mat({
      color: "#fff3c4",
      emissive: "#fff0b4",
      emissiveIntensity: 1.3,
      roughness: 0.4,
    }),
  );
  bulb.position.set(x, ceilY - 0.66, z);
  g.add(bulb);
  return g;
}

/* ---------------- OPEN / CLOSED SIGN ---------------- */
/**
 * A small hanging sign on the front window. The returned object includes an
 * `update(isOpen)` function that redraws the canvas texture so the sign
 * reflects the current shop state. `setClickable` adds the mesh to the list
 * of things the scene's raycaster checks against.
 */
export function makeOpenSign(): {
  group: THREE.Group;
  face: THREE.Mesh;
  update: (isOpen: boolean) => void;
} {
  const group = new THREE.Group();
  group.name = "openSign";

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  function draw(isOpen: boolean) {
    ctx.fillStyle = isOpen ? "#7bc97b" : "#ef476f";
    ctx.fillRect(0, 0, 256, 160);
    ctx.strokeStyle = "#fffbea";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 140);
    ctx.fillStyle = "#fffbea";
    ctx.font = "800 72px 'Fraunces', Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isOpen ? "OPEN" : "CLOSED", 128, 82);
    ctx.font = "600 22px 'Fraunces', Georgia, serif";
    ctx.fillText("click me!", 128, 138);
    tex.needsUpdate = true;
  }
  draw(false);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.56),
    mat({ map: tex, side: THREE.DoubleSide, roughness: 0.7 }),
  );
  face.name = "openSignFace";
  // Mount on the front window, a bit left of center, inside-facing.
  face.position.set(2.2, 1.7, ROOM.depth / 2 - 0.08);
  face.rotation.y = Math.PI; // show face to someone standing inside
  group.add(face);

  // Chain loops
  const chainM = mat({ color: "#5a4030", roughness: 0.6 });
  for (const cx of [-0.35, 0.35]) {
    const chain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.24, 6),
      chainM,
    );
    chain.position.set(2.2 + cx, 2.08, ROOM.depth / 2 - 0.08);
    group.add(chain);
  }

  return { group, face, update: draw };
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

/* ---------------- PLUSHIE DISPLAY SHELF ----------------
 * A dedicated wooden shelf against the back wall (opposite side from the
 * pantry) holding the four themed bakery plushies: Donut Bear, Croissant
 * Cat, Cupcake Bunny, and Coffee Cup Puppy. They're built from simple
 * primitives so they read clearly from across the room.
 */

/** Build a single plushie figure from primitives, centered on the origin.
 *  Returns a group you can `position.set(x, shelfY, z)` directly. Each
 *  plushie is roughly 0.3m tall so four fit comfortably side by side. */
function makePlushie(
  kind: "donut_bear" | "croissant_cat" | "cupcake_bunny" | "coffee_puppy",
): THREE.Group {
  const g = new THREE.Group();
  g.name = `plushie_${kind}`;
  const soft = (color: string) => mat({ color, roughness: 0.95, metalness: 0 });

  if (kind === "donut_bear") {
    const fur = soft("#a9784e");
    const belly = soft("#e6c79a");
    // body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), fur);
    body.position.y = 0.11;
    body.scale.set(1, 0.85, 0.95);
    g.add(body);
    // belly patch
    const bellyM = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), belly);
    bellyM.position.set(0, 0.09, 0.06);
    bellyM.scale.set(1, 0.9, 0.4);
    g.add(bellyM);
    // head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), fur);
    head.position.y = 0.27;
    g.add(head);
    // ears
    const earGeo = new THREE.SphereGeometry(0.035, 10, 8);
    const earL = new THREE.Mesh(earGeo, fur);
    earL.position.set(-0.065, 0.34, 0);
    const earR = new THREE.Mesh(earGeo, fur);
    earR.position.set(0.065, 0.34, 0);
    g.add(earL, earR);
    // snout
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), belly);
    snout.position.set(0, 0.255, 0.075);
    g.add(snout);
    // nose
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 8, 6),
      soft("#3d1d0c"),
    );
    nose.position.set(0, 0.27, 0.1);
    g.add(nose);
    // eyes
    const eyeM = soft("#1a1a1a");
    const eyeGeo = new THREE.SphereGeometry(0.008, 8, 6);
    const eL = new THREE.Mesh(eyeGeo, eyeM);
    eL.position.set(-0.025, 0.285, 0.085);
    const eR = new THREE.Mesh(eyeGeo, eyeM);
    eR.position.set(0.025, 0.285, 0.085);
    g.add(eL, eR);
    // arms & legs (little nubs)
    const nubGeo = new THREE.SphereGeometry(0.035, 10, 8);
    const armL = new THREE.Mesh(nubGeo, fur);
    armL.position.set(-0.11, 0.12, 0);
    const armR = new THREE.Mesh(nubGeo, fur);
    armR.position.set(0.11, 0.12, 0);
    g.add(armL, armR);
    // donut hat on head (torus with pink glaze)
    const donut = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.022, 10, 20),
      soft("#f5a3c7"),
    );
    donut.position.set(0, 0.36, 0);
    donut.rotation.x = Math.PI / 2;
    g.add(donut);
    // rainbow sprinkles
    const sprinkleColors = ["#ffe66a", "#7fd6ff", "#ff8cb3", "#a6f0a1"];
    for (let i = 0; i < 8; i++) {
      const s = new THREE.Mesh(
        new THREE.BoxGeometry(0.006, 0.003, 0.003),
        soft(sprinkleColors[i % sprinkleColors.length]),
      );
      const ang = (i / 8) * Math.PI * 2;
      s.position.set(Math.cos(ang) * 0.055, 0.375, Math.sin(ang) * 0.055);
      s.rotation.y = ang + Math.random() * 0.5;
      g.add(s);
    }
  } else if (kind === "croissant_cat") {
    const fur = soft("#f0e1c0");
    const pink = soft("#f7b8c8");
    const choc = soft("#6b3a1e");
    // croissant base (tan crescent) — two flattened spheres + top
    const croissBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 14, 10),
      soft("#d4a56a"),
    );
    croissBase.position.y = 0.08;
    croissBase.scale.set(1.1, 0.55, 0.8);
    g.add(croissBase);
    // ridged top of croissant
    for (let i = 0; i < 4; i++) {
      const ridge = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 6),
        soft("#c08a4a"),
      );
      ridge.position.set(-0.06 + i * 0.04, 0.13, -0.02);
      ridge.scale.set(1, 0.6, 1);
      g.add(ridge);
    }
    // chocolate drizzle puddle
    const choco = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 8),
      choc,
    );
    choco.position.set(0, 0.13, 0.03);
    choco.scale.set(1, 0.15, 0.7);
    g.add(choco);
    // kitty body (sitting in croissant)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), fur);
    body.position.y = 0.195;
    body.scale.set(1, 0.9, 0.9);
    g.add(body);
    // head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), fur);
    head.position.y = 0.3;
    g.add(head);
    // triangle ears
    const earGeo = new THREE.ConeGeometry(0.025, 0.05, 8);
    const earL = new THREE.Mesh(earGeo, fur);
    earL.position.set(-0.045, 0.365, 0);
    const earR = new THREE.Mesh(earGeo, fur);
    earR.position.set(0.045, 0.365, 0);
    g.add(earL, earR);
    // inner ears
    const innerEarL = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.025, 8),
      pink,
    );
    innerEarL.position.set(-0.045, 0.37, 0.006);
    const innerEarR = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.025, 8),
      pink,
    );
    innerEarR.position.set(0.045, 0.37, 0.006);
    g.add(innerEarL, innerEarR);
    // pink nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), pink);
    nose.position.set(0, 0.295, 0.072);
    g.add(nose);
    // eyes
    const eyeM = soft("#1a1a1a");
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), eyeM);
    eL.position.set(-0.022, 0.315, 0.068);
    const eR = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), eyeM);
    eR.position.set(0.022, 0.315, 0.068);
    g.add(eL, eR);
    // tail (curled, sticking out of croissant)
    const tail = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.012, 8, 16, Math.PI),
      fur,
    );
    tail.position.set(0.11, 0.13, 0);
    tail.rotation.y = Math.PI / 2;
    g.add(tail);
  } else if (kind === "cupcake_bunny") {
    const fur = soft("#fff4ec");
    const pink = soft("#f7b8c8");
    const wrapper = soft("#eb74a5");
    const frosting = soft("#ffd6e4");
    // cupcake wrapper (ridged cone)
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.07, 0.1, 12),
      wrapper,
    );
    wrap.position.y = 0.055;
    g.add(wrap);
    // frosting "cushion" on top of wrapper
    const fluff = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 14, 10),
      frosting,
    );
    fluff.position.y = 0.11;
    fluff.scale.set(1, 0.5, 1);
    g.add(fluff);
    // body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), fur);
    body.position.y = 0.2;
    body.scale.set(1, 0.9, 0.9);
    g.add(body);
    // head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.078, 14, 12), fur);
    head.position.y = 0.3;
    g.add(head);
    // long bunny ears
    const earGeo = new THREE.CapsuleGeometry(0.018, 0.08, 4, 8);
    const earL = new THREE.Mesh(earGeo, fur);
    earL.position.set(-0.035, 0.4, 0);
    earL.rotation.z = -0.1;
    const earR = new THREE.Mesh(earGeo, fur);
    earR.position.set(0.035, 0.4, 0);
    earR.rotation.z = 0.1;
    g.add(earL, earR);
    // inner ears
    const innerEarGeo = new THREE.CapsuleGeometry(0.009, 0.055, 4, 8);
    const iEarL = new THREE.Mesh(innerEarGeo, pink);
    iEarL.position.set(-0.035, 0.4, 0.01);
    iEarL.rotation.z = -0.1;
    const iEarR = new THREE.Mesh(innerEarGeo, pink);
    iEarR.position.set(0.035, 0.4, 0.01);
    iEarR.rotation.z = 0.1;
    g.add(iEarL, iEarR);
    // pink nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), pink);
    nose.position.set(0, 0.29, 0.075);
    g.add(nose);
    // eyes
    const eyeM = soft("#1a1a1a");
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), eyeM);
    eL.position.set(-0.023, 0.31, 0.07);
    const eR = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), eyeM);
    eR.position.set(0.023, 0.31, 0.07);
    g.add(eL, eR);
    // sprinkles on frosting
    const sprinkleColors = ["#ffe66a", "#7fd6ff", "#d0a7ff", "#a6f0a1"];
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.003, 0.003),
        soft(sprinkleColors[i % sprinkleColors.length]),
      );
      const ang = (i / 6) * Math.PI * 2;
      s.position.set(Math.cos(ang) * 0.08, 0.125, Math.sin(ang) * 0.08);
      s.rotation.y = ang + Math.random() * 0.6;
      g.add(s);
    }
  } else {
    // coffee_puppy
    const fur = soft("#b3845a");
    const belly = soft("#eccfa2");
    const cupWhite = soft("#fbfbfb");
    const coffee = soft("#5b3321");
    // coffee cup (cylinder, opens up toward the top)
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.065, 0.14, 14, 1, true),
      cupWhite,
    );
    cup.position.y = 0.075;
    g.add(cup);
    // base disk
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.015, 14),
      cupWhite,
    );
    base.position.y = 0.005;
    g.add(base);
    // coffee inside (brown disk near top)
    const java = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.078, 0.01, 14),
      coffee,
    );
    java.position.y = 0.145;
    g.add(java);
    // cup handle (torus)
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.025, 0.008, 8, 14),
      cupWhite,
    );
    handle.position.set(0.085, 0.08, 0);
    handle.rotation.y = Math.PI / 2;
    g.add(handle);
    // paper sleeve around cup (little band)
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.085, 0.04, 14),
      soft("#c88f5a"),
    );
    sleeve.position.y = 0.075;
    g.add(sleeve);
    // puppy peeking out: body (inside cup, hidden), head popping up
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), fur);
    head.position.y = 0.22;
    g.add(head);
    // floppy ears
    const earGeo = new THREE.SphereGeometry(0.03, 10, 8);
    const earL = new THREE.Mesh(earGeo, fur);
    earL.position.set(-0.062, 0.225, 0);
    earL.scale.set(0.7, 1.2, 0.8);
    const earR = new THREE.Mesh(earGeo, fur);
    earR.position.set(0.062, 0.225, 0);
    earR.scale.set(0.7, 1.2, 0.8);
    g.add(earL, earR);
    // snout
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), belly);
    snout.position.set(0, 0.205, 0.065);
    g.add(snout);
    // nose
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 8, 6),
      soft("#1a1a1a"),
    );
    nose.position.set(0, 0.215, 0.09);
    g.add(nose);
    // eyes
    const eyeM = soft("#1a1a1a");
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), eyeM);
    eL.position.set(-0.022, 0.235, 0.072);
    const eR = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), eyeM);
    eR.position.set(0.022, 0.235, 0.072);
    g.add(eL, eR);
    // steam wisps above the cup
    const steamM = soft("#ffffff");
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 6),
        steamM,
      );
      puff.position.set(-0.02 + i * 0.02, 0.3 + i * 0.025, 0);
      g.add(puff);
    }
  }

  // soft shadow under every plushie
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 18),
    mat({
      color: "#000",
      transparent: true,
      opacity: 0.15,
      roughness: 1,
    }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.002;
  g.add(blob);

  return g;
}

/** Pastel palette cycled through for custom plushies / chew toys so each
 *  chef-made merch item has its own cheerful color. */
const CUSTOM_MERCH_PALETTE = [
  "#f7b8c8",
  "#a6d8f0",
  "#ffe66a",
  "#a6f0a1",
  "#d0a7ff",
  "#ffc380",
  "#ff8cb3",
  "#7fd6ff",
];

/** Build a tiny chef-made plushie figure (generic rounded blob with ears and
 *  a bow). Different hashId values produce different colors / accents so
 *  every custom creation has a distinct look on the display shelf. */
export function makeCustomPlushie(hashId: string): THREE.Group {
  const g = new THREE.Group();
  g.name = "custom_plushie";
  let h = 0;
  for (let i = 0; i < hashId.length; i++) h = (h * 31 + hashId.charCodeAt(i)) >>> 0;
  const bodyColor = CUSTOM_MERCH_PALETTE[h % CUSTOM_MERCH_PALETTE.length];
  const accent = CUSTOM_MERCH_PALETTE[(h >>> 3) % CUSTOM_MERCH_PALETTE.length];
  const bow = CUSTOM_MERCH_PALETTE[(h >>> 6) % CUSTOM_MERCH_PALETTE.length];
  const soft = (c: string) =>
    mat({ color: c, roughness: 0.95, metalness: 0 });

  // body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), soft(bodyColor));
  body.position.y = 0.1;
  body.scale.set(1, 0.85, 0.95);
  g.add(body);
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), soft(bodyColor));
  head.position.y = 0.24;
  g.add(head);
  // belly patch
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), soft(accent));
  belly.position.set(0, 0.08, 0.05);
  belly.scale.set(1, 0.9, 0.4);
  g.add(belly);
  // rounded ears (shape varies with hash)
  const earGeo =
    h % 3 === 0
      ? new THREE.CapsuleGeometry(0.018, 0.06, 4, 8)
      : h % 3 === 1
        ? new THREE.ConeGeometry(0.028, 0.055, 8)
        : new THREE.SphereGeometry(0.035, 10, 8);
  const earL = new THREE.Mesh(earGeo, soft(bodyColor));
  earL.position.set(-0.055, 0.32, 0);
  const earR = new THREE.Mesh(earGeo, soft(bodyColor));
  earR.position.set(0.055, 0.32, 0);
  g.add(earL, earR);
  // eyes
  const eyeM = soft("#1a1a1a");
  const eyeGeo = new THREE.SphereGeometry(0.008, 8, 6);
  const eL = new THREE.Mesh(eyeGeo, eyeM);
  eL.position.set(-0.022, 0.25, 0.075);
  const eR = new THREE.Mesh(eyeGeo, eyeM);
  eR.position.set(0.022, 0.25, 0.075);
  g.add(eL, eR);
  // bow on the head
  const bowLeft = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), soft(bow));
  bowLeft.position.set(-0.03, 0.33, 0.02);
  bowLeft.scale.set(1, 0.5, 0.4);
  const bowRight = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), soft(bow));
  bowRight.position.set(0.03, 0.33, 0.02);
  bowRight.scale.set(1, 0.5, 0.4);
  const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), soft(bow));
  bowKnot.position.set(0, 0.33, 0.03);
  g.add(bowLeft, bowRight, bowKnot);
  // little shadow
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.09, 18),
    mat({ color: "#000", transparent: true, opacity: 0.15, roughness: 1 }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.002;
  g.add(blob);
  return g;
}

/** Build a small chef-made chew toy — chunky rubber shape with a pastel
 *  accent, sitting on the toy rack. Shape varies per hash for variety. */
export function makeCustomChewToy(hashId: string): THREE.Group {
  const g = new THREE.Group();
  g.name = "custom_chew_toy";
  let h = 0;
  for (let i = 0; i < hashId.length; i++) h = (h * 31 + hashId.charCodeAt(i)) >>> 0;
  const main = CUSTOM_MERCH_PALETTE[h % CUSTOM_MERCH_PALETTE.length];
  const accent = CUSTOM_MERCH_PALETTE[(h >>> 4) % CUSTOM_MERCH_PALETTE.length];
  const soft = (c: string) =>
    mat({ color: c, roughness: 0.55, metalness: 0 });

  const shape = h % 3;
  if (shape === 0) {
    // mini rubber bone
    const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), soft(main));
    lobeL.position.set(-0.08, 0.06, 0);
    const lobeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), soft(main));
    lobeR.position.set(0.08, 0.06, 0);
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.04, 0.04),
      soft(main),
    );
    bar.position.set(0, 0.06, 0);
    g.add(lobeL, lobeR, bar);
  } else if (shape === 1) {
    // ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), soft(main));
    ball.position.y = 0.06;
    g.add(ball);
    // stripe
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 14), soft(accent));
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = 0.06;
    g.add(stripe);
  } else {
    // rope knot
    const knotL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), soft(main));
    knotL.position.set(-0.05, 0.04, 0);
    const knotR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), soft(accent));
    knotR.position.set(0.05, 0.04, 0);
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.08, 10),
      soft("#e8d7a8"),
    );
    rope.rotation.z = Math.PI / 2;
    rope.position.y = 0.04;
    g.add(knotL, knotR, rope);
  }
  // tiny shadow
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.06, 14),
    mat({ color: "#000", transparent: true, opacity: 0.15, roughness: 1 }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.001;
  g.add(blob);
  return g;
}

/** Positions on the plushie shelf's top deck where custom plushies get
 *  stacked once invented. Relative to shelf anchor (-4, 0, -6.15). */
export const CUSTOM_PLUSHIE_SLOTS: Array<[number, number, number]> = [
  [-4.9, 1.5, -6.15],
  [-4.4, 1.5, -6.15],
  [-3.9, 1.5, -6.15],
  [-3.4, 1.5, -6.15],
  [-2.9, 1.5, -6.15],
];

/** Positions near the pet station where custom chew toys pile up. */
export const CUSTOM_CHEW_SLOTS: Array<[number, number, number]> = [
  [-5.9, 0.95, -0.8],
  [-5.9, 0.95, -1.3],
  [-5.9, 0.95, -1.8],
  [-5.6, 0.95, -0.8],
  [-5.6, 0.95, -1.3],
];

export function buildPlushieShelf(): THREE.Group {
  const g = new THREE.Group();
  g.name = "plushie_shelf";
  // Back-left area of the bakery, against the back wall (z ≈ -6.5).
  // Offset from the wall so the kids can see the plushies from any angle.
  const shelfX = -4.0;
  const shelfZ = -6.15;
  const shelfW = 2.4;

  const woodM = mat({ color: "#8c5a36", roughness: 0.75 });
  const woodLight = mat({ color: "#d7a975", roughness: 0.7 });
  const accentM = mat({ color: "#f7b8c8", roughness: 0.5 });

  // Back panel + side supports
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(shelfW, 1.9, 0.04),
    woodM,
  );
  back.position.set(shelfX, 1.1, shelfZ - 0.22);
  g.add(back);

  const sideGeo = new THREE.BoxGeometry(0.05, 1.9, 0.45);
  const left = new THREE.Mesh(sideGeo, woodM);
  left.position.set(shelfX - shelfW / 2, 1.1, shelfZ);
  const right = new THREE.Mesh(sideGeo, woodM);
  right.position.set(shelfX + shelfW / 2, 1.1, shelfZ);
  g.add(left, right);

  // Horizontal shelves — two levels so plushies have room overhead.
  const shelfGeo = new THREE.BoxGeometry(shelfW, 0.05, 0.45);
  const topShelfY = 1.45;
  const bottomShelfY = 0.85;
  const shelfBottom = new THREE.Mesh(shelfGeo, woodLight);
  shelfBottom.position.set(shelfX, bottomShelfY, shelfZ);
  g.add(shelfBottom);
  const shelfTop = new THREE.Mesh(shelfGeo, woodLight);
  shelfTop.position.set(shelfX, topShelfY, shelfZ);
  g.add(shelfTop);
  // Floor plinth (so the whole thing sits evenly)
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(shelfW, 0.15, 0.45),
    woodM,
  );
  plinth.position.set(shelfX, 0.075, shelfZ);
  g.add(plinth);

  // Little pastel sign banner along the top — no text, just a cheerful pop of
  // color so kids see "that's the plushie corner" at a glance.
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(shelfW * 0.85, 0.12, 0.02),
    accentM,
  );
  banner.position.set(shelfX, 1.95, shelfZ - 0.18);
  g.add(banner);
  // Bunting dots along the banner
  const dotColors = ["#ffe66a", "#a6f0a1", "#7fd6ff", "#d0a7ff", "#ff8cb3"];
  for (let i = 0; i < 5; i++) {
    const d = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 8),
      mat({ color: dotColors[i], roughness: 0.5 }),
    );
    d.position.set(shelfX - 0.6 + i * 0.3, 2.05, shelfZ - 0.17);
    g.add(d);
  }

  // Place the four plushies on the lower shelf, spaced evenly across.
  const plushies: Array<
    Parameters<typeof makePlushie>[0]
  > = ["donut_bear", "croissant_cat", "cupcake_bunny", "coffee_puppy"];
  for (let i = 0; i < plushies.length; i++) {
    const p = makePlushie(plushies[i]);
    // spread them across the shelf width
    const x = shelfX - shelfW / 2 + (i + 0.5) * (shelfW / plushies.length);
    p.position.set(x, bottomShelfY + 0.025, shelfZ);
    // tiny rotation variety so they don't look stamped
    p.rotation.y = -Math.PI + (i - 1.5) * 0.1;
    g.add(p);
  }

  // A couple of decorative extras on the top shelf to fill it out — a jar
  // of ribbons and a small stack of gift boxes. No emojis; just shapes.
  const ribbonJar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.075, 0.2, 14),
    mat({ color: "#fff8ec", roughness: 0.4, transparent: true, opacity: 0.85 }),
  );
  ribbonJar.position.set(shelfX - 0.9, topShelfY + 0.13, shelfZ);
  g.add(ribbonJar);
  // ribbon inside (coiled)
  const ribbon = new THREE.Mesh(
    new THREE.TorusGeometry(0.05, 0.015, 8, 16),
    mat({ color: "#f7b8c8" }),
  );
  ribbon.rotation.x = Math.PI / 2;
  ribbon.position.set(shelfX - 0.9, topShelfY + 0.06, shelfZ);
  g.add(ribbon);

  // gift boxes stacked
  const box1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.16, 0.2),
    mat({ color: "#a6d8f0" }),
  );
  box1.position.set(shelfX + 0.25, topShelfY + 0.11, shelfZ);
  g.add(box1);
  // ribbon cross on box1
  const ribA = mat({ color: "#f5a3c7" });
  const bandX = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.02, 0.21), ribA);
  bandX.position.set(shelfX + 0.25, topShelfY + 0.11, shelfZ);
  g.add(bandX);
  const bandY = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.17, 0.21), ribA);
  bandY.position.set(shelfX + 0.25, topShelfY + 0.11, shelfZ);
  g.add(bandY);
  const bow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), ribA);
  bow.position.set(shelfX + 0.25, topShelfY + 0.21, shelfZ);
  g.add(bow);
  // smaller box on top
  const box2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.1, 0.13),
    mat({ color: "#f7dfa5" }),
  );
  box2.position.set(shelfX + 0.6, topShelfY + 0.08, shelfZ);
  g.add(box2);
  const band2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.14), ribA);
  band2.position.set(shelfX + 0.6, topShelfY + 0.08, shelfZ);
  g.add(band2);

  // A little sign placard leaning on the top shelf
  const placard = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.28, 0.02),
    mat({ color: "#fff2da", roughness: 0.5 }),
  );
  placard.position.set(shelfX + 0.95, topShelfY + 0.17, shelfZ);
  placard.rotation.y = -0.1;
  g.add(placard);
  const placardFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.32, 0.012),
    mat({ color: "#f5a3c7" }),
  );
  placardFrame.position.set(shelfX + 0.95, topShelfY + 0.17, shelfZ - 0.006);
  placardFrame.rotation.y = -0.1;
  g.add(placardFrame);

  return g;
}

/* ---------------- CAT CAFE STAIRS ---------------- */
/**
 * A visible staircase in the back-right corner of the bakery hinting at a
 * downstairs space. When unlocked (lv20), clicking on it takes the player
 * to the Cat Cafe. Built from stacked wooden steps descending into a dark
 * floor opening with a pastel handrail + "Cat Cafe" signboard.
 */
export function buildCatCafeStairs(): THREE.Group {
  const g = new THREE.Group();
  g.name = "cat_cafe_stairs";
  const x = 5.5;
  const z = -5.0;
  const wood = mat({ color: "#8c5a36", roughness: 0.8 });
  const step = mat({ color: "#d7a975", roughness: 0.7 });
  const rail = mat({ color: "#f5a3c7", roughness: 0.5 });
  const darkHole = mat({ color: "#2a1a14", roughness: 1 });
  const signWhite = mat({ color: "#fff2da", roughness: 0.5 });

  // Dark "hole" in the floor where the stairs go down — gives the illusion
  // of a basement without actually punching through the floor mesh.
  const hole = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 1.6), darkHole);
  hole.position.set(x, 0.005, z - 0.4);
  g.add(hole);

  // Wooden trim around the hole
  const trimGeo = new THREE.BoxGeometry(1.7, 0.06, 0.08);
  const trimN = new THREE.Mesh(trimGeo, wood);
  trimN.position.set(x, 0.03, z - 1.2);
  const trimS = new THREE.Mesh(trimGeo, wood);
  trimS.position.set(x, 0.03, z + 0.4);
  g.add(trimN, trimS);
  const trimGeoWZ = new THREE.BoxGeometry(0.08, 0.06, 1.68);
  const trimW = new THREE.Mesh(trimGeoWZ, wood);
  trimW.position.set(x - 0.79, 0.03, z - 0.4);
  const trimE = new THREE.Mesh(trimGeoWZ, wood);
  trimE.position.set(x + 0.79, 0.03, z - 0.4);
  g.add(trimW, trimE);

  // Visible steps descending into the hole. Each step drops a bit and
  // recedes — only the top few are visible, which is exactly what you'd
  // see looking into a stairwell from above.
  const stepGeo = new THREE.BoxGeometry(1.3, 0.04, 0.28);
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(stepGeo, step);
    s.position.set(x, -i * 0.08, z + 0.3 - i * 0.22);
    g.add(s);
  }

  // Handrails — two sloping banisters.
  const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 10);
  const railL = new THREE.Mesh(railGeo, rail);
  railL.position.set(x - 0.7, 0.45, z - 0.1);
  railL.rotation.x = 0.55;
  const railR = new THREE.Mesh(railGeo, rail);
  railR.position.set(x + 0.7, 0.45, z - 0.1);
  railR.rotation.x = 0.55;
  g.add(railL, railR);
  // Tiny newel posts at the top
  const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 10);
  const postL = new THREE.Mesh(postGeo, rail);
  postL.position.set(x - 0.7, 0.5, z + 0.45);
  const postR = new THREE.Mesh(postGeo, rail);
  postR.position.set(x + 0.7, 0.5, z + 0.45);
  g.add(postL, postR);
  // Ball tops on the newels (cute)
  const ballGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const ballM = mat({ color: "#f7b8c8", roughness: 0.4 });
  const ballL = new THREE.Mesh(ballGeo, ballM);
  ballL.position.set(-0.7 + x, 0.95, z + 0.45);
  const ballR = new THREE.Mesh(ballGeo, ballM);
  ballR.position.set(0.7 + x, 0.95, z + 0.45);
  g.add(ballL, ballR);

  // Signboard above pointing down — "Cat Cafe ↓"
  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8),
    wood,
  );
  signPost.position.set(x + 0.85, 1.4, z + 0.5);
  g.add(signPost);
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.35, 0.03),
    signWhite,
  );
  sign.position.set(x + 1.15, 2.1, z + 0.5);
  sign.rotation.y = -0.2;
  g.add(sign);
  const signFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.4, 0.015),
    rail,
  );
  signFrame.position.set(x + 1.15, 2.1, z + 0.49);
  signFrame.rotation.y = -0.2;
  g.add(signFrame);
  // tiny paw print on the sign (circle + 4 dots)
  const paw = mat({ color: "#8c5a36" });
  const pawPad = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), paw);
  pawPad.position.set(x + 0.95, 2.08, z + 0.47);
  pawPad.scale.set(1, 0.4, 1);
  g.add(pawPad);
  for (let i = 0; i < 4; i++) {
    const toe = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 8, 6),
      paw,
    );
    const ang = -Math.PI / 2 + (i - 1.5) * 0.4;
    toe.position.set(
      x + 0.95 + Math.cos(ang) * 0.085,
      2.17,
      z + 0.47 + Math.sin(ang) * 0.04,
    );
    toe.scale.set(1, 0.4, 1);
    g.add(toe);
  }
  // arrow accent
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.12, 8),
    paw,
  );
  arrow.position.set(x + 1.32, 1.95, z + 0.49);
  arrow.rotation.z = Math.PI;
  g.add(arrow);

  return g;
}

/* ---------------- CAFE SEATING ---------------- */
/**
 * A few little cafe tables with chairs so customers have somewhere to sit
 * and sip their drinks. Each table gets a tiny vase with cheerful flowers.
 */
export function buildSeatingArea(): THREE.Group {
  const g = new THREE.Group();
  g.name = "seating";

  const woodTop = mat({ color: "#e2b87c", roughness: 0.6 });
  const woodLeg = mat({ color: "#7c5236", roughness: 0.7 });
  const chairSeat = mat({ color: "#d6708d", roughness: 0.7 });
  const chairBack = mat({ color: "#c45576", roughness: 0.7 });
  const vaseM = mat({ color: "#9acbd1", roughness: 0.35 });
  const stemM = mat({ color: "#4ec47e" });
  const petalColors = ["#ff7aa0", "#ffd24d", "#a879ff", "#ff6b6b", "#4ec4e8"];
  const centerM = mat({ color: "#ffe27a" });

  const tableTopR = 0.42;
  const tableH = 0.78;

  function buildFlower(color: string): THREE.Group {
    const flower = new THREE.Group();
    // 5 petals as squashed spheres around a small center
    const petalM = mat({ color, roughness: 0.5 });
    const petalGeo = new THREE.SphereGeometry(0.045, 10, 8);
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(petalGeo, petalM);
      const a = (i / 5) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.045, 0, Math.sin(a) * 0.045);
      petal.scale.set(1, 0.5, 1);
      flower.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), centerM);
    flower.add(center);
    return flower;
  }

  function buildChair(x: number, z: number, facing: number): THREE.Group {
    const chair = new THREE.Group();
    // seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.05, 0.36),
      chairSeat,
    );
    seat.position.y = 0.46;
    chair.add(seat);
    // 4 legs
    const legGeo = new THREE.BoxGeometry(0.04, 0.46, 0.04);
    [
      [-0.15, 0.23, -0.15],
      [0.15, 0.23, -0.15],
      [-0.15, 0.23, 0.15],
      [0.15, 0.23, 0.15],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodLeg);
      leg.position.set(lx, ly, lz);
      chair.add(leg);
    });
    // backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.04),
      chairBack,
    );
    back.position.set(0, 0.68, -0.16);
    chair.add(back);
    chair.position.set(x, 0, z);
    chair.rotation.y = facing;
    return chair;
  }

  function buildTable(x: number, z: number): THREE.Group {
    const t = new THREE.Group();
    // round top
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(tableTopR, tableTopR, 0.05, 24),
      woodTop,
    );
    top.position.y = tableH;
    t.add(top);
    // pedestal
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, tableH - 0.05, 12),
      woodLeg,
    );
    post.position.y = (tableH - 0.05) / 2;
    t.add(post);
    // foot
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 0.05, 18),
      woodLeg,
    );
    foot.position.y = 0.025;
    t.add(foot);
    // vase with flowers in the middle of the table
    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 0.14, 14),
      vaseM,
    );
    vase.position.y = tableH + 0.07;
    t.add(vase);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.01, 8, 14),
      vaseM,
    );
    rim.position.y = tableH + 0.14;
    rim.rotation.x = Math.PI / 2;
    t.add(rim);
    // 3 flowers poking out at slightly different heights
    const flowerSpots: [number, number, number, string][] = [
      [0, tableH + 0.24, 0, petalColors[0]],
      [0.03, tableH + 0.22, 0.02, petalColors[1]],
      [-0.025, tableH + 0.23, -0.02, petalColors[2]],
    ];
    flowerSpots.forEach(([fx, fy, fz, color]) => {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.14, 6),
        stemM,
      );
      stem.position.set(fx, fy - 0.07, fz);
      t.add(stem);
      const flower = buildFlower(color);
      flower.position.set(fx, fy, fz);
      t.add(flower);
    });
    t.position.set(x, 0, z);
    return t;
  }

  // Three little tables tucked against the side walls so the middle aisle
  // from the entrance to the counter stays clear.
  const spots: [number, number][] = [
    [-5.0, 1.0],
    [5.0, 1.0],
    [-5.0, 4.0],
    [5.0, 4.0],
  ];
  for (const [x, z] of spots) {
    g.add(buildTable(x, z));
    // put chairs on the two sides facing away from the wall (towards +/-x)
    const inward = x < 0 ? 1 : -1;
    // Side chair (between the table and the aisle) — faces the table.
    g.add(buildChair(x + inward * 0.7, z, inward < 0 ? Math.PI / 2 : -Math.PI / 2));
    // Chair on the +Z side of the table — must look back toward the
    // table at smaller Z, so it faces -Z (yaw = PI), not +Z.
    g.add(buildChair(x, z + 0.75, Math.PI));
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

  // Supermarket facade at the end of the path. We keep a reference to its
  // sliding door meshes on `g.userData` so the renderer can animate them
  // without relying on name-based lookup (which can fail after clones).
  const market = buildSupermarket(DOOR_POS.x, -ROOM.depth / 2 - 30);
  g.add(market);
  g.userData.supermarketDoors = market.userData.doors;
  g.userData.supermarketDoorCenter = {
    x: DOOR_POS.x,
    z: -ROOM.depth / 2 - 30,
  };

  // Vet clinic — small pastel-green building along the sidewalk. Carry
  // a sick cat here to heal it.
  const vet = buildVetClinic(VET_CENTER.x, VET_CENTER.z);
  g.add(vet);

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
  const wallM = mat({ color: "#e0d8c8", roughness: 0.85 });
  const trimM = mat({ color: "#5a4030" });

  // Floor (tile look)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    mat({ color: "#f2ecdc", roughness: 0.7 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.01, -3);
  g.add(floor);

  // Back wall
  const back = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.2), wallM);
  back.position.set(0, 2, -6);
  g.add(back);
  // Side walls
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 6), wallM);
  sideL.position.set(-4, 2, -3);
  g.add(sideL);
  const sideR = sideL.clone();
  sideR.position.x = 4;
  g.add(sideR);
  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.1, 6),
    mat({ color: "#f6f0e0", roughness: 0.9 }),
  );
  ceiling.position.set(0, 4, -3);
  g.add(ceiling);

  // Front wall: panels leaving a center door + two big glass windows
  // Corner pillars and lintel
  const corner = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 0.2), wallM);
  corner.position.set(-3.7, 2, 0);
  g.add(corner);
  const cornerR = corner.clone();
  cornerR.position.x = 3.7;
  g.add(cornerR);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 0.2), wallM);
  lintel.position.set(0, 3.4, 0);
  g.add(lintel);
  // Low walls under each window
  const sill = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 0.2), wallM);
  sill.position.set(-2.1, 0.4, 0);
  g.add(sill);
  const sillR = sill.clone();
  sillR.position.x = 2.1;
  g.add(sillR);
  // Mullions between door and windows
  const mull = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.2), wallM);
  mull.position.set(-0.9, 1.4, 0);
  g.add(mull);
  const mullR = mull.clone();
  mullR.position.x = 0.9;
  g.add(mullR);

  // Glass windows (see the food inside!)
  const glassM = mat({
    color: "#cfe9ff",
    roughness: 0.15,
    metalness: 0.0,
    transparent: true,
    opacity: 0.25,
  });
  for (const wx of [-2.1, 2.1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 0.04), glassM);
    w.position.set(wx, 1.8, 0);
    g.add(w);
    // window frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.06, 0.05),
      trimM,
    );
    frame.position.set(wx, 0.8, 0.06);
    g.add(frame);
    const frame2 = frame.clone();
    frame2.position.y = 2.8;
    g.add(frame2);
  }

  // Glass double doors
  const doorM = mat({
    color: "#cfe9ff",
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.3,
  });
  const doorGeo = new THREE.BoxGeometry(0.78, 2.6, 0.06);
  const doorL = new THREE.Mesh(doorGeo, doorM);
  doorL.position.set(-0.4, 1.3, 0);
  doorL.name = "sm-door-l";
  g.add(doorL);
  const doorR = new THREE.Mesh(doorGeo, doorM);
  doorR.position.set(0.4, 1.3, 0);
  doorR.name = "sm-door-r";
  g.add(doorR);
  // Stash the doors on userData so the caller can animate them directly.
  g.userData.doors = { left: doorL, right: doorR, baseLX: -0.4, baseRX: 0.4 };
  // door frame
  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.1, 0.12),
    trimM,
  );
  doorFrame.position.set(0, 2.65, 0.05);
  g.add(doorFrame);
  // handles
  const handleM = mat({ color: "#c0c0c0", metalness: 0.7, roughness: 0.3 });
  for (const hx of [-0.08, 0.08]) {
    const h = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8),
      handleM,
    );
    h.rotation.z = Math.PI / 2;
    h.position.set(hx, 1.3, 0.07);
    g.add(h);
  }

  // Pitched roof
  const roofG = new THREE.BoxGeometry(8.4, 0.3, 6.4);
  const roof = new THREE.Mesh(roofG, mat({ color: "#8a4d3a" }));
  roof.position.set(0, 4.2, -3);
  g.add(roof);

  // Signboard
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
  sign.position.set(0, 3.4, 0.11);
  g.add(sign);

  // Awning
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.08, 0.8),
    mat({ color: "#ef476f" }),
  );
  awning.position.set(0, 2.9, 0.45);
  g.add(awning);

  // --- Interior: produce shelves ---
  g.add(makeMarketShelf(-2.6, -4.6, 2.4));
  g.add(makeMarketShelf(2.6, -4.6, 2.4));
  const mid = makeMarketShelf(0, -4.8, 2.0);
  g.add(mid);

  // --- Register counter + cashier ---
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.95, 0.7),
    mat({ color: "#9c6d3f" }),
  );
  counter.position.set(1.6, 0.475, -1.4);
  g.add(counter);
  const register = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.28, 0.26),
    mat({ color: "#3a4f63", metalness: 0.4 }),
  );
  register.position.set(2.2, 1.1, -1.4);
  g.add(register);
  // little screen
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.1, 0.02),
    mat({ color: "#86ff9f", emissive: "#86ff9f", emissiveIntensity: 0.4 }),
  );
  screen.position.set(2.2, 1.15, -1.27);
  g.add(screen);
  // basket
  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.12, 0.3),
    mat({ color: "#c97a5a" }),
  );
  basket.position.set(1.0, 1.0, -1.4);
  g.add(basket);
  // some items on the counter
  const items = ["#ec4899", "#f59e0b", "#86d8a6"];
  for (let i = 0; i < 3; i++) {
    const it = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.16, 0.1),
      mat({ color: items[i] }),
    );
    it.position.set(0.85 + i * 0.14, 1.1, -1.4);
    g.add(it);
  }

  // Cashier figure (low-poly, static)
  g.add(makeCashier(2.0, -1.9));

  // Ceiling lights (glow-only, no real point lights to keep perf)
  for (const lx of [-2, 0, 2]) {
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.06, 0.25),
      mat({ color: "#fff4d0", emissive: "#fff4d0", emissiveIntensity: 0.5 }),
    );
    lamp.position.set(lx, 3.95, -3);
    g.add(lamp);
  }

  g.position.set(x, 0, z);
  return g;
}

/** Simple pastel-green vet clinic sitting by the sidewalk. Door faces
 *  -X (toward the bakery-to-supermarket path). The clinic has a big
 *  red medical cross on the facade so it reads at a glance. */
export function buildVetClinic(cx: number, cz: number): THREE.Group {
  const g = new THREE.Group();
  const W = 5;
  const D = 5;
  const H = 3.2;
  const wallM = mat({ color: "#d8ebd3", roughness: 0.85 });
  const trimM = mat({ color: "#4e7a55", roughness: 0.6 });
  const crossM = mat({ color: "#e35a5a", roughness: 0.6 });
  const glassM = mat({
    color: "#bcd6e6",
    roughness: 0.25,
    transparent: true,
    opacity: 0.7,
  });
  const floorM = mat({ color: "#f4f7f0", roughness: 0.7 });

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorM);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.01, 0);
  g.add(floor);

  // Back + side walls
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.2), wallM);
  back.position.set(0, H / 2, D / 2);
  g.add(back);
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.2, H, D), wallM);
  sideL.position.set(-W / 2, H / 2, 0);
  g.add(sideL);
  const sideR = sideL.clone();
  sideR.position.x = W / 2;
  g.add(sideR);

  // Front wall with a door-sized gap on the -X side. We build it as two
  // panels + a lintel so the player can walk in.
  const doorW = 1.4;
  const doorH = 2.3;
  const frontFull = W; // wall width
  const leftPanelW = (frontFull - doorW) / 2 - 0.2;
  const rightPanelW = frontFull - doorW - leftPanelW;
  const frontLeft = new THREE.Mesh(
    new THREE.BoxGeometry(leftPanelW, H, 0.2),
    wallM,
  );
  frontLeft.position.set(-W / 2 + leftPanelW / 2, H / 2, -D / 2);
  g.add(frontLeft);
  const frontRight = new THREE.Mesh(
    new THREE.BoxGeometry(rightPanelW, H, 0.2),
    wallM,
  );
  frontRight.position.set(W / 2 - rightPanelW / 2, H / 2, -D / 2);
  g.add(frontRight);
  const frontLintel = new THREE.Mesh(
    new THREE.BoxGeometry(doorW + 0.2, H - doorH, 0.2),
    wallM,
  );
  frontLintel.position.set(
    -W / 2 + leftPanelW + 0.1 + doorW / 2,
    doorH + (H - doorH) / 2,
    -D / 2,
  );
  g.add(frontLintel);

  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, D), floorM);
  ceiling.position.set(0, H, 0);
  g.add(ceiling);

  // Pitched roof on top (simple pyramid)
  const roofGeo = new THREE.ConeGeometry(W * 0.78, 1.2, 4);
  const roof = new THREE.Mesh(roofGeo, trimM);
  roof.position.set(0, H + 0.6, 0);
  roof.rotation.y = Math.PI / 4;
  g.add(roof);

  // Giant red medical cross on the front wall (two boxes overlapping)
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.05), crossM);
  crossH.position.set(W / 2 - 1.0, H - 0.7, -D / 2 - 0.06);
  g.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.05), crossM);
  crossV.position.copy(crossH.position);
  g.add(crossV);

  // Window on the left of the door — frame behind, glass in front.
  const winFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.0, 0.04),
    trimM,
  );
  winFrame.position.set(-W / 2 + leftPanelW / 2, 1.6, -D / 2 - 0.01);
  g.add(winFrame);
  const window1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.08),
    glassM,
  );
  window1.position.set(-W / 2 + leftPanelW / 2, 1.6, -D / 2 - 0.05);
  g.add(window1);

  // Signboard over the door
  const signTex = signboardTexture("🐾 VET CLINIC", "#4e7a55");
  const signGeo = new THREE.PlaneGeometry(2.2, 0.6);
  const sign = new THREE.Mesh(
    signGeo,
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true }),
  );
  sign.position.set(0, H - 0.35, -D / 2 - 0.12);
  g.add(sign);

  // Interior: exam table, vet stool, cat bed, shelf
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.1, 0.8),
    mat({ color: "#f6f4ee", roughness: 0.4 }),
  );
  tableTop.position.set(0.4, 0.85, 0.8);
  g.add(tableTop);
  const tableLegGeo = new THREE.BoxGeometry(0.08, 0.8, 0.08);
  for (const sx of [-0.6, 0.6]) {
    for (const sz of [-0.35, 0.35]) {
      const leg = new THREE.Mesh(tableLegGeo, trimM);
      leg.position.set(0.4 + sx, 0.4, 0.8 + sz);
      g.add(leg);
    }
  }
  // Stethoscope (dark ring + tubes) resting on the table
  const stethoRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.015, 6, 14),
    mat({ color: "#1f2a30" }),
  );
  stethoRing.rotation.x = Math.PI / 2;
  stethoRing.position.set(0.1, 0.93, 0.95);
  g.add(stethoRing);

  // Cat bed on the floor
  const bed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.6, 0.18, 18),
    mat({ color: "#c88aa8" }),
  );
  bed.position.set(-W / 2 + 0.8, 0.09, 1.2);
  g.add(bed);
  const bedInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.05, 18),
    mat({ color: "#f6d3e2" }),
  );
  bedInner.position.set(-W / 2 + 0.8, 0.18, 1.2);
  g.add(bedInner);

  // Medicine shelf on the back wall
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.06, 0.3),
    trimM,
  );
  shelf.position.set(-W / 2 + 1.4, 1.8, D / 2 - 0.2);
  g.add(shelf);
  // Bottles on the shelf
  const bottleColors = ["#e08a8a", "#8fc3e0", "#b8d49a", "#e6c77a"];
  for (let i = 0; i < 4; i++) {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10),
      mat({ color: bottleColors[i] }),
    );
    bottle.position.set(-W / 2 + 0.6 + i * 0.45, 1.94, D / 2 - 0.2);
    g.add(bottle);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10),
      mat({ color: "#444" }),
    );
    cap.position.set(-W / 2 + 0.6 + i * 0.45, 2.07, D / 2 - 0.2);
    g.add(cap);
  }

  // Vet NPC behind the table — a seated character builder for warmth.
  const vet = makeCharacter({
    skin: "#eec4a6",
    shirt: "#f6f4ee",
    pants: "#4e7a55",
    hair: "#3a2418",
    hairStyle: "bun",
  });
  vet.root.position.set(0.4, 0, 1.9);
  vet.root.rotation.y = Math.PI; // face -Z (toward player walking in)
  g.add(vet.root);
  g.userData.vetFig = vet;

  g.position.set(cx, 0, cz);
  // Rotate so the door opening at -Z side points toward the sidewalk (-X).
  g.rotation.y = Math.PI / 2;
  return g;
}

function makeMarketShelf(x: number, z: number, height: number): THREE.Group {
  const g = new THREE.Group();
  const frameM = mat({ color: "#b6b4a9" });
  const w = 2.0;
  const d = 0.5;
  // back board
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, 0.04),
    frameM,
  );
  back.position.set(0, height / 2, -d / 2);
  g.add(back);
  // sides
  const side = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, height, d),
    frameM,
  );
  side.position.set(-w / 2, height / 2, 0);
  g.add(side);
  const side2 = side.clone();
  side2.position.x = w / 2;
  g.add(side2);
  // shelves with produce boxes
  const productColors = [
    "#ef4444",
    "#f59e0b",
    "#facc15",
    "#86d8a6",
    "#60a5fa",
    "#a78bfa",
    "#ec4899",
    "#fbbf24",
  ];
  const shelfCount = Math.max(2, Math.floor(height / 0.45));
  for (let s = 0; s < shelfCount; s++) {
    const sy = 0.15 + s * (height - 0.2) / shelfCount;
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.04, d),
      frameM,
    );
    shelf.position.set(0, sy, 0);
    g.add(shelf);
    // 4 product boxes per shelf
    for (let p = 0; p < 4; p++) {
      const color = productColors[(s * 4 + p) % productColors.length];
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.3, 0.3),
        mat({ color }),
      );
      box.position.set(-w / 2 + 0.3 + p * 0.46, sy + 0.18, 0);
      g.add(box);
      // tiny "label" accent
      const label = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.06, 0.01),
        mat({ color: "#fff" }),
      );
      label.position.set(box.position.x, sy + 0.18, 0.16);
      g.add(label);
    }
  }
  g.position.set(x, 0, z);
  return g;
}

function makeCashier(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  const skinM = mat({ color: "#f3c8a4" });
  const shirtM = mat({ color: "#3aa1d0" });
  const pantsM = mat({ color: "#2a2a2a" });
  const hairM = mat({ color: "#3a2418" });
  const eyeM = mat({ color: "#1a1008" });
  // legs
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.75, 10),
    pantsM,
  );
  leg.position.set(-0.1, 0.375, 0);
  g.add(leg);
  const leg2 = leg.clone();
  leg2.position.x = 0.1;
  g.add(leg2);
  // torso (uniform with blue apron) — oval rather than boxy
  const torso = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 14),
    shirtM,
  );
  torso.scale.set(0.24, 0.3, 0.14);
  torso.position.set(0, 1.03, 0);
  g.add(torso);
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.6, 0.03),
    mat({ color: "#ef4444" }),
  );
  apron.position.set(0, 0.9, 0.14);
  g.add(apron);
  // arms
  const armGeo = new THREE.CapsuleGeometry(0.07, 0.28, 6, 10);
  const arm = new THREE.Mesh(armGeo, shirtM);
  arm.position.set(-0.3, 1.05, 0);
  g.add(arm);
  const arm2 = arm.clone();
  arm2.position.x = 0.3;
  g.add(arm2);
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 22, 18), skinM);
  head.position.set(0, 1.5, 0);
  g.add(head);
  // hair
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.148, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairM,
  );
  hair.position.set(0, 1.53, 0);
  g.add(hair);
  // eyes
  for (const ex of [-0.05, 0.05]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), eyeM);
    e.position.set(ex, 1.52, 0.12);
    g.add(e);
  }
  // visor/name tag hint
  const tag = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.06, 0.02),
    mat({ color: "#fff" }),
  );
  tag.position.set(0.12, 1.2, 0.14);
  g.add(tag);

  g.position.set(x, 0, z);
  g.rotation.y = Math.PI; // face the front door
  return g;
}

/* ---------------- CAT CAFE BASEMENT ---------------- */

export type CatPose = "sit" | "loaf" | "sleep" | "stretch";
export interface CatSpec {
  name: string;
  personality: string;
  color: string;
  accent: string;
  pose: CatPose;
  pos: [number, number, number]; // local to basement group
  yaw: number;
  /** Hidden favorite treat recipe — only revealed in the cat's profile
   *  after the player has fed them enough. */
  favTreat: string;
  /** Hidden favorite toy recipe id. */
  favToy: string;
}

// Positions are in BASEMENT-local coords. Counter top y ≈ 1.00, cushion
// top y ≈ 0.22. Cats with feet at y=0 are placed on the floor.
export const CAT_CAFE_CATS: CatSpec[] = [
  {
    name: "Mochi",
    personality: "Sleepy barista",
    color: "#f0e1c0",
    accent: "#c8a674",
    pose: "loaf",
    pos: [-2.4, 1.0, 4.3],
    yaw: Math.PI * 0.9,
    favTreat: "cat_fish",
    favToy: "feather_wand_toy",
  },
  {
    name: "Espresso",
    personality: "Scruffy bean fiend",
    color: "#6b4a33",
    accent: "#3d2a1e",
    pose: "sit",
    pos: [-1.2, 0, 0.2],
    yaw: -0.5,
    favTreat: "dog_bone",
    favToy: "rope_tug_toy",
  },
  {
    name: "Latte",
    personality: "Queen of the cushion",
    color: "#fff4ec",
    accent: "#f7dfc4",
    pose: "sleep",
    pos: [0, 0.22, -1.2],
    yaw: 0.4,
    favTreat: "cat_fish",
    favToy: "tennis_ball_toy",
  },
  {
    name: "Muffin",
    personality: "Steals biscotti",
    color: "#caa980",
    accent: "#a07a4a",
    pose: "sit",
    pos: [3.5, 0, 1.0],
    yaw: Math.PI * 0.55,
    favTreat: "dog_bone",
    favToy: "feather_wand_toy",
  },
  {
    name: "Biscuit",
    personality: "Sun-patch napper",
    color: "#e3b36a",
    accent: "#a07a1a",
    pose: "stretch",
    pos: [1.4, 0, -3.2],
    yaw: -Math.PI / 2,
    favTreat: "cat_fish",
    favToy: "rubber_bone_toy",
  },
];

/** Chibi 3D cat. Poses are baked into the local transforms of the body,
 *  head and tail groups. The head + tail are returned via userData so the
 *  render loop can animate breathing and tail-flicks. */
export function makeCat3D(spec: CatSpec): THREE.Group {
  const g = new THREE.Group();
  g.name = `cat_${spec.name.toLowerCase()}`;
  const body = mat({ color: spec.color, roughness: 0.9 });
  const accent = mat({ color: spec.accent, roughness: 0.9 });
  const pink = mat({ color: "#ffbad1", roughness: 0.9 });
  const hotPink = mat({ color: "#ff5e85", roughness: 0.9 });
  const white = mat({ color: "#ffffff", roughness: 0.7 });
  const dark = mat({ color: "#1c110a", roughness: 0.7 });

  const torso = new THREE.Group();
  g.add(torso);
  const head = new THREE.Group();
  g.add(head);
  const tail = new THREE.Group();
  g.add(tail);

  if (spec.pose === "sit") {
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), body);
    belly.scale.set(1, 1.25, 1);
    belly.position.y = 0.22;
    torso.add(belly);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), accent);
    chest.position.set(0.05, 0.22, 0);
    chest.scale.set(0.6, 1.1, 0.6);
    torso.add(chest);
    // Little front paws in front of the belly so the cat is clearly
    // grounded rather than floating.
    for (const pz of [-0.08, 0.08]) {
      const paw = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 8),
        body,
      );
      paw.position.set(0.16, 0.05, pz);
      paw.scale.set(1.1, 0.55, 1);
      torso.add(paw);
    }
    // Haunches showing the back legs tucked under.
    for (const pz of [-0.12, 0.12]) {
      const haunch = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 10),
        body,
      );
      haunch.position.set(-0.08, 0.08, pz);
      haunch.scale.set(1.2, 0.65, 1);
      torso.add(haunch);
    }
    head.position.set(0.1, 0.5, 0);
    const tailCurve = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.04, 8, 20, Math.PI * 1.2),
      body,
    );
    tailCurve.position.set(-0.18, 0.18, 0);
    tailCurve.rotation.y = Math.PI / 2;
    tailCurve.rotation.x = Math.PI;
    tail.add(tailCurve);
  } else if (spec.pose === "loaf") {
    const loaf = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.18, 8, 14),
      body,
    );
    loaf.rotation.z = Math.PI / 2;
    loaf.position.y = 0.14;
    torso.add(loaf);
    head.position.set(0.22, 0.26, 0);
    const tailCurled = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.035, 8, 16, Math.PI * 1.4),
      body,
    );
    tailCurled.position.set(-0.22, 0.16, 0.1);
    tailCurled.rotation.y = 0.5;
    tail.add(tailCurled);
  } else if (spec.pose === "sleep") {
    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 14), body);
    curl.scale.set(1.3, 0.55, 1);
    curl.position.y = 0.11;
    torso.add(curl);
    // head tucked on a paw
    head.position.set(-0.18, 0.15, 0.08);
    head.rotation.z = 0.25;
    const wrapped = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.04, 8, 22, Math.PI * 1.2),
      body,
    );
    wrapped.position.set(0.08, 0.1, 0);
    wrapped.rotation.x = Math.PI / 2;
    wrapped.rotation.z = 0.6;
    tail.add(wrapped);
  } else {
    // stretch — low, long body with head way forward
    const stretched = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.4, 8, 14),
      body,
    );
    stretched.rotation.z = Math.PI / 2;
    stretched.position.y = 0.12;
    torso.add(stretched);
    // front paws forward
    for (const zf of [-0.05, 0.05]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.14, 10),
        body,
      );
      leg.position.set(0.3, 0.07, zf);
      torso.add(leg);
    }
    head.position.set(0.36, 0.12, 0);
    head.rotation.z = -0.3;
    const tailUp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.02, 0.35, 8),
      body,
    );
    tailUp.position.set(-0.3, 0.25, 0);
    tailUp.rotation.z = -0.6;
    tail.add(tailUp);
  }

  // ---- HEAD (common) ----
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 14), body);
  skull.scale.set(1, 0.95, 1);
  head.add(skull);
  // Pointy cat ears
  const earGeo = new THREE.ConeGeometry(0.05, 0.12, 10);
  const earL = new THREE.Mesh(earGeo, body);
  earL.position.set(-0.02, 0.14, 0.08);
  head.add(earL);
  const earR = earL.clone();
  earR.position.z = -0.08;
  head.add(earR);
  const innerGeo = new THREE.ConeGeometry(0.025, 0.075, 10);
  const innerL = new THREE.Mesh(innerGeo, pink);
  innerL.position.set(-0.01, 0.13, 0.08);
  head.add(innerL);
  const innerR = innerL.clone();
  innerR.position.z = -0.08;
  head.add(innerR);
  // Rosy cheeks
  const cheekGeo = new THREE.CircleGeometry(0.028, 14);
  const cheekM = mat({ color: "#ff92ae" });
  const cheekL = new THREE.Mesh(cheekGeo, cheekM);
  cheekL.position.set(0.1, -0.01, 0.09);
  cheekL.rotation.y = Math.PI / 2;
  head.add(cheekL);
  const cheekR = cheekL.clone();
  cheekR.position.z = -0.09;
  head.add(cheekR);
  // Closed happy eyes (tiny crescents) — except when sleeping (then zzz).
  const eyeGeo = new THREE.TorusGeometry(0.025, 0.005, 6, 14, Math.PI);
  const eyeL = new THREE.Mesh(eyeGeo, dark);
  eyeL.position.set(0.12, 0.02, 0.06);
  eyeL.rotation.y = -Math.PI / 2;
  eyeL.rotation.z = Math.PI; // arc opens downward → happy blink
  head.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.06;
  head.add(eyeR);
  // Pink nose
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 12, 10),
    hotPink,
  );
  nose.position.set(0.14, -0.02, 0);
  nose.scale.set(0.9, 0.7, 1.1);
  head.add(nose);
  // Smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.02, 0.004, 6, 14, Math.PI),
    dark,
  );
  smile.position.set(0.14, -0.06, 0);
  smile.rotation.y = -Math.PI / 2;
  smile.rotation.z = Math.PI;
  head.add(smile);
  // Whiskers — straight, sticking horizontally out of each cheek.
  const whiskerM = mat({ color: "#fdf6de" });
  const whiskerGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.12, 4);
  for (const side of [1, -1]) {
    for (const dy of [0.015, -0.005, -0.025]) {
      const w = new THREE.Mesh(whiskerGeo, whiskerM);
      // Cylinder native along Y → rotate around X to align with Z axis.
      w.rotation.x = Math.PI / 2;
      // Place centre outside the cheek so the whisker extends fully into fresh air.
      w.position.set(0.14, dy, (0.08 + 0.06) * side);
      head.add(w);
    }
  }
  // Sleepy "zz" sprite if this cat is snoozing
  if (spec.pose === "sleep") {
    const zzM = mat({ color: "#7a3f20" });
    for (let i = 0; i < 2; i++) {
      const zz = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.01, 0.04),
        zzM,
      );
      zz.position.set(-0.06, 0.22 + i * 0.08, 0.14 + i * 0.06);
      zz.rotation.z = 0.6;
      head.add(zz);
    }
  }

  g.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
  g.rotation.y = spec.yaw;
  // Shadow nub underneath
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 18),
    mat({ color: "#000000", transparent: true, opacity: 0.18 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  g.add(shadow);

  void white; // reserved for future sparkle highlights
  g.userData.cat = {
    head,
    tail,
    pose: spec.pose,
    name: spec.name,
    favTreat: spec.favTreat,
    favToy: spec.favToy,
    baseHeadY: head.position.y,
    baseHeadRotX: head.rotation.x,
    baseHeadRotZ: head.rotation.z,
  };
  return g;
}

/**
 * Cozy basement room for the cat cafe. Placed far away at BASEMENT.cz so
 * it doesn't collide with the bakery/outdoor/supermarket zones. Includes
 * walls, warm wood floor, an L-shaped service counter, a coffee bar with
 * espresso machine, a bookshelf, a big pink floor cushion, a braided rug,
 * an "upstairs" staircase, warm pendant lights and the 5 resident cats.
 *
 * The returned group also exposes `userData.cats` (array of cat groups)
 * and `userData.lamps` (array of point lights) so the render loop can
 * animate them.
 */
export function buildCatCafeBasement(): THREE.Group {
  const g = new THREE.Group();
  g.name = "cat_cafe_basement";
  g.position.set(BASEMENT.cx, 0, BASEMENT.cz);

  const W = BASEMENT.width;
  const D = BASEMENT.depth;
  const H = BASEMENT.height;

  const floorTex = woodPlankFloorTexture();
  floorTex.repeat.set(3, 3);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    mat({ map: floorTex, roughness: 0.7 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  // Coffee-shop vibe: deep forest-green walls with warm dark-wood trim.
  const wallM = mat({ color: "#34503f", roughness: 0.95 });
  const trimM = mat({ color: "#5a3a22", roughness: 0.6 });

  // Back wall (far +Z)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallM);
  backWall.position.set(0, H / 2, D / 2);
  backWall.rotation.y = Math.PI;
  g.add(backWall);
  // Front wall (near -Z) with a stairwell opening centred around x=0
  const stairOpeningW = 2.0;
  const leftFrontW = (W - stairOpeningW) / 2;
  if (leftFrontW > 0) {
    const fL = new THREE.Mesh(new THREE.PlaneGeometry(leftFrontW, H), wallM);
    fL.position.set(-W / 2 + leftFrontW / 2, H / 2, -D / 2);
    g.add(fL);
    const fR = new THREE.Mesh(new THREE.PlaneGeometry(leftFrontW, H), wallM);
    fR.position.set(W / 2 - leftFrontW / 2, H / 2, -D / 2);
    g.add(fR);
  }
  // Lintel above the stair opening
  const lintelH = H - 2.4;
  if (lintelH > 0) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(stairOpeningW, lintelH), wallM);
    l.position.set(0, 2.4 + lintelH / 2, -D / 2);
    g.add(l);
  }
  // Side walls
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallM);
  leftWall.position.set(-W / 2, H / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  g.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallM);
  rightWall.position.set(W / 2, H / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  g.add(rightWall);
  // Ceiling — slightly lowered to feel cozy
  const ceil = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.02, 0.06, D - 0.02),
    mat({ color: "#241811", roughness: 0.9 }),
  );
  ceil.position.set(0, H + 0.03, 0);
  g.add(ceil);

  // Floor trim
  const trimGeo1 = new THREE.BoxGeometry(W, 0.1, 0.04);
  const t1 = new THREE.Mesh(trimGeo1, trimM);
  t1.position.set(0, 0.05, D / 2 - 0.02);
  g.add(t1);
  const t2 = t1.clone();
  t2.position.z = -D / 2 + 0.02;
  g.add(t2);
  const trimGeo2 = new THREE.BoxGeometry(D, 0.1, 0.04);
  const t3 = new THREE.Mesh(trimGeo2, trimM);
  t3.rotation.y = Math.PI / 2;
  t3.position.set(-W / 2 + 0.02, 0.05, 0);
  g.add(t3);
  const t4 = t3.clone();
  t4.position.x = W / 2 - 0.02;
  g.add(t4);

  // ---- L-shaped counter ----
  // Long arm runs along the back wall (+Z side) from x=-W/2 to about x=1.
  // Short arm juts forward (toward -Z) from the left end.
  const topTex = counterTopTexture();
  topTex.repeat.set(2, 1);
  const topM = mat({ map: topTex, roughness: 0.5 });
  // Espresso-stained oak base with a mossy-green accent stripe.
  const baseM = mat({ color: "#4a2f1c", roughness: 0.85 });
  const baseTrim = mat({ color: "#2a3d30", roughness: 0.7 });

  // Long arm
  const longLen = 6.4;
  const longDepth = 0.9;
  const longCX = -W / 2 + longLen / 2 + 0.4;
  const longCZ = D / 2 - 1.2;
  const longBase = new THREE.Mesh(
    new THREE.BoxGeometry(longLen, 0.95, longDepth),
    baseM,
  );
  longBase.position.set(longCX, 0.475, longCZ);
  g.add(longBase);
  const longTop = new THREE.Mesh(
    new THREE.BoxGeometry(longLen + 0.06, 0.06, longDepth + 0.06),
    topM,
  );
  longTop.position.set(longCX, 0.97, longCZ);
  g.add(longTop);
  // Decorative vertical panel stripes on the long arm
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.85, 0.02),
      baseTrim,
    );
    stripe.position.set(
      longCX - longLen / 2 + 0.6 + i * 1.3,
      0.45,
      longCZ - longDepth / 2 - 0.005,
    );
    g.add(stripe);
  }

  // Short arm perpendicular
  const shortLen = 2.4;
  const shortDepth = 0.9;
  const shortCX = longCX - longLen / 2 + shortDepth / 2;
  const shortCZ = longCZ - longDepth / 2 - shortLen / 2 + 0.05;
  const shortBase = new THREE.Mesh(
    new THREE.BoxGeometry(shortDepth, 0.95, shortLen),
    baseM,
  );
  shortBase.position.set(shortCX, 0.475, shortCZ);
  g.add(shortBase);
  const shortTop = new THREE.Mesh(
    new THREE.BoxGeometry(shortDepth + 0.06, 0.06, shortLen + 0.06),
    topM,
  );
  shortTop.position.set(shortCX, 0.97, shortCZ);
  g.add(shortTop);
  // Vertical paneling on the short arm's room-facing side (+X)
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.85, 0.04),
      baseTrim,
    );
    stripe.position.set(
      shortCX + shortDepth / 2 + 0.005,
      0.45,
      shortCZ - shortLen / 2 + 0.35 + i * 0.55,
    );
    g.add(stripe);
  }

  // Stash counter colliders so BakeryWorld3D can apply them
  g.userData.counterColliders = [
    { x: BASEMENT.cx + longCX, z: BASEMENT.cz + longCZ, w: longLen, d: longDepth },
    {
      x: BASEMENT.cx + shortCX,
      z: BASEMENT.cz + shortCZ,
      w: shortDepth,
      d: shortLen,
    },
  ];

  // ---- Espresso machine + cups on the long arm ----
  const chrome = mat({ color: "#d8dce4", metalness: 0.6, roughness: 0.3 });
  const black = mat({ color: "#1a1a1a", roughness: 0.6 });
  const machine = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.45, 0.4),
    chrome,
  );
  machine.position.set(longCX - 1.2, 1.225, longCZ + 0.15);
  g.add(machine);
  // Top warmer
  const warmer = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.08, 0.35),
    black,
  );
  warmer.position.set(longCX - 1.2, 1.49, longCZ + 0.15);
  g.add(warmer);
  // Portafilter arms
  for (const dx of [-0.22, 0.22]) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8),
      black,
    );
    arm.position.set(longCX - 1.2 + dx, 1.05, longCZ);
    arm.rotation.x = Math.PI / 2;
    g.add(arm);
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.04, 0.08, 14),
      mat({ color: "#efe3c8", roughness: 0.5 }),
    );
    cup.position.set(longCX - 1.2 + dx, 1.01, longCZ - 0.22);
    g.add(cup);
  }
  // Steam wand
  const wand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8),
    chrome,
  );
  wand.position.set(longCX - 0.75, 1.3, longCZ);
  wand.rotation.z = 0.3;
  g.add(wand);

  // A row of mug saucers, nudged toward the customer side of the counter.
  const saucerM = mat({ color: "#d8c49a", roughness: 0.5 });
  const mugM = mat({ color: "#4a2f1c", roughness: 0.5 });
  for (let i = 0; i < 4; i++) {
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.015, 18),
      saucerM,
    );
    saucer.position.set(longCX + 0.2 + i * 0.3, 1.01, longCZ - 0.2);
    g.add(saucer);
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.1, 18),
      mugM,
    );
    mug.position.set(longCX + 0.2 + i * 0.3, 1.07, longCZ - 0.2);
    g.add(mug);
    // Little handle
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.01, 6, 10, Math.PI),
      mugM,
    );
    handle.position.set(longCX + 0.2 + i * 0.3 + 0.06, 1.07, longCZ - 0.2);
    handle.rotation.y = Math.PI / 2;
    g.add(handle);
  }

  // Chalkboard menu on the back wall above the long arm
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.0, 0.03),
    mat({ color: "#1e2a1e", roughness: 0.7 }),
  );
  board.position.set(longCX + 0.6, 2.0, D / 2 - 0.06);
  g.add(board);
  const boardFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 1.1, 0.02),
    mat({ color: "#8c5a36" }),
  );
  boardFrame.position.set(longCX + 0.6, 2.0, D / 2 - 0.075);
  g.add(boardFrame);
  // Chalk menu "lines" — rows of little white/pink box marks
  const chalkW = mat({ color: "#fff" });
  const chalkPink = mat({ color: "#e8c57a" }); // warm gold chalk accent
  for (let i = 0; i < 4; i++) {
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.04, 0.005),
      i % 2 ? chalkW : chalkPink,
    );
    head.position.set(longCX + 0.0, 2.25 - i * 0.22, D / 2 - 0.045);
    g.add(head);
    const price = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.04, 0.005),
      chalkW,
    );
    price.position.set(longCX + 1.3, 2.25 - i * 0.22, D / 2 - 0.045);
    g.add(price);
  }

  // ---- "Upstairs" staircase at the front wall stair opening ----
  // Player enters the basement at the deep end (+Z) and walks toward -Z
  // to reach the stairs. The stairs should rise AWAY from the player — the
  // lowest (bottom) step is closest to the player at higher z, and each
  // successive step rises y while receding toward the wall at -Z.
  const stepM = mat({ color: "#d7a975", roughness: 0.7 });
  const stepRise = 0.18;
  const stepRun = 0.26;
  const stairGeo = new THREE.BoxGeometry(1.7, 0.04, stepRun + 0.02);
  const stairBottomZ = -D / 2 + 1.8; // closest step to the player
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(stairGeo, stepM);
    s.position.set(0, 0.05 + i * stepRise, stairBottomZ - i * stepRun);
    g.add(s);
    // Riser under each step
    if (i > 0) {
      const riser = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, stepRise, 0.02),
        mat({ color: "#8c5a36", roughness: 0.8 }),
      );
      riser.position.set(
        0,
        0.05 + (i - 0.5) * stepRise,
        stairBottomZ - i * stepRun + stepRun / 2,
      );
      g.add(riser);
    }
  }
  // "Dark up-ramp" at the top of the steps — reads as "the stairwell
  // continues up into darkness toward the bakery floor above".
  const darkPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 2.0),
    mat({ color: "#1a0f0a", roughness: 1 }),
  );
  darkPanel.position.set(0, 1.45, -D / 2 + 0.04);
  g.add(darkPanel);
  // A thin wooden landing slab where the dark opening begins
  const landing = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.06, 0.4),
    stepM,
  );
  landing.position.set(0, 0.05 + 5 * stepRise + 0.04, -D / 2 + 0.25);
  g.add(landing);

  // Handrails — slope downward from the wall (high y) toward the player
  // (low y) matching the step direction.
  const railM = mat({ color: "#3d2617", roughness: 0.5 });
  const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.9, 10);
  for (const sx of [-0.85, 0.85]) {
    const r = new THREE.Mesh(railGeo, railM);
    r.position.set(sx, 0.85, -D / 2 + 0.9);
    // Rotate so the high end is at -Z (wall) and low end is at +Z (player).
    r.rotation.x = -Math.atan2(5 * stepRise, 5 * stepRun);
    g.add(r);
    // Newel posts at the bottom
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.95, 10),
      railM,
    );
    post.position.set(sx, 0.45, stairBottomZ + 0.05);
    g.add(post);
    // Ball top on each newel
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      mat({ color: "#c9a15c", roughness: 0.4, metalness: 0.5 }), // brass ball top
    );
    ball.position.set(sx, 0.95, stairBottomZ + 0.05);
    g.add(ball);
  }
  // ↑ sign above the stairs
  const exitSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.34, 0.03),
    mat({ color: "#fff2da" }),
  );
  exitSign.position.set(0, 2.7, -D / 2 + 0.06);
  g.add(exitSign);
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.18, 8),
    mat({ color: "#c07040" }),
  );
  arrow.position.set(-0.25, 2.7, -D / 2 + 0.08);
  arrow.rotation.z = 0;
  g.add(arrow);
  for (let i = 0; i < 3; i++) {
    const letter = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.12, 0.01),
      mat({ color: "#8c5a36" }),
    );
    letter.position.set(-0.05 + i * 0.14, 2.7, -D / 2 + 0.08);
    g.add(letter);
  }

  // ---- Braided oval rug + big mossy-green floor cushion ----
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 32),
    mat({ color: "#3d2a1a", roughness: 0.95 }), // dark espresso ring
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.005, -0.5);
  rug.scale.set(1.2, 1, 1);
  g.add(rug);
  const rugInner = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 32),
    mat({ color: "#7a5a3a", roughness: 0.95 }), // warm caramel centre
  );
  rugInner.rotation.x = -Math.PI / 2;
  rugInner.position.set(0, 0.007, -0.5);
  rugInner.scale.set(1.2, 1, 1);
  g.add(rugInner);

  // Giant squishy cushion on the rug (Latte sleeps on this)
  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.2, 0.7),
    mat({ color: "#2f4a38", roughness: 0.9 }),
  );
  cushion.position.set(0, 0.12, -1.2);
  g.add(cushion);
  const cushionTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.08, 0.62),
    mat({ color: "#4a6b55", roughness: 0.9 }),
  );
  cushionTop.position.set(0, 0.25, -1.2);
  g.add(cushionTop);

  // ---- Bookshelf (against right wall, books + spines face the room) ----
  const shelfM = mat({ color: "#3d2617", roughness: 0.85 }); // dark walnut
  const shelfBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.0, 0.08),
    shelfM,
  );
  // Push back panel flush against the wall so shelves + books sit *in front*
  // of it, visible from the room side (the player was previously looking at
  // the back of the panel).
  shelfBack.position.set(W / 2 - 0.05, 1.05, 0);
  shelfBack.rotation.y = -Math.PI / 2;
  g.add(shelfBack);
  // Vertical side panels framing the bookcase
  const sideGeo = new THREE.BoxGeometry(0.5, 2.0, 0.05);
  for (const sz of [-0.7, 0.7]) {
    const sidePanel = new THREE.Mesh(sideGeo, shelfM);
    sidePanel.position.set(W / 2 - 0.3, 1.05, sz);
    g.add(sidePanel);
  }
  // Top cap + bottom kickplate
  const capGeo = new THREE.BoxGeometry(0.55, 0.05, 1.45);
  const cap = new THREE.Mesh(capGeo, shelfM);
  cap.position.set(W / 2 - 0.3, 2.07, 0);
  g.add(cap);
  const kick = new THREE.Mesh(capGeo, shelfM);
  kick.position.set(W / 2 - 0.3, 0.08, 0);
  g.add(kick);
  // Shelves + muted book spines in coffee-shop colours
  const bookColors = ["#6b4a2f", "#3d5c4a", "#8c5a36", "#4a6b55", "#5a3a2a"];
  for (let row = 0; row < 4; row++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.04, 1.35),
      shelfM,
    );
    shelf.position.set(W / 2 - 0.3, 0.35 + row * 0.45, 0);
    g.add(shelf);
    for (let b = 0; b < 5; b++) {
      const h = 0.28 + ((row + b) % 3) * 0.05;
      // Book bodies sit in front of the back panel, spines facing the room (-X).
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, h, 0.14),
        mat({ color: bookColors[(row + b) % bookColors.length], roughness: 0.9 }),
      );
      book.position.set(W / 2 - 0.3, 0.37 + row * 0.45 + h / 2, -0.52 + b * 0.26);
      g.add(book);
    }
  }

  // ---- Pendant lamps (cozy warm glow) ----
  const lampSpots: [number, number][] = [
    [-3, 1.5],
    [2.5, 1.5],
    [0, -2],
  ];
  const lampGroups: THREE.PointLight[] = [];
  for (const [lx, lz] of lampSpots) {
    // Use the existing pendant style by hand (tight inline to keep deps small)
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6),
      mat({ color: "#2a2118" }),
    );
    cord.position.set(lx, H - 0.3, lz);
    g.add(cord);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.24, 18, 1, true),
      mat({
        color: "#d7884a",
        roughness: 0.55,
        metalness: 0.3,
        side: THREE.DoubleSide,
      }),
    );
    shade.position.set(lx, H - 0.6, lz);
    shade.rotation.x = Math.PI;
    g.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 12),
      mat({
        color: "#fff3c4",
        emissive: "#fff0b4",
        emissiveIntensity: 1.4,
        roughness: 0.4,
      }),
    );
    bulb.position.set(lx, H - 0.7, lz);
    g.add(bulb);
    const pl = new THREE.PointLight("#ffd08a", 0.9, 7, 1.6);
    pl.position.set(lx, H - 0.75, lz);
    g.add(pl);
    lampGroups.push(pl);
  }

  // ---- Paw-print wall decals ----
  const pawM = mat({ color: "#8c5a36" });
  for (let i = 0; i < 4; i++) {
    const pawX = -W / 2 + 0.1;
    const pawY = 1.6 + (i % 2) * 0.4;
    const pawZ = -1.5 + i * 0.8;
    const pad = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 8),
      pawM,
    );
    pad.position.set(pawX, pawY, pawZ);
    pad.scale.set(0.1, 0.6, 0.6);
    g.add(pad);
    for (let t = 0; t < 4; t++) {
      const toe = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 6),
        pawM,
      );
      const ang = -Math.PI / 2 + (t - 1.5) * 0.4;
      toe.position.set(
        pawX,
        pawY + 0.07,
        pawZ + Math.sin(ang) * 0.08,
      );
      toe.scale.set(0.1, 0.4, 0.4);
      g.add(toe);
    }
  }

  // ---- Big potted fiddle-leaf plant in the back-left corner ----
  const potM = mat({ color: "#3d2617", roughness: 0.85 });
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.26, 0.55, 18),
    potM,
  );
  pot.position.set(-W / 2 + 0.7, 0.275, D / 2 - 0.7);
  g.add(pot);
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.04, 18),
    mat({ color: "#2a1810", roughness: 1 }),
  );
  soil.position.set(-W / 2 + 0.7, 0.56, D / 2 - 0.7);
  g.add(soil);
  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 1.4, 10),
    mat({ color: "#5a3a22", roughness: 0.9 }),
  );
  trunk.position.set(-W / 2 + 0.7, 1.28, D / 2 - 0.7);
  g.add(trunk);
  // Leaves — a cluster of flat rounded blobs
  const leafM = mat({ color: "#2f4a32", roughness: 0.9 });
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8),
      leafM,
    );
    const a = (i / 9) * Math.PI * 2;
    const y = 1.0 + (i % 3) * 0.35;
    leaf.position.set(
      -W / 2 + 0.7 + Math.cos(a) * 0.18,
      y,
      D / 2 - 0.7 + Math.sin(a) * 0.18,
    );
    leaf.scale.set(1.2, 0.5, 1.0);
    leaf.rotation.y = a;
    g.add(leaf);
  }

  // ---- Cat scratching post (near cushion) ----
  const postBaseM = mat({ color: "#5a3a22", roughness: 0.9 });
  const ropeM = mat({ color: "#c9a15c", roughness: 1 });
  const postBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.06, 0.4),
    postBaseM,
  );
  postBase.position.set(1.6, 0.03, -1.4);
  g.add(postBase);
  const postShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.9, 14),
    ropeM,
  );
  postShaft.position.set(1.6, 0.51, -1.4);
  g.add(postShaft);
  const postTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.06, 0.36),
    postBaseM,
  );
  postTop.position.set(1.6, 0.99, -1.4);
  g.add(postTop);
  // Dangling feather toy
  const feather = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.18, 8),
    mat({ color: "#c97070" }),
  );
  feather.position.set(1.72, 0.85, -1.4);
  feather.rotation.z = -0.3;
  g.add(feather);

  // ---- Food + water bowls on the floor ----
  const bowlMats = [
    mat({ color: "#6b4a2f", roughness: 0.7 }),
    mat({ color: "#4a6b55", roughness: 0.7 }),
  ];
  for (let i = 0; i < 2; i++) {
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.05, 18),
      bowlMats[i],
    );
    bowl.position.set(-1.7 + i * 0.35, 0.025, -1.4);
    g.add(bowl);
    // Contents — kibble is warm brown, water shimmery blue
    const contents = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16),
      mat({
        color: i === 0 ? "#8c5a36" : "#7fb3d9",
        roughness: i === 0 ? 0.9 : 0.3,
      }),
    );
    contents.position.set(-1.7 + i * 0.35, 0.06, -1.4);
    g.add(contents);
  }

  // ---- Framed painting on the left wall ----
  const paintBgM = mat({ color: "#8c5a36", roughness: 0.5 });
  const paintFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.8, 1.2),
    paintBgM,
  );
  paintFrame.position.set(-W / 2 + 0.04, 1.7, 2);
  g.add(paintFrame);
  const paintCanvas = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.7, 1.1),
    mat({ color: "#efe3c8", roughness: 0.9 }),
  );
  paintCanvas.position.set(-W / 2 + 0.08, 1.7, 2);
  g.add(paintCanvas);
  // A big cozy cat silhouette on the painting
  const paintCat = mat({ color: "#3d2617", roughness: 0.9 });
  const pcBody = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), paintCat);
  pcBody.position.set(-W / 2 + 0.1, 1.6, 2);
  pcBody.scale.set(0.12, 0.7, 1);
  g.add(pcBody);
  const pcHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), paintCat);
  pcHead.position.set(-W / 2 + 0.1, 1.82, 2.24);
  pcHead.scale.set(0.12, 1, 1);
  g.add(pcHead);
  for (const ex of [0, 0.06]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 6), paintCat);
    ear.position.set(-W / 2 + 0.1, 1.94, 2.2 + ex);
    ear.scale.set(0.25, 1, 1);
    g.add(ear);
  }

  // ---- A small cafe table with two seated patrons ----
  // Placed in front of the short arm of the L-counter so the scene feels
  // lived-in. Figures breathe via their update() call; BakeryWorld3D ticks
  // them each frame from userData.patronFigs.
  const tableM = mat({ color: "#5a3a22", roughness: 0.85 });
  const tableGroup = new THREE.Group();
  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.05, 24),
    mat({ color: "#6b4a2f", roughness: 0.7 }),
  );
  tableTop.position.y = 0.74;
  tableGroup.add(tableTop);
  const tableStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10),
    tableM,
  );
  tableStem.position.y = 0.39;
  tableGroup.add(tableStem);
  const tableBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.32, 0.05, 18),
    tableM,
  );
  tableBase.position.y = 0.025;
  tableGroup.add(tableBase);
  // Two mugs on the table
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? -0.2 : 0.2;
    const tmug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 0.1, 14),
      mat({ color: i === 0 ? "#4a2f1c" : "#8c5a36", roughness: 0.5 }),
    );
    tmug.position.set(sx, 0.82, 0.1);
    tableGroup.add(tmug);
    const th = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.009, 6, 10, Math.PI),
      mat({ color: i === 0 ? "#4a2f1c" : "#8c5a36" }),
    );
    th.position.set(sx + 0.055, 0.82, 0.1);
    th.rotation.y = Math.PI / 2;
    tableGroup.add(th);
  }
  // Little bud vase in the centre of the table
  const vase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.14, 10),
    mat({ color: "#4a6b55", roughness: 0.6 }),
  );
  vase.position.set(0, 0.85, 0);
  tableGroup.add(vase);
  const vaseFlower = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 10, 8),
    mat({ color: "#c97070", roughness: 0.8 }),
  );
  vaseFlower.position.set(0, 0.96, 0);
  tableGroup.add(vaseFlower);
  // Table positioned in the open floor space beside the short arm.
  tableGroup.position.set(-1.4, 0, 2.4);
  g.add(tableGroup);

  // Chairs facing each other across the table
  function makeSimpleChair(color: string): THREE.Group {
    const c = new THREE.Group();
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.06, 0.42),
      mat({ color, roughness: 0.8 }),
    );
    seat.position.y = 0.45;
    c.add(seat);
    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
    const legM = mat({ color: "#3d2617" });
    for (const [cx, cz] of [
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18],
    ] as const) {
      const leg = new THREE.Mesh(legGeo, legM);
      leg.position.set(cx, 0.225, cz);
      c.add(leg);
    }
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.55, 0.05),
      mat({ color, roughness: 0.8 }),
    );
    back.position.set(0, 0.76, -0.19);
    c.add(back);
    return c;
  }
  const chairA = makeSimpleChair("#6b4a2f");
  chairA.position.set(-1.4, 0, 2.4 + 0.85);
  chairA.rotation.y = Math.PI; // back faces +Z, seat faces -Z (toward table)
  g.add(chairA);
  const chairB = makeSimpleChair("#4a6b55");
  chairB.position.set(-1.4, 0, 2.4 - 0.85);
  chairB.rotation.y = 0;
  g.add(chairB);
  // A third "visitor" chair on the room side of the table — this is where
  // rotating bakery customers pop in for their cat session.
  const chairC = makeSimpleChair("#5a3a22");
  chairC.position.set(-1.4 + 0.85, 0, 2.4);
  chairC.rotation.y = -Math.PI / 2; // back faces +X, seat faces -X (toward table)
  g.add(chairC);

  // Seated NPC customers. The character builder's `seated` mode swaps the
  // standing legs for a horizontal thigh + dangling shins, and we drop the
  // root so the hips land on the chair seat (y=0.45) instead of their
  // feet-on-the-cushion danger pose.
  const SEAT_HIP_DROP = -0.31;
  const patronFigs: CharacterFigure[] = [];
  const patronA = makeCharacter({
    skin: "#f0c8a5",
    shirt: "#6b4a2f",
    pants: "#2a1a10",
    hair: "#3d2617",
    hairStyle: "short",
    seated: true,
  });
  patronA.root.position.set(-1.4, SEAT_HIP_DROP, 2.4 + 0.85);
  patronA.root.rotation.y = Math.PI;
  g.add(patronA.root);
  patronFigs.push(patronA);

  const patronB = makeCharacter({
    skin: "#d19270",
    shirt: "#3d5c4a",
    pants: "#2a1a10",
    hair: "#5a3a22",
    hairStyle: "bun",
    seated: true,
  });
  patronB.root.position.set(-1.4, SEAT_HIP_DROP, 2.4 - 0.85);
  patronB.root.rotation.y = 0;
  g.add(patronB.root);
  patronFigs.push(patronB);

  g.userData.patronFigs = patronFigs;
  // Visitor seat spec — BakeryWorld3D spawns real bakery customers into
  // this slot after they finish their order.
  g.userData.visitorSeat = {
    x: -1.4 + 0.85,
    y: SEAT_HIP_DROP,
    z: 2.4,
    rotY: -Math.PI / 2,
  };

  // ---- Cats ----
  const cats: THREE.Group[] = [];
  for (const spec of CAT_CAFE_CATS) {
    const c = makeCat3D(spec);
    g.add(c);
    cats.push(c);
  }
  g.userData.cats = cats;
  g.userData.lamps = lampGroups;
  return g;
}

