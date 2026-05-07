'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { Scene } from './three/Scene';
import { ScrollHtml } from './ScrollHtml';

/**
 * The 3D home experience.
 *
 *   • One full-viewport Canvas
 *   • drei <ScrollControls> creates a virtual scroll surface (6 "pages")
 *   • <Scene> reads scroll progress to drive the camera
 *   • <Scroll html> overlays the hero title + per-section text on top
 *   • White flash overlay (DOM) for the restart sequence
 */
export function HomeExperience() {
  const [flashAlpha, setFlashAlpha] = useState(0);

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 50], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <ScrollControls pages={6} damping={0.3}>
          <Scene onFlash={setFlashAlpha} />
          <Scroll html style={{ width: '100%' }}>
            <ScrollHtml />
          </Scroll>
        </ScrollControls>
      </Canvas>

      {/* White flash overlay for the restart sequence — covers the canvas
          while the scroll snaps back to the top. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-white"
        style={{
          opacity: flashAlpha,
          transition:
            flashAlpha === 1
              ? 'opacity 0.4s ease-out'
              : 'opacity 0.7s ease-in',
        }}
      />
    </main>
  );
}
