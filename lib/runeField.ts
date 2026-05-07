import { RUNES, type RuneId } from './runes';

export interface RuneInstance {
  key: string;
  runeId: RuneId;
  /** One of the six puzzle runes (clickable, possibly correct) */
  isPuzzle: boolean;
  isCorrect: boolean;
  /** World-space position */
  position: [number, number, number];
  /** Z-rotation in radians */
  rotation: number;
  /** World-space size */
  scale: number;
  /** Continuous downward drift speed (world units / second). 0 = float in place. */
  driftSpeed: number;
  /** Phase offset for sine-based wobble */
  phase: number;
  /** Wobble frequency */
  wobbleFreq: number;
  /** Slow tumble (rotation drift) speed in rad/s */
  tumbleSpeed: number;
  /** Base opacity 0..1 */
  opacity: number;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface FieldOpts {
  drifterCount?: number;
  seed?: number;
  /** World-volume bounds */
  width?: number;   // total x span
  height?: number;  // total y span
  depth?: number;   // total z span
}

/**
 * Build the rune field:
 *   - 6 puzzle runes at their authored positions, larger and brighter
 *   - N decorative drifters at random positions, smaller and dimmer
 *
 * Decorative runes still answer hover/click, but only the 3 correct
 * puzzle runes count toward the awakening.
 */
export function generateRuneField(opts: FieldOpts = {}): RuneInstance[] {
  const {
    drifterCount = 90,
    seed = 1729,
    width = 18,
    height = 12,
    depth = 5,
  } = opts;
  const rand = mulberry32(seed);

  // Puzzle runes — pick up authored positions, anchor in front of camera.
  const puzzle: RuneInstance[] = RUNES.map((r, i) => ({
    key: `puzzle-${r.id}`,
    runeId: r.id,
    isPuzzle: true,
    isCorrect: r.isCorrect,
    position: [r.position[0] * 3.4, r.position[1] * 1.8, r.position[2] * 0.6],
    rotation: r.rotation,
    scale: 0.85,
    driftSpeed: 0,
    phase: i * 0.7,
    wobbleFreq: 0.5 + rand() * 0.3,
    tumbleSpeed: 0,
    opacity: 0.7,
  }));

  // Drifters — random everywhere
  const drifters: RuneInstance[] = [];
  for (let i = 0; i < drifterCount; i++) {
    const def = RUNES[Math.floor(rand() * RUNES.length)];
    const z = -depth + rand() * (depth + 1.5);
    // Smaller scale for things further back
    const distAttenuation = (z + depth) / (depth + 1.5); // 0..1
    const baseScale = 0.18 + rand() * 0.32;
    drifters.push({
      key: `drift-${i}`,
      runeId: def.id,
      isPuzzle: false,
      isCorrect: false,
      position: [
        (rand() - 0.5) * width,
        (rand() - 0.5) * height,
        z,
      ],
      rotation: (rand() - 0.5) * Math.PI,
      scale: baseScale,
      driftSpeed: 0.04 + rand() * 0.08,
      phase: rand() * Math.PI * 2,
      wobbleFreq: 0.25 + rand() * 0.6,
      tumbleSpeed: (rand() - 0.5) * 0.06,
      opacity: 0.12 + distAttenuation * 0.28,
    });
  }

  return [...puzzle, ...drifters];
}

export const FIELD_HEIGHT = 12; // exposed so the drift loop knows the wrap range
