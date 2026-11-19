# 单页模板 — 使用说明

一套零依赖、零外联的可运行模板，用来生成与 Shopify Winter 2026 某一页视觉一致的新页面。
本目录由 Skill 的 `scripts/scaffold.mjs` 复制而来，可直接改用。

## 打开

```bash
cd <你的目录>
node serve.mjs        # → http://127.0.0.1:4188/
```

`PORT=5000 node serve.mjs` 可换端口。

**不要直接双击 `index.html`**：`file://` 下 Chromium 会因 CORS 拒绝加载本地 woff2 字体，三族字体回退到系统字体后视觉就不成立了。也可以放进任意静态服务器，只要走 `http://`。

实测（`--no-external` 无头浏览器，1440×900）：`RESULT CLEAN` — 0 console 错误、0 请求失败、0 外联；4 个字体全部 `loaded`，Drop Cap 花体生效。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 编辑内容范式页：深色封面 + 灰绿主底（`#dcded1`）正文区 + 12 列卡片 + 云卡片 + `13.9%` 侧栏目录 |
| `portfolio.html` | 作品集范式页：真 3D 四层舞台（`stage3d` + `hero-intro`）+ 中文排印适配 + 跨章擦镜与粒子场 |
| `css/tokens.css` | 全部设计令牌：主底色 `--c-page-bg`、`13.9%` 侧栏、四族字体、12 字阶、10 条缓动与动效常数 |
| `css/layout.css` | 骨架与组件：默认灰绿底（C-09）、栅格、章节、Drop Cap、CTA、播放键、云卡、`13.9%` 侧栏、C-11 首屏 `340×464` 细线框目录卡解锁组件（`.toc-card[data-toc-dock]`） |
| `css/stage3d.css` | 真 3D 舞台：标准 4 层（`-240 / 0 / +40 / +90px`）+ 可选 V3.1 5 层剧场深纵模式（`data-stage-mode="theater"`）+ 静息隐形热区（`.stage3d__hotspot`） |
| `css/details.css` | 跨章节过渡遮罩（白闪 / 织物擦镜）与粒子画布样式 |
| `js/motion.js` | 平滑滚动、章节主题联动、stagger 进场、斥力场、视差、阻尼 |
| `js/stage3d.js` + `js/hero-intro.js` | 单透视相机驱动（支持标准与 `theater` 双模式、前景滚动退场、共享阻尼指针）+ 首屏自动推镜/爆发/呼吸序列与滚动交接 |
| `js/ambient-director.js` | V3.1 零点击自主演出编导（`EditionsSceneDirector`）+ 100% 离线 Web Audio 432 Hz 程序化声场（`EditionsSoundEngine`，自动绑定 `[data-sound-toggle]`） |
| `css/cinema.css` + `js/cinema.js` + `js/cinematic.js` | 顶栏阶梯入场、六种滚动驱动镜头 rig、2D 推镜（含 `[data-stage3d]` 互斥保护锁） |
| `js/details.js` | 章节白闪/擦镜与 `60×3` 粒子流背景 |
| `assets/` | 几何线 SVG、光晕底图、3 张示范分层 PNG（`assets/layers/`） |
| `fonts/` | 4 个本地 `.woff2` 字体（零外联） |
| `vendor/gsap/` | 本地离线 GSAP `3.15.1` 全量 `25` 个插件（`472 KB`） |
| `serve.mjs` | 零依赖本地预览服务器（`node serve.mjs`） |
| `references/01..06` | V3.1 六份零冲突手册（从根目录 `SKILL.md` 按问题路由进入） |

## 改一页的最短路径

1. 用 `node <skill>/scripts/scaffold.mjs --out <目录> --title "<标题>"` 复制一份。
2. `index.html` 里替换 SLOT 区块的文字与图片路径；做含人物与道具的敞廊/室内外舞台时，在 `[data-stage3d]` 上加 `data-stage-mode="theater"` 启用 5 层真景深，并引入 `js/ambient-director.js` 让画面与离线声场零点击自主演出。
3. 增删章节时同步复制 `<section>` 与一条侧栏 `<li>`；罗马数字由 CSS counter 自动生成。
4. 换肤只改 `css/tokens.css` 的 `--c-*`（严禁动主底色 `--c-page-bg` 与侧栏宽度 `--sidebar-w`）；改节奏改 `--sp-*`。
5. 要镜头推进：选真 3D 舞台（`stage3d.js + hero-intro.js`）或 `.cine-stage` 滚动 rig（`cinema.js`，六种轨迹见 `references/04-motion-and-stage3d.md §四`）。
6. 跑 `node <skill>/scripts/verify.mjs <目录>`（六条零依赖硬拦截），再按 `references/05-page-recipes-and-verification.md §五` 的四把尺子验收。

## 不要动的东西

- `class` 名与 DOM 层级：它们对应真实源码，改动会丢掉排印与响应式。
- 媒体容器的 `aspect-ratio`：16:9 / 1016:529 / 340:100 是原站实测比例。
- 三族字体的分工：NeueMontreal 标题、HWCigars 叙事、ImperialScript 仅 Drop Cap 首字母。
- 缓动 `cubic-bezier(.34,1.56,.64,1)`：卡片回弹的过冲手感来自它。

## 已知边界

真实 WebGL 场景、KTX2 纹理与 Rive 状态机无法离线复刻。`stage3d.css` / `cinema.js` 用 CSS 3D 透视与多层视差模拟相机轨迹，数值属空间重参数化而非原站 Three.js 坐标。完整边界见 `references/01-overturns-and-truth.md §四` 与 `references/04-motion-and-stage3d.md §一`。

字体与示例图权利归各自权利人，默认不部署、不对外分发、不商用。
