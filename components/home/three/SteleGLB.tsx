'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useScroll } from '@react-three/drei';
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type MeshBasicMaterial,
} from 'three';
import { createRuneTexture } from '@/lib/runeTexture';
import { RUNES, type RuneId } from '@/lib/runes';

const GLB_PATH = '/models/stele.glb';
const TARGET_HEIGHT = 32;
const STELE_BOTTOM_Y = -16;

interface ColumnRuneDef {
  id: RuneId;
  y: number;
  angle: number;
  /**
   * Scroll position where this rune is fully lit. Visibility falls off
   * symmetrically over `scrollWindow / 2` on either side using a cosine
   * curve. Each rune's peak is aligned with the section in ScrollHtml.tsx
   * that introduces its meaning.
   */
  scrollPeak: number;
  scrollWindow: number;
  /** Eye sits above ground — visible from the start, fades only at void */
  alwaysVisible?: boolean;
}

/**
 * Section mapping (each section spans ~16.67% of scroll):
 *   Hero          0.00 - 0.17     EYE rune (above ground, visible from afar)
 *   Approach      0.17 - 0.33     transition (no specific rune)
 *   Awakening     0.33 - 0.50     TREE  (peak 0.42)
 *   Speak ...     0.50 - 0.67     GATE  (peak 0.58)
 *   Memory Palace 0.67 - 0.83     STAR  (peak 0.75)
 *   Void          0.83 - 1.00     FIRE + WAVE (peak 0.86 / 0.92)
 */
const COLUMN_RUNES: ColumnRuneDef[] = [
  { id: 'eye',  y:  10, angle: 0,                alwaysVisible: true,  scrollPeak: 0,    scrollWindow: 0    },
  { id: 'tree', y:  -2, angle: Math.PI * 1 / 3,                       scrollPeak: 0.42, scrollWindow: 0.18 },
  { id: 'gate', y:  -5, angle: Math.PI * 2 / 3,                       scrollPeak: 0.58, scrollWindow: 0.18 },
  { id: 'star', y:  -8, angle: Math.PI,                               scrollPeak: 0.75, scrollWindow: 0.18 },
  { id: 'fire', y: -11, angle: Math.PI * 4 / 3,                       scrollPeak: 0.86, scrollWindow: 0.14 },
  { id: 'wave', y: -14, angle: Math.PI * 5 / 3,                       scrollPeak: 0.92, scrollWindow: 0.10 },
];

export function SteleGLB() {
  const root = useRef<Group>(null);
  const scroll = useScroll();
  const gltf = useGLTF(GLB_PATH);

  // Pure WHITE stone — no self-emission. Visibility comes from scene lighting.
  // fog:false so the column reads the same color above ground and in the cave
  // (otherwise the tightening black fog tints it dark in the descent).
  const stoneMat = useMemo(() => {
    return new MeshStandardMaterial({
      color: new Color('#fafafa'),
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 1,
      fog: false,
    });
  }, []);

  const { scale, baseOffset, halfWidth } = useMemo(() => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material = stoneMat;
      }
    });
    gltf.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(gltf.scene);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = TARGET_HEIGHT / Math.max(size.y, 0.001);
    return {
      scale: s,
      baseOffset: new Vector3(-center.x * s, -box.min.y * s, -center.z * s),
      halfWidth: (Math.max(size.x, size.z) * s) / 2,
    };
  }, [gltf.scene, stoneMat]);

  useFrame(() => {
    const t = scroll.offset;
    const voidT = Math.max(0, Math.min(1, (t - 0.86) / 0.10));
    stoneMat.opacity = 1 - voidT;
  });

  return (
    <group ref={root} position={[0, STELE_BOTTOM_Y, 0]}>
      <group position={baseOffset} scale={scale}>
        <primitive object={gltf.scene} />
      </group>
      {COLUMN_RUNES.map((rune) => (
        <ColumnRune
          key={rune.id}
          def={rune}
          halfWidth={halfWidth}
          localY={rune.y - STELE_BOTTOM_Y}
        />
      ))}
    </group>
  );
}

function ColumnRune({
  def,
  halfWidth,
  localY,
}: {
  def: ColumnRuneDef;
  halfWidth: number;
  localY: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  const scroll = useScroll();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const texture = useMemo(() => {
    const r = RUNES.find((x) => x.id === def.id)!;
    return createRuneTexture({ path: r.path, size: 256, strokeWidth: 5 });
  }, [def.id]);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (!matRef.current) return;
    const t = scroll.offset;
    const voidT = Math.max(0, Math.min(1, (t - 0.92) / 0.06));
    const voidMul = 1 - voidT;

    let visibility: number;
    if (def.alwaysVisible) {
      // Eye fades out only at the very end (void)
      const fade = Math.max(0, Math.min(1, (t - 0.78) / 0.10));
      visibility = 0.85 * (1 - fade);
    } else {
      // Cosine bell centered on def.scrollPeak with half-width window/2
      const half = def.scrollWindow / 2;
      const dist = Math.abs(t - def.scrollPeak);
      visibility = dist > half ? 0 : Math.cos((dist / half) * (Math.PI / 2));
    }

    if (clicked) visibility = Math.max(visibility, 0.95);
    if (hovered) visibility = Math.min(1, visibility * 1.2);
    matRef.current.opacity = visibility * voidMul;
  });

  // Hug the column body — slight 0.02 bias to avoid z-fighting only
  const offset = halfWidth + 0.02;
  const tint = clicked ? '#fbe5b8' : hovered ? '#cce4e5' : '#f5e3cf';
  // Smaller, more inscription-like — caps at 2.0 wide × 2.5 tall so a
  // single rune never dominates the frame even at the closest spiral pass.
  const runeWidth = Math.min(halfWidth * 0.7, 2.0);
  const runeHeight = Math.min(halfWidth * 0.9, 2.5);

  return (
    <mesh
      ref={meshRef}
      position={[Math.sin(def.angle) * offset, localY, Math.cos(def.angle) * offset]}
      rotation={[0, def.angle, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        setClicked(true);
        console.log('[column rune] clicked:', def.id);
      }}
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
      <planeGeometry args={[runeWidth, runeHeight]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        color={tint}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

useGLTF.preload(GLB_PATH);
