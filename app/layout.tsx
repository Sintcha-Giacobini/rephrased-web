import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/noto-serif-jp/400.css';
import '@fontsource/noto-serif-jp/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rephrased — Rewrite the world',
  description:
    'A 3D isometric linguistic puzzle adventure. Sol wakes with no memory in a fallen civilization. Speak the runes — reshape what they touch.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
