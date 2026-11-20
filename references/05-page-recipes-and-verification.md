# 页面装配与验收

本手册负责把已经产出的分层视觉（见 `references/03-painting-and-layers.md`）、网页令牌（见 `references/02-design-tokens.md`）与动效舞台（见 `references/04-motion-and-stage3d.md`）组装成任意题材的完整网页，并按四把尺子与自动化脚本完成出厂验收 `← page-recipes.md §0`。**硬铁律：改页面类型时只换配方与槽位，绝不凭空新增 CSS 类；本手册零十六进制色码，全部引用 `02 §一` 的变量名** `← page-recipes.md §0, audit/v3/02-dedup-matrix.md D-03`。

---

## 一 三级证据标记与能换/不能换边界

### 1.1 页面装配三级证据标记用法

在页面需求超出官网原有栏目（如个人作品集、活动议程、长文章、页脚）时，必须在配方与文档中显式挂以下三级标签，绝不把推导结构冒充成官网原样 `← page-recipes.md §4`：

- **`[源码]`**：直接出自官网 HTML / CSS / JS 或录屏实测的原生结构（例如外壳五件套、左侧 `13.9%` 罗马数字目录、首屏细线框目录卡 `340×464`、`12` 列子网格、章节深浅主题切换、`.product` 左右图文卡） `← blueprint.md §1, real-page.md §二, §三`。
- **`[推导]`**：官网原本不存在，但严格复用现有 CSS 原语与节拍推导出的合法页面组合（例如作品集双列卡片、活动议程三列表、关于页时间线、极简三行版权页脚——原站 `<footer>` 出现次数为 `0`） `← page-recipes.md §3.3-3.5, §4.1`。
- **`[禁用]`**：会立刻破坏风格一致性、引发脚本打架或构成抄袭的写法（例如把 `assets/reference/` 原稿放进成品、在 `[data-stage3d]` 内挂 `.hero__img`、对中文段加 `.drop-cap`、给页面堆社交图标栏与订阅框） `← page-recipes.md §0.1, §4.1, §4.4, C-15`。

### 1.2 什么能换、什么不能换、什么严禁搬运

终极交付标准一句话：**把你的成品与官网并排遮住品牌名，别人一眼觉得是同一个设计团队画的，却说不出抄了哪一页** `← page-recipes.md §0.1`：

| 维度 | 可以自由换 | 不能换（换了就不像） | `[禁用]` 绝对不能搬 |
|---|---|---|---|
| **业务内容** | 品牌名、个人身份、项目条目、章节标题、文案语言与章节数量 | 极克制的字数密度与大留白节奏 | 抄袭原站品牌名或电商功能词 `← page-recipes.md §0.1` |
| **版式结构** | 章节顺序、六种配方切换、栅格列跨度（`12 / 6 / 5 / 4`） | 外壳五件套、页面主底 `var(--c-page-bg)` + 卡片纸面 `var(--c-paper)` + 深底 `var(--c-ink)`、`12` 列、巨字、左侧 `13.9%` 罗马数字目录 | 自造新 CSS 类名或把侧栏扩回 `20%` `← 01 §二 #8` |
| **画面语言** | 人物身份、时代题材、场景世界、现代道具、画幅比例 | 材质三态、冷青蓝漫射暗场、荧光配额 `0–2` 处（详规见 `03 §一, §三`） | 把 `assets/reference/` 里的原稿或截图放进成品/裁切复用 `← page-recipes.md §0.1` |
| **构图方向** | 主体居左或居右、静物/材质/抽象无人物切换 | 巨字压人遮挡、四角留气、主体偏心不站桩 | 复刻原站标志性画面（双人指尖悬触 + 滑板 + 荧光袋） `← page-recipes.md §0.1` |

### 1.3 中文页面必改四项排印覆盖（防翻车）

英文原站排印直接套汉字必然下沉变形，中文页必须在 `tokens.css` 之后追加以下四条覆盖 `← page-recipes.md §4.3, §4.4`：
1. **关闭 `text-box` 裁切**：`cap / alphabetic` 基线对汉字无效，强制写 `h1, h2, h3, h4, .headline-1, .narrative-1 { text-box: normal; }`，改靠 `line-height` 与 `padding-block` 居中 `← page-recipes.md §4.3`。
2. **放宽行高**：大标题由 `0.9` 调至 `1.05–1.15`，正文由 `1.1` 调至 `1.6–1.75` `← page-recipes.md §4.3`。
3. **取消负字距**：中文一律设 `letter-spacing: 0` 或 `0.02em`，严禁沿用 `-0.03em / -0.05em` 压扁方块字 `← page-recipes.md §4.3`。
4. **中文禁用花体首字**：`.drop-cap` 与 `.drop-cap-aligned` 在 `layout.css:221` 共用同一条 `ImperialScript` 规则，中文段落两个类都**不许加**，直接用 `.narrative-1 / .narrative-2`（需首行缩进加 `text-indent: 2em`） `← page-recipes.md §4.4`。

