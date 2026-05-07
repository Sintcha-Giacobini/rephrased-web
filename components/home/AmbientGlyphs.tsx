'use client';

import { useEffect, useRef } from 'react';

/**
 * Slow-drifting glyph silhouettes layered behind a section as atmosphere.
 * Pure SVG + CSS — no canvas, cheap, won't affect 3D contexts.
 */

const GLYPHS = [
  'M64 32 C32 32 12 64 12 64 C12 64 32 96 64 96 C96 96 116 64 116 64 C116 64 96 32 64 32 Z M64 50 A14 14 0 1 0 64 78 A14 14 0 1 0 64 50 Z',
  'M64 14 L64 114 M64 40 L40 60 M64 40 L88 60 M64 70 L34 92 M64 70 L94 92',
  'M28 110 L28 38 Q28 18 64 18 Q100 18 100 38 L100 110 M28 60 L100 60 M64 60 L64 110',
  'M64 14 L114 110 L14 110 Z M64 50 L64 90 M50 70 L78 70',
  'M64 8 L72 56 L120 64 L72 72 L64 120 L56 72 L8 64 L56 56 Z',
  'M14 50 Q34 30 54 50 T94 50 T114 50 M14 70 Q34 50 54 70 T94 70 T114 70 M14 90 Q34 70 54 90 T94 90 T114 90',
];

interface Item {
  id: number;
  glyph: number;
  x: number; // %
  y: number; // %
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  opacity: number;
}

function seededField(count: number, seed = 41): Item[] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  return Array.from({ length: count }, (_, id) => ({
    id,
    glyph: Math.floor(rand() * GLYPHS.length),
    x: rand() * 100,
    y: rand() * 100,
    size: 20 + rand() * 50,
    rotation: rand() * 360,
    duration: 18 + rand() * 25,
    delay: -rand() * 30,
    opacity: 0.05 + rand() * 0.12,
  }));
}

interface Props {
  count?: number;
  seed?: number;
  className?: string;
}

export function AmbientGlyphs({ count = 22, seed = 41, className = '' }: Props) {
  const items = useRef(seededField(count, seed));

  useEffect(() => {
    items.current = seededField(count, seed);
  }, [count, seed]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.current.map((it) => (
        <span
          key={it.id}
          className="absolute drift-glyph"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: it.size,
            height: it.size,
            opacity: it.opacity,
            animation: `glyph-drift ${it.duration}s linear ${it.delay}s infinite`,
            color: '#b4d7d8',
          }}
        >
          <svg
            viewBox="0 0 128 128"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: `rotate(${it.rotation}deg)` }}
          >
            <path d={GLYPHS[it.glyph]} />
          </svg>
        </span>
      ))}
      <style jsx>{`
        @keyframes glyph-drift {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(-30px, 80px) rotate(8deg);
          }
        }
      `}</style>
    </div>
  );
}
