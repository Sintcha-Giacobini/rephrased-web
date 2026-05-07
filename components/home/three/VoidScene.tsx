'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Billboard, useScroll } from '@react-three/drei';
import { Color, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import gsap from 'gsap';
import { createRuneTexture } from '@/lib/runeTexture';
import { RUNES, type RuneId } from '@/lib/runes';

interface Props {
  /** Drives the white flash overlay during the restart sequence */
  onFlash?: (alpha: number) => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  twinkle: number;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VOID_CENTER_Y = -20;

const STARS: Star[] = (() => {
  const r = mulberry32(7);
  return Array.from({ length: 140 }, () => {
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(2 * r() - 1) - Math.PI / 2;
    const dist = 6 + r() * 18;
    return {
      x: dist * Math.cos(phi) * Math.cos(theta),
      y: VOID_CENTER_Y + dist * Math.sin(phi),
      z: dist * Math.cos(phi) * Math.sin(theta),
      size: 0.05 + r() * 0.10,
      twinkle: r() * Math.PI * 2,
    };
  });
})();

// Just three runes, all correct. Click them in any order to restart.
const RESET_RUNE_IDS: RuneId[] = ['eye', 'tree', 'gate'];

const RESET_POSITIONS: [number, number, number][] = (() => {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < RESET_RUNE_IDS.length; i++) {
    const angle = (i / RESET_RUNE_IDS.length) * Math.PI * 2 + Math.PI / 6;
    positions.push([Math.cos(angle) * 5, VOID_CENTER_Y, Math.sin(angle) * 5]);
  }
  return positions;
})();

export function VoidScene({ onFlash }: Props) {
  const root = useRef<Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    const t = scroll.offset;
    if (!root.current) return;
    root.current.visible = t > 0.28;
  });

  return (
    <group ref={root} visible={false}>
      {STARS.map((s, i) => (
        <TwinkleStar key={i} {...s} />
      ))}
      <ResetRunes onFlash={onFlash} />
    </group>
  );
}

function TwinkleStar({ x, y, z, size, twinkle }: Star) {
  const matRef = useRef<MeshBasicMaterial>(null);
  const scroll = useScroll();
  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = scroll.offset;
    const alpha = Math.max(0, Math.min(1, (t - 0.30) / 0.48));
    const twinkleOpacity =
      0.55 + Math.sin(clock.elapsedTime * 1.2 + twinkle) * 0.35;
    matRef.current.opacity = twinkleOpacity * alpha;
  });
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ffffff"
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

