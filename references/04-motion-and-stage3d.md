# 动效与 3D 舞台

本手册负责让已经对味的视觉页面「按 Shopify Editions 的单相机与时间轴逻辑动起来」。所有原站帧级实测与 `13` 场景状态机真相以 `references/01-overturns-and-truth.md` 为准；CSS 缓动原始曲线与色值令牌归属 `references/02-design-tokens.md`；通用 GSAP 语法（补间参数、时间轴位置语法、ScrollTrigger 通用选项）交给本机 `gsap-*` 技能（分工见 `references/06-extraction-and-skills-wiring.md`），本手册只写 Shopify 专属的镜头架构、重参数化数值、钩子契约与防打架铁律 `← motion-playbook.md §0, gsap-library.md §8`。

---

## 一 镜头系统边界：五套脚本怎么选、怎么不打架

本技能包共包含五套职责隔离的运动脚本。同一页面绝不能把两套抢同一元素 `transform` 的镜头叠在同一个舞台上，否则后执行的脚本会直接覆盖前者的 `translateZ` 或 `scale`，把 3D 景深压成平面 `← motion-playbook.md §0, §5d, audit/v3/01-conflict-rulings.md C-15`。

### 1.1 五套脚本选型矩阵

| 脚本 | 职责定位 | 依赖 | 核心钩子（详表见 §五） | 适用场景 | 严禁冲突对象 |
|---|---|---|---|---|---|
| **`motion.js`** | 全站底座：平滑滚动等效、主题切换、卡片斥力场、基础显现、侧栏 `easeOutExpo` `1s` 跳转 `← motion.js:254` | 零依赖 | `data-nav-theme`, `data-section-scope`, `data-cloud-field`, `data-reveal`, `data-damp` | 所有页面必载 | 不与其余引擎写同一元素同一属性 |
| **`stage3d.js` + `hero-intro.js`** | **首选主舞台**：单相机透视推拉 + `4` 层固定 `translateZ` + 加载即播 `10s` 首屏自动序列 `← stage3d.js:4-9, hero-intro.js:59-99` | `stage3d.js` 零依赖；`hero-intro.js` 依赖本地 `gsap.min.js` | `data-stage3d`, `data-autoplay`, `data-dolly`, `data-drift` | 有独立透明分层素材（`bg / subject / prop`）的首屏与重章节封面 | **严禁与 `cinematic.js` 推镜或 `cinema.js` 共用于同一舞台**；背景图禁止挂 `.hero__img` `← C-15` |
| **`cinematic.js`** | 轻量单图滚动推镜 + `720ms / 1320ms` 四段式文字入场 + `75ms` 卡片错峰 + 章节四层视差 `← cinematic.js:8, 145, 175` | 本地 `gsap.min.js` + `ScrollTrigger.min.js` | `data-cine`, `data-cine-stagger`, `data-cine-step`, `data-parallax`, `data-scroll-layer` | 只有单张成品底图的常规首屏、作品集正文与列表章 | 检测到 `[data-stage3d]` 时必须自动跳过 `.hero__img` 推镜，只保留文字 `[data-cine]` 入场 `← C-15` |
| **`cinema.js`** | 六机位分层运镜（`dolly / orbital / truck / lateral / dolly-zoom / pull-back`）+ 彩色粒子迸发 + 下拉搜索交互 `← cinema.js:14, 250` | 零依赖 | `.cine-stage[data-rig]`, `data-depth`, `data-burst` | 需要特定章节镜头轨（如希区柯克变焦、弧轨绕物）的中段重场面 | 不与 `stage3d.js` 混用于同一容器 `← motion-playbook.md §0` |
| **`details.js`** | 章节转场遮罩（白闪 `flash` / 织物擦镜 `wipe`）+ `60×3` Canvas 2D 星尘粒子背景 `← details.js:151-211` | 零依赖（WAAPI + Canvas 2D） | `data-transition`, `data-particle-field` | 章节过渡与浅色背景细腻动势 | **严禁再挂载重复的 `1.77s` 首屏爆发段**（已收归 `hero-intro.js` 独占，旧版 `data-shot` / `data-burst-*` 废弃） `← C-16` |

### 1.2 属性隔离与加载顺序铁律

脚本与样式表必须严格按以下顺序声明，顺序颠倒会导致变量未就绪或自动序列锁失效 `← motion-playbook.md §6, gsap-library.md §5`：

1. **CSS 顺序**：`tokens.css` → `layout.css` → `cinema.css` → `stage3d.css` → `details.css`（后三者引用 `tokens.css` 的令牌变量）。
2. **JS 顺序**：`vendor/gsap/gsap.min.js` → `vendor/gsap/ScrollTrigger.min.js` →（按需其他本地插件）→ `js/motion.js` → `js/cinema.js` → `js/cinematic.js` → `js/stage3d.js` → `js/hero-intro.js` → `js/details.js`（全部带 `defer`）。
3. **关键先后依赖**：`hero-intro.js` 必须排在 `stage3d.js` 之后，因为前者写入 `window.__stage3dAuto = true`，后者在 `write()` 里读取该锁来让出 `z / rx` 控制权 `← stage3d.js:93, hero-intro.js:54`。
4. **父子分层不打架**：在 `cinematic.js` 模式下，推镜写父块（`.hero__title` 的 `yPercent/opacity`、`.hero__status` 的 `opacity`），入场写子行（`> span[data-cine]` 的 `xPercent/y/opacity`）；正文区 `data-cine-stagger` 与 `data-scroll-layer` 同挂在一个容器上是**合法**的——前者只写子项 `[data-cine-step]` 的 `y`，后者写容器自身的 `yPercent`；但 `data-scroll-layer` 与 `data-parallax` 严禁同挂一元素（两者都写 `yPercent`） `← motion-playbook.md §3, §5b, §9`。

