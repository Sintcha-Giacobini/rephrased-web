'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { WishlistButton } from './WishlistButton';
import { AmbientGlyphs } from './AmbientGlyphs';

export function Hero() {
  const eyebrow = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const tagline = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(eyebrow.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo(title.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, '-=0.4')
      .fromTo(tagline.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0 }, '-=0.8')
      .fromTo(lede.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
      .fromTo(cta.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.3')
      .fromTo(meta.current, { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.3');
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* ── Sky → Ocean → Ink gradient (the cyan sky over desert) ── */}
      <div className="absolute inset-0 -z-10">
        {/* Layered vertical gradient: bright sky at top, deep sea below */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-700 via-ocean to-ink" />

        {/* Sun-side warm glow off-center, like a setting sun behind dunes */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 h-[760px] w-[760px] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #e0d7cf 0%, #ab9072 35%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 h-[280px] w-[280px] rounded-full blur-2xl opacity-30"
          style={{ background: 'radial-gradient(circle, #f0e4d2 0%, transparent 60%)' }}
        />

        {/* Soft mist top — like haze on the horizon */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/3 opacity-40"
          style={{ background: 'linear-gradient(to bottom, rgba(180,215,216,0.18) 0%, transparent 100%)' }}
        />

        {/* Ambient drifting glyphs */}
        <AmbientGlyphs count={26} seed={41} />

        {/* Bottom legibility fade */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* ── Centered content ─────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 md:px-10 text-center">
        <div ref={eyebrow} className="flex items-center justify-center gap-4 mb-6">
          <span className="block h-px w-10 bg-bronze/60" />
          <p className="font-display italic tracking-[0.4em] text-fog/75 text-[11px] md:text-xs uppercase whitespace-nowrap">
            A linguistic puzzle adventure
          </p>
          <span className="block h-px w-10 bg-bronze/60" />
        </div>

        <h1
          ref={title}
          className="font-display text-[5.5rem] md:text-[10rem] lg:text-[12rem] leading-[0.92] tracking-tight text-balance text-sand"
          style={{ letterSpacing: '-0.02em' }}
        >
          Rephrased
        </h1>

        <p
          ref={tagline}
          className="mt-6 font-display italic text-bronze-700 text-2xl md:text-4xl lg:text-5xl tracking-wide"
        >
          Rewrite the world.
        </p>

        <p
          ref={lede}
          className="mt-10 mx-auto max-w-xl text-fog/85 text-base md:text-lg leading-[1.85] text-balance"
        >
          Sol wakes with no memory in a fallen civilization. The runes he
          finds are not just words — speak them in the right order, and the
          world rearranges itself around him.
        </p>

        <div ref={cta} className="mt-12 flex flex-wrap items-center justify-center gap-8">
          <WishlistButton />
          <a
            href="#world"
            className="group inline-flex items-center gap-3 font-display italic tracking-[0.2em] text-fog/75 text-sm
                       hover:text-sand transition-colors duration-500"
          >
            <span>Read the awakening</span>
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none" className="transition-transform group-hover:translate-y-0.5">
              <path d="M1 1 L11 9 L21 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* ── Bottom meta strip ────────────────────────────────────── */}
      <div
        ref={meta}
        className="absolute inset-x-0 bottom-8 flex items-center justify-between px-8 md:px-14 text-fog/45 text-[10px] md:text-xs font-display italic tracking-[0.4em] uppercase"
      >
        <span className="flex items-center gap-3">
          <span className="block h-px w-8 bg-fog/30" />
          PC · Steam
        </span>
        <span className="flex items-center gap-3">
          Coming when ready
          <span className="block h-px w-8 bg-fog/30" />
        </span>
      </div>
    </section>
  );
}
