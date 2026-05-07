/**
 * Placeholder rune set. Six glyphs scattered in the ruins;
 * three of them (`isCorrect: true`) form the awakening sequence.
 *
 * Replace `path` with the final art when ready — keep IDs stable
 * so save data (localStorage) survives the redesign.
 */
export type RuneId = 'eye' | 'tree' | 'gate' | 'fire' | 'star' | 'wave';

export interface RuneDef {
  id: RuneId;
  name: string;       // 中文叙事名
  meaning: string;    // 一句线索
  isCorrect: boolean;
  /** 在 R3F Plane 上的归一化坐标 (-1..1)，z 是深度层 */
  position: [number, number, number];
  /** 默认旋转 (rad) — 让符文不要太工整 */
  rotation: number;
  /** SVG viewBox 内的路径，128×128 居中绘制 */
  path: string;
}

export const RUNES: RuneDef[] = [
  {
    id: 'eye',
    name: '观',
    meaning: '看见的人，方能被看见。',
    isCorrect: true,
    position: [-1.4, 0.4, 0.2],
    rotation: -0.08,
    // 圆 + 横瞳：一只睁开的眼
    path: 'M64 32 C32 32 12 64 12 64 C12 64 32 96 64 96 C96 96 116 64 116 64 C116 64 96 32 64 32 Z M64 50 A14 14 0 1 0 64 78 A14 14 0 1 0 64 50 Z',
  },
  {
    id: 'tree',
    name: '根',
    meaning: '向下扎得深，才向上看得远。',
    isCorrect: true,
    position: [0.0, -0.7, 0.0],
    rotation: 0.04,
    // 中轴 + 三组分叉：树根
    path: 'M64 14 L64 114 M64 40 L40 60 M64 40 L88 60 M64 70 L34 92 M64 70 L94 92',
  },
  {
    id: 'gate',
    name: '门',
    meaning: '不是所有的门，都希望被开启。',
    isCorrect: true,
    position: [1.5, 0.5, 0.3],
    rotation: 0.1,
    // 矩形门 + 横梁
    path: 'M28 110 L28 38 Q28 18 64 18 Q100 18 100 38 L100 110 M28 60 L100 60 M64 60 L64 110',
  },
  {
    id: 'fire',
    name: '焰',
    meaning: '它温暖，也吞噬。',
    isCorrect: false,
    position: [-0.7, -0.2, -0.3],
    rotation: -0.18,
    // 三角 + 内部火焰
    path: 'M64 14 L114 110 L14 110 Z M64 50 L64 90 M50 70 L78 70',
  },
  {
    id: 'star',
    name: '辰',
    meaning: '迷路时抬头，但别迷信指引。',
    isCorrect: false,
    position: [0.9, 0.9, -0.1],
    rotation: 0.22,
    // 八角星
    path: 'M64 8 L72 56 L120 64 L72 72 L64 120 L56 72 L8 64 L56 56 Z',
  },
  {
    id: 'wave',
    name: '潮',
    meaning: '退去之物，从来不曾真正离开。',
    isCorrect: false,
    position: [-1.6, -0.8, 0.1],
    rotation: -0.05,
    // 三道波浪
    path: 'M14 50 Q34 30 54 50 T94 50 T114 50 M14 70 Q34 50 54 70 T94 70 T114 70 M14 90 Q34 70 54 90 T94 90 T114 90',
  },
];

export const CORRECT_IDS = RUNES.filter((r) => r.isCorrect).map((r) => r.id);
