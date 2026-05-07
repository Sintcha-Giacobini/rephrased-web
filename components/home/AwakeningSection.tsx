'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const ACTS = [
  {
    num: 'I',
    name: 'Disorientation',
    cn: '失序',
    body: 'A boy wakes in a world that no longer remembers him. Cliffs are scarred with carvings he cannot read.',
  },
  {
    num: 'II',
    name: 'Interpretation',
    cn: '解译',
    body: 'Sentence by sentence the world speaks back. Stones become trees. Rivers change direction. The civilization that fell begins to whisper why.',
  },
  {
    num: 'III',
    name: 'Destruction',
    cn: '抉择',
    body: 'The “World” rune restores his memory. He looks to the stars. A single sentence can rewrite everything — and he must choose what.',
  },
];

export function AwakeningSection() {
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
    <section id="world" ref={root} className="relative px-6 py-32 md:py-44 overflow-hidden">
      {/* warm-leaning backdrop */}
      <div className="absolute inset-0 -z-10">
        <div
          aria-hidden
          className="absolute -left-32 top-1/3 h-[480px] w-[480px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #ab9072 0%, transparent 70%)' }}
        />
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-12 gap-8">
        {/* Left: heading rail */}
        <div className="col-span-12 md:col-span-5">
          <p data-fade className="font-display italic tracking-[0.45em] text-fog/55 text-[10px] uppercase">
            The Awakening
          </p>
          <h2
            data-fade
            className="mt-3 font-display text-4xl md:text-6xl text-sand leading-[1.05] text-balance"
          >
            A boy.
            <br />
            A fallen world.
            <br />
            A language that
            <br />
            <span className="italic text-bronze">still works.</span>
          </h2>
          <p data-fade className="mt-6 font-display italic tracking-widest text-fog/40 text-sm">
            序章 · Sol's Three Acts
          </p>
        </div>

        {/* Right: prose */}
        <div className="col-span-12 md:col-span-7 md:pl-6">
          <p data-fade className="text-fog/80 text-lg md:text-xl leading-[1.8]">
            You play as <span className="text-sand">Sol</span>, awakened from a long slumber into a
            civilization whose people, gods, and stories have all fallen away. What remains are the
            runes — chiseled, painted, half-buried — that once described the world.
          </p>
          <p data-fade className="mt-6 font-display italic text-fog/65 text-lg md:text-xl leading-[1.7]">
            Speak them aloud, and the world responds.
          </p>
        </div>
      </div>

      {/* Three acts as horizontal timeline */}
      <div className="mx-auto max-w-6xl mt-24 relative">
        {/* connecting hairline */}
        <div aria-hidden className="absolute left-0 right-0 top-[34px] h-px bg-gradient-to-r from-transparent via-bronze/35 to-transparent" />
        <div className="grid gap-12 md:grid-cols-3">
          {ACTS.map((act, i) => (
            <article key={act.num} data-fade className="relative">
              {/* Act bullet */}
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-bronze/50 bg-ink font-display text-bronze text-sm">
                  {act.num}
                </span>
                <span className="font-display italic tracking-[0.3em] text-fog/45 text-[10px] uppercase">
                  Act {i + 1}
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-sand">
                {act.name}
                <span className="block font-display italic text-fog/40 text-sm tracking-widest mt-1">
                  {act.cn}
                </span>
              </h3>
              <p className="mt-4 text-fog/70 leading-[1.7] text-sm md:text-base">{act.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
