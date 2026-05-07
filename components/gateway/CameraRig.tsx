'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useRunePuzzle } from '@/stores/runePuzzle';
import { useCameraState } from '@/stores/cameraState';

export function CameraRig() {
  const { camera, pointer } = useThree();
  const t = useRef(0);
  const target = useRef(new Vector3(0, 0, 6));
  const phase = useRunePuzzle((s) => s.openingPhase);

  useFrame((_, delta) => {
    t.current += delta;

    // Ritual phases override ambient orbit
    if (phase === 'connecting') {
      // Hold camera near the monolith so the user sees the constellation form
      target.current.set(0, 0, 4.5);
      camera.position.lerp(target.current, 0.025);
      camera.lookAt(0, 0, -2);
      return;
    }
    if (phase === 'opening') {
      // Push toward the doorway as the halves split
      target.current.set(0, -0.1, 1.0);
      camera.position.lerp(target.current, 0.045);
      camera.lookAt(0, -0.1, -3);
      return;
    }
    if (phase === 'flooding') {
      // Push through the gap into the white
      target.current.set(0, -0.1, -1.5);
      camera.position.lerp(target.current, 0.12);
      camera.lookAt(0, -0.1, -4);
      return;
    }

    // Ambient — user is exploring
    const dolly = useCameraState.getState().dolly;
    const orbitX = Math.sin(t.current * 0.20) * 1.7;
    const orbitY = Math.sin(t.current * 0.13) * 0.55;
    const orbitZ = 6 + Math.cos(t.current * 0.075) * 0.7 + dolly;
    const mouseX = pointer.x * 0.7;
    const mouseY = pointer.y * 0.35;
    target.current.set(orbitX + mouseX, orbitY + mouseY, orbitZ);
    camera.position.lerp(target.current, 0.045);
    camera.lookAt(0, 0, -1);
  });

  return null;
}
