'use client';

import { useMemo } from 'react';
import { Rune3D } from './Rune3D';
import { generateRuneField } from '@/lib/runeField';

interface Props {
  /** How many decorative drifters to render in addition to the 6 puzzle runes */
  drifterCount?: number;
  /** Seed for stable layout across hot reloads */
  seed?: number;
}

export function RuneField({ drifterCount = 90, seed = 1729 }: Props) {
  const instances = useMemo(
    () => generateRuneField({ drifterCount, seed }),
    [drifterCount, seed],
  );

  return (
    <group>
      {instances.map((inst) => (
        <Rune3D key={inst.key} inst={inst} />
      ))}
    </group>
  );
}
