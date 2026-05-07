'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

interface Sentence {
  a: { glyph: string; word: string; type: 'noun' | 'verb' };
  b: { glyph: string; word: string; type: 'noun' | 'verb' };
  result: string;
}

const SENTENCES: Sentence[] = [
  {
    a: { glyph: 'M14 50 Q34 30 54 50 T94 50 T114 50 M14 70 Q34 50 54 70 T94 70 T114 70 M14 90 Q34 70 54 90 T94 90 T114 90', word: 'river', type: 'noun' },
    b: { glyph: 'M64 8 L72 56 L120 64 L72 72 L64 120 L56 72 L8 64 L56 56 Z', word: 'reverse', type: 'verb' },
    result: 'and the water flows back to its source.',
  },
  {
    a: { glyph: 'M64 14 L114 110 L14 110 Z M64 50 L64 90 M50 70 L78 70', word: 'stone', type: 'noun' },
    b: { glyph: 'M64 14 L64 114 M64 40 L40 60 M64 40 L88 60 M64 70 L34 92 M64 70 L94 92', word: 'tree', type: 'noun' },
    result: 'and what was carved becomes what was rooted.',
  },
  {
    a: { glyph: 'M64 32 C32 32 12 64 12 64 C12 64 32 96 64 96 C96 96 116 64 116 64 C116 64 96 32 64 32 Z M64 50 A14 14 0 1 0 64 78 A14 14 0 1 0 64 50 Z', word: 'time', type: 'noun' },
    b: { glyph: 'M64 8 L72 56 L120 64 L72 72 L64 120 L56 72 L8 64 L56 56 Z', word: 'reverse', type: 'verb' },
    result: 'and yesterday begins again, and you remember more.',
  },
];

function GlyphIcon({ d, size = 44 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none"
         stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function RuneMechanicSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-fade]'), {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative px-6 py-32 md:py-44 overflow-hidden">
      {/* Cool-leaning backdrop with a faint scroll/parchment vignette */}
      <div className="absolute inset-0 -z-10">
        <div
          aria-hidden
          className="absolute right-0 top-1/4 h-[520px] w-[520px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #27606c 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute left-1/4 bottom-0 h-[300px] w-[300px] rounded-full blur-3xl opacity-12"
          style={{ background: 'radial-gradient(circle, #ab9072 0%, transparent 70%)' }}
        />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="grid grid-cols-12 gap-8 mb-20">
          <div className="col-span-12 md:col-span-5">
            <p data-fade className="font-display italic tracking-[0.45em] text-fog/55 text-[10px] uppercase">
              The Mechanic
            </p>
            <h2 data-fade className="mt-3 font-display text-4xl md:text-6xl text-sand leading-[1.05] text-balance">
              Speak it again,
              <br />
              <span className="italic text-bronze">in another tongue.</span>
            </h2>
            <p data-fade className="mt-6 font-display italic tracking-widest text-fog/40 text-sm">
              言以塑形 · Rune Sentences
            </p>
          </div>
          <div className="col-span-12 md:col-span-7 md:pl-6 self-end">
            <p data-fade className="text-fog/80 text-lg leading-[1.8]">
              Runes come in two kinds — <span className="text-sand">nouns</span> for what is, and{' '}
              <span className="text-sand">verbs</span> for how it changes. Click them in sequence
              to form a sentence. If the sentence is grammatical, the world obeys.
            </p>
          </div>
        </div>

        {/* Parchment-like sentence tablets */}
        <div data-fade className="rounded-sm border border-bronze/25 bg-gradient-to-b from-ink-700/60 to-ink/60 backdrop-blur-sm">
          {SENTENCES.map((s, i) => (
            <div
              key={i}
              data-fade
              className={`grid grid-cols-1 md:grid-cols-[auto_auto_auto_1fr] items-center gap-6 md:gap-10
                          px-8 md:px-12 py-10
                          ${i !== SENTENCES.length - 1 ? 'border-b border-bronze/15' : ''}`}
            >
              <div className="flex items-center gap-4 text-fog">
                <GlyphIcon d={s.a.glyph} />
                <div>
                  <p className="font-display text-2xl md:text-3xl text-sand">{s.a.word}</p>
                  <p className="font-display italic text-fog/40 text-[10px] uppercase tracking-[0.3em]">
                    {s.a.type}
                  </p>
                </div>
              </div>

              <span className="font-display text-bronze/50 text-3xl md:text-4xl">+</span>

              <div className="flex items-center gap-4 text-fog">
                <GlyphIcon d={s.b.glyph} />
                <div>
                  <p className="font-display text-2xl md:text-3xl text-sand">{s.b.word}</p>
                  <p className="font-display italic text-fog/40 text-[10px] uppercase tracking-[0.3em]">
                    {s.b.type}
                  </p>
                </div>
              </div>

              <p className="font-display italic text-fog/75 text-base md:text-lg leading-[1.7] text-balance md:border-l md:border-bronze/20 md:pl-6">
                {s.result}
              </p>
            </div>
          ))}
        </div>

        <p data-fade className="mt-16 max-w-3xl font-display italic text-fog/55 text-base md:text-lg leading-[1.8]">
          Later, the line between rune and world dissolves. A cloud shaped like the{' '}
          <span className="text-sand">rotate</span> rune <em>is</em> the rotate rune. The horizon
          you walk toward might already be a sentence waiting to be read.
        </p>
      </div>
    </section>
  );
}
