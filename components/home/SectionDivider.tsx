'use client';

/**
 * Decorative ornamental divider — three dots with thin lines, used between
 * home page sections to break the monotony of plain border-tops.
 */
export function SectionDivider() {
  return (
    <div aria-hidden className="flex items-center justify-center py-16">
      <span className="block h-px w-24 bg-gradient-to-r from-transparent to-bronze/40" />
      <span className="mx-3 flex items-center gap-2">
        <span className="block h-1 w-1 rounded-full bg-bronze/60" />
        <span className="block h-1.5 w-1.5 rounded-full bg-sand" />
        <span className="block h-1 w-1 rounded-full bg-bronze/60" />
      </span>
      <span className="block h-px w-24 bg-gradient-to-l from-transparent to-bronze/40" />
    </div>
  );
}