---

## 二 真 3D 四层舞台与 Z 轴数学推导

原站首页的立体感不是给四张图手写四种滚动速率，而是 Three.js 的**单一透视相机 + 多层不同深度的空间 mesh**（`50` 个 `.glb`、`45` 个 `.ktx2`），相机一动，近层位移与放大倍率由透视投影自动算出 `← cinema-audit.md §5, motion-playbook.md §5d`。纯前端网页用 CSS `perspective` 与 `transform-style: preserve-3d` 复刻同一原理。

### 2.1 四层 Z 值唯一权威定义（CSS 3D 重参数化，非原站 Three.js 坐标）

容器固定 `perspective: 1000px`、`.stage3d__camera` 启用 `transform-style: preserve-3d`，四层固定静态深度，JS **永远只写 `.stage3d__camera` 一个元素的 6 个 CSS 变量**，从不逐层改 `transform` `← stage3d.css:11, 60-63, stage3d.js:89-99`：

| 层类名 | 固定 CSS `transform`（重参数化，非原站坐标） | 视距 `1000px` 静止倍率 | 职责与素材规格 | 对应出处 |
|---|---|---|---|---|
| `.stage3d__layer--bg` | `translateZ(-240px) scale(calc(1.32 * var(--bg-push, 1)))` | 原始 `0.806×` → 补边后 `1.064×` | 纯环境横图（无人无道具），`1536×1024` 不透明 | `← stage3d.css:60` |
| `.stage3d__layer--subject` | `translateZ(0px)` | `1.000×` | 抠出真 Alpha 的主体人物，`1024×1536`，`object-fit: contain` | `← stage3d.css:61, 69-73` |
| `.stage3d__layer--fx` | `translateZ(40px)` | `1.042×` | 网页 SVG 神圣几何线 + 柔光斑（`pointer-events: none`），不靠生图 | `← stage3d.css:62, 80-102` |
| `.stage3d__layer--prop` | `translateZ(90px)` | `1.099×` | 贴近镜头的小道具真 Alpha 图，`1024×1024`，无合适道具则直接砍掉本层 | `← stage3d.css:63, 74-78` |

> 分层生图与抠图 SOP 见 `references/03-painting-and-layers.md §二, §四`；本节是全库关于四层 `translateZ` 与透视倍率的唯一数学推导处。

### 2.2 透视放大穿帮推导：为什么绝不能用旧稿 `+40 / +100 / +180`

旧版 `SKILL.md` 与 `stage3d.css` 文件头曾错写 `-240 / +40 / +100 / +180px` `← C-13`。按透视公式（视距 $P = 1000\text{px}$，合成深度 $Z_{\text{eff}} = Z_{\text{cam}} + Z_{\text{layer}}$），视觉缩放倍率为：

$$M = \frac{1000}{1000 - (Z_{\text{cam}} + Z_{\text{layer}})}$$

代入推镜峰值 $Z_{\text{cam}} = +150\text{px}$ `← hero-intro.js:68` 与负起点 $Z_{\text{cam}} = -60\text{px}$ `← stage3d.js:78`：

1. **旧值 `prop = +180px` 必然穿帮**：峰值合成深度 $150 + 180 = 330\text{px}$，倍率飙至 $1000 / 670 = 1.493\times$，右上道具直接越界并遮脸；`subject = +40px` 峰值达 $1.235\times$ 易裁头顶 `← C-13`。
2. **现行值 `0 / +40 / +90px` 稳定**：负起点（`-60px`）时 `subject = 0.943×`、`prop = 1.031×` 避免首屏糊脸 `← stage3d.js:76-78`；峰值（`+150px`）时 `subject = 1.176×`、`fx = 1.235×`、`prop = 1.316×`，景深拉开且全员留安全区内。
3. **背景 `-240px` 必乘 `1.32` 补边**：静止态缩至 `0.8065×`，负起点缩至 `0.769×` 会露黑边；解 $0.769 \times S_{\text{base}} \ge 1.015$ 得 $S_{\text{base}} \ge 1.319$，故 `stage3d.css:60` 取 `1.32`，自动序列再叠 `--bg-push: 1 → 1.52` 呼应原站 `landscape` 独立放大 `← hero-intro.js:71-72`。

### 2.3 单相机交互驱动与容器铁律

`stage3d.js` 经 `IntersectionObserver`（`rootMargin: "10% 0px 10% 0px"`）仅在入屏时合批 `rAF` 写入 6 个变量 `← stage3d.js:46-115`：

- **滚动映射**：`p = clamp((vh - r.top) / (vh + r.height), 0, 1)`，驱动 `--cam-z = -60 + p * (dolly + 60)`（默认 `dolly = 150`）、`--cam-rx = (1 - p) * 1.6 - 0.8`（`deg`） `← stage3d.js:64, 78-79`。
- **鼠标视差**：归一化坐标 `[-1, 1]` 经 `0.15` 阻尼（`cx += (mx - cx) * 0.15`），写 `--cam-x = -cx * drift`、`--cam-y = -cy * drift * 0.6`（默认 `drift = 18px`）、`--cam-ry = cx * 1.6deg` 与原点 `--cam-origin-x = 50 + cx * 4%`、`--cam-origin-y = 50 + cy * 3%` `← stage3d.js:30, 73-99`。
- **防塌陷铁律**：`.stage3d` 必须 `position: absolute; inset: 0; width: 100%; height: 100%`，否则高度为 `0` 致 `p` 恒为 `1` 卡死峰值 `← motion-playbook.md §5d`。
- **CDP 实测（`1440×900`）**：滚距 `0→780px` 下 `bg` 位移 `806.6px`、`prop` 位移 `813.5px`（纯透视多走 `7px`）；鼠标触发 `camX: 0 → -2.56px → +0.38px` `← motion-playbook.md §5d`。`prefers-reduced-motion` 下 `transform` 全归 `none` `← stage3d.js:19`。

