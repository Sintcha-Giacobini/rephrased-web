'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WishlistButton } from './WishlistButton';
import { AmbientGlyphs } from './AmbientGlyphs';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export function WishlistSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-fade]'), {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative min-h-[80vh] flex items-center px-6 py-32 md:py-44 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-[#0d141a] to-ink" />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[760px] w-[760px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #ab9072 0%, transparent 65%)' }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[260px] w-[260px] rounded-full blur-2xl opacity-22"
          style={{ background: 'radial-gradient(circle, #e0d7cf 0%, transparent 60%)' }}
        />
        <AmbientGlyphs count={18} seed={97} />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <p data-fade className="font-display italic tracking-[0.45em] text-fog/55 text-[10px] uppercase">
          On Steam
        </p>
        <h2
          data-fade
          className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl text-sand leading-[1.0] text-balance"
        >
          Wishlist
          <br />
          <span className="italic text-bronze">Rephrased.</span>
        </h2>

        <p data-fade className="mt-10 max-w-xl mx-auto text-fog/75 text-base md:text-lg leading-[1.8] text-balance">
          A single-player puzzle adventure for PC. Wishlisting helps Sol find his way home — and
          helps Steam show the game to people who love what you love.
        </p>

        <div data-fade className="mt-12">
          <WishlistButton />
        </div>

        <p
          data-fade
          className="mt-16 font-display italic text-fog/40 text-[10px] md:text-xs tracking-[0.4em] uppercase"
        >
          Coming when it's ready · TBA
        </p>
      </div>
    </section>
  );
}