---

## 二 布局原语速查与避坑铁律

页面由「公共外壳 + 章节原语」拼装而成，具体 CSS 变量与字体阶梯查 `references/02-design-tokens.md §一, §三`，行为钩子定义查 `references/04-motion-and-stage3d.md §五` `← page-recipes.md §1, §2`。

### 2.1 公共外壳三项必写件（`[源码]`）

所有页面共用 `<header class="cine-header">` + `<img class="cine-geometry" src="assets/davinci-lines.svg" alt="" aria-hidden="true">`（全页只出现 `1` 次，置 `.page` 前）+ `.page`（内含 `aside.side-nav` + `main.page__main`） `← page-recipes.md §1`：
1. 每个 `<section>` 必须同时写 `id`、`data-section-scope` 及三个同名同值主题属性 `data-nav-theme`、`data-title-theme`、`data-sidebar-theme`（深色章全写 `dark`，浅色章全写 `light`），漏写会导致导航换色失效 `← page-recipes.md §1`。
2. `aside.side-nav` 的 `<li>` 条数严格等于正文章节 `<section>` 数（首屏 `Hero` 不入列），罗马数字由 CSS `::after` 生成，不手写；`.side-nav__rule` 引线默认 `clip-path: inset(0 100% 0 0)` 收起，仅 `:hover` 与 `.is-active` 展开 `← page-recipes.md §1, §4.2`。
3. 站内级第 14 页复刻（尺子 3）首屏必须挂载中央 `340×464` 细线框目录卡解锁组件，滚出 `100px` 后停靠左侧 `13.9%` 导航栏 `← 01 §二 #9, 02 §四`。

### 2.2 核心原语与五条高频避坑铁律

| 原语类名 | 角色与必填槽位 | 变体与避坑铁律 | 证据 |
|---|---|---|---|
| `.section` + `.section__body` | 纵向章节与主列内容容器 | `--dark`（`var(--c-ink)`/`var(--c-black)` 底）/ `--paper`（浅底，主底走 `var(--c-page-bg)`、卡面走 `var(--c-paper)`）/ `--grey`（`var(--c-grey-light)` 休止带） | `[源码]` `← page-recipes.md §2.1, 02 §一` |
| `.grid` + `.grid__full / __half / __five / __four` | `12` 列栅格与跨列子项（`12 / 6 / 5 / 4` 列） | **铁律 1**：跨列类是**双下划线**（`.grid__four` 非 `.grid--four`）。**铁律 2**：**严禁把 `.grid--offset` 塞进 `.section__body`**，否则叠加右推导致左缘掉到 `36%`；不用 `--offset` 时 `.block__title` 同步归 `margin-left: 0; max-width: none` | `[源码]` `← page-recipes.md §2.1` |
| `.hero` vs `.cover` | 全幅油画首屏 vs 纯文字深色封面 | **铁律 3**：有图必用 `.hero`，纯文极简才用 `.cover`；使用 `[data-stage3d]` 四层舞台时背景图改挂 `.stage3d__img`（**禁挂 `.hero__img`**） | `[推导]/[源码]` `← page-recipes.md §2.2, C-15` |
| `.band` + `.rule` | 全宽浅灰休止带 + `1px` 分割线 | **铁律 4**：`.band` 必须放在 `.grid` **外面**，塞进偏移栅格会被压成 `64%` 宽 | `[源码]` `← page-recipes.md §2.1, §2.2` |
| `.product` + `.media` + `.play` | 左文右图卡 + 锁比例媒体框 | **铁律 5**：`.media` 必带 `--poster`（`1016/529`）或 `--video`（`16/9`），否则高度塌陷；首屏图不加 `loading="lazy"`，其余图全加 | `[源码]` `← page-recipes.md §2.3, §5` |
| `.cloud` + `.cloud-card` / `.cine-glow-card` | 鼠标斥力卡片场 / 光晕迸发卡 | 卡片设 `data-base-scale`、`data-base-opacity`；变体 `.cloud-card--organ` 启用 `--r-organ` 异形圆角 | `[源码]` `← page-recipes.md §2.3, 02 §一` |
| `.block`（页脚推导态） | 底部极简收尾版权区 | 原站 `<footer>` 为 `0`；仅放名字 + 版权 + `2` 链接（`.bodycopy-2`），**禁加社交图标库与订阅框** | `[推导]` `← page-recipes.md §4.1` |

