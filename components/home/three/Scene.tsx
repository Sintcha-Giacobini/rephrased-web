'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import {
  Color,
  Fog,
  Vector2,
  type AmbientLight,
  type DirectionalLight,
  type HemisphereLight,
} from 'three';
import { CameraScrollRig } from './CameraScrollRig';
import { SkyDesert } from './SkyDesert';
import { DesertTerrain } from './DesertTerrain';
import { SteleGLB } from './SteleGLB';
import { VoidScene } from './VoidScene';

const FOG_COLOR_DAY = new Color('#dcc7af');
const FOG_COLOR_NIGHT = new Color('#000000');

interface SceneProps {
  onFlash?: (alpha: number) => void;
}

export function Scene({ onFlash }: SceneProps) {
  const { scene } = useThree();
  const scroll = useScroll();
  const ambientRef = useRef<AmbientLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const dirLightRef = useRef<DirectionalLight>(null);

  useEffect(() => {
    scene.fog = new Fog('#dcc7af', 32, 80);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  /**
   * Lighting policy:
   *   Daylight  ambient 0.6 + hemi 0.55 + sun 1.2  → bright desert
   *   Cave      ambient 1.6 + hemi 1.0 + sun 0.4   → strong AMBIENT GLOW
   *                                                   from "everywhere",
   *                                                   gives the column
   *                                                   gentle visibility
   *                                                   without making it
   *                                                   self-emissive
   *
   * Terrain & sky go to color=black via vertex/material color, so they
   * stay pitch black even with bumped lights — only the actual rocks
   * (column, runes) catch the light.
   */
  useFrame(() => {
    const t = scroll.offset;
    const dark = Math.max(0, Math.min(1, (t - 0.20) / 0.13));

    if (ambientRef.current) {
      ambientRef.current.intensity = 0.6 + dark * 1.0;   // 0.6 → 1.6
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = 0.55 + dark * 0.45;    // 0.55 → 1.0
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = 1.2 * (1 - dark) + 0.4; // 1.2 → 0.4
    }

    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(FOG_COLOR_DAY).lerp(FOG_COLOR_NIGHT, dark);
      scene.fog.near = 32 - dark * 22; // 32 → 10
      scene.fog.far = 80 - dark * 50;  // 80 → 30
    }
  });

  return (
    <Suspense fallback={null}>
      <ambientLight ref={ambientRef} intensity={0.6} />
      <hemisphereLight
        ref={hemiRef}
        color="#cfe7f8"
        groundColor="#cfb89e"
        intensity={0.55}
      />
      <directionalLight
        ref={dirLightRef}
        position={[8, 14, 5]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={55}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0008}
      />

      <CameraScrollRig />
      <SkyDesert />
      <DesertTerrain />
      <SteleGLB />
      <VoidScene onFlash={onFlash} />

      {/* Post-processing — Bloom catches stars & runes (basicMaterial unlit
          with toneMapped:false). Bloom threshold tuned high enough so the
          column doesn't bloom (it's not self-emissive any more). */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.95}
          luminanceSmoothing={0.45}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.00025, 0.00025)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} premultiply />
      </EffectComposer>
    </Suspense>
  );
}