### 2.4 真 5 层剧场级景深模式（`data-stage-mode="theater"`，V3.1 实战升级）

标准 4 层（`drift: 18px`、`ry: ±1.6°`）偏向克制；当首屏包含**建筑拱廊框景 + 廊外远景 + 接地人物互动桌 + 近镜前景物**，需要一眼拉开电影级立体错位时，在 `[data-stage3d]` 上追加 `data-stage-mode="theater"` 启用剧场 5 层架构（以下数值均标「重参数化，非原站坐标」 `← V3.1 实战蒸馏`）：

| 层级 | 类名 | 固定深度与缩放（`perspective: 900px`） | 职责与防露边要领 |
|---|---|---|---|
| **L1 远景层** | `.stage3d__layer--bg` | `translateZ(-260px) scale(calc(1.50 * var(--bg-push, 1)))` | 远山河谷 + 双层冷雾慢漂；大超裁 `1.50×` 保证 `±6.5°` 绕轨零黑边 |
| **L2 中景自然层** | `.stage3d__layer--mid` | `translateZ(-165px) scale(1.28)` | 廊外柏枝/树冠等独立透明层，独立随微风倾曳 |
| **L3 建筑框景层** | `.stage3d__layer--arch` | `translateZ(-75px) scale(1.22)` | 独立拱门、石柱与雕花栏杆真透明层，**彻底与人物分离** |
| **L4 接地主体层** | `.stage3d__layer--subject` | `translateZ(0px) scale(1.12)` | 稳坐接地的人物、石桌与互动设备（Canvas 2D 活体舞台 1:1 锁画幅） |
| **L5a 几何光尘层** | `.stage3d__layer--fx` | `translateZ(42px)` | 网页 SVG 神圣几何线缓慢自转 + 稀疏冷北光光尘 |
| **L5b 近镜前景层** | `.stage3d__layer--fg` | `translateZ(82px) scale(calc(1.06 * var(--fg-peel, 1)))` | 近镜石拱边沿 + 桌角卷页古书；滚动时 `--fg-peel` 放大至 `1.36` 且 `--fg-opacity` 淡出，形成镜头穿门穿梭感 |

**剧场镜头三项增强**：1) 鼠标绕轨放宽至 `ry: ±6.5°`、`rx: ±2.6°`、`drift: 36px`（需持续 `rAF` 阻尼循环，鼠标停住仍柔滑归位）；2) 开场支持侧移摇臂弧线（`x / ry / z` 联动）而非单调直推；3) 滚动推进时同步驱动 `--fg-peel` 外推剥离前景框，把观者「带进画面内部」。

---

## 三 首屏自动序列与滚动交接（工程实现）

首屏不是等人滚动才动的静帧，而是加载即播的 `10` 秒自动时间轴。**时间轴各时刻的原站实测数据与重参数化刻度见 `references/01-overturns-and-truth.md §二 #11` 与 `§四`，本节不再重抄关键帧表，只写 `hero-intro.js` 的工程落地、锁机制与故障兜底** `← audit/v3/01-conflict-rulings.md C-14`。

### 3.1 代理对象幂等架构（`hero-intro.js`）

当 `1.77s` 爆发段与 `0–1.80s` 推镜段、`0.50–1.80s` 背景加速段在时间上重叠时，若用多个 GSAP tween 直接去改 DOM `style`，会互相覆盖。`hero-intro.js` 采用单一普通 JS 代理对象统一刷写 CSS 变量，保证任意重叠都幂等 `← hero-intro.js:39-51`：

```js
var cam = { z: -60, rx: 1.6, bgPush: 1, flash: 0 };
function apply() {
  stage.style.setProperty("--cam-z", cam.z.toFixed(2) + "px");
  stage.style.setProperty("--cam-rx", cam.rx.toFixed(2) + "deg");
  stage.style.setProperty("--bg-push", cam.bgPush.toFixed(3));
  if (flash) flash.style.opacity = cam.flash.toFixed(3);
}
```

### 3.2 时间轴装配与控制权交接

1. **启动与抢锁**：仅对 `[data-stage3d][data-autoplay]` 运行；`prefers-reduced-motion: reduce` 或缺失 `window.gsap` 时直接退出。启动前置 `window.__stage3dAuto = true`、`stage.dataset.autoplayState = "playing"` 并先执行一次 `apply()` 锁死初始负起点 `z = -60px` `← hero-intro.js:54-57`。
2. **主线与延迟**：`gsap.timeline({ delay: 0.35, onUpdate: apply, onComplete: markIdle })`，`0.35s` 延迟等待首帧绘制并呼应原站 `0.37s` 资产淡入；内部依次编排 `0s` 强推（`power2.in`）、`0.50s` 背景加速（`power1.in`）、`1.77s` 闪光与星尘迸开（`none` `60ms` 升 + `power2.out` `460ms` 退）、`2.13s` 回落（`power2.out` `0.54s`），`3.03s` 经 `tl.call(startBreath, null, 3.03)` 切入 `z: 10 ↔ 16` 的 `5s` `sine.inOut` 无限 `yoyo` 呼吸 `← hero-intro.js:59-99`。
3. **闪光层挂位**：`.stage3d__flash` 放于 `.stage3d__camera` 外面（`z-index: 8`），不参与 3D 推镜变形 `← motion-playbook.md §5e`。
4. **滚动交接**：自动播期间 `stage3d.js:93` 跳过写 `--cam-z / --cam-rx` 但保留鼠标 `x / y / ry / origin` 视差；首次滚动触发 `yieldToUser()`（`passive: true, once: true`），置 `__stage3dAuto = false`、`autoplayState = "yielded"` 并执行 `tl.kill()`（阶段 B 修复将一并回收 `3.03s` 派生的呼吸 tween），同时暴露 `window.__heroIntro` 供断言 `← hero-intro.js:102-111`。
5. **CDP 实测基线**：`z: -60 → +150（2.04s）→ flash 0.78（1.77s）→ +10（2.94s）→ 呼吸 10→11.62`、`bgPush: 1→1.52`、滚动交接 `__stage3dAuto: true→false`、`autoplayState: idle→yielded` `← motion-playbook.md §5e`。

