# 网页设计令牌字典

本手册是全库**唯一允许落盘网页 CSS 十六进制色码与变量定义的字典**（像素实测证据色码留于 `references/01-overturns-and-truth.md §一`，其余五份文档一律禁用十六进制码，只引用本手册变量名） `← audit/v3/02-dedup-matrix.md D-03`。本手册只给确凿变量、类名对照、关键结构 CSS 要点与资产命名，不重复论证色值对错（裁决依据见 `01 §一, §二`），不贴整页 HTML `← design-spec.md, blueprint.md`。

---

## 一 全量 CSS 变量表（唯一定义）

除特别标明来自 `layout.css` 或原站编译产物的项外，以下全部变量在 `assets/starter/css/tokens.css` 落地（含阶段 B 修复后的 `--c-page-bg` 与 `--sidebar-w: 13.9%`） `← tokens.css:40-162`。

### 1.1 网页色板变量（`tokens.css:42-58` + 阶段 B 修正）

| CSS 变量 | 权威色值 | 语义角色 | 唯一出处 |
|---|---|---|---|
| `--c-page-bg` | `#dcded1` | **全站默认浅色页面主底色**（冷灰绿，阶段 B 新增，覆盖旧错的纯黑/米白底） | `← 01 §二 #7, real-page.md §一` |
| `--c-paper`（别名 `--c-card-paper`） | `#f7f7ee` | **卡片与浮层纸面色**、深色章节反白文字（**绝非页面主底色**） | `← tokens.css:42, 01 §二 #7` |
| `--c-ink` | `#292919` | **网页墨色正文与深色底块**（严禁用于生图插画暗部） | `← tokens.css:43, 01 §一` |
| `--c-grey-light` | `#dcdcd0` | 分割线、细边框、全宽浅灰休止带（`.bg-grey-light`） | `← tokens.css:44, blueprint.md §2.1` |
| `--c-grey-mid` | `#909083` | 次级信息、浅色态 `.davinci-lines` 线条色 | `← tokens.css:45, blueprint.md §2.1` |
| `--c-grey-dark` | `#5c5c4e` | 深灰正文链接与辅助标注 | `← tokens.css:46, blueprint.md §2.1` |
| `--c-black` | `#000000` | 深色章节底色基底 | `← tokens.css:47` |
| `--c-white` | `#ffffff` | 卡片内底、播放图标、深色态侧栏链接 | `← tokens.css:48, blueprint.md §1.2` |
| `--c-paper-60` | `#f7f7ee99` | 深色态次级字、非当前章罗马数字（`60%` 透明） | `← tokens.css:50, blueprint.md §2.1` |
| `--c-ink-60` | `#29291999` | 浅色态侧栏罗马数字 | `← tokens.css:51, layout.css:32` |
| `--c-ink-10` | `#2929191a` | 浅色态 1px 细分割线 | `← tokens.css:52` |
| `--c-ink-30` | `#2929194d` | `.square-button` 半透明深底 | `← tokens.css:53` |
| `--c-nav-light` | `#e2e2d9` | `light` 主题移动端导航条底色 | `← tokens.css:54, design-spec.md D10` |
| `--c-accent` | `#8051ff` | 卡片激活态按钮色（网页 UI 专用，禁作插画荧光） | `← tokens.css:55, 01 §一` |
| `--c-magenta` | `#ea135e` | 仅擦镜织物转场瞬间的玫红闪点 | `← tokens.css:56` |
| `--c-orbital` | `#d9d9d9` | 轨道发光点光晕基底色 | `← tokens.css:57` |
| `--c-focus` | `#57afdf` | 键盘焦点环颜色 | `← tokens.css:58` |
| 局部专用常量（非 `:root`） | `#303030` / `#808080` / `#7126ff` / `#1c004f` | 云卡小字（`layout.css:380`）/ 粒子端点灰（`details.js:198`）/ `sidekick.svg` 眼罩与脸部（`cinema-audit.md §2`） | `← layout.css:380, details.js:198` |

### 1.2 四族字体与字重（`tokens.css:10-38, 61-71`）

