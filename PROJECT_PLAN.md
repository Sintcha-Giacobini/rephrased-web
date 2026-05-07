# 蒼影のフィルム — Project Plan

> Film of the Sea · Steam PC game official site
> Tech: Next.js 14 + React Three Fiber + GSAP + Tailwind + Zustand
> Visual reference: 巴别塔圣歌 (Chants of Sennaar) / Mœbius ligne claire
> Palette: 蒼影のフィルム — `#0f1217 / #27606c / #7baaab / #c68d5d / #e6bd8b`

---

## 已完成（脚手架）

- [x] Tailwind tokens · 5 色 + 字体 + 自定义动画 keyframes
- [x] Global CSS · 纸质噪点 overlay + reduced-motion fallback + view-transition pseudo-elements
- [x] Zustand store · 符文状态 + 持久化 unlock 标记
- [x] R3F 开场场景 · 6 个占位符文 + 视差背景层
- [x] 提示系统 · 25s/50s 闲置触发渐进文字提示
- [x] 觉醒序列 · 光柱炸开 + 白闪 + View Transitions API 整页切换
- [x] 主页 Hero · GSAP 入场 + Steam wishlist 按钮（带高光扫光）
- [x] 跳过入口 · 二刷玩家直接进 / home
- [x] Hero 概念图 · `public/concept/rune-ruins-mood.svg` 静态参照

---

## Phase 1 · 开场谜题精修（2-3 周）

| # | 任务 | 输出 | 优先级 |
|---|---|---|---|
| 1.1 | 替换占位符文为最终美术 (6 张 SVG) | `lib/runes.ts` 的 `path` 字段 | P0 |
| 1.2 | 鼠标悬停符文显示线索短句 (Tooltip) | 已有，需调字体/排版 | P1 |
| 1.3 | 正确符文连线动画 (DrawSVG) | 觉醒序列加 SVG 连线 | P0 |
| 1.4 | 移动端降级方案：纯 SVG 静态版 | `app/page.mobile.tsx` | P1 |
| 1.5 | Mœbius 后处理 shader（自定义） | 替换现有 EffectComposer | P2 |
| 1.6 | 加载占位画面（资产预加载完才能开始） | `<GatewayLoader />` | P0 |
| 1.7 | 无障碍：键盘 Tab 切换符文 + 回车点亮 | `<Rune>` 加 a11y | P1 |
| 1.8 | 音频集成（Howler.js）：环境音 + 4 个 SFX | `lib/audio.ts` 实现 | P1 |
| 1.9 | 解锁前后 metadata 切换 (OG image) | `app/opengraph-image.tsx` | P2 |

## Phase 2 · 主页骨架（2 周）

| # | 任务 | 输出 | 优先级 |
|---|---|---|---|
| 2.1 | Hero 真 key art + 视差摄像机推拉 | R3F 场景 | P0 |
| 2.2 | World 章节：滚动驱动卷轴展开 | GSAP ScrollTrigger horizontal | P0 |
| 2.3 | Characters 卡片网格 + Atropos 视差 | `components/home/CharacterCard.tsx` | P0 |
| 2.4 | Mechanics（玩法）section | 视频/GIF 演示 + 解说 | P0 |
| 2.5 | Media gallery（截图/预告） | Embla Carousel | P1 |
| 2.6 | FAQ + System Requirements | shadcn Accordion | P1 |
| 2.7 | 多语言 i18n（中/英/日） | next-intl | P2 |
| 2.8 | Lenis 平滑滚动接入 | `<LenisProvider>` | P0 |

## Phase 3 · Codex 隐藏设定集（1.5 周）

| # | 任务 | 输出 | 优先级 |
|---|---|---|---|
| 3.1 | MDX content layer | `content/lore/*.mdx` + Contentlayer | P0 |
| 3.2 | 全站埋点：每页 1-3 个隐藏符文 | `<HiddenRune slug="..." />` 组件 | P0 |
| 3.3 | Codex 图鉴页 `/codex` | 已发现 + 模糊未发现 | P0 |
| 3.4 | 进度提示 HUD（已发现 X/Y） | 屏角的小数字 | P1 |
| 3.5 | 解锁阅读动画 (ScrambleText) | GSAP ScrambleText | P1 |
| 3.6 | 分享单条设定碎片 (`/codex/[slug]`) | 单页带 OG image | P2 |

## Phase 4 · Steam 整合（1 周）