---

## 三 六种页面配方（适用内容 × 区块序列 × 钩子 × 原型）

所有配方用到的 `data-*` 钩子行为均定义在 `references/04-motion-and-stage3d.md §五`，画面构图原型均定义在 `references/03-painting-and-layers.md §五` `← page-recipes.md §3`。凡涉及**多幕连续转场或大幅动态表演**的页面，装配前必须先按 `03 §0.5` 写清逐幕分镜（开场构图、道具朝向、动作顶点与转场锚点），再动手出图与编码 `← V3.3`。

### 配方 1 · 个人作品集（Portfolio）
- **适用内容**：创作者、编辑、设计师个人主页，图多、留白大、节奏慢 `← page-recipes.md §3.1`。
- **区块序列（深浅交替）**：
  1. `hero`（`--dark`，`[源码]`/`[推导]`）：`.hero` 全幅四层舞台 + 巨字压左（写「名字 + 身份」，**不写「作品集」**）+ `.hero__status` 一行状态。
  2. `work`（`--paper`，`[推导]`）：`.block__title` + `.narrative-1` 导语 + `.grid.grid-padding` 内 `.grid__half` × `2`（`.media--video` + `.headline-6` 标题与 `.bodycopy-2` 年份/角色分行排），网格外接全宽 `.band`（`--grey`）作休止符。
  3. `about`（`--paper`，`[推导]`）：`.block__title` + `.narrative-1` 引言 + `.grid__five` 竖幅工作照 + `.grid__half` 两段正文。
  4. `contact`（`--dark`，`[推导]`）：`.headline-3` 邀请 + `.narrative-2` 一句 + `.cta` 邮箱（可选 `.cloud` 卡片组）。
- **核心 `data-*`（见 `04 §五`）**：`data-stage3d`、`data-autoplay`、`data-cine`、`data-cine-stagger`、`data-cine-step`、`data-scroll-layer`、`data-section-scope`、`data-nav-theme`、`data-transition="wipe"`、`data-particle-field`。
- **推荐构图原型（见 `03 §五`）**：首屏选「原型 2 · 单人半身」（参考 `P02 Sidekick` 净底单人构图）；关于页配图选 `S3` 材质特写或「原型 5 · 背影工作」。

### 配方 2 · 产品发布页（Landing / Release）
- **适用内容**：软件版本更新、年度功能发布、品牌新品宣言 `← page-recipes.md §3.2`。
- **区块序列（深浅交替）**：
  1. `hero`（`--dark`，`[源码]`）：中央细线框目录卡解锁首屏或 `.hero` 四层舞台 + 产品名 + 一句话价值主张。
  2. `value`（`--paper`，`[源码]`）：全宽 `.band` 一句话宣言 + `<hr class="rule">`。
  3. `pillars`（`--paper`，`[推导]`）：`.grid` + `.grid__four` × `3`（每栏 `.headline-6` + `.narrative-3` 三条核心理由）。
  4. `features`（`--paper` 与 `--dark` 交替，`[源码]`）：`.product` × `2–3`（靠 DOM 顺序交替左右图文，不改 CSS；重磅功能章可插入 `.cine-stage` 六机位运镜）。
  5. `cta`（`--dark`，`[推导]`）：一句话收尾 + `.cta`。
- **核心 `data-*`（见 `04 §五`）**：`data-stage3d`、`data-autoplay`、`data-cine`、`data-rig="dolly\|dolly-zoom"`、`data-depth`、`data-transition="flash"`、`data-cloud-field`、`data-section-scope`、`data-nav-theme`。
- **推荐构图原型（见 `03 §五`）**：首屏选「原型 1 · 双人相向」（参考 `P01 Hero`）或「原型 3 · 风景画中画大道具」（参考 `P03 Marketing`）；核心特性章选「原型 2 · 对称举物」（参考 `P05 Finance`）。