全部字体本地化存放于 `assets/starter/fonts/`（零外链），严禁互换角色 `← tokens.css:10-65, audit/v3/01-conflict-rulings.md C-12`：

| CSS 变量 | 字体族与本地文件 | 字重与 OpenType 特性 | 唯一法定用途 | 出处 |
|---|---|---|---|---|
| `--f-sans` | `NeueMontreal`（`NeueMontreal-Bold.woff2`） | `700`，`"liga" 1, "kern" 1`（**严禁开 `smcp`**） | 全站 `.headline-1..6` 章节巨字、`.bodycopy-1..2` 与主 UI | `← tokens.css:10-17, 61` |
| `--f-serif` | `HWCigars`（`HWCigars-Regular.woff2`） | `400`，`"liga" 1, "dlig" 1, "kern" 1, "smcp" 1, "c2sc" 1, "case" 1` | `.narrative-1..4` 叙事导语与左侧栏罗马数字 `::after` | `← tokens.css:18-25, 62` |
| `--f-script` | `ImperialScript`（`ImperialScript-Regular.woff2`） | `400` | **仅限** `.drop-cap::first-letter` 西文首字下沉 | `← tokens.css:26-32, 63` |
| `--f-ui` | `Inter-Variable`（`Inter-Variable.woff2`） | 可变字重（`400/500/600/700`） | `.cloud-card__text` 卡片小字与 tooltip（`11–13px`） | `← tokens.css:33-38, 64` |
| `--w-normal..bold` | `400 / 500 / 600 / 700` | `--w-normal: 400`, `--w-medium: 500`, `--w-semibold: 600`, `--w-bold: 700` | 全站四档字重令牌 | `← tokens.css:68-71` |

### 1.3 12 级字阶与 Drop Cap 三档（`layout.css:158-242`）

所有标题与叙事类统一开启 `text-wrap: pretty` 与 `text-box: trim-both cap alphabetic`（消除字形上下留白，缺此项巨字会明显下沉） `← design-spec.md D3, layout.css:158-176`：

| 类名 | 字体变量 | `<769px` 基础 | 行高 | 字距 | 字重 | `≥769px` 响应式覆盖 | 出处 |
|---|---|---|---|---|---|---|---|
| `.headline-1` | `--f-sans` | `72px` | `0.9` | `-0.03em` | `700` | `clamp(7.5rem, 35.7895px + 10.9649vw, 13.75rem)` | `← layout.css:164, 200` |
| `.headline-2` | `--f-sans` | `64px` | `0.9` | `-0.03em` | `700` | `clamp(6.25rem, 66.3158px + 4.38597vw, 8.75rem)` | `← layout.css:165, 201` |
| `.headline-3` | `--f-sans` | `54px` | `0.9` | `-0.02em` | `700` | `clamp(3.375rem, 45.579px + 1.09649vw, 4rem)` | `← layout.css:166, 202` |
| `.headline-4` | `--f-sans` | `32px` | `0.95` | `-0.03em` | `700` | 沿用基础值 | `← layout.css:167` |
| `.headline-5` | `--f-sans` | `24px` | `0.95` | `-0.02em` | `700` | 沿用基础值 | `← layout.css:168` |
| `.headline-6` | `--f-sans` | `18px` | `0.95` | `-0.02em` | `700` | 沿用基础值 | `← layout.css:169` |
| `.narrative-1` | `--f-serif` | `28px` | `0.96` | `-0.05em` | `400` | `clamp(2rem, 18.5263px + 1.75439vw, 3rem)` | `← layout.css:177, 203` |
| `.narrative-2` | `--f-serif` | `24px` | `0.97` | `-0.05em` | `400` | `clamp(1.5625rem, 21.6316px + .438597vw, 1.8125rem)` | `← layout.css:178, 204` |
| `.narrative-3` | `--f-serif` | `20px` | `0.97` | `-0.04em` | `400` | 沿用基础值 | `← layout.css:179` |
| `.narrative-4` | `--f-serif` | `12px` | `1.07` | `0` | `400` | 沿用基础值 | `← layout.css:180` |
| `.bodycopy-1` | `--f-sans` | `16px` | `1.1` | `0` | `700` | `14px`（悬停链接变虚线下划线） | `← layout.css:189, 197, 205` |
| `.bodycopy-2` | `--f-sans` | `14px` | `1.1` | `0` | `700` | `11px` | `← layout.css:190, 206` |

