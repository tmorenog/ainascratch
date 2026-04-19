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
  makeOpenSign,
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
  inputPaused?: boolean;
}

export function BakeryWorld3D({
  onInteract,
  placingFurniture,
  onPlaceFurniture,
  inputPaused = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const customers = useGame((s) => s.customers);
  const furniture = useGame((s) => s.furniture);
  const isOpen = useGame((s) => s.isOpen);
  const toggleStore = useGame((s) => s.toggleStore);

  const [prompt, setPrompt] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const activeHotspotRef = useRef<Hotspot | null>(null);
  const activeCustomerRef = useRef<Customer | null>(null);
  const customersRef = useRef<Customer[]>(customers);
  const furnitureRef = useRef(furniture);
  const placingRef = useRef(placingFurniture);
  const pausedRef = useRef(inputPaused);
  const toggleStoreRef = useRef(toggleStore);
  const signUpdateRef = useRef<((open: boolean) => void) | null>(null);
  const signFaceRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    toggleStoreRef.current = toggleStore;
  }, [toggleStore]);
  useEffect(() => {
    signUpdateRef.current?.(isOpen);
  }, [isOpen]);

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
    pausedRef.current = inputPaused;
    // Release mouse lock so the user can click UI buttons freely
    if (inputPaused && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [inputPaused]);

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
    // Start inside the bakery behind the service counter, facing the
    // customer side so the first thing you see is the queue area.
    camera.position.set(0, PLAYER.eyeHeight, -0.3);
    camera.rotation.order = "YXZ";
    camera.rotation.y = Math.PI; // face +Z (where the service counter is)

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
    // Warm pendant-lamp lights. Positioned just under the shades so the
    // light cone points down toward the floor instead of splashing across
    // the ceiling.
    for (const [x, z] of [
      [-3, -1],
      [3, -1],
      [0, 1.5],
      [-5, 2],
      [5, 2],
    ] as const) {
      const pl = new THREE.PointLight("#ffd08a", 0.7, 8, 1.6);
      pl.position.set(x, 2.6, z);
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
    // Hanging OPEN/CLOSED sign on the front window — clickable.
    const sign = makeOpenSign();
    scene.add(sign.group);
    signUpdateRef.current = sign.update;
    signFaceRef.current = sign.face;
    sign.update(useGame.getState().isOpen);

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
      if (pausedRef.current) return;
      keys.add(e.code);
      if (e.code === "KeyE" || e.code === "Space") {
        const hs = activeHotspotRef.current;
        if (hs) onInteract(hs, activeCustomerRef.current);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Mouse look is drag-based so it works the moment the player moves the
    // mouse — no pointer-lock required. If pointer lock happens to be
    // engaged (from a double-click below), it also works. A short click
    // (low movement, quick release) still counts as a click for the sign
    // and furniture placement.
    const clickRay = new THREE.Raycaster();
    let isDragging = false;
    let dragLastX = 0;
    let dragLastY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTime = 0;

    function handleShortClick(e: MouseEvent) {
      const kind = placingRef.current;
      if (kind) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const x = camera.position.x + forward.x * 1.2;
        const z = camera.position.z + forward.z * 1.2;
        onPlaceFurniture(
          kind,
          clamp(x, -ROOM.width / 2 + 0.4, ROOM.width / 2 - 0.4),
          clamp(z, -ROOM.depth / 2 + 0.4, ROOM.depth / 2 - 0.4),
        );
        return;
      }
      const face = signFaceRef.current;
      if (face) {
        const rect = renderer.domElement.getBoundingClientRect();
        let nx: number, ny: number;
        if (document.pointerLockElement === renderer.domElement) {
          nx = 0;
          ny = 0;
        } else {
          nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }
        clickRay.setFromCamera(new THREE.Vector2(nx, ny), camera);
        const hit = clickRay.intersectObject(face, false);
        if (hit.length > 0 && hit[0].distance < 20) {
          toggleStoreRef.current();
        }
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current) return;
      if (e.button !== 0) return;
      isDragging = true;
      dragLastX = e.clientX;
      dragLastY = e.clientY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTime = performance.now();
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const wasShort =
        isDragging &&
        performance.now() - dragStartTime < 300 &&
        Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < 6;
      isDragging = false;
      if (wasShort && !pausedRef.current) handleShortClick(e);
    };
    const onDblClick = () => {
      if (pausedRef.current) return;
      // Optional: engage pointer lock for continuous turning.
      renderer.domElement.requestPointerLock();
    };
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("dblclick", onDblClick);

    const onLockChange = () => {
      setLocked(document.pointerLockElement === renderer.domElement);
    };
    document.addEventListener("pointerlockchange", onLockChange);

    const onMouseMove = (e: MouseEvent) => {
      if (pausedRef.current) return;
      if (document.pointerLockElement === renderer.domElement) {
        camera.rotation.y -= e.movementX * 0.0025;
        camera.rotation.x -= e.movementY * 0.0025;
      } else if (isDragging) {
        const dx = e.clientX - dragLastX;
        const dy = e.clientY - dragLastY;
        dragLastX = e.clientX;
        dragLastY = e.clientY;
        camera.rotation.y -= dx * 0.005;
        camera.rotation.x -= dy * 0.005;
      } else {
        return;
      }
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
    const outdoorMinX = doorLeft - 10;
    const outdoorMaxX = doorRight + 10;
    const outdoorMinZ = -ROOM.depth / 2 - 30;

    // Track which side the player last stood on so we don't teleport
    // them across the back wall when they walk sideways outdoors.
    let wasOutdoor = false;
    function applyBounds(pos: THREE.Vector3) {
      const isOutdoor = wasOutdoor
        ? pos.z <= -ROOM.depth / 2 + 0.1 // allow slight drift back indoors only via door
        : pos.z < -ROOM.depth / 2;
      if (isOutdoor) {
        // Outdoor corridor leading to the supermarket
        pos.z = Math.max(outdoorMinZ, pos.z);
        pos.x = Math.max(outdoorMinX, Math.min(outdoorMaxX, pos.x));
        const inDoorColumn = pos.x > doorLeft && pos.x < doorRight;
        if (!inDoorColumn) {
          // Not under the doorway — back wall is solid; clamp at -depth/2
          pos.z = Math.min(-ROOM.depth / 2 - 0.05, pos.z);
        }
        wasOutdoor = true;
      } else {
        // Indoor zone
        pos.x = Math.max(-ROOM.width / 2 + 0.3, Math.min(ROOM.width / 2 - 0.3, pos.x));
        pos.z = Math.min(ROOM.depth / 2 - 0.3, pos.z);
        const inDoorColumn = pos.x > doorLeft && pos.x < doorRight;
        if (!inDoorColumn) {
          pos.z = Math.max(-ROOM.depth / 2 + 0.3, pos.z);
        }
        wasOutdoor = false;
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

      if (pausedRef.current) {
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Arrow keys turn the camera (yaw + pitch) so mobile / non-pointer-lock
      // users can look around without grabbing the mouse. Arrow keys do NOT
      // move the player — WASD handles movement — so the two never conflict.
      const turnSpeed = 1.8 * dt;
      if (keys.has("ArrowLeft")) camera.rotation.y += turnSpeed;
      if (keys.has("ArrowRight")) camera.rotation.y -= turnSpeed;
      if (keys.has("ArrowUp")) camera.rotation.x = Math.max(-1.2, camera.rotation.x - turnSpeed);
      if (keys.has("ArrowDown")) camera.rotation.x = Math.min(1.2, camera.rotation.x + turnSpeed);
      camera.rotation.z = 0; // never roll

      // move player
      const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? PLAYER.runSpeed : PLAYER.walkSpeed;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      let moveF = 0, moveR = 0;
      if (keys.has("KeyW")) moveF += 1;
      if (keys.has("KeyS")) moveF -= 1;
      if (keys.has("KeyA")) moveR -= 1;
      if (keys.has("KeyD")) moveR += 1;
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
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("dblclick", onDblClick);
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

      {/* controls hint */}
      {!locked && !placingFurniture && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 text-cocoa-700 text-xs px-3 py-1 rounded-full">
          Drag mouse to look around • WASD to walk • ← ↑ ↓ → to turn • E to interact
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