### 3.3 停滞兜底与无头截图两坑

- **3 秒停滞兜底**：后台标签页或无头浏览器下 `rAF` 可能停滞导致 `[data-cine]` 卡在 `opacity: 0`；`cinematic.js:199-206` 在 `setTimeout(restoreVisible, 3000)` 后强行将未点亮元素置 `opacity: 1; transform: none` `← motion-playbook.md §7`。
- **无头截图两坑**：1) Headless Chrome 的 `virtual-time-budget` 不推 GSAP ticker（停在 `0.04`），截验收图前注入 `gsap.globalTimeline.time(3)` 推进；2) 无头下 `100svh` 算成 `802px` 非 `900px`，属环境差异勿改 `min-height` `← motion-playbook.md §8`。

---

## 四 滚动推镜、四段入场、六种运镜与物理细节

本节收编轻量推镜（`cinematic.js`）、六机位运镜（`cinema.js`）、章节转场与粒子场（`details.js`）以及还原度边界（`cinema-audit.md`）。页面缓动变量（`--e-back`、`--e-scroll`、`--e-complete` 等 `10` 条贝塞尔原始参数）定义见 `references/02-design-tokens.md §一`，本节只引用变量名与运动语义 `← audit/v3/02-dedup-matrix.md D-06`。

### 4.1 四段式文字入场与单图滚动推镜（`cinematic.js`）

- **官网 `720ms / 1320ms` 延迟链**：源自编译 CSS `--slide-delay: 200ms + 520ms = 720ms` 与第二段 `600ms + 720ms = 1320ms` `← cinematic.js:8, 42`。GSAP 时间轴默认 `ease: "power3.out"`，硬值不可私自改写：
  - 首行 `.hero__title > [data-cine]`：`t=0.72s` 起，`xPercent: -18 → 0`、`opacity: 0 → 1`，时长 `0.72s` `← cinematic.js:59-60`。
  - 第二行：`t=1.32s` 起，`y: 24 → 0`、`opacity: 0 → 1`，时长 `0.52s` `← cinematic.js:65-66`。
  - 状态句 `.hero__status [data-cine]`：`t=1.60s` 起，`y: 12 → 0`、`opacity: 0 → 1`，时长 `0.50s` `← cinematic.js:71-72`。
  - 几何线 `.davinci-lines`：`clipPath: inset(0 100% 0 0) → inset(0 0% 0 0)`，匀速 `6s` 展开后 `4s`（`power1.in`）淡出 `← cinematic.js:79-82`。
- **单图推镜三条纪律**（仅用于**非 `stage3d`** 的单图首屏）：`ScrollTrigger` 绑定 `start: "top top", end: "bottom top", scrub: 1, invalidateOnRefresh: true`；底图 `.hero__img` **只动纯 `scale: 1 → 1.22`、严禁动 `yPercent`**（防露黑边，偏心摇镜靠 `transform-origin` 对齐 `object-position`）；父标题 `.hero__title` 同步 `yPercent: -14, opacity: 0.15`；光斑 `.hero__glow` 同步 `xPercent: -16` `← cinematic.js:93-124, motion-playbook.md §2, §4`。
- **卡片错峰与章节四层视差**：
  - 卡片组 `[data-cine-stagger]` 子项 `[data-cine-step]`：`y: 28 → 0, opacity: 0 → 1`，时长 `0.6s`，`stagger: 0.075`（对应原站 `--stagger-fade-in-delay: 75ms`） `← cinematic.js:145-155`。
  - 章节四层 `[data-scroll-layer]`（作用域取最近 `[data-section-scope]`，`scrub: 1` 驱动 `yPercent`，属滚动场景重参数化）：`bg` 系数 `-6`（最慢下坠）、`title` 系数 `-2`、`subject` 系数 `+5`、`prop` 系数 `+14`（最快穿过卡片形成实体遮挡，须置高 `z-index` 且极淡非糊色块） `← motion-playbook.md §5b, cinematic.js:175-182`。

### 4.2 六种运镜轨迹与六维还原度边界（`cinema.js` + `cinema-audit.md`）

以下六种运镜将原站 Theatre.js 关键帧语义重参数化为 CSS 3D rig，固定三层系数 `data-depth="0.2 / 0.6 / 1.2"`，叠加每帧鼠标视差 `mouse × -15px × depth` 与 `0.15` 阻尼；**语义同源、数值空间不同源，严禁标为 `1:1`** `← cinema-audit.md §3, cinema.js:31-99`：