- **Drop Cap 三档**（`:not(:lang(jp)):not(:lang(ja))::first-letter` 用 `--f-script`，`<769px` 为 `70px`、`line-height: 0`）：`≥769px` 标准档 `clamp(6rem, 75.7895px + 2.63158vw, 7.5rem)`（`96→120px`）、`.narrative-2` 变体 `clamp(4.375rem, 48.1053px + 2.85088vw, 6rem)`（`70→96px`）、`.merch-drop-cap` 变体 `clamp(7.5rem, 86.3158px + 4.38597vw, 10rem)`（`120→160px`），配 `text-indent: -12px`（桌面 `-clamp(12px, 1vw, 16px)`）与 `padding-inline: 12px`（`.drop-cap-aligned` 桌面归 `0`）；中文段改用 `.narrative-1` 不加 `.drop-cap` `← layout.css:210-242, design-spec.md D3`。

### 1.4 1px 间距刻度、容器布局、9 级断点、圆角阴影与 Z-index

原站 Tailwind 类名数字直接等于 **1px 单位**（如 `py-40 = 40px`、`mb-70 = 70px`、`pb-120 = 120px`，非默认 `4px` 倍数），严禁自造 `17px`、`23px` 等刻度外数值 `← tokens.css:73-89, design-spec.md D4`：

| 类别 | CSS 变量与取值 | 用途与说明 | 出处 |
|---|---|---|---|
| **基础与栅格间距** | `--sp: 1px`; `--sp-grid: 12px`; `--sp-grid-md: clamp(12px, 1vw, 16px)`; `--sp-row: 2.5rem`; `--sp-row-lg: 4rem` | 列间距 `12–16px`；行间距 `40px`（`≥1080px` 扩至 `64px`） | `← tokens.css:78-82` |
| **常用节奏刻度** | `--sp-3/5/7/8/10/11/12/13/15/20/24/40/60/70/80/100/120/130`（均等于同名 `px`） | 封面 `py-40/130`、导语 `mb-70/40`、块 `pb-60/120/80`、卡片内距 `15px` | `← tokens.css:85-89, design-spec.md D13` |
| **容器与分栏** | `--container: 105rem`（`1680px`）; `--cols: 12`; `--sidebar-w: 13.9%`; `--content-w: 86.1%`; `--content-max: 86.1%` | 阶段 B 已修正 `20% → 13.9%`（`1440` 视口下 `200px`）；`<769px` 为 `2` 列，`≥769px` 为 `12` 列子网格 | `← tokens.css:92-96, 01 §二 #8` |
| **媒体比例** | `--aspect-video: 16 / 9`; `--aspect-poster: 1016 / 529`; `--aspect-card: 340 / 100`（基础 `245/107`） | 全部媒体容器锁比例，绝不拉伸变形 | `← tokens.css:97-99` |
| **圆角** | `--r-1..4`（`1/2/3/4px`）; `--r-8/10/12/14`（`8/10/12/14px`）; `--r-card: 12px`; `--r-organ: 75px 100px 100px 20px`; `--r-pill: 3.40282e38px` | 卡片 `12px`、CTA/tooltip/modal `3px`、播放键 `6px`、图标盒 `2px`、异形卡 `--r-organ` | `← tokens.css:102-112, design-spec.md D7` |
| **阴影与层级** | `--sh-card: 3px 6px 12px rgba(0,0,0,.13)`; `--sh-orbital: 0 0 20px rgba(217,217,217,.8)`; `--z-cloud: 1`; `--z-media: 2`; `--z-play: 10`; `--z-nav: 100`; `--z-modal: 10000` | 五级 `z-index` 严格分层，导航常驻 `100` 压过正文媒体；若页面存在独立全屏浮层/弹窗且顶栏使用 `9999`，浮层必须严格大于顶栏（`≥ var(--z-modal)` 或 `12000`），防止顶栏文字透出 `← V3.3` | `← tokens.css:115-116, 157-161` |
| **垂直节奏** | Hero `150svh`（`translate-y-[-100%]`）；章封面 `70svh → md 140svh`；sticky 封面 `top: 110px`；全宽灰带 `py-40 → lg py-60` | 章节留整屏、块留 `60–120px`、元素留 `15–24px`，禁止压扁留白 | `← design-spec.md D13` |

