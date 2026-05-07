'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/cn';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  id?: string;
  eyebrow?: string;
  /** Roman/English heading */
  title: string;
  /** Optional bilingual sub-heading in CJK */
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ id, eyebrow, title, subtitle, className, children }: Props) {
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
    <section
      id={id}
      ref={root}
      className={cn(
        'relative px-6 py-32 md:py-40 border-t border-ocean/20',
        className,
      )}
    >
      <div className="mx-auto max-w-5xl">
        {eyebrow && (
          <p
            data-fade
            className="font-display italic tracking-[0.45em] text-fog/55 text-[10px] uppercase"
          >
            {eyebrow}
          </p>
        )}
        <div data-fade className="mt-3 mb-12">
          <h2 className="font-display text-4xl md:text-6xl text-sand leading-tight text-balance">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 font-display italic tracking-widest text-fog/45 text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
