'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { Color, type MeshBasicMaterial } from 'three';

/**
 * Single-color upper hemisphere sky dome.
 *
 *  • Hemisphere geometry (only upper half rendered) — looking down sees
 *    canvas clear color (black), not blue. No more "blue triangle through
 *    the pit" or stripe of haze at horizon.
 *  • Single uniform sky color.
 *  • Lerps to black on the master darkening curve.
 */
const SKY = new Color('#148ee2');
const BLACK = new Color('#000000');

export function SkyDesert() {
  const skyMat = useRef<MeshBasicMaterial>(null);
  const scroll = useScroll();

  useFrame(() => {
    const t = scroll.offset;
    const dark = Math.max(0, Math.min(1, (t - 0.20) / 0.13));
    if (skyMat.current) {
      skyMat.current.color.copy(SKY).lerp(BLACK, dark);
    }
  });

  return (
    <mesh>
      {/* sphereGeometry args: [radius, widthSeg, heightSeg, phiStart, phiLength, thetaStart, thetaLength]
          thetaStart=0 + thetaLength=π/2 = upper hemisphere only */}
      <sphereGeometry args={[80, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshBasicMaterial
        ref={skyMat}
        color={SKY}
        side={1}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}