**9 级响应式断点（真实 `min-width` 阈值）** `← tokens.css:164-166, design-spec.md D11`：

| `px` | `rem` | 别名与核心布局切换 |
|---|---|---|
| `300` / `375` / `640` | `18.75` / `23.4375` / `40` | 极窄屏 / 小屏 / `sm`（多语种字号微调） |
| **`769`** | **`48.0625`** | **`md`**：启用 `clamp()` 字阶、`12` 列栅格、Drop Cap 放大 |
| **`940`** | **`58.75`** | **`global-lg`**：左侧栏切 `fixed`、`scroll-padding-top` 由 `60px → 50px`、右侧内容区切 `86.1%` |
| **`1080`** | `67.5` | `lg`：`row-gap` 扩至 `4rem`（`64px`）、区块 `pb-80` |
| `1280` / `1680` / `1712` | `80` / `105` / `107` | `xl`（侧栏贴 `105rem` 容器左缘）/ 容器上限 / 超大屏 |

### 1.5 10 条贝塞尔缓动曲线、16 项时长与 6 项动效常量（`tokens.css:118-155`）

本表是全库**唯一定义 10 条 CSS 缓动原始曲线的地方**；`references/04-motion-and-stage3d.md` 只引用变量名与运动职责，不重复抄写贝塞尔数字 `← audit/v3/02-dedup-matrix.md D-06`：

| CSS 变量 | 源码原始值 | 对应运动角色 | 出处 |
|---|---|---|---|
| `--e-default` / `--e-in-out` | `cubic-bezier(.4, 0, .2, 1)` | UI 默认与 `body` 主题切换 | `← tokens.css:119, 122` |
| `--e-in` / `--e-out` | `cubic-bezier(.4, 0, 1, 1)` / `cubic-bezier(0, 0, .2, 1)` | 通用进出过渡 | `← tokens.css:120-121` |
| `--e-back` | `cubic-bezier(.34, 1.56, .64, 1)` | **卡片回弹过冲**（`y>1` 决定手感，禁改 `ease-out`） | `← tokens.css:123, design-spec.md D8` |
| `--e-lines` | `cubic-bezier(.34, .22, .47, .84)` | 达芬奇几何线行进 | `← tokens.css:124` |
| `--e-complete` | `cubic-bezier(.72, .16, .19, .96)` | 线条完成与入场滑动 | `← tokens.css:125` |
| `--e-fade-out` | `cubic-bezier(.25, .46, .45, .94)` | 文本/图层淡出 | `← tokens.css:126` |
| `--e-scroll` | `cubic-bezier(.41, .19, .13, .95)` | 滚动态切换与擦镜转场 | `← tokens.css:127` |
| `--e-loading` | `cubic-bezier(.45, .28, .34, .84)` | 首屏加载线条进度 | `← tokens.css:128` |
| JS `easeOutExpo`（非 CSS 变量） | `Math.min(1, 1.001 - 2 ** (-10 * t))` | 侧栏点击 `1s` 章节跳转 | `← tokens.css:129, blueprint.md §3.7` |
| **16 项时长变量** | `--t-default: .15s`; `--t-hover: .3s`; `--t-body: .6s`; `--t-card: .4s`; `--t-fade-out: .52s`; `--t-lines: 3s`; `--t-lines-complete: 1s`; `--t-lines-loading: 6s`; `--t-slide: .6s`; `--t-scroll-state: .6s`; `--t-stagger-fade: 75ms`; `--t-stagger-slide: 20ms`; `--t-fade-delay: .2s`; `--t-intro: 5000ms`; `--t-intro-delay: 100ms`（另含章节跳转 `1s`） | 全站统一节拍，入场与错峰直接消费此表 | `← tokens.css:132-146, design-spec.md D8` |
| **6 项动效常量** | `--motion-lerp: .1`; `--motion-damp: .15`; `--motion-parallax: -15px`; `--motion-repulse-dist: 300`; `--motion-repulse-str: 20`; `--motion-scroll-gate: 100px` | JS 侧同步消费的物理常数（行为详见 `04 §四`） | `← tokens.css:149-154` |