### 配方 3 · 活动与议程页（Event / Agenda）
- **适用内容**：年度峰会、论坛日程、展览开幕与工作坊发布 `← page-recipes.md §3.5`。
- **区块序列（深浅交替）**：
  1. `hero`（`--dark`，`[源码]`）：`.hero` 群像/空间舞台 + 活动名（`.headline-1`）+ 日期与城市（`.narrative-3`）。
  2. `schedule`（`--paper`，`[推导]`）：`.grid.grid--offset`（或无 `--offset` 放 `.section__body` 内）每行 `.grid__full` 排三列——左时间 `.bodycopy-2`、中议题 `.headline-6`、右讲者 `.bodycopy-1`，行间插 `<hr class="rule">`。
  3. `speakers`（`--paper`，`[推导]`）：`.grid__four` × `n`，每卡 `.media--poster` + `.headline-6` 姓名 + `.bodycopy-2` 头衔；章尾接全宽 `.band`（`--grey`）放场地交通提示。
  4. `register`（`--dark`，`[推导]`）：一句话报名号召 + `.cta`。
- **核心 `data-*`（见 `04 §五`）**：`data-stage3d`、`data-autoplay`、`data-cine`、`data-cine-stagger`、`data-cine-step`、`data-reveal`、`data-transition="wipe"`、`data-section-scope`、`data-nav-theme`。
- **推荐构图原型（见 `03 §五`）**：首屏选「原型 4 · 群像正面围桌（零荧光）」（参考 `P06 Operations`），讲者区统一用冷青蓝净底单人胸像（参考 `P02` / `P04`）。

### 配方 4 · 关于页（About）
- **适用内容**：机构简介、编辑部宣言、团队历史与合作名录 `← page-recipes.md §3.3`。
- **区块序列**：1) `cover`（`--dark`，`[源码]`）名字 + 身份；2) `story`（`--paper`，`[推导]`）`.block` + `.narrative-1` 首段 + `.narrative-2` × `3–5` 段；3) `timeline`（`--paper`，`[推导]`）`.grid` 每行左年份 `.bodycopy-2` + 右事件 `.narrative-3`；4) `team`（`--paper`，`[推导]`）`.grid__four` × `n`（`.media--poster` + `.headline-6`）。
- **核心 `data-*`（见 `04 §五`）**：`data-cine`、`data-scroll-layer`、`data-reveal`、`data-section-scope`、`data-nav-theme`。
- **推荐构图原型（见 `03 §五`）**：选「原型 4 · 群像围桌」（参考 `P06`）或「原型 6 · 纸面素描线稿」（参考 `Developer` 收尾章）。

### 配方 5 · 长文与写作（Article / Essay）
- **适用内容**：深度专题、特稿、技术白皮书与年度长评 `← page-recipes.md §3.4`。
- **区块序列**：1) `header`（`--dark`，`[源码]`）`.cover__title` 降级用 `.headline-2`（避免 `headline-1` 过大）+ `.cover__lead` 摘要；2) `body`（`--paper`，`[推导]`）`.block` 内加行内限宽 `style="max-width: var(--content-w)"`（值覆盖，不加新类）+ `.narrative-2` 靠自然行距分段；3) `related`（`--grey`，`[推导]`）`.grid__four` × `3` 相关阅读。
- **核心 `data-*`（见 `04 §五`）**：`data-cine`、`data-reveal`、`data-particle-field`、`data-section-scope`、`data-nav-theme`。
- **推荐构图原型（见 `03 §五`）**：文首配图选 `S2` 静物或「原型 3 · 风景画中画」（参考 `P03 Marketing`），文末呼应「原型 6 · 纸面素描线稿」。

### 配方 6 · 极简单页（One-pager）
- **适用内容**：极简个人名片、概念预告、独立宣言页——**内容越少，留白越是主角** `← page-recipes.md §3.6`。
- **区块序列**：1) `cover`（`--dark`，`[源码]`）名字 + 一句话，**不加任何按钮**；2) `pillars`（`--paper`，`[推导]`）三个 `.block`，每块只有 `.headline-6` + `.narrative-2` 一段；3) `contact`（`--paper`，`[推导]`）一行 `.narrative-1` + `.cta`。全页不加 `--grey` 带，把底色收得最静 `← page-recipes.md §3.6`。
- **核心 `data-*`（见 `04 §五`）**：`data-cine`、`data-reveal`、`data-section-scope`、`data-nav-theme`。
- **推荐构图原型（见 `03 §五`）**：选「原型 2 · 单人净底」（参考 `P02`）或纯文字 `.cover` 配 `.cine-geometry` 几何线。

