'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { type Group, type MeshStandardMaterial } from 'three';
import { createRuneTexture } from '@/lib/runeTexture';
import { RUNES, type RuneId } from '@/lib/runes';

const FACE_RUNES: RuneId[] = ['eye', 'gate', 'tree', 'star'];
//                              front  right back   left
//   front: The Awakening
//   right: Speak to Reshape
//   back:  Memory Palace
//   left:  Wishlist

const HEIGHT = 4;
const WIDTH = 1.6;
const STONE_COLOR = '#7d8085';
const STONE_DARK = '#5d6166';

export function Stele() {
  const root = useRef<Group>(null);
  const bodyMat = useRef<MeshStandardMaterial>(null);
  const capMat = useRef<MeshStandardMaterial>(null);
  const baseMat = useRef<MeshStandardMaterial>(null);
  const scroll = useScroll();

  const textures = useMemo(
    () =>
      FACE_RUNES.map((id) => {
        const def = RUNES.find((r) => r.id === id)!;
        return createRuneTexture({ path: def.path, size: 512, strokeWidth: 6 });
      }),
    [],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  // Fade the stele into black during void phase.
  useFrame(() => {
    const t = scroll.offset;
    const voidT = Math.max(0, Math.min(1, (t - 0.78) / 0.16));
    const opacity = 1 - voidT;
    [bodyMat, capMat, baseMat].forEach((ref) => {
      if (ref.current) {
        ref.current.opacity = opacity;
        ref.current.transparent = true;
      }
    });
  });

  return (
    <group ref={root} position={[0, 4.25, 0]}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[WIDTH, HEIGHT, WIDTH]} />
        <meshStandardMaterial
          ref={bodyMat}
          color={STONE_COLOR}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>

      {/* Rune planes on each face — slight z-bias so they don't z-fight */}
      {FACE_RUNES.map((id, i) => {
        const angle = i * (Math.PI / 2);
        const offset = WIDTH / 2 + 0.005;
        return (
          <mesh
            key={id}
            position={[Math.sin(angle) * offset, 0, Math.cos(angle) * offset]}
            rotation={[0, angle, 0]}
          >
            <planeGeometry args={[WIDTH * 0.75, HEIGHT * 0.55]} />
            <meshBasicMaterial
              map={textures[i]}
              color="#2c2e32"
              transparent
              opacity={0.9}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Cap */}
      <mesh position={[0, HEIGHT / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH * 1.18, 0.2, WIDTH * 1.18]} />
        <meshStandardMaterial
          ref={capMat}
          color={STONE_DARK}
          roughness={0.85}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -HEIGHT / 2 - 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH * 1.32, 0.25, WIDTH * 1.32]} />
        <meshStandardMaterial
          ref={baseMat}
          color={STONE_DARK}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}
