'use client';

import { create } from 'zustand';

interface CameraState {
  /** User-controlled dolly offset added to ambient orbit Z. Positive = further back. */
  dolly: number;
  setDolly: (n: number) => void;
  resetDolly: () => void;
}

export const useCameraState = create<CameraState>((set) => ({
  dolly: 0,
  setDolly: (n) => set({ dolly: n }),
  resetDolly: () => set({ dolly: 0 }),
}));