| `data-rig` | 对应原站章节与 Theatre 关键帧 | CSS 重参数化轨迹（`p ∈ [0, 1]`） | 对应缓动 |
|---|---|---|---|
| **`dolly`** | `00 Hero`：`Z +12→+2.5`，FOV `35°→50°` 穿云推进 | `z: 120→25`，`scale: 1→1.55`，背景反向 `.08→-.08` | `easeInOut` / `easeOutCubic` `← cinema.js:43-44` |
| **`orbital`** | `I Sidekick`：`X -1.8→+0.6`，`rotY -18°` 弧轨 | `x: -9→3`，`ry: -18°→0°`，`z: 85→42`，`scale: 1.05→1.38` | `easeInOut` / `easeOutCubic` `← cinema.js:51-56` |
| **`truck`** | `II Agentic`：`Z 9→3`，`rotX -8°→+12°` 穿窗俯冲 | `x: -16→12`，`y: 10→-6`，`z: 90→30`，`rx: -8°→12°`，`scale: 1.04→1.32` | `easeInOut` / 线性 `← cinema.js:62-67` |
| **`lateral`** | `III Online`：`X -3.2→+2.4`，`rotX +22°` 横移仰角 | `x: -16→12`，`rx: 0→22°`，`z: 80→60` | `easeInOut` / `easeOutCubic` `← cinema.js:73-76` |
| **`dolly-zoom`** | `IV Marketing`：`Z 10→3.2` + FOV `55°→24°` 希区柯克变焦 | 前景 `scale: 1→1.85`，背景 `bgScale: 1.42→0.78` 反向压缩 | `easeInOut` `← cinema.js:84, cinema-audit.md §3` |
| **`pull-back`** | `V Retail`：`Z 1.8→11.5` 单点透视后拉 | `y: -6→0`，`z: 18→115`，`scale: 1.9→1`，`blur: 2.6→0` | `easeOutCubic` / `easeInOut` `← cinema.js:96-99` |

**六维静态还原度基线与四项不可静态复刻边界** `← cinema-audit.md §1, §5`：
- 静态纯前端可达上限：排印与栅格 `95%`、平滑滚动 `90%`、明亮元素 `90%`、鼠标斥力场 `85%`、景深层级 `85%`、镜头转换 `70%`。
- 四项架构硬边界（绝不拿静态层冒充）：1) `50` 个 `.glb` + `45` 个 `.ktx2`（KTX2/Draco/Meshopt 需 WebGL 解码）；2) `27` 个 `.riv` + `rive.wasm` 矢量状态机（静态仅用 `sidekick.svg` 复刻 `3.33667s` 周期，色值见 `02 §一`）；3) `Effects-ByAKepvN.js` 厚涂法线凹凸、Sobel 边缘高光与 PMREM 反射；4) 3D 空间蝴蝶/金币雨粒子（静态 `data-burst` 仅复刻 2D 迸发曲线 `duration = scale × 2.0s`、`delay ∈ [0.31s, 2.26s]`、`scale ∈ [0.60, 1.18]` `← cinema.js:264-265, cinema-audit.md §2`）。

### 4.3 章节转场与物理场常量（`details.js` + `motion.js`）

- **两种整屏章节转场**（挂于章节 `[data-transition]`，视口中线 `45%–55%` 触发，滚离后允许再次触发） `← details.js:151-183`：
  - `flash`（白闪，对应原站 `white-overlay`）：`180ms` 线性升至 `opacity: 1` → `260ms` 线性降至 `0`（总 `440ms`） `← details.js:151-154`。
  - `wipe`（织物擦镜，呼应 V2 红丝绒布幔扫入）：`clip-path` 自上扫入扫出，总长 `720ms`（注：`720ms` 时长标「未实证」 `← 01 §六`），缓动对接 `--e-scroll`（参数见 `02 §一`） `← details.js:164`。
- **Canvas 2D 星尘粒子背景（`[data-particle-field]`，唯一常量定义）**：逐条对齐原站源码常量——`60` 条流线 × 每线 `3` 粒子 = `180` 粒子，半径 `1px`，速度区间 `[0.01, 0.05] × 0.005`，线宽 `0.3px` / 透明度 `0.51`，端点灰点透明度 `0.29`（色值归 `02 §一`），画布缩放 `0.64×0.76`、偏移 `(5, -30)`，边缘聚集指数 `0.99`、波形扰动 `0.021`、线长抖动 `0.23`、贝塞尔分段 `0.33 / 0.67`、端点抖动 `±1.5px` `← details.js:194-202, audit/v3/02-dedup-matrix.md D-09`。离屏时 `IntersectionObserver` 自动 `cancelAnimationFrame`，`reduced-motion` 只绘制 `1` 帧静态纹理 `← details.js:192, motion-playbook.md §5c`。
- **全局交互物理常量**：Lenis 等效滚动插值 `--motion-lerp: 0.1`（见 `02 §一`），章节侧栏跳转 `easeOutExpo` 时长 `1s` `← motion.js:254`；卡片鼠标斥力场最大距离 `300px`、斥力强度 `20`、二次衰减、鼠标阻尼 `0.15`、回弹缓动对接 `--e-back`（参数见 `02 §一`） `← cinema-audit.md §1, audit/v3/02-dedup-matrix.md D-09`；顶栏 `5` 项阶梯入场延迟 `500 / 540 / 580 / 620 / 660ms`，Intro 进度条三次 `ease-out` 时长 `5000ms`、延迟 `100ms` `← cinema-audit.md §2, motion.js:232`。

### 4.4 活体人物微表情与动作幅度硬红线（Canvas 2D 锁画幅舞台，V3.1 新增）

要让古典肖像「像活人而不是纸片或夸张动画片」，**克制与解剖合理性高于一切**。在原生画幅锁定画框内（如 `1376×768`），各部位必须严守以下安全幅度上限 `← V3.1 实战蒸馏`：