---

## 四 三套跨场景替换表与非人物开关（换主体不跑味）

本节从旧版 `generator.md` 提纯并清除全部伪数学公式与暖光残留，解决核心难题：**同一套骨架换成作品集、产品发布页、活动议程页三个截然不同的业务，凭什么放一起依然像同一个设计师排出来的？** `← audit/v3/03-migration.md M-15, generator.md §11`

### 4.1 三套跨场景替换对照表（尺子 2 实操模板）

| 装配槽位 | 作品集（编辑/创作者） | 产品发布页（年度功能） | 活动议程页（年度峰会） | 锁定不变量（三页必须一致） |
|---|---|---|---|---|
| **首屏舞台主体** | 单人半身学者/创作者（占右 `2/3`），手握现代笔电或胶片机 `← 03 §五 原型2` | 双人悬空对指或风景嵌入锐边产品广告牌 `← 03 §五 原型1/3` | 五人正面围坐红木长桌（现代圆桌翻译为宫廷群像） `← 03 §五 原型4` | 冷青蓝漫射暗场 + 皮肤零笔触 + 四层 `-240/0/+40/+90px` 舞台 `← 01 §二, 04 §二` |
| **现代物件与荧光配额** | 银色笔电 + `1` 处玫红标签或封皮（占 `1%–3%`） | `1–2` 件锐边贴纸道具（卡片/界面/牌面酸黄绿字，占 `3%–8%`） | **零现代道具、零荧光色（`0%`）**，靠场景翻译制造时代反差 `← 03 §六 P06` | 道具边缘锐利不柔边、受光同源、总量严格 `0%–8%` `← 01 §二 #2, #3` |
| **章节名与左栏目录** | `I Work / II Essays / III About / IV Contact`（单字或双词） | `I Core / II Flow / III Scale / IV Launch`（一词一章） | `I Keynote / II Agenda / III Speakers / IV Venue` | 左侧 `13.9%` 固定栏 + CSS 罗马数字 + 巨字 `NeueMontreal Bold` `← 02 §一, §四` |
| **主底色与浅灰休止** | `var(--c-page-bg)` 主底 + `var(--c-paper)` 作品卡 + `1` 条全宽 `.band` | `var(--c-page-bg)` 主底 + `var(--c-paper)` `.product` 交替 + 价值 `.band` | `var(--c-page-bg)` 主底 + `var(--c-paper)` 讲者卡 + 场地 `.band` | 深浅交替、大留白（章整屏、块 `60–120px`） `← 02 §一` |
| **动效主轴** | `stage3d` 首屏 `10s` 自动序列 + 作品卡 `75ms` 错峰 + 擦镜 `wipe` | `stage3d` 首屏 + 中段 `cinema.js` `dolly-zoom` + 白闪 `flash` | `stage3d` 首屏 + 议程表 `data-reveal` + 讲者 `75ms` 错峰 | 单相机驱动、首次滚动交还相机、`reduced-motion` 静帧 `← 04 §三, §六` |

### 4.2 非人物画面三大前置开关与禁 3D 渲染铁律

当页面配图不是人物，而是产品静物、面料材质或抽象底图时，写生图提示词前必须先锁死以下三个开关（防 AI 强行补出一张脸或挤占放字空间） `← generator.md §11`：

1. **开关一 · 主体档（四选一）**：
   - `S1 人物`：按 `03 §三` 五段式完整走流程。
   - `S2 静物`：删去表情与视线描写，主语改物件（`the object sits / the vessels gather`），必加托底面（`a table edge / a stone plinth / a fold of cloth beneath`）。
   - `S3 材质`：删去人脸与人体比例，加极近景满幅（`extreme close, the surface fills the frame, no horizon, no background`），织物写法直接取 `03 §3.4`。
   - `S4 抽象`：唯一无具象主体档，改用色域与笔触结构承载构图（`the composition is carried by mass and colour`）。
   - **硬规则**：选 `S2 / S3 / S4` 时，正面与负面词必须显式加 `no people, no faces, no figures, no hands`，漏写极易长出人脸 `← generator.md §11`。
