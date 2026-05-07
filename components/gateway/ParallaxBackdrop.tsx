'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';

/**
 * Backdrop for the rune ruins — pure ink + a single warm "buried sun".
 *
 * Earlier versions had ocean horizon planes and foreground stones;
 * the Mœbius shader's edge detection traced their borders into a
 * weird teal slab and a "U-shape" valley. Now the only thing in the
 * world besides the runes is the warm anchor + the central monolith.
 */
export function ParallaxBackdrop() {
  const sun = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (sun.current) {
      sun.current.position.x = pointer.x * 0.3;
      sun.current.position.y = pointer.y * 0.15 + 0.1;
    }
  });

  return (
    <group ref={sun} position={[0, 0.1, -4.0]}>
      {/* Outer warm halo */}
      <mesh>
        <circleGeometry args={[3.8, 64]} />
        <meshBasicMaterial color="#ab9072" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {/* Inner brighter core */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[1.8, 64]} />
        <meshBasicMaterial color="#e0d7cf" transparent opacity={0.10} depthWrite={false} />
      </mesh>
    </group>
  );
}
