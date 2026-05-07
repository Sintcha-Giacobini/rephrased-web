'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  Color,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import gsap from 'gsap';
import { RUNES } from '@/lib/runes';
import type { RuneInstance } from '@/lib/runeField';
import { FIELD_HEIGHT } from '@/lib/runeField';
import { useRunePuzzle } from '@/stores/runePuzzle';
import { playSfx } from '@/lib/audio';
import { createRuneTexture } from '@/lib/runeTexture';

interface Props {
  inst: RuneInstance;
}

// Cool baseline → warm awakened, with bright cream peak.
// Tuned against the Mœbius shader's bypass (smoothstep 0.55→0.82 luma).
const TINT_DIM = new Color('#b4d7d8');       // light aqua mist (matches palette highlight)
const TINT_HOVER = new Color('#cce4e5');     // brighter aqua on hover
const TINT_HINT = new Color('#c4d4ca');      // warm-tinted aqua (subtle clue)
const TINT_FLASH = new Color('#f5e4cb');     // very bright cream — bloom hits this hard
const TINT_LIT = new Color('#e0d7cf');       // clean warm cream (settled awakened state)
const TINT_REJECTED = new Color('#ab9072');  // muted tan
const TINT_TOUCHED = new Color('#c4ac90');   // warm tan-cream (clearly warmer than dim)

const FLASH_MS_OK = 1300;
const FLASH_MS_WRONG = 280;
const DRAG_THRESHOLD_PX = 6;

