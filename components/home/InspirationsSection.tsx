'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const PUZZLES = [
  {
    title: 'Chants of Sennaar',
    cn: '巴别塔圣歌',
    note: 'For the slow ascent of decoding a foreign tongue.',
    href: 'https://store.steampowered.com/app/1931770/Chants_of_Sennaar/',
  },
  {
    title: 'Baba Is You',
    cn: 'バーバはきみ',
    note: 'For rules that are themselves words you can rearrange.',
    href: 'https://store.steampowered.com/app/736260/Baba_Is_You/',
  },
  {
    title: 'The Witness',
    cn: '見證者',
    note: 'For answers carved into the world itself.',
    href: 'https://store.steampowered.com/app/210970/The_Witness/',
  },
];

const VISUALS = [
  { title: 'Journey', cn: '風ノ旅ビト', note: 'Cloth, light, a horizon to walk toward.' },
  { title: 'Cocoon',  cn: '繭',         note: 'Geometric solids and warm, muted air.' },
];

export function InspirationsSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-fade]'), {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative px-6 py-32 md:py-44 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-20 max-w-3xl">
          <p data-fade className="font-display italic tracking-[0.45em] text-fog/55 text-[10px] uppercase">
            If You Loved
          </p>
          <h2 data-fade className="mt-3 font-display text-4xl md:text-6xl text-sand leading-[1.05] text-balance">
            Standing on the shoulders of three puzzles
            <br />
            <span className="italic text-bronze">and two paintings.</span>
          </h2>
        </div>

        {/* Puzzle inspirations */}
        <div className="mb-24">
          <p data-fade className="font-display italic text-fog/45 text-xs tracking-[0.4em] mb-8 uppercase">
            On the language of the puzzle
          </p>
          <div className="grid gap-px bg-bronze/15 border border-bronze/15">
            {PUZZLES.map((it) => (
              <a
                key={it.title}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                data-fade
                className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 px-6 md:px-10 py-8 bg-ink hover:bg-ink-700 transition-colors duration-500"
              >
                <h3 className="font-display text-2xl md:text-3xl text-sand group-hover:text-bronze transition-colors duration-500 min-w-[260px]">
                  {it.title}
                </h3>
                <span className="font-display italic text-fog/35 text-xs tracking-[0.3em] uppercase">
                  {it.cn}
                </span>
                <p className="ml-auto max-w-md text-fog/65 text-sm md:text-base leading-relaxed text-right md:text-left">
                  {it.note}
                </p>
                <span className="font-display italic text-bronze/60 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Visual inspirations */}
        <div>
          <p data-fade className="font-display italic text-fog/45 text-xs tracking-[0.4em] mb-8 uppercase">
            On the light & shape
          </p>
          <div className="grid md:grid-cols-2 gap-px bg-bronze/15 border border-bronze/15">
            {VISUALS.map((it) => (
              <article
                key={it.title}
                data-fade
                className="px-8 py-10 bg-ink"
              >
                <p className="font-display italic text-fog/35 text-[10px] tracking-[0.4em] uppercase">
                  {it.cn}
                </p>
                <h3 className="mt-2 font-display text-3xl md:text-4xl text-sand">{it.title}</h3>
                <p className="mt-4 text-fog/70 leading-relaxed">{it.note}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
