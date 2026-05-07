'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import gsap from 'gsap';
import type { Mesh, MeshBasicMaterial } from 'three';
import { RUNES } from '@/lib/runes';
import { useRunePuzzle } from '@/stores/runePuzzle';

/**
 * "Stars connecting" effect — drawn between correct runes once they're lit.
 *
 *   • VertexNode  — bright bloom-friendly disc that pulses on each lit rune
 *   • FadingLine  — line segment that fades in with stagger, then breathes
 *   • The whole composition feels like a constellation being awakened
 *     and is amplified by the EffectComposer's Bloom pass.
 */

function VertexNode({ position }: { position: [number, number, number] }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  const haloMesh = useRef<Mesh>(null);
  const haloMat = useRef<MeshBasicMaterial>(null);

  useEffect(() => {
    const m = mesh.current;
    const ma = mat.current;
    if (!m || !ma) return;
    // Burst on activate
    gsap.fromTo(
      m.scale,
      { x: 0.05, y: 0.05, z: 0.05 },
      { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(2)' },
    );
    gsap.fromTo(ma, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });

    // Halo expanding ring (the "ping" feel)
    const hm = haloMesh.current;
    const hma = haloMat.current;
    if (hm && hma) {
      gsap.fromTo(
        hm.scale,
        { x: 0.4, y: 0.4, z: 0.4 },
        { x: 4, y: 4, z: 4, duration: 1.6, ease: 'power2.out' },
      );
      gsap.fromTo(hma, { opacity: 0.7 }, { opacity: 0, duration: 1.6, ease: 'power2.out' });
    }
  }, []);

  // Continuous pulse after burst
  useFrame(({ clock }) => {
    if (!mat.current) return;
    const breath = 0.78 + Math.sin(clock.elapsedTime * 1.7) * 0.22;
    mat.current.opacity = breath;
  });

  return (
    <group position={position}>
      {/* Expanding "ping" ring (one-shot) */}
      <mesh ref={haloMesh} scale={0.4}>
        <ringGeometry args={[0.18, 0.22, 64]} />
        <meshBasicMaterial
          ref={haloMat}
          color="#fbe5b8"
          transparent
          opacity={0.7}
          depthWrite={false}
          toneMapped={false}
          side={2}
        />
      </mesh>
      {/* Solid bright core (bloom catches this) */}
      <mesh ref={mesh} scale={0.05}>
        <circleGeometry args={[0.11, 32]} />
        <meshBasicMaterial
          ref={mat}
          color="#fbe5b8"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

interface FadingLineProps {
  points: [number, number, number][];
  delay: number;
}

function FadingLine({ points, delay }: FadingLineProps) {
  const lineRef = useRef<any>(null);

  useEffect(() => {
    const m = lineRef.current?.material;
    if (!m) return;
    const tl = gsap.timeline();
    tl.fromTo(
      m,
      { opacity: 0 },
      { opacity: 0.95, duration: 0.65, delay, ease: 'power2.out' },
    );
    // After draw-in, settle into a slow breath
    tl.to(m, {
      opacity: 0.55,
      duration: 1.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
    return () => {
      tl.kill();
    };
  }, [delay]);

  return (
    <Line
      ref={lineRef}
      points={points}
      color="#e0d7cf"
      lineWidth={2}
      transparent
      opacity={0}
      toneMapped={false}
    />
  );
}

export function ConnectionLines() {
  const states = useRunePuzzle((s) => s.states);

  // Stable lit positions — derived from authored rune order so that vertex keys
  // stay consistent across renders (avoids re-mounting / re-bursting).
  const litPositions = useMemo(() => {
    return RUNES.filter((r) => r.isCorrect && states[r.id] === 'lit').map((r) => ({
      id: r.id,
      pos: [
        r.position[0] * 3.4,
        r.position[1] * 1.8,
        r.position[2] * 0.6 + 0.15, // small z-bias to render above runes
      ] as [number, number, number],
    }));
  }, [states]);

  return (
    <group>
      {/* Vertex glow at each lit correct rune */}
      {litPositions.map((v) => (
        <VertexNode key={`vertex-${v.id}`} position={v.pos} />
      ))}

      {/* Connect them — fades in per leg with stagger */}
      {litPositions.length >= 2 && (
        <FadingLine
          key={`leg1-${litPositions[0].id}-${litPositions[1].id}`}
          points={[litPositions[0].pos, litPositions[1].pos]}
          delay={0}
        />
      )}
      {litPositions.length >= 3 && (
        <>
          <FadingLine
            key={`leg2-${litPositions[1].id}-${litPositions[2].id}`}
            points={[litPositions[1].pos, litPositions[2].pos]}
            delay={0.35}
          />
          <FadingLine
            key={`leg3-${litPositions[2].id}-${litPositions[0].id}`}
            points={[litPositions[2].pos, litPositions[0].pos]}
            delay={0.7}
          />
        </>
      )}
    </group>
  );
}
