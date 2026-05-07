'use client';

import { Effect, BlendFunction } from 'postprocessing';
import { Color, Uniform } from 'three';
import { wrapEffect } from '@react-three/postprocessing';

/**
 * Mœbius / Chants of Sennaar style post-processing.
 *
 * Pipeline (per pixel):
 *   1. Sobel edge detection on luminance → dark ink outlines
 *   2. Luminance posterization → flat tonal bands
 *   3. Map quantized tone to a 5-step palette ramp
 *   4. Subtle preservation of the input chromatic direction (warm vs cool)
 *   5. Cross-hatching in shadows; double cross-hatch in deep shadows
 *   6. Composite the edge as ink-colored stroke on top
 *
 * Defaults are tuned for the 蒼影のフィルム palette.
 */
const fragmentShader = /* glsl */ `
  uniform vec3 uColorInk;
  uniform vec3 uColorShadow;
  uniform vec3 uColorMid;
  uniform vec3 uColorHighlight;
  uniform vec3 uColorAccent;

  uniform float uEdgeStrength;
  uniform float uPosterizeLevels;
  uniform float uHatchScale;
  uniform float uHatchStrength;
  uniform float uSaturation;

  float luma(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  float sampleLuma(vec2 uv) {
    return luma(texture2D(inputBuffer, uv).rgb);
  }

  float sobelMagnitude(vec2 uv) {
    vec2 t = texelSize;
    float c00 = sampleLuma(uv + vec2(-t.x, -t.y));
    float c10 = sampleLuma(uv + vec2( 0.0, -t.y));
    float c20 = sampleLuma(uv + vec2( t.x, -t.y));
    float c01 = sampleLuma(uv + vec2(-t.x,  0.0));
    float c21 = sampleLuma(uv + vec2( t.x,  0.0));
    float c02 = sampleLuma(uv + vec2(-t.x,  t.y));
    float c12 = sampleLuma(uv + vec2( 0.0,  t.y));
    float c22 = sampleLuma(uv + vec2( t.x,  t.y));
    float gx = -c00 - 2.0 * c01 - c02 + c20 + 2.0 * c21 + c22;
    float gy = -c00 - 2.0 * c10 - c20 + c02 + 2.0 * c12 + c22;
    return length(vec2(gx, gy));
  }

  vec3 mapPalette(float t) {
    if (t < 0.20) return uColorInk;
    if (t < 0.42) return uColorShadow;
    if (t < 0.66) return uColorMid;
    if (t < 0.86) return uColorHighlight;
    return uColorAccent;
  }

  // Diagonal stripe: returns 0 on the line, 1 in the gap.
  float hatchStripe(vec2 p, float angle, float spacing) {
    vec2 dir = vec2(cos(angle), sin(angle));
    float coord = dot(p, dir);
    float v = abs(fract(coord / spacing) - 0.5) * 2.0;
    return smoothstep(0.38, 0.55, v);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 sp = uv * resolution;

    // 1. Edge detection
    float edgeRaw = sobelMagnitude(uv) * uEdgeStrength;
    float edge = smoothstep(0.18, 0.55, edgeRaw);

    // 2. Luminance + posterize
    float l = luma(inputColor.rgb);
    float bands = max(2.0, uPosterizeLevels);
    float ql = clamp(floor(l * bands + 0.5) / bands, 0.0, 1.0);

    // 3. Palette mapping
    vec3 col = mapPalette(ql);

    // 4. Subtle chromatic tint from input
    //    (avoids the entire scene going cyan; warm areas keep some warmth)
    vec3 chromaTint = inputColor.rgb / max(l, 0.0001);
    col = mix(col, col * chromaTint, uSaturation * 0.35);

    // 4b. Brightness bypass — bright pixels (lit runes, glow halos) keep their
    //     own color rather than being snapped to the cool palette band. This
    //     is what lets warm runes actually look warm instead of cyan.
    float bypass = smoothstep(0.55, 0.82, l);
    col = mix(col, inputColor.rgb, bypass);

    // 5. Cross-hatching in shadows
    float shadow = 1.0 - smoothstep(0.0, 0.42, l);
    float deepShadow = 1.0 - smoothstep(0.0, 0.18, l);
    float h1 = hatchStripe(sp, 0.6, uHatchScale);
    float h2 = hatchStripe(sp, -0.6, uHatchScale * 0.72);
    float hatchDarken =
      (1.0 - h1) * shadow * 0.7
      + (1.0 - h2) * deepShadow * 0.55;
    col = mix(col, uColorInk, hatchDarken * uHatchStrength);

    // 6. Edge as ink stroke
    col = mix(col, uColorInk, edge * 0.9);

    outputColor = vec4(col, inputColor.a);
  }
`;

interface MoebiusOptions {
  palette?: {
    ink?: string;
    shadow?: string;
    mid?: string;
    highlight?: string;
    accent?: string;
  };
  edgeStrength?: number;
  posterizeLevels?: number;
  hatchScale?: number;
  hatchStrength?: number;
  saturation?: number;
}

class MoebiusEffectImpl extends Effect {
  constructor(opts: MoebiusOptions = {}) {
    const palette = {
      ink:       '#0e1f2a',
      shadow:    '#1d3d4a',
      mid:       '#285260',
      highlight: '#b4d7d8',
      accent:    '#ab9072',
      ...(opts.palette ?? {}),
    };

    super('MoebiusEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uColorInk',        new Uniform(new Color(palette.ink))],
        ['uColorShadow',     new Uniform(new Color(palette.shadow))],
        ['uColorMid',        new Uniform(new Color(palette.mid))],
        ['uColorHighlight',  new Uniform(new Color(palette.highlight))],
        ['uColorAccent',     new Uniform(new Color(palette.accent))],
        ['uEdgeStrength',    new Uniform(opts.edgeStrength ?? 2.4)],
        ['uPosterizeLevels', new Uniform(opts.posterizeLevels ?? 5.0)],
        ['uHatchScale',      new Uniform(opts.hatchScale ?? 8.5)],
        ['uHatchStrength',   new Uniform(opts.hatchStrength ?? 0.6)],
        ['uSaturation',      new Uniform(opts.saturation ?? 0.55)],
      ]),
    });
  }
}

export const MoebiusEffect = wrapEffect(MoebiusEffectImpl);
