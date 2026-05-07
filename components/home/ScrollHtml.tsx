'use client';

import { WishlistButton } from './WishlistButton';

/**
 * HTML content layered over the 3D scene, scrolled by drei's ScrollControls.
 * Each <section> = one virtual page (100vh). The 3D camera also keys off
 * the same scroll progress, so the camera state and the visible text
 * animate in lockstep.
 *
 * Layout uses pointer-events-none on outer wrappers so canvas raycasting
 * still works (for the void reset runes); inner interactive elements
 * (links, buttons) opt back in.
 */
export function ScrollHtml() {
  return (
    <div className="w-screen pointer-events-none text-white">
      {/* Page 0 — Hero (wide shot) */}
      <section className="h-screen flex items-start justify-center pt-12 md:pt-20">
        <div className="text-center max-w-4xl px-6">
          <p className="font-display italic tracking-[0.5em] text-white/85 text-[10px] md:text-xs uppercase mb-4 drop-shadow">
            A linguistic puzzle adventure
          </p>
          <h1
            className="font-display text-[5.5rem] md:text-[10rem] lg:text-[14rem] leading-[0.9] tracking-tight text-white"
            style={{ textShadow: '0 6px 30px rgba(8,40,80,0.45)' }}
          >
            Rephrased
          </h1>
          <p
            className="mt-2 md:mt-4 font-display italic text-2xl md:text-4xl lg:text-5xl text-white"
            style={{ textShadow: '0 4px 22px rgba(8,40,80,0.45)' }}
          >
            Rewrite the world.
          </p>
          <p className="mt-12 font-display italic text-white/70 text-xs md:text-sm tracking-[0.5em] uppercase">
            scroll · 滚下
          </p>
        </div>
      </section>

      {/* Page 1 — Approach (no text; camera dollies in) */}
      <section className="h-screen" />

      {/* Page 2 — Front face: The Awakening */}
      <section className="h-screen flex items-center justify-end pr-6 md:pr-16 lg:pr-24">
        <div className="max-w-md text-right pointer-events-auto">
          <p className="font-display italic tracking-[0.45em] text-white/65 text-[10px] uppercase">
            Section 01 · 序章
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-white"
              style={{ textShadow: '0 4px 18px rgba(8,40,80,0.55)' }}>
            The <span className="italic text-sand">Awakening</span>
          </h2>
          <p className="mt-6 text-white/90 text-base md:text-lg leading-[1.8]"
             style={{ textShadow: '0 2px 14px rgba(8,40,80,0.5)' }}>
            Sol wakes with no memory in a fallen civilization. The runes he
            finds are not just words — speak them in the right order, and the
            world rearranges itself around him.
          </p>
        </div>
      </section>

      {/* Page 3 — Right face: Speak to Reshape */}
      <section className="h-screen flex items-center justify-start pl-6 md:pl-16 lg:pl-24">
        <div className="max-w-md text-left pointer-events-auto">
          <p className="font-display italic tracking-[0.45em] text-white/65 text-[10px] uppercase">
            Section 02 · 言以塑形
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-white"
              style={{ textShadow: '0 4px 18px rgba(8,40,80,0.55)' }}>
            Speak it again,
            <br />
            <span className="italic text-sand">in another tongue.</span>
          </h2>
          <p className="mt-6 text-white/90 text-base md:text-lg leading-[1.8]"
             style={{ textShadow: '0 2px 14px rgba(8,40,80,0.5)' }}>
            Nouns and verbs. Click runes in sequence to form a sentence —
            <em> river + reverse</em>, and the water flows back to its source.
          </p>
        </div>
      </section>

      {/* Page 4 — Back face: Memory Palace */}
      <section className="h-screen flex items-center justify-end pr-6 md:pr-16 lg:pr-24">
        <div className="max-w-md text-right pointer-events-auto">
          <p className="font-display italic tracking-[0.45em] text-white/65 text-[10px] uppercase">
            Section 03 · 記憶の宮殿
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-white"
              style={{ textShadow: '0 4px 18px rgba(8,40,80,0.55)' }}>
            The Memory <span className="italic text-sand">Palace.</span>
          </h2>
          <p className="mt-6 text-white/90 text-base md:text-lg leading-[1.8]"
             style={{ textShadow: '0 2px 14px rgba(8,40,80,0.5)' }}>
            Press <kbd className="px-2 py-0.5 mx-1 border border-white/40 text-white text-sm font-display">Q</kbd>
            and a small room unfolds in the scene. Every rune you've found,
            every sentence you've spoken, remembered.
          </p>
        </div>
      </section>

      {/* Page 5 — Void: reset prompt + wishlist */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="pointer-events-auto">
          <p className="font-display italic tracking-[0.45em] text-white/55 text-[10px] uppercase">
            Section 04 · 深淵
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl text-white/95">
            Speak three runes
            <br />
            <span className="italic text-sand">to begin again.</span>
          </h2>
          <p className="mt-8 font-display italic text-white/55 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Click the right ones — the world will rewind to its first morning.
          </p>
          <div className="mt-12">
            <WishlistButton />
          </div>
        </div>
      </section>
    </div>
  );
}