function ResetRunes({ onFlash }: Props) {
  const scroll = useScroll();
  const [clicked, setClicked] = useState<RuneId[]>([]);
  const successRef = useRef(false);

  const meshRefs = useRef<(Mesh | null)[]>(Array(RESET_RUNE_IDS.length).fill(null));
  const matRefs = useRef<(MeshBasicMaterial | null)[]>(
    Array(RESET_RUNE_IDS.length).fill(null),
  );

  const textures = useMemo(
    () =>
      RESET_RUNE_IDS.map((id) => {
        const def = RUNES.find((r) => r.id === id)!;
        return createRuneTexture({ path: def.path, size: 256, strokeWidth: 5 });
      }),
    [],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  /**
   * Restart sequence — vortex convergence ("施法凝结").
   *
   *   0.0s  All 3 runes briefly pulse (cue: "something is happening")
   *   0.4s  Vortex begins — runes spiral inward along orbital decay,
   *         scaling up dramatically to 4× as they approach the
   *         singularity. In the second half their colour lerps to
   *         pure white.
   *   2.4s  Vortex complete; runes are concentrated at the centre
   *   2.4s  White DOM flash starts fading in
   *   2.7s  Mid-flash: scrollTop slides back to 0
   *   3.2s  Flash fades out — user lands at the Hero
   *   3.9s  Reset internal state for next playthrough
   */
  const triggerRestart = () => {
    if (successRef.current) return;
    successRef.current = true;
    console.log('[void] restart triggered — runes converging');

    // Kill any in-flight scale tweens from the click feedback
    meshRefs.current.forEach((m) => {
      if (m) gsap.killTweensOf(m.scale);
    });

    // Snapshot starting polar coords (in xz plane)
    const startPolar = RESET_POSITIONS.map(([x, , z]) => ({
      angle: Math.atan2(z, x),
      radius: Math.hypot(x, z),
    }));

    const tl = gsap.timeline();

    // ── PHASE 0: brief pulse cue ──
    RESET_POSITIONS.forEach((_, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      tl.to(mesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.18, ease: 'power2.out' }, 0);
      tl.to(mesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.18, ease: 'power2.in' }, 0.18);
    });

    // ── PHASE 1: vortex convergence (2.0s) ──
    const proxy = { progress: 0 };
    tl.to(
      proxy,
      {
        progress: 1,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          const t = proxy.progress;
          for (let i = 0; i < RESET_POSITIONS.length; i++) {
            const mesh = meshRefs.current[i];
            const mat = matRefs.current[i];
            if (!mesh) continue;

            // Spiral inward — radius decays smoothly, angle keeps sweeping
            const radius = startPolar[i].radius * Math.pow(1 - t, 1.4);
            const angle = startPolar[i].angle + t * Math.PI * 2; // 1 full turn
            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.z = Math.sin(angle) * radius;
            mesh.position.y = VOID_CENTER_Y;

            // Scale ramp 1 → 4 (dramatic finish)
            const scale = 1 + t * 3.0;
            mesh.scale.set(scale, scale, scale);

            if (mat) {
              // Colour lerps to pure white in second half
              const ct = Math.max(0, (t - 0.4) / 0.6);
              mat.color.r = 0.71 + (1 - 0.71) * ct;
              mat.color.g = 0.84 + (1 - 0.84) * ct;
              mat.color.b = 0.85 + (1 - 0.85) * ct;
              mat.opacity = 0.55 + ct * 0.45;
            }
          }
        },
      },
      0.4,
    );

    // ── PHASE 2: white flash ──
    tl.call(() => onFlash?.(1), undefined, '+=0');

    // ── PHASE 3: scroll to top while screen is white ──
    tl.call(
      () => {
        const el = scroll.el;
        if (el) gsap.to(el, { scrollTop: 0, duration: 0.5, ease: 'power2.inOut' });
      },
      undefined,
      '+=0.30',
    );

    // ── PHASE 4: flash fades out ──
    tl.call(() => onFlash?.(0), undefined, '+=0.45');

    // ── PHASE 5: reset state ──
    tl.call(
      () => {
        RESET_POSITIONS.forEach((pos, i) => {
          const mesh = meshRefs.current[i];
          const mat = matRefs.current[i];
          if (mesh) {
            mesh.position.set(pos[0], pos[1], pos[2]);
            mesh.scale.set(1, 1, 1);
            mesh.rotation.set(0, 0, 0);
          }
          if (mat) {
            mat.color.set(new Color('#b4d7d8'));
            mat.opacity = 0.55;
          }
        });
        setClicked([]);
        successRef.current = false;
      },
      undefined,
      '+=0.55',
    );
  };

  const handleClick = (e: ThreeEvent<MouseEvent>, idx: number) => {
    e.stopPropagation();
    const id = RESET_RUNE_IDS[idx];
    if (clicked.includes(id) || successRef.current) return;

    const next = [...clicked, id];
    setClicked(next);
    console.log(`[void] clicked ${id} — ${next.length}/${RESET_RUNE_IDS.length}`);

    if (next.length >= RESET_RUNE_IDS.length) {
      triggerRestart();
    }
  };

  return (
    <>
      {RESET_RUNE_IDS.map((id, i) => (
        <ResetRune
          key={id}
          texture={textures[i]}
          position={RESET_POSITIONS[i]}
          isClicked={clicked.includes(id)}
          onClick={(e) => handleClick(e, i)}
          meshRef={(m) => (meshRefs.current[i] = m)}
          matRef={(m) => (matRefs.current[i] = m)}
        />
      ))}
    </>
  );
}

interface ResetRuneProps {
  texture: ReturnType<typeof createRuneTexture>;
  position: [number, number, number];
  isClicked: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  meshRef: (m: Mesh | null) => void;
  matRef: (m: MeshBasicMaterial | null) => void;
}

function ResetRune({
  texture,
  position,
  isClicked,
  onClick,
  meshRef,
  matRef,
}: ResetRuneProps) {
  const internalMesh = useRef<Mesh>(null);
  const internalMat = useRef<MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  // Click feedback — lock in with a satisfying scale pulse
  useEffect(() => {
    if (!isClicked || !internalMesh.current) return;
    gsap.fromTo(
      internalMesh.current.scale,
      { x: 1.5, y: 1.5, z: 1.5 },
      { x: 1.25, y: 1.25, z: 1.25, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
    );
  }, [isClicked]);

  // Gentle breathing while idle, more emphatic on hover
  useFrame(({ clock }) => {
    if (!internalMat.current) return;
    if (isClicked) {
      // Locked-in steady glow
      internalMat.current.opacity = 0.95;
    } else if (hovered) {
      internalMat.current.opacity = 0.95;
    } else {
      internalMat.current.opacity = 0.5 + Math.sin(clock.elapsedTime * 1.4) * 0.15;
    }
  });

  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <mesh
        ref={(m) => {
          internalMesh.current = m;
          meshRef(m);
        }}
        onClick={onClick}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial
          ref={(m) => {
            internalMat.current = m;
            matRef(m);
          }}
          map={texture}
          color={isClicked ? '#fbe5b8' : hovered ? '#cce4e5' : '#b4d7d8'}
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  );
}
