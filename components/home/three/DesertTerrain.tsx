'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import {
  BufferAttribute,
  Color,
  PlaneGeometry,
  type MeshStandardMaterial,
} from 'three';
import { fractalNoise, smoothstep } from '@/lib/noise';

/**
 * Wide-cavity inverted crater. The pit is now ~5× wider so the camera's
 * spiral descent always has cavity around it, and the terrain mesh is
 * DoubleSide so the cavity walls render correctly when the camera is
 * inside the pit (no more "looking through the ground" bug).
 */

const SIZE = 320;
const SEGMENTS = 260;
const BASE_Y = -1.5;

// Pit — much wider + same depth
const PIT_DEPTH = 16.0;
const PIT_SIGMA = 5.5;          // was 3.0 — pit now spans ~radius 11 of significant depth

// Hill ring pushed further out
const HILL_AMP = 4.0;
const HILL_RADIUS = 9.0;
const HILL_SIGMA = 1.8;

// Far dunes start past the rim
const DUNE_AMP = 3.0;
const DUNE_FREQ = 0.024;
const DUNE_MASK_INNER = 12.0;
const DUNE_MASK_OUTER = 18.0;

const MED_AMP = 0.9;
const MED_FREQ = 0.075;
const SMALL_AMP = 0.40;
const SMALL_FREQ = 0.16;
const RIPPLE_AMP = 0.12;
const RIPPLE_FREQ = 0.55;

const C_PIT = new Color('#2a1e16');
const C_VALLEY = new Color('#5e4c3a');
const C_GROUND = new Color('#cab39c');
const C_MID = new Color('#e8d6c2');
const C_PEAK = new Color('#f5e3cf');

function gaussian(x: number, mu: number, sigma: number) {
  const dx = (x - mu) / sigma;
  return Math.exp(-dx * dx);
}

export function DesertTerrain() {
  const matRef = useRef<MeshStandardMaterial>(null);
  const scroll = useScroll();

  const geometry = useMemo(() => {
    const geom = new PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    const positions = geom.attributes.position;
    const colorArr = new Float32Array(positions.count * 3);
    const tmp = new Color();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const dist = Math.sqrt(x * x + y * y);

      const pit = -PIT_DEPTH * gaussian(dist, 0, PIT_SIGMA);
      const hill = HILL_AMP * gaussian(dist, HILL_RADIUS, HILL_SIGMA);

      // Inner-region noise mask — inside the pit, no surface noise
      const noiseMask = smoothstep(4, 9, dist);

      const dunesMask = smoothstep(DUNE_MASK_INNER, DUNE_MASK_OUTER, dist);
      const dunes =
        fractalNoise(x * DUNE_FREQ, y * DUNE_FREQ, 4) * DUNE_AMP * dunesMask;
      const med =
        fractalNoise(x * MED_FREQ + 100, y * MED_FREQ + 100, 3) *
        MED_AMP *
        noiseMask;
      const small =
        fractalNoise(x * SMALL_FREQ + 300, y * SMALL_FREQ + 300, 3) *
        SMALL_AMP *
        noiseMask;
      const ripples =
        fractalNoise(x * RIPPLE_FREQ + 500, y * RIPPLE_FREQ + 500, 2) *
        RIPPLE_AMP *
        noiseMask;

      const h = pit + hill + dunes + med + small + ripples;
      positions.setZ(i, h);

      // Color across 5 stops
      const f = Math.max(
        0,
        Math.min(1, (h + PIT_DEPTH) / (HILL_AMP + PIT_DEPTH + DUNE_AMP)),
      );
      if (f < 0.18) {
        tmp.copy(C_PIT).lerp(C_VALLEY, f / 0.18);
      } else if (f < 0.40) {
        tmp.copy(C_VALLEY).lerp(C_GROUND, (f - 0.18) / 0.22);
      } else if (f < 0.65) {
        tmp.copy(C_GROUND).lerp(C_MID, (f - 0.40) / 0.25);
      } else {
        tmp.copy(C_MID).lerp(C_PEAK, (f - 0.65) / 0.35);
      }
      colorArr[i * 3] = tmp.r;
      colorArr[i * 3 + 1] = tmp.g;
      colorArr[i * 3 + 2] = tmp.b;
    }

    positions.needsUpdate = true;
    geom.setAttribute('color', new BufferAttribute(colorArr, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (!matRef.current) return;
    const t = scroll.offset;
    // Aligned with camera DESCENT phase (0.22→0.33)
    const dark = Math.max(0, Math.min(1, (t - 0.20) / 0.13));
    const v = 1 - dark;
    matRef.current.color.setRGB(v, v, v);
  });

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, BASE_Y, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        ref={matRef}
        vertexColors
        color={0xffffff}
        roughness={0.96}
        metalness={0.0}
      />
    </mesh>
  );
}

export const HILL_RIM_Y = BASE_Y + HILL_AMP;
export const PIT_FLOOR_Y = BASE_Y - PIT_DEPTH;
