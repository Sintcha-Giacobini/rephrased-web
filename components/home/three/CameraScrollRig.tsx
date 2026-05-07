'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { Vector3 } from 'three';

/**
 * Camera path that aligns BOTH altitude AND azimuth to the active rune.
 *
 *   Each rune on the column is at a known (y, angle) position. At its
 *   scroll peak, the camera is positioned at the SAME angle around the
 *   column, at the SAME altitude — so the rune sits dead-centre in the
 *   frame, fully visible (not occluded by the column body).
 *
 *   Between peaks, both altitude and angle are smoothly interpolated.
 *   Between every pair of adjacent peaks the camera does ONE full extra
 *   turn around the column, so the journey still feels like a spiral.
 */
const RUNE_ANCHORS: Array<{ peak: number; y: number; angle: number }> = [
  { peak: 0.10, y: 10, angle: 0 },                    // EYE
  { peak: 0.42, y: -2, angle: Math.PI * 1 / 3 },     // TREE  60°
  { peak: 0.58, y: -5, angle: Math.PI * 2 / 3 },     // GATE  120°
  { peak: 0.75, y: -8, angle: Math.PI },             // STAR  180°
  { peak: 0.86, y: -11, angle: Math.PI * 4 / 3 },    // FIRE  240°
  { peak: 0.92, y: -14, angle: Math.PI * 5 / 3 },    // WAVE  300°
];

// Cumulative camera angles — each transition adds one full extra turn so
// the camera spirals between peaks (5 transitions × ~420° ≈ 5.8 turns).
const CUM_ANGLES = (() => {
  const out = [RUNE_ANCHORS[0].angle];
  for (let i = 1; i < RUNE_ANCHORS.length; i++) {
    const diff = RUNE_ANCHORS[i].angle - RUNE_ANCHORS[i - 1].angle;
    const forward = diff <= 0 ? diff + Math.PI * 2 : diff;
    out.push(out[i - 1] + forward + Math.PI * 2);
  }
  return out;
})();

interface RuneState {
  y: number;
  angle: number;
}

function activeRuneState(scroll: number): RuneState {
  if (scroll <= RUNE_ANCHORS[0].peak) {
    return { y: RUNE_ANCHORS[0].y, angle: CUM_ANGLES[0] };
  }
  for (let i = 0; i < RUNE_ANCHORS.length - 1; i++) {
    const a = RUNE_ANCHORS[i];
    const b = RUNE_ANCHORS[i + 1];
    if (scroll <= b.peak) {
      const t = (scroll - a.peak) / (b.peak - a.peak);
      const smooth = t * t * (3 - 2 * t);
      return {
        y: a.y + (b.y - a.y) * smooth,
        angle: CUM_ANGLES[i] + (CUM_ANGLES[i + 1] - CUM_ANGLES[i]) * smooth,
      };
    }
  }
  return {
    y: RUNE_ANCHORS[RUNE_ANCHORS.length - 1].y,
    angle: CUM_ANGLES[CUM_ANGLES.length - 1],
  };
}

export function CameraScrollRig() {
  const { camera } = useThree();
  const scroll = useScroll();
  const target = useRef(new Vector3());
  const lookTarget = useRef(new Vector3());

  useFrame(({ clock }) => {
    const t = scroll.offset;

    if (t < 0.10) {
      // Wide
      const k = t / 0.10;
      target.current.set(Math.sin(k * 0.3) * 0.3, 2.0, 42 - k * 6);
      lookTarget.current.set(0, 11, 0);
    } else if (t < 0.22) {
      // Approach (no descent)
      const k = (t - 0.10) / 0.12;
      target.current.set(0, 2.0 + k * 1.0, 36 - k * 24);
      lookTarget.current.set(0, 11 - k * 5, 0);
    } else if (t < 0.33) {
      // Descent: arc into the cavity from the EYE side toward TREE side
      const k = (t - 0.22) / 0.11;
      const startAngle = 0;                       // eye angle
      const endAngle = RUNE_ANCHORS[1].angle + Math.PI * 2; // tree + 1 turn
      const angle = startAngle + (endAngle - startAngle) * k;
      const y = 3 + (-2 - 3) * k;
      target.current.set(Math.sin(angle) * 12, y, Math.cos(angle) * 12);
      lookTarget.current.set(0, 6 + (-2 - 6) * k, 0);
    } else if (t < 0.92) {
      // SPIRAL — camera state aligned with active rune (y + angle)
      const state = activeRuneState(t);
      // Radius shrinks slightly through the spiral but stays comfortable
      const k = (t - 0.33) / 0.59;
      const radius = 13 - k * 3; // 13 → 10
      target.current.set(
        Math.sin(state.angle) * radius,
        state.y,
        Math.cos(state.angle) * radius,
      );
      lookTarget.current.set(0, state.y, 0);
    } else {
      // Void — drift past the column AND keep auto-rotating with time
      // (so even when the user is parked at scroll = 1, the camera
      // continues to orbit slowly — endless rotation around the column.)
      const k = (t - 0.92) / 0.08;
      const lastAngle = CUM_ANGLES[CUM_ANGLES.length - 1];
      const baseAngle = lastAngle + k * Math.PI * 0.5;
      const autoRot = clock.elapsedTime * 0.18 * k; // ramps up as we land
      const angle = baseAngle + autoRot;
      const radius = 10 + k * 4;
      const y = -14 - k * 6;
      target.current.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
      lookTarget.current.set(0, -16 - k * 4, 0);
    }

    camera.position.lerp(target.current, 0.12);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
