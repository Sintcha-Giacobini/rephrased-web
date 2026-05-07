'use client';

import { useEffect } from 'react';
import { useCameraState } from '@/stores/cameraState';

const MIN_DOLLY = -3.5; // closer to monolith
const MAX_DOLLY = 5.5;  // further away
const SCROLL_FACTOR = 0.0035;

/**
 * Captures mouse wheel events on the gateway and translates them to a
 * dolly offset on the camera (read by CameraRig). Page is overflow:hidden
 * so the wheel doesn't scroll anything else; we hijack it for camera
 * push/pull.
 */
export function WheelDolly() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Don't hijack wheel inside scrollable subtrees if any (defensive)
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-allow-scroll]')) return;

      e.preventDefault();
      const cur = useCameraState.getState().dolly;
      const next = Math.max(
        MIN_DOLLY,
        Math.min(MAX_DOLLY, cur + e.deltaY * SCROLL_FACTOR),
      );
      useCameraState.getState().setDolly(next);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      useCameraState.getState().resetDolly();
    };
  }, []);

  return null;
}
