'use client';

import { create } from 'zustand';
import { RUNES, CORRECT_IDS, type RuneId } from '@/lib/runes';

type RuneState = 'dim' | 'lit' | 'rejected';

/**
 * idle:        no awakening yet
 * connecting:  isUnlocked just fired; star lines drawing (~1.6s)
 * opening:     monolith doors splitting + camera pushing in (~1.5s)
 * flooding:    white-light flash, view transition trigger (~0.5s)
 */
export type OpeningPhase = 'idle' | 'connecting' | 'opening' | 'flooding';

interface RunePuzzleState {
  states: Record<RuneId, RuneState>;
  litCorrect: number;
  isUnlocked: boolean;
  hintLevel: 0 | 1 | 2;
  lastInteractionAt: number;
  touched: Record<string, true>;
  openingPhase: OpeningPhase;

  light: (id: RuneId) => 'correct' | 'wrong' | 'noop';
  reject: (id: RuneId) => void;
  markTouched: (key: string) => void;
  unlock: () => void;
  reset: () => void;
  bumpHint: () => void;
  setOpeningPhase: (p: OpeningPhase) => void;
}

const initialStates = (): Record<RuneId, RuneState> =>
  RUNES.reduce(
    (acc, r) => ({ ...acc, [r.id]: 'dim' as RuneState }),
    {} as Record<RuneId, RuneState>,
  );

export const useRunePuzzle = create<RunePuzzleState>((set, get) => ({
  states: initialStates(),
  litCorrect: 0,
  isUnlocked: false,
  hintLevel: 0,
  lastInteractionAt: Date.now(),
  touched: {},
  openingPhase: 'idle',

  light: (id) => {
    const s = get();
    if (s.states[id] !== 'dim') return 'noop';
    const isCorrect = CORRECT_IDS.includes(id);

    if (isCorrect) {
      const litCorrect = s.litCorrect + 1;
      const justUnlocked = litCorrect >= CORRECT_IDS.length;
      set({
        states: { ...s.states, [id]: 'lit' },
        litCorrect,
        lastInteractionAt: Date.now(),
        isUnlocked: justUnlocked ? true : s.isUnlocked,
        openingPhase: justUnlocked ? 'connecting' : s.openingPhase,
      });
      return 'correct';
    } else {
      set({
        states: { ...s.states, [id]: 'rejected' },
        lastInteractionAt: Date.now(),
      });
      return 'wrong';
    }
  },

  reject: (id) => {
    set((s) => ({ states: { ...s.states, [id]: 'dim' } }));
  },

  markTouched: (key) => {
    set((s) => (s.touched[key] ? s : { touched: { ...s.touched, [key]: true } }));
  },

  unlock: () => set({ isUnlocked: true, openingPhase: 'connecting' }),
  reset: () =>
    set({
      states: initialStates(),
      litCorrect: 0,
      isUnlocked: false,
      hintLevel: 0,
      lastInteractionAt: Date.now(),
      touched: {},
      openingPhase: 'idle',
    }),
  bumpHint: () =>
    set((s) => ({ hintLevel: Math.min(2, s.hintLevel + 1) as 0 | 1 | 2 })),
  setOpeningPhase: (p) => set({ openingPhase: p }),
}));
