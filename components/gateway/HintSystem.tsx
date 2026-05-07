'use client';

import { useEffect, useState } from 'react';
import { useRunePuzzle } from '@/stores/runePuzzle';

const HINT_COPY: Record<0 | 1 | 2, string | null> = {
  0: null,
  1: '——风过沙原，有些石头比别的更暖。',
  2: '——闭上眼。它们想被看见、被根扎、被推开。',
};

/**
 * Idle-detection hint: nudges the player without spoiling.
 * Level 0 → 1 after 25s of inactivity, level 1 → 2 after another 25s.
 */
export function HintSystem() {
  const lastInteractionAt = useRunePuzzle((s) => s.lastInteractionAt);
  const hintLevel = useRunePuzzle((s) => s.hintLevel);
  const bumpHint = useRunePuzzle((s) => s.bumpHint);
  const isUnlocked = useRunePuzzle((s) => s.isUnlocked);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isUnlocked) return;
    const id = setInterval(() => {
      const idle = Date.now() - lastInteractionAt;
      if (idle > 25_000 && hintLevel < 2) bumpHint();
    }, 5000);
    return () => clearInterval(id);
  }, [lastInteractionAt, hintLevel, bumpHint, isUnlocked]);

  useEffect(() => {
    if (hintLevel === 0) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, [hintLevel]);

  const copy = HINT_COPY[hintLevel];
  if (!copy) return null;

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed bottom-16 left-1/2 -translate-x-1/2
                  font-display italic tracking-wider text-fog/70 text-sm md:text-base
                  transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {copy}
    </div>
  );
}
