'use client';

/**
 * Stubbed audio layer. Hook up Howler.js when audio assets are ready.
 * For now this is a no-op so the rest of the code can call playSfx() safely.
 */

type Sfx = 'correct' | 'wrong' | 'awakening' | 'ambient';

let unlocked = false;

/** Call from a user gesture handler to satisfy browser autoplay policy. */
export function unlockAudio() {
  unlocked = true;
}

export function playSfx(_name: Sfx) {
  if (!unlocked) return;
  // TODO: integrate Howler.js once audio assets land.
  // import Howl from 'howler';
  // new Howl({ src: [`/audio/${_name}.mp3`], volume: 0.6 }).play();
}