---

## 二 双轨色板隔离声明（变量名映射）

生图插画色板与网页 CSS 色板严格分轨，混用即刻触发「生图发黄、网页发蓝」 `← 01 §一`：

| 轨道 | 允许使用的色值 / 变量 | 严禁串用项 | 详细裁决出处 |
|---|---|---|---|
| **网页 UI 轨道（CSS 专属）** | 页面主底 `var(--c-page-bg)`、卡片纸面 `var(--c-paper)`、正文与深底 `var(--c-ink)`、灰阶 `var(--c-grey-light/mid/dark)`、按钮激活 `var(--c-accent)` | **严禁**把插画暗部冷青蓝拿来当网页主底色；**严禁**把 `var(--c-paper)` 当全页主底色 | `← 01 §一, §二 #7` |
| **插画与分层图轨道（生图专属）** | 仅按冷青蓝暗部（`189°–224°`）与洋红/玫红点缀（`309°–339°`）转译为英文颜料词（见 `03 §三`） | **严禁**把 `var(--c-ink)`（橄榄褐）或 `var(--c-accent)`（电光紫）写进任何生图提示词或 3D 舞台罩染层 | `← 01 §一, audit/v3/01-conflict-rulings.md C-01, C-02` |

---

## 三 DOM 类名骨架与 `data-*` 类名对照表

本节只给结构类名与状态类名的静态配对关系；每个 `data-*` 钩子的脚本归属、写入属性与冲突禁区唯一定义在 `references/04-motion-and-stage3d.md §五` `← blueprint.md §1, layout.css`：

| 页面区块 | 根容器与核心子元素类名 | 配对 `data-*`（行为见 `04 §五`） | 状态类 / 主题联动 | 出处 |
|---|---|---|---|---|
| **页面外壳** | `html` → `.main-wrapper.max-w-container` → `main.safe-min-h-svh`（全站默认全程静音，**严禁再放声音开关**） | `html[data-nav-theme="dark\|light"]`, `data-title-theme`, `data-sidebar-theme` | `light` 态切灰绿主底与深墨色；`dark` 态切深底反白 `← layout.css:11-36, V3.3` | `← blueprint.md §1.1, design-spec.md D10` |
| **首屏目录卡与左侧栏** | 可选 `.toc-card[data-toc-dock]`（`340×464` 细线框）+ `aside.side-nav` → `nav` → `svg.davinci-lines` + `ol` → `li.side-nav__item` → `a.side-nav__link`（`.side-nav__label` + `.side-nav__rule` + `.side-nav__num`） | `data-toc-dock`, `data-section-name="side-nav"`, `data-initiated`, `data-scrolled`, `data-sidebar-ready`, `data-sidebar-loaded` | 滚过 `100px` 由 `card` 解锁为 `docked`；`.is-active` 加粗当前章并隐去罗马数字 `← layout.css:52-206` | `← blueprint.md §1.2, C-11` |
| **3D 首屏舞台** | `.hero` → `.stage3d` → `.stage3d__camera` → 标准 4 层（`--bg` `.stage3d__img` / `--subject` / `--fx` / `--prop`）或 5 层剧场（`--bg` / `--mid` / `--arch` / `--subject` / `--fx` / `--fg`）+ `.stage3d__hotspot`（`.stage3d__hotspot-ring` 常态 `opacity: 0`）+ 相机外 `.stage3d__flash` | `data-stage3d`, `data-stage-mode="theater"`, `data-autoplay`, `data-dolly`, `data-drift` | **严禁**在 `.stage3d` 背景图上挂 `.hero__img` 或 `.stage3d__tone`；热区悬停才用 `var(--c-magenta)` 显露 `← stage3d.css:60-245` | `← stage3d.css, C-15, V3.1` |
| **常规章节** | `section.section`（`id="<slug>"`）→ `.chapter-cover`（`.headline-1`）+ `.narrative-1.drop-cap` + `.grid-template-with-gaps` → `article.grid-cols-subgrid` | `data-section-id`, `data-section-index`, `data-section-scope`, `data-nav-theme`, `data-transition` | 滚入视口由 `IntersectionObserver` 同步根元素主题 | `← blueprint.md §1.1, §1.3` |
| **卡片与斥力场** | `.cloud-field` → `.cloud-card`（变体 `.cloud-card--organ`）→ `.cloud-card__inner` + `.cloud-card__text` + `.cloud-card__btn` | `data-cloud-field`, `data-cine-stagger`, `data-cine-step`（或 `data-reveal`） | `.is-active .cloud-card__btn` 切 `var(--c-accent)` | `← layout.css:364-388` |
| **六机位重场面** | `.cine-stage` → `.cine-layer`（远/中/近三层） | `data-rig`, `data-rig-label`, `data-depth` | 独立于 `.stage3d`，二选一不混用 | `← cinema.js:14-17` |