| # | 任务 | 输出 | 优先级 |
|---|---|---|---|
| 4.1 | 真实 Steam App ID + Wishlist URL | `.env.local` | P0 |
| 4.2 | Steam 嵌入 widget（动态 iframe） | `<SteamWidget>` | P1 |
| 4.3 | 平台徽章（Steam/Epic/itch）行 | `<PlatformBadges>` | P1 |
| 4.4 | 系统需求表（最低/推荐） | shadcn Table | P1 |
| 4.5 | 媒体资源包页 `/press-kit` | presskit() 兼容格式 | P2 |
| 4.6 | OG image 预生成（含 wishlist CTA） | `next/og` ImageResponse | P1 |

## Phase 5 · 性能与上线（持续）

| # | 任务 | 输出 | 优先级 |
|---|---|---|---|
| 5.1 | Lighthouse Perf ≥ 85 | 报告 | P0 |
| 5.2 | 图片：Sharp 转 WebP/AVIF + responsive sizes | `scripts/optimize-images.ts` | P0 |
| 5.3 | 字体：subset + preload 关键字重 | `next/font` | P0 |
| 5.4 | 监控：Vercel Analytics + Sentry | dashboard | P1 |
| 5.5 | SEO：sitemap.xml + robots.txt + structured data | `app/sitemap.ts` | P0 |
| 5.6 | 部署：Vercel + custom domain | DNS + cert | P0 |
| 5.7 | Plausible/Umami（无 cookie 的隐私分析） | embed | P2 |

---

## 技术债 / 待决策

- [ ] **Mœbius shader 的归属**：是自己写 GLSL（需要 shader 工程时间）还是用 `@react-three/postprocessing` 的现成组合（更快但不够"漫画感"）。当前代码用的是后者，先跑起来再迭代。
- [ ] **音频策略**：环境音 30-60 秒 loop 还是更长的拼接？预算？
- [ ] **第三方追踪与 GDPR**：欧洲玩家是 Steam 主力市场之一，必须先 cookie consent。
- [ ] **本地化**：日语字幕由谁翻译？AI + 人工校对 还是直接外包？
- [ ] **Hero key art 来源**：内部美术 / 外包 / AI 辅助 + 重绘？

## 风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| 移动端性能不足 | 玩家流失 | 提供 SVG 静态版 + 自动检测 GPU |
| 谜题让玩家挫败 | 跳出率高 | 提示系统 + 60s 后保底 + 跳过按钮 |
| 资产没准备好就上线 | 占位感拉低气质 | 上线前 1 周锁定资产清单 |
| Steam 政策变化 | wishlist 链接失效 | 抽象成 env 变量 |
| 浏览器 View Transitions 兼容 | Firefox 旧版 fallback | 已写检测，降级直接跳转 |

---

## 本地启动

```bash
cd /Users/jiayuanfu/Documents/RephrasedWeb
cp .env.local.example .env.local       # 填真实 Steam app id
npm install
npm run dev
# → http://localhost:3000
```

第一次访问 → 点亮 **观 / 根 / 门** 三个符文 → 觉醒动画 → 主页
（六个符文里这三个是 `isCorrect: true`，其余 焰 / 辰 / 潮 是诱饵）

## 文件地图

```
RephrasedWeb/
├── app/
│   ├── layout.tsx               全局字体 + metadata
│   ├── globals.css              Design tokens · 纸质噪点
│   ├── page.tsx                 开场谜题 (gateway)
│   └── home/page.tsx            主页
├── components/
│   ├── gateway/
│   │   ├── RuneRuinsScene.tsx   R3F + 后处理
│   │   ├── ParallaxBackdrop.tsx 三层视差色块
│   │   ├── Rune.tsx             单个符文交互
│   │   ├── HintSystem.tsx       闲置提示
│   │   ├── AwakeningOverlay.tsx 觉醒序列 + view transition
│   │   ├── Prologue.tsx         顶部叙事文字
│   │   └── SkipGate.tsx         二刷跳过
│   └── home/
│       ├── Hero.tsx             首屏
│       └── WishlistButton.tsx   Steam CTA（带扫光）
├── lib/
│   ├── runes.ts                 符文数据 + 路径定义
│   ├── audio.ts                 Howler 桩
│   └── cn.ts                    classnames helper
├── stores/
│   └── runePuzzle.ts            Zustand + persist
├── public/concept/
│   └── rune-ruins-mood.svg      静态概念稿
└── PROJECT_PLAN.md              本文件
```