| 部位 | 驱动原理与枢轴 | 允许安全幅度 | 严禁翻车做法 |
|---|---|---|---|
| **胸腔呼吸** | 以桌面/腰线接触点为 `transform-origin` 锚点 | `scaleY: 1 ± 0.0065`（`±0.65%`） | **严禁**整个人物上下平移（必现气球漂浮感） |
| **双眼视线与眼神光** | 杏仁眼裂裁切内平移原眼虹膜 + 冷北光高光点 | 水平 `±2.8px`、垂直 `±1.6px`，随旋钮/远景/鼠标流转 | 严禁画卡通大白眼珠或过亮霓虹眼 |
| **自然眨眼** | 吸取真实瓷釉上眼睑肤色渐变下拉 + 纤细睫毛弧 | 每 `2.8–4.8s` 随机眨眼（闭 `95ms` / 开 `140ms`，26% 概率双眨） | 严禁机械等距每秒眨眼或用纯黑块盖眼 |
| **含蓄微笑** | 双嘴角局部微抬 + 极淡颊晕与眉梢提亮 | 嘴角上扬 `≤ 2.0px`，腮红透明度 `≤ 0.11` | 严禁大幅张嘴或夸张变形破坏古典神韵 |
| **颈枢微转头** | 枢轴落在锁骨与颈根处，下沿软羽化无缝贴合 | 旋转 `±3.2°`，点头 `-1.4px ~ +3.6px` | 严禁硬切颈部留接缝或大幅甩头 |
| **手部实拧道具与节拍轻抬** | 独立亚像素精抠整手 PNG + 枢轴藏进袖口内侧 + **袖口外沿遮片叠绘上方** | 拧旋钮 `idle ±2.6°` / 主动拧 `-6.8° → +8.8°`、`tx -2.8~+4.2px`、`ty -4.2~+1.5px`；同步驱动旋钮高光刻度与柔焦接触影 | **严禁**运行期矩形切手（必断指）、严禁无袖口包覆致腕部脱节 |
| **薄纱/丝巾微风轻拂** | 仅切**最外沿半透明薄纱**（宽度 `≤ 15%` 外缘），慢速正弦柔波 | 常态 `±0.7px`、阵风峰值 `±2.1px`，角频率 `1.15–1.60 rad/s` | **严禁**切进实心棕色卷发或大幅度狂甩 |

### 4.5 零点击自演剧场总控、离线程序化声场与隐形热点纪律（V3.1 新增）

1. **零点击自动连续演出（`ambient-director.js` 范式）**：
   - 严禁做成「不点按钮就永远死寂」的页面。开场推镜爆发后，场景总控应按 `5–6s` 节拍自动交替演出两条因果链（手动点击控件可随时插播切换）：
     - **环境→人因果链（微风穿廊）**：远山冷雾加速（`0.00s`）→ 中景树枝迎风倾曳（`+0.35s`）→ 人物外沿薄纱轻颤与前景古书微晃（`+0.70s`）→ 人物自然侧头望向远景、轻闭眼舒心微笑（`+0.90s`）。
     - **人→物→境因果链（操作互动）**：人物低头看设备（`0.00s`）→ 手部实拧旋钮并触发泛音拨弦（`+0.28s`）→ 屏幕波形跃动与冷光尘轻扬（`+0.32s`）→ 人物抬眼望向观者微笑（`+0.84s`）。
2. **离线程序化环境声场（Web Audio API，零外链）**：
   - 严禁引入任何外部 `.mp3` / `.ogg` CDN 链接。使用纯本地 Web Audio 合成器生成低通温暖的 `432 Hz` 纯五度古典和声长音垫 + 柔和粉红噪声山谷轻风 + 互动时的清润鲁特琴/竖琴泛音。
   - **自动播与唤醒**：页面加载即尝试启动；若被浏览器自动播放策略挂起，监听首次任意 `pointerdown / pointermove / wheel / touchstart / keydown` 无缝淡入（无需专程点音乐按钮），同时在顶栏提供克制的 `[data-sound-toggle]`（`Sound On / Sound Off`）静音开关，`prefers-reduced-motion` 下默认静音。
3. **绘画道具上的交互热区常态隐形纪律**：
   - 凡叠放在油画自带发光道具（如洋红光环旋钮）上的可点击热区（`.stage3d__hotspot`），其边框环常态必须设 `opacity: 0`，仅在 `:hover` 或 `:focus-visible` 时柔和浮现，彻底杜绝常态下与画面自带光环叠成「双层错位椭圆」的穿帮。

---

## 五 全库唯一 `data-*` 行为钩子字典

本节是全库**唯一定义 `data-*` 行为契约的位置**；`references/02-design-tokens.md` 只给 DOM 类名对照，`references/05-page-recipes-and-verification.md` 装配页面时直接引用本表钩子名。所有钩子严格遵循「单属性单写手」原则 `← audit/v3/02-dedup-matrix.md, motion-playbook.md §3, §9`。

