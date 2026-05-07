'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ParallaxBackdrop } from './ParallaxBackdrop';
import { RuneField } from './RuneField';
import { CentralMonolith } from './CentralMonolith';
import { ConnectionLines } from './ConnectionLines';
import { CameraRig } from './CameraRig';
import { MoebiusEffect } from './effects/MoebiusEffect';

/**
 * The "rune ruins" scene — a 3D space the player explores.
 *
 *   • CameraRig : ambient slow orbit + cursor parallax → exploration feel
 *   • CentralMonolith : focal "gate" the player is heading toward
 *   • ParallaxBackdrop : horizon + buried sun + foreground stones
 *   • RuneField : ~96 drifting runes (6 puzzle + 90 decorative)
 *   • ConnectionLines : the sentence drawn between lit correct runes
 *   • Mœbius post-processing → ligne claire / Chants of Sennaar feel
 *   • Bloom on warm highlights, soft Vignette
 */
export function RuneRuinsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0e1f2a' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 5]} intensity={0.5} color="#b4d7d8" />

        <CameraRig />
        <ParallaxBackdrop />
        <CentralMonolith />
        <RuneField drifterCount={90} />
        <ConnectionLines />

        <EffectComposer multisampling={0}>
          <MoebiusEffect
            edgeStrength={2.0}
            posterizeLevels={5}
            hatchScale={9}
            hatchStrength={0.5}
            saturation={0.6}
          />
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