---

## 四 首屏目录卡片、13.9% 左侧栏与 50–56px 顶栏 CSS 实现要点

这三处是决定「能否直接塞进 Shopify 官网当第 14 页」的硬性视觉结构，不可凭印象自由发挥 `← 01 §二 #8, #9, real-page.md §二, §三`：

### 4.1 首屏中央 `1px` 细线框目录卡片（解锁飞向左侧栏）
- **初始尺寸与比例**：首屏 `0–1s` 不出章节巨字，中央呈现细线框目录卡——`nav` 设 `position: absolute; top: 50%; left: 50cqw; transform: translate(-50%, -50%)`，宽度 `min(340px, calc(100vw - 24px))`，比例锁死 `aspect-ratio: 340 / 464`，内边距 `var(--sp-20)` `← blueprint.md §1.2, 01 §二 #9`。
- **线框载体**：内嵌 `<svg class="davinci-lines" viewBox="550 208 340 464">`，由 `25` 条 `path`、`4` 个 `rect`、`14` 个 `circle` 构成（`41` 处 `pathLength="1"`），外框 `<rect x="550" y="208" width="340" height="464" stroke-width="1" stroke-linecap="square">`；色值用 `currentColor` 随主题切换 `var(--c-paper)` 与 `var(--c-grey-mid)` `← cinema-audit.md §2, blueprint.md §1.2, §2.1`。
- **解锁流转**：滚出 `100px` 阈值（`data-scrolled="true"`）后，目录卡解锁收缩并停靠左侧常驻导航栏；巨字章节封面从第二章起出现 `← 01 §二 #9, tokens.css:154`。

### 4.2 左侧 `13.9%` 罗马数字导航栏
- **有效列宽**：`≥940px`（`global-lg`）切 `position: fixed; top: 0; bottom: 0; left: 0; z-index: var(--z-nav)`，视觉导航列宽锁定 `width: var(--sidebar-w)`（`13.9%`，`1440px` 视口下约 `200px`；`≥1280px` 贴齐 `left: calc((100% - var(--container)) / 2)`），右侧主内容区占 `86.1%`（`margin-left: auto`） `← 01 §二 #8, tokens.css:94-96, layout.css:56`。
- **CSS 生成罗马数字与悬停虚线**：`12` 章目录（`I` 至 `XII`，`Hero` 不入列）每项设行内 `--index`，罗马数字**由 CSS `::after` 生成而非 DOM 文本**，字体 `var(--f-serif)`、`0.6875rem`；当前激活章 `.is-active` 文字加粗并隐去罗马数字；标签后挂 `1px` 虚线（`background-image: linear-gradient(270deg, currentColor 1px, transparent 1px); background-size: 3px 30%`），hover 延迟 `0.15s` 通过 `clip-path: inset(0)` 展开 `← design-spec.md D6, layout.css:31-36`。
- **侧栏底脚避让红线（V3.3 新增）**：若左侧栏底部挂有绝对定位的版权区（`.side-nav__foot`），目录容器（`.side-nav__inner`）必须预留充足的底部安全内边距（如 `padding-bottom` 覆盖版权区高度再加 `24–36px`），确保在较矮视口下最后一条章节目录绝不被底脚文字遮盖重叠 `← V3.3 实战蒸馏`。

