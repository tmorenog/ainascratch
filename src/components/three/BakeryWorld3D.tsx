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
  buildSeatingArea,
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
import { disposeAllCachedTextures, heartTexture } from "./textures3d";

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
  const giftedPets = useGame((s) => s.giftedPets);
  const isOpen = useGame((s) => s.isOpen);
  const toggleStore = useGame((s) => s.toggleStore);

  const [prompt, setPrompt] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const activeHotspotRef = useRef<Hotspot | null>(null);
  const activeCustomerRef = useRef<Customer | null>(null);
  const customersRef = useRef<Customer[]>(customers);
  const furnitureRef = useRef(furniture);
  const giftedPetsRef = useRef(giftedPets);
  const placingRef = useRef(placingFurniture);
  const pausedRef = useRef(inputPaused);
  const toggleStoreRef = useRef(toggleStore);
  const signUpdateRef = useRef<((open: boolean) => void) | null>(null);
  const signFaceRef = useRef<THREE.Mesh | null>(null);
  // Fires when the player is next to a dog/cat — spawns hearts + wags
  // the tail. Wired up inside the main useEffect.
  const petTriggerRef = useRef<() => void>(() => {});
  // Shared by the on-screen mobile joystick overlay and the per-frame tick.
  const moveVecRef = useRef({ x: 0, y: 0 });
  const onInteractRef = useRef(onInteract);
  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);
  useEffect(() => {
    const turnOn = () => setIsTouch(true);
    window.addEventListener("touchstart", turnOn, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", turnOn);
  }, []);

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
    giftedPetsRef.current = giftedPets;
  }, [giftedPets]);
  useEffect(() => {
    placingRef.current = placingFurniture;
  }, [placingFurniture]);
  const wasLockedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = inputPaused;
    if (inputPaused) {
      // Release mouse lock so the user can click UI buttons freely
      if (document.pointerLockElement) {
        wasLockedRef.current = true;
        document.exitPointerLock();
      }
    } else if (wasLockedRef.current) {
      // Dialog/modal closed: if the player was in pointer-lock mouse-look
      // mode before, re-engage so mouse movement keeps turning the camera.
      wasLockedRef.current = false;
      const mount = mountRef.current;
      const canvas = mount?.querySelector("canvas") as HTMLCanvasElement | null;
      canvas?.requestPointerLock?.();
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
    scene.add(buildSeatingArea());
    const outdoors = buildOutdoors();
    scene.add(outdoors);

    // Supermarket sliding doors — the builder stashes the mesh refs and
    // door center on userData so we can animate them every frame without
    // relying on name lookup.
    const smDoors = outdoors.userData.supermarketDoors as
      | { left: THREE.Mesh; right: THREE.Mesh; baseLX: number; baseRX: number }
      | undefined;
    const SM_DOOR_CENTER =
      (outdoors.userData.supermarketDoorCenter as { x: number; z: number }) ?? {
        x: -3.0,
        z: -ROOM.depth / 2 - 30,
      };

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

    // ---- Gifted-pet desk pets ----
    // These are pets loving customers left behind. They sit on top of the
    // service counter (z=1.2, top y≈1.025), scaled down, facing the player.
    const giftedPetGroups = new Map<string, THREE.Group>();
    // Spots on the counter: left-side row, right-side row; we cycle
    // through them so a few pets fit without overlapping.
    const GIFT_SLOTS: [number, number][] = [
      [-1.1, 1.2],
      [0.2, 1.2],
      [1.15, 1.2],
      [-0.45, 1.2],
    ];
    function syncGiftedPets() {
      const list = giftedPetsRef.current;
      const seen = new Set<string>();
      list.forEach((p, idx) => {
        seen.add(p.id);
        if (giftedPetGroups.has(p.id)) return;
        const g = makePet(p.kind);
        g.scale.setScalar(0.48);
        const [sx, sz] = GIFT_SLOTS[idx % GIFT_SLOTS.length];
        g.position.set(sx, 1.025, sz);
        g.rotation.y = 0; // face -Z (toward the baker side)
        scene.add(g);
        giftedPetGroups.set(p.id, g);
      });
      for (const [id, g] of giftedPetGroups) {
        if (!seen.has(id)) {
          scene.remove(g);
          giftedPetGroups.delete(id);
        }
      }
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

    // ---- Hearts that float up when a pet is petted ----
    const heartTex = heartTexture();
    type FloatingHeart = { sprite: THREE.Sprite; born: number; life: number; drift: number };
    const hearts: FloatingHeart[] = [];
    function spawnHearts(pos: THREE.Vector3, count = 5) {
      for (let i = 0; i < count; i++) {
        const mat = new THREE.SpriteMaterial({
          map: heartTex,
          transparent: true,
          depthWrite: false,
        });
        const sp = new THREE.Sprite(mat);
        sp.scale.set(0.16, 0.16, 1);
        sp.position.set(
          pos.x + (Math.random() - 0.5) * 0.16,
          pos.y + 0.35,
          pos.z + (Math.random() - 0.5) * 0.16,
        );
        scene.add(sp);
        hearts.push({
          sprite: sp,
          born: performance.now(),
          life: 1200 + Math.random() * 400,
          drift: (Math.random() - 0.5) * 0.6,
        });
      }
    }

    // Which pet is currently in petting range, and when it was last pet
    // (used to time head-bob + tail-wag animation).
    let activePetCustomerId: string | null = null;
    let activePetRef: THREE.Group | null = null;
    const petLastPetAt = new Map<string, number>();

    function tryPet() {
      if (!activePetRef || !activePetCustomerId) return;
      spawnHearts(activePetRef.position);
      petLastPetAt.set(activePetCustomerId, performance.now());
    }
    // Expose via ref so the on-screen Interact button can trigger this too.
    petTriggerRef.current = tryPet;

    // ---- Controls (pointer lock + WASD + touch) ----
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      keys.add(e.code);
      if (e.code === "KeyE" || e.code === "Space") {
        const hs = activeHotspotRef.current;
        if (hs) {
          onInteract(hs, activeCustomerRef.current);
        } else if (activePetRef) {
          tryPet();
        }
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

    // Canvas touches all drive look (drag-to-turn). The visible on-screen
    // joystick (rendered below as React elements) writes to moveVecRef
    // independently and absorbs its own touches so they never reach here.
    const touchState = {
      lookId: -1,
      lookLast: { x: 0, y: 0 },
    };
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (touchState.lookId === -1) {
          touchState.lookId = t.identifier;
          touchState.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchState.lookId) {
          const dx = t.clientX - touchState.lookLast.x;
          const dy = t.clientY - touchState.lookLast.y;
          // Gentler sensitivity so a kid's flick doesn't spin the world.
          camera.rotation.y -= dx * 0.0035;
          camera.rotation.x -= dy * 0.0035;
          camera.rotation.x = Math.max(-1.2, Math.min(1.2, camera.rotation.x));
          touchState.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
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
      // cafe tables (round, approximated as square collider a bit bigger
      // than the top so chairs stay walkable)
      { x: -5.0, z: 1.0, w: 1.0, d: 1.0 },
      { x: 5.0, z: 1.0, w: 1.0, d: 1.0 },
      { x: -5.0, z: 4.0, w: 1.0, d: 1.0 },
      { x: 5.0, z: 4.0, w: 1.0, d: 1.0 },
      // Supermarket cashier counter (world coords: local (1.6, -1.4) +
      // group offset (-3, -ROOM.depth/2 - 30))
      { x: -1.4, z: -ROOM.depth / 2 - 31.4, w: 2.4, d: 0.9 },
      // Supermarket shelves along the back (local (-2.6,-4.6), (2.6,-4.6),
      // (0,-4.8)). We keep them thin so the aisles between shelves are
      // still walkable.
      { x: -5.6, z: -ROOM.depth / 2 - 34.6, w: 2.2, d: 0.7 },
      { x: -0.4, z: -ROOM.depth / 2 - 34.6, w: 2.2, d: 0.7 },
      { x: -3.0, z: -ROOM.depth / 2 - 34.8, w: 2.2, d: 0.7 },
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

    // Supermarket interior bounds. The market group is placed at
    // (DOOR_POS.x, 0, -ROOM.depth/2 - 30); its footprint is 8m wide
    // (x ± 4 around DOOR_POS.x) and 6m deep (local z from 0 to -6).
    // The sliding doors are centred on x=DOOR_POS.x at local z=0.
    const SM_CENTER_X = -3.0;
    const SM_FRONT_Z = -ROOM.depth / 2 - 30; // world z of the doors
    const SM_BACK_Z = -ROOM.depth / 2 - 36 + 0.3; // inner back wall
    const SM_LEFT_X = SM_CENTER_X - 4 + 0.3;
    const SM_RIGHT_X = SM_CENTER_X + 4 - 0.3;
    const smDoorLeft = SM_CENTER_X - 0.72;
    const smDoorRight = SM_CENTER_X + 0.72;

    // Track zones so we don't teleport the player across walls when they
    // walk sideways near a doorway.
    let wasOutdoor = false;
    let wasMarket = false;
    function applyBounds(pos: THREE.Vector3) {
      const isMarket = wasMarket
        ? pos.z <= SM_FRONT_Z + 0.1
        : pos.z < SM_FRONT_Z;
      const isOutdoor =
        !isMarket &&
        (wasOutdoor
          ? pos.z <= -ROOM.depth / 2 + 0.1
          : pos.z < -ROOM.depth / 2);

      if (isMarket) {
        // Inside the supermarket
        pos.x = Math.max(SM_LEFT_X, Math.min(SM_RIGHT_X, pos.x));
        pos.z = Math.max(SM_BACK_Z, pos.z);
        // Front wall is solid except the door column
        const inSmDoor = pos.x > smDoorLeft && pos.x < smDoorRight;
        if (!inSmDoor) {
          pos.z = Math.min(SM_FRONT_Z - 0.05, pos.z);
        }
        wasMarket = true;
        wasOutdoor = true;
      } else if (isOutdoor) {
        // Outdoor corridor leading from the bakery to the supermarket
        pos.x = Math.max(outdoorMinX, Math.min(outdoorMaxX, pos.x));
        // Market front wall (solid except through its door column)
        const inSmDoor = pos.x > smDoorLeft && pos.x < smDoorRight;
        if (!inSmDoor) {
          pos.z = Math.max(SM_FRONT_Z + 0.05, pos.z);
        }
        // Bakery back wall (solid except through its door column)
        const inBakeryDoor = pos.x > doorLeft && pos.x < doorRight;
        if (!inBakeryDoor) {
          pos.z = Math.min(-ROOM.depth / 2 - 0.05, pos.z);
        }
        wasMarket = false;
        wasOutdoor = true;
      } else {
        // Indoor bakery
        pos.x = Math.max(-ROOM.width / 2 + 0.3, Math.min(ROOM.width / 2 - 0.3, pos.x));
        pos.z = Math.min(ROOM.depth / 2 - 0.3, pos.z);
        const inBakeryDoor = pos.x > doorLeft && pos.x < doorRight;
        if (!inBakeryDoor) {
          pos.z = Math.max(-ROOM.depth / 2 + 0.3, pos.z);
        }
        wasMarket = false;
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
      syncGiftedPets();
      updateGhost();

      // Supermarket sliding doors — animated even when paused so they can
      // finish easing open after the market modal appears.
      if (smDoors) {
        const ddx = camera.position.x - SM_DOOR_CENTER.x;
        const ddz = camera.position.z - SM_DOOR_CENTER.z;
        const distToDoor = Math.hypot(ddx, ddz);
        const openT = Math.max(0, Math.min(1, (9 - distToDoor) / 5));
        const slide = openT * 0.7;
        const targetLX = smDoors.baseLX - slide;
        const targetRX = smDoors.baseRX + slide;
        const k = 1 - Math.pow(0.0001, dt);
        smDoors.left.position.x += (targetLX - smDoors.left.position.x) * k;
        smDoors.right.position.x += (targetRX - smDoors.right.position.x) * k;
      }

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
      // on-screen joystick (mobile)
      moveF += -moveVecRef.current.y;
      moveR += moveVecRef.current.x;

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

      // Pet proximity — check each customer's pet and pick the closest one
      // within a small radius. Pets "beat" station hotspots if the player
      // is literally standing next to them.
      let nearestPet: THREE.Group | null = null;
      let nearestPetCustId: string | null = null;
      let nearestPetD = 1.2;
      for (const cf of customerFigs) {
        if (!cf.pet) continue;
        const d = Math.hypot(
          cf.pet.position.x - camera.position.x,
          cf.pet.position.z - camera.position.z,
        );
        if (d < nearestPetD) {
          nearestPet = cf.pet;
          nearestPetCustId = cf.id;
          nearestPetD = d;
        }
      }
      activePetRef = nearestPet;
      activePetCustomerId = nearestPetCustId;

      let promptText = best ? best.prompt : null;
      if (nearestPet) {
        const kind = (nearestPet.userData.pet as { kind: "dog" | "cat" }).kind;
        promptText = `Pet the ${kind}`;
      }
      setPrompt(promptText);

      // Animate every pet — gentle idle breathing, plus a joyful bounce +
      // tail wag in the 1.2s after being petted.
      for (const cf of customerFigs) {
        if (!cf.pet) continue;
        const parts = cf.pet.userData.pet as {
          head: THREE.Group;
          tail: THREE.Group;
          kind: "dog" | "cat";
        };
        const lastPet = petLastPetAt.get(cf.id) ?? -Infinity;
        const since = now - lastPet;
        const petting = since < 1200;
        if (petting) {
          const t = since / 1200;
          const bob = Math.sin(t * Math.PI * 4) * 0.05 * (1 - t);
          parts.head.position.y = 0.33 + bob;
          parts.head.rotation.z = Math.sin(t * Math.PI * 6) * 0.12 * (1 - t);
          parts.tail.rotation.y = Math.sin(t * Math.PI * 8) * 0.9;
        } else {
          const breathe = Math.sin(now * 0.004) * 0.008;
          parts.head.position.y = 0.33 + breathe;
          parts.head.rotation.z = 0;
          parts.tail.rotation.y = Math.sin(now * 0.002) * 0.25;
        }
      }

      // Gifted counter-pets: gentle idle breathing + occasional tail wag.
      for (const [, g] of giftedPetGroups) {
        const parts = g.userData.pet as
          | { head: THREE.Group; tail: THREE.Group }
          | undefined;
        if (!parts) continue;
        const breathe = Math.sin(now * 0.003 + g.position.x) * 0.008;
        parts.head.position.y = 0.33 + breathe;
        parts.tail.rotation.y = Math.sin(now * 0.0025 + g.position.x * 1.3) * 0.4;
      }

      // Animate floating hearts — rise, drift sideways, fade, then remove.
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        const t = (now - h.born) / h.life;
        if (t >= 1) {
          scene.remove(h.sprite);
          h.sprite.material.dispose();
          hearts.splice(i, 1);
          continue;
        }
        h.sprite.position.y += dt * 0.9;
        h.sprite.position.x += dt * h.drift * 0.3;
        h.sprite.material.opacity = 1 - t;
        const s = 0.16 * (0.6 + t * 0.6);
        h.sprite.scale.set(s, s, 1);
      }

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
      giftedPetGroups.forEach((g) => scene.remove(g));
      giftedPetGroups.clear();
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
      {!locked && !placingFurniture && !isTouch && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 text-cocoa-700 text-xs px-3 py-1 rounded-full">
          Drag mouse to look around • WASD to walk • ← ↑ ↓ → to turn • E to interact
        </div>
      )}
      {!locked && !placingFurniture && isTouch && (
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/85 text-cocoa-700 text-[11px] px-3 py-1 rounded-full">
          Drag to look • Joystick to walk • Tap ✨ to interact
        </div>
      )}
      {placingFurniture && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-berry-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          {isTouch ? "Tap to place • ✕ to cancel" : "Click to place • Esc to cancel"}
        </div>
      )}

      {/* Mobile controls: visible joystick (bottom-left) and interact
          button (bottom-right). Only rendered once a touch has been seen
          so desktop users aren't cluttered. */}
      {isTouch && !placingFurniture && (
        <>
          <Joystick moveVecRef={moveVecRef} pausedRef={pausedRef} />
          <InteractButton
            visible={!!prompt}
            label={prompt ?? undefined}
            onTap={() => {
              if (pausedRef.current) return;
              const hs = activeHotspotRef.current;
              if (hs) {
                onInteractRef.current(hs, activeCustomerRef.current);
              } else {
                petTriggerRef.current();
              }
            }}
          />
        </>
      )}
    </div>
  );
}

function Joystick({
  moveVecRef,
  pausedRef,
}: {
  moveVecRef: React.MutableRefObject<{ x: number; y: number }>;
  pausedRef: React.MutableRefObject<boolean>;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const touchIdRef = useRef<number>(-1);
  const centerRef = useRef({ x: 0, y: 0 });
  const RADIUS = 52; // px — how far the thumb can travel

  function updateThumb(x: number, y: number) {
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  function onStart(e: React.TouchEvent<HTMLDivElement>) {
    if (pausedRef.current) return;
    const t = e.changedTouches[0];
    if (!t || touchIdRef.current !== -1) return;
    const rect = baseRef.current!.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    touchIdRef.current = t.identifier;
  }
  function onMove(e: React.TouchEvent<HTMLDivElement>) {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier !== touchIdRef.current) continue;
      let dx = t.clientX - centerRef.current.x;
      let dy = t.clientY - centerRef.current.y;
      const d = Math.hypot(dx, dy);
      if (d > RADIUS) {
        dx = (dx / d) * RADIUS;
        dy = (dy / d) * RADIUS;
      }
      updateThumb(dx, dy);
      moveVecRef.current.x = dx / RADIUS;
      moveVecRef.current.y = dy / RADIUS;
    }
  }
  function onEnd(e: React.TouchEvent<HTMLDivElement>) {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier !== touchIdRef.current) continue;
      touchIdRef.current = -1;
      moveVecRef.current.x = 0;
      moveVecRef.current.y = 0;
      updateThumb(0, 0);
    }
  }

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto absolute left-5 bottom-5 z-30 w-32 h-32 rounded-full bg-white/30 border-2 border-white/60 backdrop-blur-sm shadow-bakery touch-none select-none"
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
      aria-label="Walk joystick"
    >
      <div
        ref={thumbRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-berry-400 border-2 border-white shadow-bakery"
      />
    </div>
  );
}

function InteractButton({
  visible,
  label,
  onTap,
}: {
  visible: boolean;
  label?: string;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onTap();
      }}
      onClick={onTap}
      className={`pointer-events-auto absolute right-6 bottom-8 z-30 w-24 h-24 rounded-full border-2 border-white text-white font-black text-lg shadow-bakery active:scale-95 transition-transform touch-none select-none ${
        visible ? "bg-berry-500 animate-pulse" : "bg-cocoa-500/60"
      }`}
      aria-label={label ? `Interact: ${label}` : "Interact"}
    >
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className="text-2xl">✨</span>
        <span className="text-[10px] font-bold">
          {visible ? label : "near…"}
        </span>
      </div>
    </button>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