2. **开关二 · 画幅档（按槽位选，换画幅必须重算留白，绝不硬裁）**：`F1 16:9`（首屏与章封面，左侧留白给巨字）、`F2 4:5`（竖幅关于照与作品主图，头顶留白 `≥15%`）、`F3 1:1`（网格缩略图与头像，主体居中）、`F4 9:16`（手机竖屏，上下留白加大） `← generator.md §11`。
3. **开关三 · UI 文字层（默认必选 `U3`）**：`U1` 仅限官网研究对照、`U2` 易出乱码、**默认永远选 `U3 无文字`**——生图只留干净低频负空间，全部文字由网页 HTML + CSS 叠放 `← generator.md §11`。
4. **静物/材质/抽象的禁 3D 渲染铁律**：此类题材最容易偷懒跑成 CGI 塑料风，负面词表严禁删除 `no 3D render look, no Octane render, no Unreal Engine, no procedural surface, no CGI plastic`；表达金属或布面必须改写为薄罩染绘画语言（如 `brushed metal painted in thin glazes, the highlights laid on last`） `← generator.md §11`。

---

## 五 四把尺子可执行验收表

页面做完后，不允许用「感觉已经很像了」验收，必须逐项跑完以下四把尺子 `← page-recipes.md §5, 01 §二`：

### 5.1 尺子 1 · 盲测（3 秒犹豫标准）
- **操作**：截出成品的「首屏 + 任意浅色内容章 + 深色封面章」共 `3` 张 `1440×900` 屏，遮掉品牌名与业务专有名词，与 `assets/reference/` 里的官方截图并排给第三方看 `3` 秒。
- **过关线**：对方犹豫分不出哪张是官网原页；且画面全部 `12` 维符合 `03 §一, §七` 测量卡 `← page-recipes.md §0.1, 03 §七`。

### 5.2 尺子 2 · 换内容不换手（三页同屏核对）
- **操作**：把作品集、产品发布页、活动议程页三个成品缩略图并排摆在一起对比骨架。
- **过关线**：三页主体与业务完全不同，但左侧导航占比、页面主底色、章节巨字字阶、浅灰休止带节奏与卡片留白肉眼一致，无「换个题材就像换了个人排」的割裂感 `← 05 §4.1`。

### 5.3 尺子 3 · 站内第 14 页四项硬衔接（最硬红线）

| 衔接项 | 硬验收数值 / 变量 | 怎么查 | 露馅症状 |
|---|---|---|---|
| **1. 左侧导航宽** | `--sidebar-w: 13.9%`（`1440` 下 `200px`） `← 01 §二 #8` | 浏览器测 `aside.side-nav` 计算宽度 / 视口宽度 | 宽达 `20%`（`288px`）或罗马数字手写进 DOM |
| **2. 页面主底色** | `var(--c-page-bg)`（定义见 `02 §一`） `← 01 §二 #7` | 吸取浅色章节主背景色，核对不等于卡片纸面 `var(--c-paper)` | 整页一片纯黑或整页发黄米白无层次 |
| **3. 章节节奏与首屏** | 首屏中央 `340×464` 细线框目录卡解锁 + 深浅交替 + 顶栏刻意遮掉巨字顶边一截 `← 01 §二 #9` | 滚动核对首屏解锁、深浅 `data-nav-theme` 联动及顶栏遮字 | 十几屏油画连排不喘气，或把巨字推离顶栏 |
| **4. 四族字体与字阶** | 巨字 `NeueMontreal Bold`（无 `smcp`）、叙事 `HWCigars`、西文首字 `ImperialScript`、小字 `Inter-Variable` `← 02 §1.2, §1.3` | DevTools Computed 查 `.headline-1` 字体与行高 `0.9`（中文 `1.05–1.15`） | 巨字误用衬线体 `HWCigars` 或缺 `woff2` 退回系统默认字体 |

### 5.4 尺子 4 · 不跑味五条硬查 + 动态与精抠防穿帮九条一票否决 + 实机截图目检闭环（V3.3 升级）

**不跑味五条硬查**：1) 暗部不发黄（插画冷青蓝 `189°–224°`，无 `.stage3d__tone` 橄榄褐遮罩）；2) 皮肤与天空零笔触；3) 现代道具边缘锐利且具备高定工业质感（不廉价塑料、光温同源、透视落地）；4) 荧光 `0–2` 处（`0%–8%`）绝无电光紫溢出；5) 打开首屏不做操作能看到纯视觉自动演出且**默认全程静音无合成嗡鸣**，滚动立即交还控制权 `← 01 §二, 03 §〇, 04 §四, V3.3`。

