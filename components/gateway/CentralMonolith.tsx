'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import { useRunePuzzle } from '@/stores/runePuzzle';
import { CORRECT_IDS } from '@/lib/runes';

/**
 * Two stone halves with a glowing seam between them.
 *
 * IMPORTANT visual contract:
 *   • IDLE / CONNECTING — body is fully transparent. Only the seam is visible
 *     (a glowing crack hovering in space). The previous version had visible
 *     bodies that read as a "frame cutting the middle off"; this fixes that.
 *   • OPENING — body materializes (opacity 0 → 0.7), halves slide apart and
 *     tilt outward, seam expands into a wide light beam.
 *   • FLOODING — body dissolves (opacity → 0) as the white plane fills.
 */
export function CentralMonolith() {
  const root = useRef<Group>(null);
  const leftHalf = useRef<Mesh>(null);
  const leftMat = useRef<MeshBasicMaterial>(null);
  const rightHalf = useRef<Mesh>(null);
  const rightMat = useRef<MeshBasicMaterial>(null);
  const seam = useRef<Mesh>(null);
  const seamMat = useRef<MeshBasicMaterial>(null);
  const halo = useRef<Mesh>(null);
  const haloMat = useRef<MeshBasicMaterial>(null);

  const litCorrect = useRunePuzzle((s) => s.litCorrect);
  const isUnlocked = useRunePuzzle((s) => s.isUnlocked);
  const openingPhase = useRunePuzzle((s) => s.openingPhase);

  const progressTarget = isUnlocked ? 1 : litCorrect / CORRECT_IDS.length;
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current += (progressTarget - progress.current) * Math.min(1, delta * 3.0);
    const inRitual = openingPhase === 'opening' || openingPhase === 'flooding';

    // Seam glow only auto-driven when not in active door-opening animation
    if (seam.current && seamMat.current && !inRitual) {
      const breath = 0.82 + Math.sin(performance.now() * 0.002) * 0.18;
      seamMat.current.opacity = 0.18 + progress.current * 0.7 * breath;
      seam.current.scale.y = 0.4 + progress.current * 0.6;
    }
    if (halo.current && haloMat.current && !inRitual) {
      haloMat.current.opacity = progress.current * 0.18;
      halo.current.scale.x = 1 + progress.current * 0.45;
    }
  });

  // ── Door-opening animation ─────────────────────────────────────
  useEffect(() => {
    if (openingPhase !== 'opening') return;
    const lh = leftHalf.current;
    const lm = leftMat.current;
    const rh = rightHalf.current;
    const rm = rightMat.current;
    const sm = seam.current;
    const sMat = seamMat.current;
    const ha = halo.current;
    const hMat = haloMat.current;
    if (!lh || !lm || !rh || !rm || !sm || !sMat || !ha || !hMat) return;

    const tl = gsap.timeline();

    // 1. Doors materialize (fade in) so the player sees them appear
    tl.to([lm, rm], { opacity: 0.78, duration: 0.4, ease: 'power2.out' }, 0);

    // 2. Doors slide apart and tilt outward
    tl.to(lh.position, { x: -0.95, duration: 1.4, ease: 'power3.in' }, 0.15);
    tl.to(lh.rotation, { y: 0.42, duration: 1.4, ease: 'power3.in' }, 0.15);
    tl.to(rh.position, { x: 0.95, duration: 1.4, ease: 'power3.in' }, 0.15);
    tl.to(rh.rotation, { y: -0.42, duration: 1.4, ease: 'power3.in' }, 0.15);

    // 3. Seam expands into a wide horizontal light beam
    tl.to(sm.scale, { x: 14, y: 1.25, duration: 1.4, ease: 'power3.out' }, 0.15);
    tl.to(sMat, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.15);

    // 4. Halo blooms massively to fill the gap
    tl.to(ha.scale, { x: 6, y: 4, duration: 1.4, ease: 'power3.out' }, 0.15);
    tl.to(hMat, { opacity: 0.85, duration: 0.7, ease: 'power2.out' }, 0.15);

    // 5. Doors fade away as they slide out (so they don't block the flood)
    tl.to([lm, rm], { opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.0);

    return () => {
      tl.kill();
    };
  }, [openingPhase]);

  return (
    <group ref={root} position={[0, -0.15, -2.4]}>
      {/* Soft halo behind the seam — invisible at first */}
      <mesh ref={halo} position={[0, 0, -0.05]}>
        <planeGeometry args={[1.8, 3.0]} />
        <meshBasicMaterial
          ref={haloMat}
          color="#c4ac90"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Left half — INVISIBLE until opening (this fixes the framing bug) */}
      <group position={[-0.2, 0, 0]}>
        <mesh ref={leftHalf} position={[-0.2, 0, 0]}>
          <planeGeometry args={[0.4, 2.4]} />
          <meshBasicMaterial
            ref={leftMat}
            color="#162939"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Right half — same */}
      <group position={[0.2, 0, 0]}>
        <mesh ref={rightHalf} position={[0.2, 0, 0]}>
          <planeGeometry args={[0.4, 2.4]} />
          <meshBasicMaterial
            ref={rightMat}
            color="#162939"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Vertical seam — the only thing visible during the puzzle phase */}
      <mesh ref={seam} position={[0, 0, 0.01]}>
        <planeGeometry args={[0.06, 2.1]} />
        <meshBasicMaterial
          ref={seamMat}
          color="#f5e4cb"
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
