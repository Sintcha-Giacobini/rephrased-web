'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export function MemoryPalaceSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-fade]'), {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative px-6 py-32 md:py-44 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          aria-hidden
          className="absolute right-1/4 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #e0d7cf 0%, transparent 70%)' }}
        />
      </div>

      <div className="mx-auto max-w-6xl grid md:grid-cols-12 gap-12 items-center">
        {/* Left: stylized isometric room */}
        <div data-fade className="md:col-span-7 md:order-1 order-2">
          <div className="relative aspect-[5/4] border border-bronze/25 bg-gradient-to-br from-ink-700/40 via-ink/30 to-ink-700/40 overflow-hidden">
            {/* corner ornaments */}
            <span aria-hidden className="absolute top-3 left-3 h-3 w-3 border-l border-t border-bronze/50" />
            <span aria-hidden className="absolute top-3 right-3 h-3 w-3 border-r border-t border-bronze/50" />
            <span aria-hidden className="absolute bottom-3 left-3 h-3 w-3 border-l border-b border-bronze/50" />
            <span aria-hidden className="absolute bottom-3 right-3 h-3 w-3 border-r border-b border-bronze/50" />

            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 480 360" className="w-[88%] h-[88%]" fill="none">
                {/* Floor light pool */}
                <ellipse cx="270" cy="240" rx="110" ry="22" fill="#e0d7cf" opacity="0.18" />

                {/* Isometric room frame */}
                <g stroke="#ab9072" strokeWidth="1.4" opacity="0.7">
                  <polygon points="120,250 380,250 430,200 170,200" fill="none" />
                  <polygon points="120,250 120,110 170,60 170,200" fill="none" />
                  <polygon points="380,250 430,200 430,60 380,110" fill="none" />
                  <line x1="170" y1="200" x2="380" y2="110" strokeDasharray="3 4" opacity="0.45" />
                </g>

                {/* Carved wall glyphs */}
                <g stroke="#e0d7cf" strokeWidth="1.6" opacity="0.85" strokeLinecap="round" strokeLinejoin="round">
                  {/* Left wall — eye */}
                  <path d="M138 152 C132 152 128 158 128 158 C128 158 132 164 138 164 C144 164 148 158 148 158 C148 158 144 152 138 152 Z M138 156 A2.5 2.5 0 1 0 138 161 A2.5 2.5 0 1 0 138 156 Z" />
                  {/* Left wall — gate */}
                  <path d="M132 100 L132 84 Q132 78 140 78 Q148 78 148 84 L148 100 M132 90 L148 90 M140 90 L140 100" />
                  {/* Right wall — tree */}
                  <path d="M404 145 L404 175 M404 153 L398 158 M404 153 L410 158 M404 162 L394 169 M404 162 L414 169" />
                  {/* Right wall — wave */}
                  <path d="M395 100 Q400 96 405 100 T415 100 M395 108 Q400 104 405 108 T415 108" />
                </g>

                {/* Tiny figure standing in the room */}
                <g fill="#e0d7cf" opacity="0.9">
                  <ellipse cx="270" cy="248" rx="3" ry="1.5" />
                  <rect x="268.5" y="232" width="3" height="14" rx="1.5" />
                  <circle cx="270" cy="228" r="3" />
                </g>
              </svg>
            </div>

            <p className="absolute bottom-4 left-5 font-display italic text-fog/40 text-xs tracking-widest">
              the room unfolds in the scene · placeholder
            </p>
          </div>
        </div>

        {/* Right: text */}
        <div className="md:col-span-5 md:order-2 order-1">
          <p data-fade className="font-display italic tracking-[0.45em] text-fog/55 text-[10px] uppercase">
            Sol's Notebook
          </p>
          <h2 data-fade className="mt-3 font-display text-4xl md:text-6xl text-sand leading-[1.05] text-balance">
            The Memory <span className="italic text-bronze">Palace.</span>
          </h2>
          <p data-fade className="mt-3 font-display italic tracking-widest text-fog/40 text-sm">
            記憶の宮殿
          </p>

          <p data-fade className="mt-8 text-fog/80 text-lg leading-[1.8]">
            Sol has no memory of his own — but he can keep one for the runes he meets. Press{' '}
            <kbd className="inline-block px-2 py-0.5 mx-1 border border-bronze/40 text-bronze font-display text-sm">
              Q
            </kbd>{' '}
            and a small room unfolds in the scene. The walls remember every rune you've found and
            every sentence you've spoken.
          </p>
          <p data-fade className="mt-6 font-display italic text-fog/55 text-base leading-[1.7]">
            It is not a UI. It is a place you can walk into.
          </p>
        </div>
      </div>
    </section>
  );
}
