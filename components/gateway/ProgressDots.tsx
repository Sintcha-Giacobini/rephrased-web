'use client';

import { useRunePuzzle } from '@/stores/runePuzzle';
import { CORRECT_IDS } from '@/lib/runes';

/**
 * Three quiet dots at the bottom of the gateway. Each fills warm-bronze
 * when a correct rune is lit. No counter text — the design pillar is
 * "less UI, more visual hints."
 */
export function ProgressDots() {
  const litCorrect = useRunePuzzle((s) => s.litCorrect);
  const isUnlocked = useRunePuzzle((s) => s.isUnlocked);

  if (isUnlocked) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center gap-3"
    >
      {CORRECT_IDS.map((_, i) => {
        const lit = i < litCorrect;
        return (
          <span
            key={i}
            className={`block h-[6px] w-[6px] rounded-full transition-all duration-700 ease-[var(--ease-cinematic)]
              ${lit
                ? 'bg-sand shadow-glow-sand scale-110'
                : 'bg-fog/15 scale-90'}`}
          />
        );
      })}
    </div>
  );
}