**动态、精抠与工程防穿帮九条一票否决（中任意一条即打回返工）**：
1. **物件粗糙割裂否决**：现代物件像粗糙矢量贴纸、塑料 CGI 或带刺眼反光、透视与桌面打架 → 立即按 `03 §0.2` 重做工业材质与冷北光贴合。
2. **人-物-境无关联与道具朝向错误否决**：人物莫名漂在远山里、角色使用中的笔电开场就巨大正对观众、零碎小件排成货架一列，或第二屏与首屏四锚点断层 → 立即按 `03 §0.1, §0.3, §0.5` 返工。
3. **气球漂浮否决**：静坐人物或桌面道具整体上下浮动失重 → 改为稳坐/稳站物理接地 + 桌面/腰线锚定胸腔微呼吸（`±0.65%`） `← 04 §4.4`。
4. **断指、锯齿灰边与袖口缝隙否决**：活动手部出现断指、外圈锯齿灰边、手腕竖切缝或底图单色方块 → 立即走 `03 §4.5` 亚像素色键精抠 + 袖口外沿包覆 + 200% 实景放大复查。
5. **头发狂甩与双层光环否决**：实心头发大幅晃动、或道具点击热区常态画框叠出双层椭圆 → 丝纱收至最外沿 `±0.7–2.1px`、热区常态 `opacity: 0` `← 04 §4.4, §4.5`。
6. **被动死页否决**：不点按钮就完全静止无演出 → 启用 `data-autoplay` + 零点击纯视觉轮演总控 `← 04 §4.5`。
7. **合成耳鸣背景音否决（V3.3 新增）**：页面自动启播 Web Audio 振荡器长音/粉红噪声或残留 `[data-sound-toggle]` → 彻底删除振荡器合成音频代码与声音开关，保持默认全程静音 `← 01 §三, 04 §4.5`。
8. **头颈扭曲与离板悬空否决（V3.3 新增）**：动态人物网格蒙皮把脖子拧过头、腾跃角色穿死板束腰衣裙、或滑板开场脚离板悬空平移 → 立即按 `03 §0.5` 与 `04 §4.4.5` 锁死头颈刚体保护区、换无束腰宽袍并按 6 阶段真实生物力学重绑脚板接触。
9. **分栏拉伸、粗粉边与层级透字否决（V3.3 新增）**：WebGL 画布在窄窗/分栏里垂直拉长、玻璃碎片边糊成粗粉带、全屏浮层底下透出顶栏文字，或左侧栏底脚压住最后一个章节 → 立即按 `02 §1.4, §4.2` 与 `04 §4.6` 锁 `100svh / max-height: 100vh`、片元算 `1.5–2px` 边、抬高浮层 `z-index` 并补足侧栏底距。

**实机无头浏览器关键帧截图目检闭环（V3.3 强制工序）**：
静态检查无法替代肉眼看真实渲染。交付前必须拉起本地 HTTP 服务，用无头浏览器至少实拍并亲眼审阅 5 类画面，确认零穿帮后删净全部临时截图：
1. **桌面标准视口（`1440×900`）开场首帧**：核对构图比例、脚板接触、道具朝向、散点疏密与冷青蓝氛围；
2. **动态动作顶点帧 / 滚动中段帧**：核对头颈无扭曲、双膝收腿与 3D 硬件厚度清晰、无顶点着色器模糊粗边；
3. **转场/碎裂切换帧与第二幕落定帧**：核对细边锐利、跨屏四锚点衔接自然、零黑屏或着色器状态污染；
4. **窄窗/分栏视口（如 `960×900` 或较矮高度）**：核对 WebGL 画布无垂直拉伸畸变、左侧栏末章与底脚零重叠；
5. **交互弹窗/全屏浮层展开帧（若有）**：核对顶栏文字零透出、关闭后状态完整复原；审阅通过后**必须删除所有 `_qa_*.png` 临时图**。

**整页组装打勾清单** `← page-recipes.md §5`：
- [ ] 每个 `<section>` 均具备 `id`、`data-section-scope` 及同名同值的三个 `data-*-theme` 属性。
- [ ] 正文左缘落在约 `14%–20%`（绝未因叠用 `--offset` 与 `.section__body` 掉到 `36%`）；侧栏底脚与末章零重叠。
- [ ] 每个 `.grid` 直接子项均带双下划线跨列类；每个 `.media` 均带 `--poster` 或 `--video`。
- [ ] 全页最多 `1` 个 `<h1>`，每章最多 `1` 个 `<h2>`；`data-reveal` 的 `--index` 同组从 `0` 连续递增。
- [ ] 全站未使用 `assets/reference/` 原稿；默认全程静音无合成音频；完成无头浏览器关键帧目检并清零 `_qa_*` 临时图；中文页已落实 §1.3 四项排印覆盖；页脚若存在已标 `[推导]`。