export function Rune3D({ inst }: Props) {
  const group = useRef<Group>(null);
  const plane = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const haloMat = useRef<MeshBasicMaterial>(null);
  const innerGlow = useRef<Mesh>(null);
  const innerGlowMat = useRef<MeshBasicMaterial>(null);

  const [hovered, setHovered] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag state lives in refs (no re-renders during drag)
  const dragState = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    pointerId: -1,
  });
  // The "home" position the rune drifts/wobbles around. Updated on drop.
  const homePos = useRef<[number, number, number]>([...inst.position]);
  // For drifters: where in the drift cycle is the rune. Rebased on drop.
  const driftRebase = useRef({ originY: inst.position[1], originT: 0 });
  // Latest clock time, captured in useFrame for use in pointer handlers
  const elapsedRef = useRef(0);

  const def = useMemo(() => RUNES.find((r) => r.id === inst.runeId)!, [inst.runeId]);
  const texture = useMemo(
    () => createRuneTexture({ path: def.path, size: 256, strokeWidth: 5 }),
    [def.path],
  );
  useEffect(() => () => texture.dispose(), [texture]);

  const state = useRunePuzzle((s) =>
    inst.isPuzzle ? s.states[inst.runeId] : 'dim',
  );
  const hintLevel = useRunePuzzle((s) => s.hintLevel);
  const isTouched = useRunePuzzle((s) => Boolean(s.touched[inst.key]));
  const light = useRunePuzzle((s) => s.light);
  const reject = useRunePuzzle((s) => s.reject);
  const markTouched = useRunePuzzle((s) => s.markTouched);

  const { camera, size, gl } = useThree();
  const dragRaycaster = useRef(new Raycaster());
  const dragPlane = useRef(new Plane(new Vector3(0, 0, 1), 0));
  const dragHit = useRef(new Vector3());
  const ndc = useRef(new Vector2());

  // ── Per-frame drift / wobble (skipped while dragging) ────────────
  useFrame(({ clock }) => {
    elapsedRef.current = clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    if (dragState.current.isDragging) return; // freeze position during drag

    const t = clock.elapsedTime;
    const [hx, hy, hz] = homePos.current;

    if (inst.isPuzzle) {
      g.position.x = hx + Math.sin(t * inst.wobbleFreq * 0.6 + inst.phase) * 0.05;
      g.position.y = hy + Math.sin(t * inst.wobbleFreq + inst.phase) * 0.08;
      g.position.z = hz;
      g.rotation.z = inst.rotation + Math.sin(t * 0.3 + inst.phase) * 0.04;
    } else {
      const total = FIELD_HEIGHT + 2;
      const elapsed = t - driftRebase.current.originT;
      const yOffset = (driftRebase.current.originY + total / 2 - elapsed * inst.driftSpeed) % total;
      const wrapped = yOffset < 0 ? yOffset + total : yOffset;
      g.position.y = wrapped - total / 2;
      g.position.x = hx + Math.sin(t * 0.3 + inst.phase) * 0.35;
      g.position.z = hz;
      g.rotation.z = inst.rotation + t * inst.tumbleSpeed;
    }

    if (state === 'lit' && innerGlowMat.current) {
      innerGlowMat.current.opacity = 0.45 + Math.sin(t * 1.6 + inst.phase) * 0.18;
    }
  });

  // ── Lit feedback ────────────────────────────────────────────────
  useEffect(() => {
    const p = plane.current;
    if (state !== 'lit' || !p) return;
    gsap.to(p.scale, { x: 1.25, y: 1.25, duration: 0.7, ease: 'power3.out' });
    if (innerGlowMat.current) {
      gsap.fromTo(innerGlowMat.current, { opacity: 0 }, { opacity: 0.5, duration: 0.6 });
    }
  }, [state]);

  // ── Reject feedback ─────────────────────────────────────────────
  useEffect(() => {
    const g = group.current;
    if (state !== 'rejected' || !g) return;
    const tl = gsap.timeline({ onComplete: () => reject(inst.runeId) });
    tl.to(g.position, {
      x: `+=0.12`, duration: 0.05, repeat: 5, yoyo: true, ease: 'power2.inOut',
    });
  }, [state, reject, inst.runeId]);

  // ── Awaken animation (called from click and drop-as-click) ──────
  const triggerAwaken = (durationMs: number) => {
    setFlashing(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashing(false), durationMs);

    const h = halo.current;
    const hm = haloMat.current;
    if (h && hm) {
      gsap.killTweensOf([h.scale, hm]);
      gsap.fromTo(h.scale,
        { x: 0.35, y: 0.35, z: 0.35 },
        { x: 3.6, y: 3.6, z: 3.6, duration: durationMs / 1000, ease: 'power2.out' });
      gsap.fromTo(hm,
        { opacity: 0.65 },
        { opacity: 0, duration: durationMs / 1000, ease: 'power2.out' });
    }

    const ig = innerGlow.current;
    const igm = innerGlowMat.current;
    if (ig && igm) {
      gsap.killTweensOf([ig.scale, igm]);
      gsap.fromTo(ig.scale,
        { x: 0.3, y: 0.3, z: 0.3 },
        { x: 1.6, y: 1.6, z: 1.6, duration: 0.5, ease: 'back.out(1.6)' });
      gsap.fromTo(igm, { opacity: 0 }, { opacity: 0.85, duration: 0.25, ease: 'power3.out' });
      if (durationMs < 1000) {
        gsap.to(igm, { opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.in' });
      } else if (!inst.isPuzzle) {
        gsap.to(igm, { opacity: 0.18, duration: 0.6, delay: durationMs / 1000 - 0.6, ease: 'power2.in' });
      }
    }

    const p = plane.current;
    if (p) {
      gsap.killTweensOf(p.scale);
      gsap.fromTo(p.scale,
        { x: 1.55, y: 1.55, z: 1.55 },
        { x: 1, y: 1, z: 1, duration: 0.85, ease: 'elastic.out(1, 0.45)' });
    }
  };

  const performClickLogic = () => {
    markTouched(inst.key);
    let result: 'correct' | 'wrong' | 'noop' = 'noop';
    if (inst.isPuzzle && state === 'dim') {
      result = light(inst.runeId);
    }
    triggerAwaken(result === 'wrong' ? FLASH_MS_WRONG : FLASH_MS_OK);
    if (result === 'correct') playSfx('correct');
    else if (result === 'wrong') playSfx('wrong');
  };

  // ── Drag implementation ─────────────────────────────────────────
  const projectToRunePlane = (clientX: number, clientY: number, outZ: number) => {
    ndc.current.set(
      (clientX / size.width) * 2 - 1,
      -(clientY / size.height) * 2 + 1,
    );
    dragRaycaster.current.setFromCamera(ndc.current, camera);
    dragPlane.current.set(new Vector3(0, 0, 1), -outZ);
    dragRaycaster.current.ray.intersectPlane(dragPlane.current, dragHit.current);
    return dragHit.current;
  };

  const onPointerMoveGlobal = (ev: PointerEvent) => {
    const ds = dragState.current;
    if (!ds.isDown) return;
    const dx = ev.clientX - ds.startX;
    const dy = ev.clientY - ds.startY;
    if (!ds.isDragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      ds.isDragging = true;
      document.body.style.cursor = 'grabbing';
    }
    const g = group.current;
    if (!g) return;
    const hit = projectToRunePlane(ev.clientX, ev.clientY, g.position.z);
    g.position.x = hit.x;
    g.position.y = hit.y;
  };

  const cleanupDrag = () => {
    window.removeEventListener('pointermove', onPointerMoveGlobal);
    window.removeEventListener('pointerup', onPointerUpGlobal);
    window.removeEventListener('pointercancel', onPointerUpGlobal);
  };

  const onPointerUpGlobal = (ev: PointerEvent) => {
    const ds = dragState.current;
    if (!ds.isDown) return;
    if (ds.pointerId !== -1 && ev.pointerId !== ds.pointerId) return;

    if (!ds.isDragging) {
      // Treat as a click
      performClickLogic();
    } else {
      const g = group.current;
      if (g) {
        homePos.current = [g.position.x, g.position.y, g.position.z];
        if (!inst.isPuzzle) {
          // Rebase the drift loop so it continues smoothly from drop point
          driftRebase.current = {
            originY: g.position.y,
            originT: elapsedRef.current,
          };
        }
      }
    }

    ds.isDown = false;
    ds.isDragging = false;
    ds.pointerId = -1;
    document.body.style.cursor = hovered ? 'grab' : 'auto';
    cleanupDrag();
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const ds = dragState.current;
    ds.isDown = true;
    ds.isDragging = false;
    ds.startX = e.clientX;
    ds.startY = e.clientY;
    ds.pointerId = e.pointerId;
    document.body.style.cursor = 'grabbing';

    window.addEventListener('pointermove', onPointerMoveGlobal);
    window.addEventListener('pointerup', onPointerUpGlobal);
    window.addEventListener('pointercancel', onPointerUpGlobal);
  };

  // Hover handlers (unchanged behavior)
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (!dragState.current.isDragging) {
      document.body.style.cursor = 'grab';
    }
  };
  const handlePointerLeave = () => {
    setHovered(false);
    if (!dragState.current.isDragging) {
      document.body.style.cursor = 'auto';
    }
  };

  useEffect(() => () => cleanupDrag(), []); // safety on unmount

  // ── Visual derivations ──────────────────────────────────────────
  const isHinting = inst.isPuzzle && inst.isCorrect && state === 'dim' && hintLevel >= 1;

  let tint: Color;
  if (flashing) tint = TINT_FLASH;
  else if (state === 'lit') tint = TINT_LIT;
  else if (state === 'rejected') tint = TINT_REJECTED;
  else if (hovered) tint = TINT_HOVER;
  else if (isHinting) tint = TINT_HINT;
  else if (isTouched && !inst.isPuzzle) tint = TINT_TOUCHED;
  else tint = TINT_DIM;

  let opacity: number;
  if (flashing) opacity = 1;
  else if (state === 'lit') opacity = 1;
  else if (state === 'rejected') opacity = 0.85;
  else if (hovered) opacity = Math.min(1, inst.opacity + 0.4);
  else if (isHinting) opacity = Math.min(1, inst.opacity + 0.2);
  else if (isTouched && !inst.isPuzzle) opacity = Math.min(1, inst.opacity + 0.32);
  else opacity = inst.opacity;

  return (
    <group
      ref={group}
      position={inst.position}
      rotation={[0, 0, inst.rotation]}
      scale={inst.scale}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Inner glow disc (ignites from within on click) */}
      <mesh ref={innerGlow} position={[0, 0, -0.02]} scale={0.3}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial
          ref={innerGlowMat}
          color="#f5e4cb"
          transparent opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Expanding halo ring */}
      <mesh ref={halo} position={[0, 0, -0.01]} scale={0.35}>
        <ringGeometry args={[0.5, 0.58, 48]} />
        <meshBasicMaterial
          ref={haloMat}
          color="#f5e4cb"
          transparent opacity={0}
          depthWrite={false}
          toneMapped={false}
          side={2}
        />
      </mesh>

      {/* Rune itself */}
      <mesh ref={plane}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          color={tint}
          transparent opacity={opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
