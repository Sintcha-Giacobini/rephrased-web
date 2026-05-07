import { CanvasTexture, LinearFilter, ClampToEdgeWrapping } from 'three';

/**
 * Rasterizes an SVG `path d` string onto an offscreen canvas and wraps it
 * as a Three.js CanvasTexture, so we can use it on a 3D plane and let
 * the Mœbius post-processing shader work on it.
 *
 * Path is drawn in WHITE; tint via meshBasicMaterial.color downstream.
 * Browser-only (uses document.createElement). Call from client code.
 */

const SVG_VIEWBOX = 128;

interface RuneTextureOpts {
  path: string;
  size?: number;
  strokeWidth?: number;
}

export function createRuneTexture({
  path,
  size = 256,
  strokeWidth = 5,
}: RuneTextureOpts): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // Map 128-unit viewBox into the canvas, with a small padding so the stroke
  // doesn't get clipped at the border.
  const padding = strokeWidth;
  const drawSize = size - padding * 2;
  ctx.translate(padding, padding);
  ctx.scale(drawSize / SVG_VIEWBOX, drawSize / SVG_VIEWBOX);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = strokeWidth;

  try {
    const p = new Path2D(path);
    ctx.stroke(p);
  } catch {
    // Path parse failed — fall back to a small dot so we don't crash.
    ctx.beginPath();
    ctx.arc(SVG_VIEWBOX / 2, SVG_VIEWBOX / 2, 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
