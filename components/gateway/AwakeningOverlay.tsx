'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useRunePuzzle } from '@/stores/runePuzzle';

/**
 * Drives the post-puzzle ritual via the openingPhase store value.
 *
 *   1. isUnlocked → store sets phase = 'connecting' immediately
 *   2. After ~1.6s (lines drawing) → phase 'opening' (monolith doors split)
 *   3. After ~1.4s (doors opened) → phase 'flooding' (white plane fills)
 *   4. After ~0.5s → router.push('/home') with View Transitions API
 */
export function AwakeningOverlay() {
  const isUnlocked = useRunePuzzle((s) => s.isUnlocked);
  const phase = useRunePuzzle((s) => s.openingPhase);
  const setOpeningPhase = useRunePuzzle((s) => s.setOpeningPhase);
  const router = useRouter();

  const overlay = useRef<HTMLDivElement>(null);
  const flood = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const orchestrated = useRef(false);

  // Orchestrate phase transitions
  useEffect(() => {
    if (!isUnlocked || orchestrated.current) return;
    orchestrated.current = true;

    const tl = gsap.timeline();
    // Phase 1 was already 'connecting' (set by light()); wait for lines to draw.
    tl.to({}, { duration: 1.6 });
    // Phase 2: open the doors
    tl.add(() => setOpeningPhase('opening'));
    tl.to({}, { duration: 1.4 });
    // Phase 3: flood the screen with light
    tl.add(() => setOpeningPhase('flooding'));
    tl.to({}, { duration: 0.5 });
    // Phase 4: navigate via View Transitions
    tl.add(() => {
      const go = () => router.push('/home');
      // @ts-expect-error -- View Transitions API isn't fully typed yet
      if (typeof document !== 'undefined' && document.startViewTransition) {
        // @ts-expect-error
        document.startViewTransition(() => go());
      } else {
        go();
      }
    });

    return () => {
      tl.kill();
    };
  }, [isUnlocked, router, setOpeningPhase]);

  // Phase-driven DOM animations: flooding light + flash
  useEffect(() => {
    if (phase !== 'opening') return;
    // While doors are opening, soft warm overlay fades in to bridge to flood
    gsap.fromTo(
      overlay.current,
      { opacity: 0 },
      { opacity: 0.35, duration: 1.2, ease: 'power2.out' },
    );
  }, [phase]);

  useEffect(() => {
    if (phase !== 'flooding') return;
    // Flooding: a warm radial expands from monolith center, then a hard flash
    const tl = gsap.timeline();
    tl.fromTo(
      flood.current,
      { opacity: 0, scale: 0.2 },
      { opacity: 1, scale: 6, duration: 0.45, ease: 'power3.in' },
    );
    tl.to(flash.current, { opacity: 1, duration: 0.18, ease: 'power3.in' }, 0.15);
    return () => {
      tl.kill();
    };
  }, [phase]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden={!isUnlocked}>
      {/* Warm wash that fades in during 'opening' */}
      <div
        ref={overlay}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(224,215,207,0.42) 0%, rgba(171,144,114,0.18) 35%, transparent 70%)',
        }}
      />
      {/* Radial flood that expands from monolith during 'flooding' */}
      <div
        ref={flood}
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            'radial-gradient(circle, #fbe5b8 0%, #e0d7cf 28%, rgba(224,215,207,0.7) 55%, transparent 80%)',
        }}
      />
      {/* Final hard flash */}
      <div ref={flash} className="absolute inset-0 bg-sand opacity-0" />
    </div>
  );
}
