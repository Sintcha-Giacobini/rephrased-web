'use client';

import { useEffect } from 'react';
import { useRunePuzzle } from '@/stores/runePuzzle';

/**
 * Resets the puzzle state every time the gateway mounts.
 * This protects against the case where the user navigates / -> /home -> back to /,
 * which preserves React state across SPA route changes.
 *
 * Hard refresh already gives us a fresh in-memory store; this handles soft navs.
 */
export function GatewayBootstrap() {
  useEffect(() => {
    useRunePuzzle.getState().reset();
  }, []);
  return null;
}