| `data-*` 钩子 | 所属脚本 | 可选值 / 默认值 | 实际写入属性 | 合法共现与冲突禁区 |
|---|---|---|---|---|
| `data-stage3d` | `stage3d.js` | 布尔标记 | 写舞台 `--cam-x/y/z/rx/ry`、`--cam-origin-x/y` | **禁用**：同舞台挂 `.hero__img` 或 `data-rig` `← C-15` |
| `data-stage-mode` | `stage3d.js` | `standard \| theater`（默认 `standard`） | `theater` 启用 5 层剧场大摆幅绕轨（`±6.5°`）、持续 `rAF` 阻尼与前景 `--fg-peel` 滚动剥离 | 仅随 `data-stage3d` 生效 `← V3.1` |
| `data-autoplay` | `hero-intro.js` | 布尔标记（搭配 `data-stage3d`） | 接管 `--cam-z/rx`、`--bg-push`、`.stage3d__flash` `opacity` | 写入 `data-autoplay-state="playing\|idle\|yielded"`；首滚立刻交还 `← hero-intro.js:55, 105` |
| `data-dolly` | `stage3d.js` | 数值（默认 `150`） | 控制滚动推镜目标 Z 深度（px） | 仅随 `data-stage3d` 生效 `← stage3d.js:28` |
| `data-drift` | `stage3d.js` | 数值（默认 `18`，`theater` 默认 `36`） | 控制鼠标视差最大平移幅度（px） | 仅随 `data-stage3d` 生效 `← stage3d.js:30` |
| `data-sound-toggle` | `ambient-director.js` | 布尔标记（顶栏按钮） | 切换离线 Web Audio 环境声场静音并同步 `aria-pressed` | 零外链纯本地合成，加载即试播 `← V3.1` |
| `data-cine` | `cinematic.js` | 布尔标记 | 首屏入场 `xPercent / y / opacity` | **只准挂子元素 `span`**，严禁挂父块 `.hero__title` / `.hero__status` `← motion-playbook.md §3` |
| `data-cine-stagger` | `cinematic.js` | 布尔标记（容器） | 无（驱动子项 `[data-cine-step]`） | **合法共现**：可与 `data-scroll-layer` 同挂容器 `← motion-playbook.md §9` |
| `data-cine-step` | `cinematic.js` | 布尔标记（卡片子项） | `y`、`opacity`（`75ms` 错峰） | 不可同时挂 `data-reveal` `← cinematic.js:146-155` |
| `data-parallax` | `cinematic.js` | 浮点速率（默认 `0.06`） | `yPercent`（`scrub: 1`） | **禁用**：与 `data-scroll-layer` 同挂一元素 `← cinematic.js:171` |
| `data-scroll-layer` | `cinematic.js` | `bg \| title \| subject \| prop` | 章节内 `yPercent`（`-6/-2/+5/+14`） | 需外层有 `[data-section-scope]`；**禁与 `data-parallax` 同元素** `← motion-playbook.md §5b` |
| `data-section-scope` | `motion.js` / `cinematic.js` | 布尔标记（章节 `<section>`） | 写 `--section-progress`、`--scroll-dir` | 所有章节容器必挂 `← cinematic.js:178` |
| `data-section-id` | `motion.js` | 章节唯一 slug | 驱动左侧 `13.9%` 导航高亮与锚点跳转 | 与左侧目录 `href="#slug"` 一一对应 `← motion.js` |
| `data-nav-theme` | `motion.js` | `dark \| light` | 切换顶栏与左侧栏明暗配色主题 | 每章按深浅交替显式标注 `← 01 §二 #9` |
| `data-reveal` | `motion.js` | 布尔标记 | 基础进场显现状态类 | 已被 `data-cine-stagger` 接管的卡片不再挂 `← cinematic.js:146` |
| `data-cloud-field` | `motion.js` | 布尔标记（卡片组容器） | 驱动内部卡片鼠标 `300px` 斥力位移 | 可配卡片 `data-base-opacity` `← motion.js:214` |
| `data-damp` | `motion.js` | 布尔标记 | 跟随滚动/鼠标阻尼微位移 | 不与 `data-parallax` / `data-scroll-layer` 同元素 `← motion.js:214` |
| `data-rig` | `cinema.js` | `dolly \| orbital \| truck \| lateral \| dolly-zoom \| pull-back` | 写 `.cine-stage` 相机与三层 `transform` | 需配合 `.cine-stage`；**禁与 `data-stage3d` 同用** `← cinema.js:105` |
| `data-rig-label` | `cinema.js` | 文本标签 | 写入调试 HUD 与 `window.__cine` | 可选，用于自动化断言 `← cinema.js:14` |
| `data-depth` | `cinema.js` | `0.2 \| 0.6 \| 1.2` | 控制 `.cine-layer` 视差倍率与透明度衰减 | 仅作 `.cine-stage` 直接子层 `← cinema.js:15-17` |
| `data-burst` | `cinema.js` | 布尔标记 | 注入 `--random-duration / --random-delay` 粒子 | 独立装饰容器 `← cinema.js:254-271` |
| `data-transition` | `details.js` | `flash \| wipe` | 视口中线触发整屏白闪或织物擦镜 | 挂章节 `<section>`，零依赖 `← details.js:168-183` |
| `data-particle-field` | `details.js` | 布尔标记（`<canvas>`） | 绘制 `60×3` 星尘粒子场 | 容器须 `position: relative`，canvas 加 `aria-hidden="true"` `← motion-playbook.md §5c` |
| `data-dropdown-trigger` / `data-search-trigger` / `data-search-close` | `cinema.js` | 布尔标记 | 顶栏/目录浮层显隐与焦点切换 | 纯 UI 交互钩子 `← cinema.js:221-242` |
| **已废弃** `data-shot` / `data-shot-stage` / `data-shot-layer` / `data-burst-dust` / `data-burst-fog` | — | **禁止新增** | 原 `details.js` 重复 `1.77s` 爆发实现 | 已从 `details.js` 清除，统一改用 `data-stage3d` + `data-autoplay` `← C-16` |

---

## 六 动效库预算、离线铁律与交付自检

### 6.1 动效库体积预算口径（全库唯一裁决）

- **采用口径：全量离线打包 `25` 个 GSAP `3.15.1` 插件（本地 `assets/starter/vendor/gsap/`，`472 KB`），零外链开箱即用** `← motion-playbook.md §6, gsap-library.md §6`。
- **理由**：1) `verify.mjs` 严禁一切 `http(s)://` 外链，GSAP 自 `3.13` 被 Webflow 收购后全插件免费，本地预置 `25` 个文件让创作者无需构建器即可随时调用 `SplitText / DrawSVGPlugin / Flip / CustomEase`；2) HTML 页面仍只按需加载 `<script>`（基础页仅载 `gsap.min.js + ScrollTrigger.min.js`），其余插件不占首屏请求，仅增约 `410 KB` 磁盘占用，换来断网全闭环 `← gsap-library.md §5, §7`。

