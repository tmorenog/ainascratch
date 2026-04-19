/**
 * Procedural meshes for the placeable furniture catalog. Each builder
 * returns a THREE.Group positioned with its base at y = 0 so the caller
 * can simply set group.position.x / .z.
 */
import * as THREE from "three";

const sharedMaterials: THREE.Material[] = [];
function mat(color: THREE.ColorRepresentation, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra });
  sharedMaterials.push(m);
  return m;
}

export function disposeAllFurnitureMaterials() {
  sharedMaterials.forEach((m) => m.dispose());
  sharedMaterials.length = 0;
}

export function makeRoundTable(): THREE.Group {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.05, 28),
    mat("#c5945e"),
  );
  top.position.y = 0.74;
  top.castShadow = top.receiveShadow = true;
  g.add(top);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12),
    mat("#7c5236"),
  );
  stem.position.y = 0.39;
  g.add(stem);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.05, 18),
    mat("#5c3a22"),
  );
  base.position.y = 0.025;
  g.add(base);
  return g;
}

export function makeCafeChair(): THREE.Group {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.06, 0.42),
    mat("#9c6d3f"),
  );
  seat.position.y = 0.45;
  seat.castShadow = true;
  g.add(seat);
  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
  const legM = mat("#5c3a22");
  for (const [x, z] of [
    [-0.18, -0.18],
    [0.18, -0.18],
    [-0.18, 0.18],
    [0.18, 0.18],
  ] as const) {
    const leg = new THREE.Mesh(legGeo, legM);
    leg.position.set(x, 0.225, z);
    g.add(leg);
  }
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.55, 0.05),
    mat("#9c6d3f"),
  );
  back.position.set(0, 0.76, -0.19);
  g.add(back);
  return g;
}

export function makePlanter(): THREE.Group {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.32, 18),
    mat("#c97a5a"),
  );
  pot.position.y = 0.16;
  pot.castShadow = true;
  g.add(pot);
  // soil
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.21, 0.02, 18),
    mat("#3a261a"),
  );
  soil.position.y = 0.32;
  g.add(soil);
  // flower puffs
  const colors = ["#ff85a2", "#ffd166", "#fff", "#bb86fc"];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6),
      mat("#3e8a3a"),
    );
    stem.position.set(Math.cos(a) * 0.1, 0.43, Math.sin(a) * 0.1);
    g.add(stem);
    const bloom = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 8),
      mat(colors[i % colors.length]),
    );
    bloom.position.set(Math.cos(a) * 0.1, 0.55, Math.sin(a) * 0.1);
    g.add(bloom);
  }
  return g;
}

export function makeRug(): THREE.Group {
  const g = new THREE.Group();
  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.02, 1.1),
    mat("#d6708d", { roughness: 0.95 }),
  );
  rug.position.y = 0.012;
  rug.receiveShadow = true;
  g.add(rug);
  // border
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.022, 0.95),
    mat("#fde4ec", { roughness: 0.95 }),
  );
  border.position.y = 0.02;
  g.add(border);
  return g;
}

export function makeBunting(): THREE.Group {
  const g = new THREE.Group();
  const colors = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#bb86fc"];
  // string
  const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.6, 4);
  const stringMesh = new THREE.Mesh(stringGeo, mat("#5c3a22"));
  stringMesh.rotation.z = Math.PI / 2;
  stringMesh.position.y = 2.4;
  g.add(stringMesh);
  // flags
  for (let i = 0; i < 8; i++) {
    const flag = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.18, 3),
      mat(colors[i % colors.length]),
    );
    flag.position.set(-0.7 + i * 0.2, 2.3, 0);
    flag.rotation.x = Math.PI;
    g.add(flag);
  }
  return g;
}

export function makePendantLight(): THREE.Group {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.7, 6),
    mat("#222"),
  );
  cord.position.y = 2.7;
  g.add(cord);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.18, 16, 1, true),
    mat("#f4d9a3", { side: THREE.DoubleSide }),
  );
  shade.position.y = 2.32;
  g.add(shade);
  // bulb glow
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 10),
    mat("#fff6c8", { emissive: "#fff6c8", emissiveIntensity: 0.7 }),
  );
  bulb.position.y = 2.22;
  g.add(bulb);
  // point light for the actual glow
  const pl = new THREE.PointLight("#ffe0a0", 0.8, 4, 1.6);
  pl.position.y = 2.18;
  g.add(pl);
  return g;
}

export function makeFurnitureByKind(kind: string): THREE.Group {
  switch (kind) {
    case "round_table":
      return makeRoundTable();
    case "cafe_chair":
      return makeCafeChair();
    case "planter":
      return makePlanter();
    case "rug":
      return makeRug();
    case "bunting":
      return makeBunting();
    case "pendant_light":
      return makePendantLight();
    default:
      return new THREE.Group();
  }
}
