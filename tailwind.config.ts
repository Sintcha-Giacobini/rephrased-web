import type { Config } from 'tailwindcss';

/**
 * Palette: clean desert + cyan sky.
 * Inspired by denotastudio's water/sand swatch + Studio-Ghibli desert vibes.
 *
 *   ink    deep navy-teal — almost black, but with a sea undertone
 *   ocean  deep teal sea
 *   sky    vibrant cyan-blue (the bright top half of the sky)
 *   fog    light aqua mist (the highlight, fresher than before)
 *   bronze muted warm tan accent
 *   sand   clean warm cream (no longer muddy)
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0e1f2a',
          900: '#091420',
          800: '#0e1f2a',
          700: '#162939',
        },
        ocean: {
          DEFAULT: '#285260',
          900: '#1d3d4a',
          800: '#285260',
          700: '#3a6a78',
        },
        sky: {
          DEFAULT: '#148ee2',
          900: '#0e6db0',
          800: '#148ee2',
          700: '#43a5e8',
        },
        fog: {
          DEFAULT: '#b4d7d8',
          900: '#7fb1b3',
          800: '#b4d7d8',
          700: '#cce4e5',
        },
        bronze: {
          DEFAULT: '#ab9072',
          900: '#856e54',
          800: '#ab9072',
          700: '#c4ac90',
        },
        sand: {
          DEFAULT: '#e8d6c2',
          900: '#cfb89e',
          800: '#e8d6c2',
          700: '#f1e3d2',
        },
        stone: {
          DEFAULT: '#7d8085',
          900: '#5d6166',
          800: '#7d8085',
          700: '#9b9ea3',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        glyph: ['var(--font-glyph)', 'serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.35', filter: 'brightness(0.9)' },
          '50%': { opacity: '0.55', filter: 'brightness(1.1)' },
        },
        'breathe-correct': {
          '0%, 100%': { opacity: '0.4', filter: 'brightness(0.95)' },
          '50%': { opacity: '0.65', filter: 'brightness(1.2)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        'breathe-correct': 'breathe-correct 2.6s ease-in-out infinite',
        flicker: 'flicker 0.15s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
      },
      boxShadow: {
        'glow-bronze': '0 0 24px rgba(171, 144, 114, 0.45)',
        'glow-sand':   '0 0 36px rgba(224, 215, 207, 0.55)',
        'glow-sky':    '0 0 28px rgba(58, 139, 176, 0.45)',
        'glow-ocean':  '0 0 18px rgba(40, 82, 96, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
