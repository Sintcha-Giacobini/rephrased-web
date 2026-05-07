'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  href?: string;
  className?: string;
}

const STEAM_LOGO = (
  <svg
    width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.7 2 2.4 6.1 2 11.3l5.4 2.2c.5-.3 1-.5 1.6-.5h.2l2.4-3.5v-.1c0-2.1 1.7-3.8 3.8-3.8s3.8 1.7 3.8 3.8-1.7 3.8-3.8 3.8h-.1l-3.4 2.5v.2c0 1.6-1.3 2.9-2.9 2.9-1.4 0-2.6-1-2.9-2.4L2.5 14.6C3.7 18.9 7.5 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm-3.4 15.2l-1.2-.5c.2.4.5.8.9 1 .9.4 1.9 0 2.3-.9.2-.4.2-.9 0-1.4-.2-.4-.5-.8-1-1-.4-.2-.9-.2-1.3 0l1.3.5c.7.3 1 1.1.7 1.7-.3.7-1.1 1-1.7.6zm6.9-4.7c1.4 0 2.5-1.1 2.5-2.5S17 7.5 15.6 7.5 13.1 8.6 13.1 10s1.1 2.5 2.4 2.5zm0-4.4c1 0 1.9.8 1.9 1.9s-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9.9-1.9 1.9-1.9z" />
  </svg>
);

export function WishlistButton({ href, className }: Props) {
  const [hovered, setHovered] = useState(false);
  const url =
    href ||
    process.env.NEXT_PUBLIC_STEAM_WISHLIST_URL ||
    'https://store.steampowered.com/';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        'group inline-flex items-center gap-3 px-7 py-3.5',
        'border border-bronze/50 bg-ink/60 backdrop-blur-sm',
        'text-sand font-display tracking-[0.2em] text-sm md:text-base uppercase',
        'transition-all duration-500 ease-[var(--ease-cinematic)]',
        'hover:border-sand hover:bg-bronze/10 hover:shadow-glow-bronze',
        'relative overflow-hidden',
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        <span className="text-bronze group-hover:text-sand transition-colors">
          {STEAM_LOGO}
        </span>
        Steam · Add to Wishlist
      </span>
      {/* sweeping highlight on hover */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-sand/15 to-transparent',
          'transition-transform duration-700 ease-out',
          hovered ? 'translate-x-[400%]' : 'translate-x-0',
        )}
      />
    </a>
  );
}
