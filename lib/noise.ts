/**
 * Cheap deterministic 2D value-noise + fractal stack.
 * Good enough for terrain displacement — visually similar to simplex
 * for our scale, with no dependencies.
 */

function hash2D(x: number, y: number): number {
  // Classic sin-based hash. Not cryptographic, but reproducible across machines.
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return h - Math.floor(h);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  // Quintic smoothstep — softer derivative than cubic
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);

  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
}

/** Multi-octave fractal noise. Returns roughly [-1, 1]. */
export function fractalNoise(
  x: number,
  y: number,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0,
): number {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    total += smoothNoise(x * frequency, y * frequency) * amplitude;
    maxAmp += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return (total / maxAmp) * 2 - 1;
}

/** smoothstep helper */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
