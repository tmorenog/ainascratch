"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGame } from "@/game/store";
import type { Customer } from "@/game/types";
import {
  ROOM,
  PLAYER,
  FOV_DEG,
  HOTSPOTS,
  type Hotspot,
} from "@/game/world3d";
import {
  buildRoom,
  buildCounter,
  buildStationSignboards,
  buildStationProps,
  buildPantry,
  buildOutdoors,
  disposeAllSceneryMaterials,
} from "./scenery3d";
import {
  makeCharacter,
  makePet,
  disposeAllSharedMaterials,
  type CharacterFigure,
} from "./characters";
import {
  makeFurnitureByKind,
  disposeAllFurnitureMaterials,
} from "./furniture3d";
import { disposeAllCachedTextures } from "./textures3d";

interface Props {
  onInteract: (hotspot: Hotspot, customer: Customer | null) => void;
  placingFurniture: string | null;
  onPlaceFurniture: (kind: string, x: number, z: number) => void;
}

export function BakeryWorld3D({
  onInteract,
  placingFurniture,
  onPlaceFurniture,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const customers = useGame((s) => s.customers);
  const furniture = useGame((s) => s.furniture);

  const [prompt, setPrompt] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const activeHotspotRef = useRef<Hotspot | null>(null);
  const activeCustomerRef = useRef<Customer | null>(null);
  const customersRef = useRef<Customer[]>(customers);
  const furnitureRef = useRef(furniture);
  const placingRef = useRef(placingFurniture);

  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);
  useEffect(() => {
    furnitureRef.current = furniture;
  }, [furniture]);
  useEffect(() => {
    placingRef.current = placingFurniture;
  }, [placingFurniture]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---- Renderer / Scene / Camera ----
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d6eafc");
    scene.fog = new THREE.Fog("#d6eafc", 25, 80);

    const camera = new THREE.PerspectiveCamera(
      FOV_DEG,
      mount.clientWidth / mount.clientHeight,
      0.05,
      200,
    );
    // Start inside the bakery near the service counter
    camera.position.set(0, PLAYER.eyeHeight, 3.0);
    camera.rotation.order = "YXZ";

    // ---- Lights ----
    scene.add(new THREE.AmbientLight("#fff4dc", 0.55));
    scene.add(new THREE.HemisphereLight("#fff6dc", "#c9a26a", 0.85));
    const sun = new THREE.DirectionalLight("#fff2c8", 1.2);
    sun.position.set(6, 14, -4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 44;
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    scene.add(sun);
    // Warm ceiling lights scattered across the bakery
    for (const [x, z] of [
      [-3, -1],
      [3, -1],
      [0, 1.5],
      [-5, 2],
      [5, 2],
    ] as const) {
      const pl = new THREE.PointLight("#ffd08a", 0.9, 9, 1.4);
      pl.position.set(x, 2.9, z);
      scene.add(pl);
    }

    // ---- Static scenery ----
    const room = buildRoom();
    scene.add(room);
    const counter = buildCounter();
    scene.add(counter);
    scene.add(buildStationSignboards(HOTSPOTS));
    scene.add(buildStationProps());
    scene.add(buildPantry());
    const outdoors = buildOutdoors();
    scene.add(outdoors);

    // The player IS the baker — no avatar drawn in front of the camera,
    // since that made customers look like they were wearing chef hats.

    // ---- Customer figure instance map ----
    type CustFig = { id: string; fig: CharacterFigure; pet?: THREE.Group };
    const customerFigs: CustFig[] = [];

    function ensureCustomerFigs(list: Customer[]) {
      // Remove figures for customers that have left
      for (let i = customerFigs.length - 1; i >= 0; i--) {
        if (!list.find((c) => c.id === customerFigs[i].id)) {
          scene.remove(customerFigs[i].fig.root);
          customerFigs[i].fig.dispose();
          customerFigs.splice(i, 1);
        }
      }
      // Add figures for new customers
      for (const c of list) {
        if (customerFigs.find((cf) => cf.id === c.id)) continue;
        const look = c.look;
        const fig = makeCharacter({
          skin: look?.skin ?? "#fbd6b2",
          shirt: look?.shirt ?? "#3aa1d0",
          pants: "#3a2a18",
          hair: look?.hairColor ?? "#3a2418",
          hairStyle: look?.hair ?? "short",
        });
        fig.root.position.set(0, 0, 2.6);
        fig.root.rotation.y = Math.PI; // face the counter
        scene.add(fig.root);
        let pet: THREE.Group | undefined;
        if (c.hasPet) {
          pet = makePet(c.hasPet);
          pet.position.set(0.5, 0, 2.9);
          scene.add(pet);
        }
        customerFigs.push({ id: c.id, fig, pet });
      }
      // Re-layout queue positions (line in front of service counter facing -Z)
      customerFigs.forEach((cf, idx) => {
        const offset = idx * 0.9;
        cf.fig.root.position.set(-0.2, 0, 2.4 + offset);
        cf.fig.setSpeaking(idx === 0);
        if (cf.pet) cf.pet.position.set(0.45, 0, 2.7 + offset);
      });
    }

    // ---- Furniture instance map ----
    const furnGroups = new Map<string, THREE.Group>();
    function syncFurniture() {
      const list = furnitureRef.current;
      const seen = new Set<string>();
      for (const f of list) {
        seen.add(f.id);
        if (furnGroups.has(f.id)) continue;
        const g = makeFurnitureByKind(f.kind);
        g.position.set(f.x, 0, f.z);
        g.rotation.y = f.rot;
        scene.add(g);
        furnGroups.set(f.id, g);
      }
      for (const [id, g] of furnGroups) {
        if (!seen.has(id)) {
          scene.remove(g);
          furnGroups.delete(id);
        }
      }
    }

    // ---- Placement ghost ----
    let ghost: THREE.Group | null = null;
    function updateGhost() {
      if (ghost) {
        scene.remove(ghost);
        ghost = null;
      }
      const kind = placingRef.current;
      if (!kind) return;
      ghost = makeFurnitureByKind(kind);
      ghost.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && "opacity" in m) {
          (m as THREE.MeshStandardMaterial & { transparent: boolean }).transparent = true;
          (m as THREE.MeshStandardMaterial & { opacity: number }).opacity = 0.5;
        }
      });
      scene.add(ghost);
    }

    // ---- Controls (pointer lock + WASD + touch) ----
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      keys.add(e.code);
      if (e.code === "KeyE" || e.code === "Space") {
        const hs = activeHotspotRef.current;
        if (hs) onInteract(hs, activeCustomerRef.current);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onCanvasClick = () => {
      const kind = placingRef.current;
      if (kind) {
        // place at point 1.2m in front of camera on the floor
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const x = camera.position.x + forward.x * 1.2;
        const z = camera.position.z + forward.z * 1.2;
        onPlaceFurniture(kind, clamp(x, -ROOM.width / 2 + 0.4, ROOM.width / 2 - 0.4),
          clamp(z, -ROOM.depth / 2 + 0.4, ROOM.depth / 2 - 0.4));
        return;
      }
      renderer.domElement.requestPointerLock();
    };
    renderer.domElement.addEventListener("click", onCanvasClick);

    const onLockChange = () => {
      setLocked(document.pointerLockElement === renderer.domElement);
    };
    document.addEventListener("pointerlockchange", onLockChange);

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      camera.rotation.y -= e.movementX * 0.0025;
      camera.rotation.x -= e.movementY * 0.0025;
      camera.rotation.x = Math.max(-1.2, Math.min(1.2, camera.rotation.x));
    };
    document.addEventListener("mousemove", onMouseMove);

    // Touch joysticks
    const touchState = {
      moveId: -1,
      moveBase: { x: 0, y: 0 },
      moveVec: { x: 0, y: 0 },
      lookId: -1,
      lookLast: { x: 0, y: 0 },
    };
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        const rect = renderer.domElement.getBoundingClientRect();
        const isLeft = t.clientX - rect.left < rect.width / 2;
        if (isLeft && touchState.moveId === -1) {
          touchState.moveId = t.identifier;
          touchState.moveBase = { x: t.clientX, y: t.clientY };
          touchState.moveVec = { x: 0, y: 0 };
        } else if (!isLeft && touchState.lookId === -1) {
          touchState.lookId = t.identifier;
          touchState.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchState.moveId) {
          const dx = t.clientX - touchState.moveBase.x;
          const dy = t.clientY - touchState.moveBase.y;
          const max = 60;
          touchState.moveVec.x = Math.max(-1, Math.min(1, dx / max));
          touchState.moveVec.y = Math.max(-1, Math.min(1, dy / max));
        } else if (t.identifier === touchState.lookId) {
          const dx = t.clientX - touchState.lookLast.x;
          const dy = t.clientY - touchState.lookLast.y;
          camera.rotation.y -= dx * 0.005;
          camera.rotation.x -= dy * 0.005;
          camera.rotation.x = Math.max(-1.2, Math.min(1.2, camera.rotation.x));
          touchState.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchState.moveId) {
          touchState.moveId = -1;
          touchState.moveVec = { x: 0, y: 0 };
        }
        if (t.identifier === touchState.lookId) touchState.lookId = -1;
      }
    };
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", onTouchEnd, { passive: true });

    // ---- Collision: simple AABB list for the counter + walls ----
    const colliders: { x: number; z: number; w: number; d: number }[] = [
      // long arm of L
      { x: 0, z: -3.0, w: 7.5, d: 0.9 },
      // short arm of L
      { x: -3.0, z: -3.0 + 0.9 / 2 + 1.5, w: 0.9, d: 3.0 },
      // service counter
      { x: 0, z: 1.2, w: 2.6, d: 0.9 },
      // pantry
      { x: 4.0, z: -3.8, w: 1.5, d: 0.4 },
    ];
    function collides(x: number, z: number, r: number): boolean {
      for (const c of colliders) {
        const dx = Math.abs(x - c.x) - c.w / 2;
        const dz = Math.abs(z - c.z) - c.d / 2;
        if (dx < r && dz < r) return true;
      }
      return false;
    }

    const doorLeft = -3.0 - 1.6 / 2 + 0.2;
    const doorRight = -3.0 + 1.6 / 2 - 0.2;
    function applyBounds(pos: THREE.Vector3) {
      // Indoor zone: inside four walls, except allow crossing the back wall
      // through the door cutout.
      const insideX = pos.x > -ROOM.width / 2 + 0.3 && pos.x < ROOM.width / 2 - 0.3;
      const insideZ = pos.z > -ROOM.depth / 2 + 0.3 && pos.z < ROOM.depth / 2 - 0.3;
      const inDoorColumn = pos.x > doorLeft && pos.x < doorRight;
      if (insideZ) {
        // inside the room along Z — keep inside the side walls
        pos.x = Math.max(-ROOM.width / 2 + 0.3, Math.min(ROOM.width / 2 - 0.3, pos.x));
        // front wall
        pos.z = Math.min(ROOM.depth / 2 - 0.3, pos.z);
      } else if (inDoorColumn) {
        // stepping out through the back door into the alley/outdoor zone
        pos.z = Math.max(-ROOM.depth / 2 - 30, pos.z);
        // constrain to the sidewalk-ish corridor (let them wander a bit)
        pos.x = Math.max(doorLeft - 8, Math.min(doorRight + 8, pos.x));
      } else if (insideX) {
        // they were trying to cross the back wall away from the door — block.
        pos.z = Math.max(-ROOM.depth / 2 + 0.3, pos.z);
      }
      pos.y = PLAYER.eyeHeight;
    }

    // ---- Animation loop ----
    const raycaster = new THREE.Raycaster();
    let rafId = 0;
    let lastT = performance.now();

    function tick(now: number) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // keep customers in sync
      ensureCustomerFigs(customersRef.current);
      syncFurniture();
      updateGhost();

      // move player
      const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? PLAYER.runSpeed : PLAYER.walkSpeed;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      let moveF = 0, moveR = 0;
      if (keys.has("KeyW") || keys.has("ArrowUp")) moveF += 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) moveF -= 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) moveR -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) moveR += 1;
      // touch joystick
      moveF += -touchState.moveVec.y;
      moveR += touchState.moveVec.x;

      const mag = Math.hypot(moveF, moveR);
      if (mag > 0) {
        const invMag = 1 / Math.max(1, mag);
        const vx = (forward.x * moveF + right.x * moveR) * invMag * speed * dt;
        const vz = (forward.z * moveF + right.z * moveR) * invMag * speed * dt;
        const nextX = camera.position.x + vx;
        const nextZ = camera.position.z + vz;
        if (!collides(nextX, camera.position.z, PLAYER.radius)) camera.position.x = nextX;
        if (!collides(camera.position.x, nextZ, PLAYER.radius)) camera.position.z = nextZ;
        applyBounds(camera.position);
      }

      // hotspot detection
      let best: Hotspot | null = null;
      let bestD = Infinity;
      for (const hs of HOTSPOTS) {
        const d = Math.hypot(hs.position[0] - camera.position.x, hs.position[2] - camera.position.z);
        if (d < PLAYER.reachDistance && d < bestD) {
          best = hs;
          bestD = d;
        }
      }
      // customer hotspot: detect the first customer if standing at counter-customer spot
      let customerHit: Customer | null = null;
      if (best?.id === "counter-customer" && customersRef.current[0]) {
        customerHit = customersRef.current[0];
      }
      activeHotspotRef.current = best;
      activeCustomerRef.current = customerHit;
      setPrompt(best ? best.prompt : null);

      // update animated entities
      customerFigs.forEach((cf) => cf.fig.update(now));

      // animate birds (sine-wave drift)
      outdoors.traverse((o) => {
        if (o.name === "bird") {
          const s = o as THREE.Sprite & { _birdSeed?: number };
          const seed = s._birdSeed ?? 0;
          s.position.x += Math.sin(now * 0.0005 + seed) * 0.01;
          s.position.y = 6 + Math.sin(now * 0.001 + seed) * 0.4;
        }
      });

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
      // silence unused warning
      void raycaster;
    }
    rafId = requestAnimationFrame(tick);

    // ---- Resize ----
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("click", onCanvasClick);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      // dispose everything
      customerFigs.forEach((cf) => cf.fig.dispose());
      disposeAllCachedTextures();
      disposeAllSharedMaterials();
      disposeAllFurnitureMaterials();
      disposeAllSceneryMaterials();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} className="absolute inset-0 overflow-hidden">
      {/* crosshair */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
        <div className="w-2 h-2 rounded-full bg-white/70 shadow-[0_0_0_2px_rgba(0,0,0,0.2)]" />
      </div>

      {/* interaction prompt */}
      {prompt && (
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-32 z-20">
          <div className="bg-cocoa-900/85 text-cream-50 text-sm px-4 py-2 rounded-full shadow-bakery">
            <span className="font-bold">[E]</span> {prompt}
          </div>
        </div>
      )}

      {/* lock hint */}
      {!locked && !placingFurniture && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 text-cocoa-700 text-xs px-3 py-1 rounded-full">
          Click to look around • WASD to walk • E to interact
        </div>
      )}
      {placingFurniture && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-berry-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Click to place • Esc to cancel
        </div>
      )}
    </div>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