### 4.3 `50–56px` 半透明顶栏与刻意遮字构图
- **顶栏高度与锚点补偿**：顶栏固定在视口顶部，桌面高 `50px`、小屏/starter 预留 `56px`（`html` 同步设 `scroll-padding-top: 60px`，`≥940px` 改 `50px`）；内部 `header > nav` 叠暗/亮双层渐变遮罩（`opacity: 0.75`，过渡 `var(--t-hover)`），`5` 个顶栏导航项按 `500 / 540 / 580 / 620 / 660ms` 阶梯显现 `← design-spec.md D13, layout.css:477, cinema-audit.md §2`。
- **刻意裁字与避让**：章节封面巨字（`.headline-1`）在顶边被半透明顶栏**故意遮掉一截**属于原站标志性设计，不得为了「露全字」而把巨字硬推到顶栏下方；但当巨字压左排版时，`.hero__inner` 必须留足 `padding-left` 避开左侧 `13.9%` 导航文字，禁止两者重叠 `← 01 §二 #9, motion-playbook.md §5d`。

---

## 五 资产命名规范与响应式图片档位

无论消费官方镜像还是自产分层素材，全库资产严格遵循「**章节前缀 → 内容/图层 → 日期与优化版本**」三层语义命名 `← design-spec.md D12, blueprint.md §4`：

| 资产类型 | 命名模板与实测示例 | 工程硬约束 | 出处 |
|---|---|---|---|
| **自产分层与关节 PNG** | `assets/layers/<layer>-<scene>-<role>.png`（如 `bg-courtyard.png`、`figure-subject-cutout.png`、`prop-mirror-cutout.png`；5 层与关节拆件：`*-arch-*.png`、`*-fg-*.png`、`*-base.png`、`*-hand-left.png`、`*-hand-right.png`） | 仅保留成品图；所有透明层/拆件必须真 `RGBA`（`verify.mjs` 拦截 4 自动校验 PNG `colorType`），200% 实景复核后**删光所有 `_qa_*` 临时质检图与带水印原图** | `← 03 §四, V3.1` |
| **本地字体** | 语义名 `.woff2`（`NeueMontreal-Bold.woff2`、`HWCigars-Regular.woff2`、`ImperialScript-Regular.woff2`、`Inter-Variable.woff2`）；原站 CDN 为 `32` 位 MD5 哈希，日文带 `-subset` | 全部置 `assets/starter/fonts/`，配 `font-display: swap`，零外链 | `← tokens.css:10-38, blueprint.md §4.1` |
| **3D 模型与贴图** | `<前缀>_<场景>_<图层>_<YYMMDD>_compressed-optimized.glb`；`<Scene>_<layer>@@v=<戳>.ktx2` | `@@v=` 为离线镜像查询串编码；静态页只占位不实例化 WebGL | `← blueprint.md §4.2, cinema-audit.md §5` |
| **Theatre 状态与 Rive** | `<Scene>Scene.theatre-project-state[_序号]@@v=<戳>.json`；`<name>.riv` | 仅作源码取数与动效对照参考，静态页不加载运行态 | `← blueprint.md §4.2` |
| **响应式图片 `srcSet`** | 视频缩略图：`300 / 500 / 700 / 900 / 1100 / 1300 / 1500 / 1700`（步长 `200`）；海报：`200 → 2000`（步长 `200`） | 宽度变体须为独立文件；锁容器比例、装饰图写 `alt=""`、非首屏 `loading="lazy"` | `← design-spec.md D12` |