---

## 六 `verify.mjs` 七重硬拦截静态验收脚本：怎么跑、报什么错、怎么修（V3.3 升级）

`scripts/verify.mjs` 是零依赖的本地 HTTP 静态体检工具（不启浏览器），每次改完页面、分层素材或动效脚本必须跑通全绿 `← verify.mjs`。

### 6.1 运行命令

```bash
node scripts/verify.mjs assets/starter
# 指定端口避免冲突：
node scripts/verify.mjs ./my-page --port 4195
```

通过时输出：`VERIFY PASS — 首页 200、本地资源全 200、零外联、字体齐备、七条硬拦截全通过`。

### 6.2 静态检测项与七重硬拦截报错速修表

| 报错关键词 | 检测来源 | 真实根因 | 一行修复动作 |
|---|---|---|---|
| `GET / → 404` | 基础连通 | 传入目录缺少 `index.html` 或路径拼错 | 核对命令行目标目录内存在 `index.html` |
| `resource /xxx → 404` | 引用校验 | HTML 里 `src`/`href` 指向了不存在或大小写不一致的本地图片/CSS/JS | 检查 `assets/` 与 `vendor/gsap/` 文件名并修正相对路径 |
| `font fonts/xxx.woff2 → 404` | 字体校验 | 四族本地字体文件缺失（`NeueMontreal-Bold / HWCigars-Regular / ImperialScript-Regular / Inter-Variable`） | 从 `assets/starter/fonts/` 补齐缺失的 `.woff2` |
| **硬拦截 1（C-09）**：缺失页面主底色令牌 | `tokens.css` 校验 | `tokens.css` 漏写 `--c-page-bg` 主底色定义（具体色值见 `02 §一`） | 在 `tokens.css` `:root` 补齐 `--c-page-bg` 并在浅色区消费 `← C-09` |
| **硬拦截 2（C-10）**：侧栏宽度非 `13.9%` | `tokens.css` 校验 | `tokens.css` 残留旧错 `--sidebar-w: 20%` | 将 `--sidebar-w` 改为 `13.9%`、`--content-w` 改为 `86.1%` `← C-10` |
| **硬拦截 3（C-15 / C-01）**：`[data-stage3d]` 内出现 `.hero__img` 或 `.stage3d__tone` | 舞台结构校验 | 3D 舞台背景图错挂 `.hero__img` 致 3D 塌陷，或残留暖棕罩染 | 背景图改 `.stage3d__img` 并删除 `.stage3d__tone` `← C-15` |
| **硬拦截 4（V3.1）**：分层切图非真 RGBA 透明或残留 `_qa_*` 临时质检图 | PNG 文件头 + 目录扫描 | 透明分层（`subject / prop / arch / fg / hand / cypress` 等）为无 Alpha 的假透明图，或忘记删 `_qa_*.png` | 走 `03 §四` 抠出真 RGBA（PNG colorType `6`），并删除所有 `_qa_*` 临时图 `← 03 §4.5` |
| **硬拦截 5（V3.1）**：全介质外链 / `<video>` 标签 / JS 语法错误 | HTML+CSS+JS 全扫描 | HTML/CSS/JS 中夹带 `http(s)://` 外链（含 JS 硬编码 SVG 命名空间）、误用 `<video>` 标签、或自定义 `.js` 有语法错 | 外链改本地资源、SVG 改读 `svgEl.namespaceURI`、删 `<video>` 并修正 JS 语法 `← 04 §4.6` |
| **硬拦截 6（V3.1）**：`[data-stage3d]` 景深层数不足或缺少自运行能力 | 舞台多层与自演校验 | 舞台内独立 `.stage3d__layer` 少于 `3` 层，或未开启 `data-autoplay` | 拆足至少 `3` 个（推荐 `4–5` 个）独立景深层并挂 `data-autoplay` `← 04 §2.4` |
| **硬拦截 7（V3.3）**：检出 Web Audio 振荡器合成背景音或已废弃 `[data-sound-toggle]` | HTML+JS 静音红线校验 | 页面残留 `data-sound-toggle`、`EditionsSoundEngine` 或调用 `AudioContext + createOscillator` 合成持续耳鸣底噪 | 删除振荡器合成音代码与声音开关，改用纯视觉静音自演 `← 04 §4.5` |