### 6.2 动效交付前硬检查清单

1. `node scripts/verify.mjs <目标目录>` 六重硬拦截全绿：零外联（全介质）、零视频、JS 语法正确、真 RGBA 分层图与零 `_qa_*` 残留、舞台多层且自运行 `← 05 §六`。
2. `stage3d` 首屏背景图用 `.stage3d__img`（禁挂 `.hero__img`），`cinematic.js` 已跳过推镜 `← C-15`。
3. 加载即自动推镜并转入持续呼吸/场景轮演（无需点击按钮即有动作与离线声场尝试启播），首次滚动即交还相机控制权 `← C-14, V3.1`。
4. 4 层标准（`-240 / 0 / +40 / +90px`）或 5 层剧场（`-260 / -165 / -75 / 0 / +42 & +82px`）深度正确，已删 `.stage3d__tone`，落地带柔焦冷暗接触影，无整身气球漂浮 `← C-01, C-13, V3.1`。
5. 若含活体人物微动：丝纱仅最外沿 `±0.7–2.1px` 轻拂（禁实心头发乱甩）、活动手部通过 200% 实景复查且袖口包覆无裂缝、道具热区常态 `opacity: 0` 无双层光环 `← V3.1`。
6. 非 `stage3d` 推镜只动纯 `scale`，父块未标 `data-cine`，延迟链锁定 `0.72s / 1.32s` `← motion-playbook.md §1, §3`。
7. 同元素未混挂 `data-scroll-layer` 与 `data-parallax`；`data-cine-stagger` 卡片未兼挂 `data-reveal` `← cinematic.js:146, 171`。
8. `[data-particle-field]` 首帧有像素且离屏暂停；`reduced-motion` 下动效归零、画布静绘一帧、声场默认静音 `← details.js:192, V3.1`。
9. 保留 `3s` 停滞强制显隐兜底；若用 `SplitText`，拆 DOM 后再绑定入场 `← cinematic.js:199, gsap-library.md §9`。

---

## 七 性能纪律与本机技能分工

1. **合成层约束**：动画仅写 `transform`、`opacity`、`clip-path` 与 CSS 变量，禁碰布局属性 `← cinematic.js:130`。
2. **离屏即停**：`stage3d.js`、`cinema.js` 与 `details.js` 均经 `IntersectionObserver` 离屏停算 `rAF` `← stage3d.js:46, details.js:192`。
3. **本机技能分工**：通用 GSAP 写法（timeline 位置、ScrollTrigger pin/scrub、Flip、工具函数与 60fps 调优）交本机 `gsap-*` 与 `motion-design`（路由见 `references/06-extraction-and-skills-wiring.md §三`），本库不重讲基础语法 `← motion-playbook.md §10`。

---

## 附录 本地 GSAP `3.15.1` 全量 `25` 插件速查表与加载顺序

全套位于 `assets/starter/vendor/gsap/`（`25` 个 `.min.js`，`472 KB`）。**一行加载顺序**：`gsap.min.js → 核心依赖插件 → 派生插件 → motion.js → cinema.js → cinematic.js → stage3d.js → hero-intro.js → details.js`，入口显式调用 `gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)` `← gsap-library.md §2, §5`。四组不可反序依赖：`ScrollSmoother ← ScrollTrigger`、`InertiaPlugin ← Draggable`、`MotionPathHelper ← MotionPathPlugin`、`CustomBounce/CustomWiggle ← CustomEase` `← gsap-library.md §5`。

| 分类 | 插件名（不含 `.min.js`） | 用途与本风格推荐度 |
|---|---|---|
| 核心（1） | `gsap` | 补间引擎、Timeline、`10` 类基础 ease（★★★ 必载） |
| 滚动（3） | `ScrollTrigger` / `ScrollSmoother` / `ScrollToPlugin` | 滚动触发与 scrub（★★★ 必载）/ 全站平滑滚动（★★）/ 锚点跳转（★） |
| 文字（3） | `SplitText` / `TextPlugin` / `ScrambleTextPlugin` | 巨字逐字升起（★★★ 最推荐）/ 打字机（★）/ 乱码揭晓（★） |
| 缓动（4） | `CustomEase` / `EasePack` / `CustomWiggle` / `CustomBounce` | 自定义曲线（★★★ 强烈推荐）/ `rough/slow/expoScale`（★★）/ 摆动与弹跳（★） |
| 布局路径（3） | `Flip` / `MotionPathPlugin` / `MotionPathHelper` | 作品卡筛选重排（★★）/ 沿 SVG 路径运动（★）/ 路径编辑（仅开发期） |
| SVG（3） | `DrawSVGPlugin` / `MorphSVGPlugin` / `CSSRulePlugin` | 达芬奇几何线描边生长（★★）/ 路径变形（★）/ 伪元素动画（★） |
| 手势拖拽（3） | `Observer` / `Draggable` / `InertiaPlugin` | 滚轮触摸切章（★★）/ 拖拽（★）/ 惯性抛掷（★） |
| 物理（2） | `Physics2DPlugin` / `PhysicsPropsPlugin` | 二维重力抛射（★）/ 任意属性加速度衰减（★） |
| 渲染调试（3） | `PixiPlugin` / `EaselPlugin` / `GSDevTools` | PixiJS 补间 / EaselJS 补间 / 可视化时间轴调试器（仅开发期） |
