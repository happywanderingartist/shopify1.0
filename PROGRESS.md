# V3 重构进度台账（终态完结）

## 阶段 A · 全量文档交付清单（已完成，49/49 闸门全通过）

| 文件 | 状态 | 字节 | 目标区间 | 闸门 | 备注 |
|---|---|---|---|---|---|
| `SKILL.md` | 已通过（纯路由总入口） | 10277 | 8–11 KB | 7/7 | 已同步磁盘分层样图路径 `assets/starter/assets/layers/` |
| `references/01-overturns-and-truth.md` | 已验收 | 33064 | 30–34 KB | 7/7 | 最高权威推翻层（保留实测色码；见 Q-01 实证核查结论） |
| `references/02-design-tokens.md` | 已通过 | 20742 | 20–24 KB | 7/7 | 全库唯一 CSS 变量、色码与 10 条缓动原值字典 |
| `references/03-painting-and-layers.md` | 已验收（§二已精简为 04 指针） | 37067 | 36–40 KB | 7/7 | 零色码，已验收 |
| `references/04-motion-and-stage3d.md` | 已通过 | 29392 | 26–30 KB | 7/7 | 零色码，含 Z 轴推导、唯一 `data-*` 钩子与 25 插件速查 |
| `references/05-page-recipes-and-verification.md` | 已通过 | 25081 | 24–28 KB | 7/7 | 零色码，六种配方、三套替换、四把尺子、`verify.mjs` 排错 |
| `references/06-extraction-and-skills-wiring.md` | 已通过 | 14668 | 12–16 KB | 7/7 | 零色码，四步换站、11+11 技能接线、14 维容差 |
| **合计（7 份核心交付）** | **阶段 A 完成** | **170291（166.3 KB）** | **156–183 KB** | **49/49** | `227` 处 `0X §Y` 互引 `0` 断链 |

## 阶段 B · 工程修复与纯仓库清理（已完成）

- [x] 拉取上游提交 `81d5587` 的 `assets/starter/`、`assets/reference/`、`assets/starter/assets/layers/`、`scripts/` 与 `NOTICE.md`
- [x] 修复 starter 已知 5 处缺陷 + Q-02：
  1. `assets/starter/css/tokens.css` & `layout.css`：补齐 `--c-page-bg: #dcded1` 与 `--c-card-paper: #f7f7ee`（C-09），侧栏 `--sidebar-w` 改 `13.9%`、`--content-w` 改 `86.1%`（C-10）
  2. `assets/starter/css/stage3d.css` & `portfolio.html`：拔除发黄橄榄褐 `.stage3d__tone` 罩染（C-01），修正文件头 Z 轴注释为 `-240 / 0 / +40 / +90`（C-13），`.stage3d__title` 字体改回 `var(--f-sans)`（C-12）
  3. `assets/starter/portfolio.html` & `js/cinematic.js`：3D 舞台背景图类名由 `.hero__img` 改 `.stage3d__img`，并在 `cinematic.js` 加入 `!hero.querySelector("[data-stage3d]")` 保护锁解除 transform 抢占（C-15）
  4. `assets/starter/js/details.js`、`css/details.css`、`portfolio.html` & `js/hero-intro.js`：移除重复的 `1.77s` `[data-shot]` / `[data-burst-*]` 逻辑与孤儿选择器（C-16）；在 `hero-intro.js` 保存 `breathTween` 句柄并在 `yieldToUser()` 同步 `kill()`（关闭 Q-02）
  5. `scripts/verify.mjs`：升级扫描根下全部 `.html` 并新增 3 条硬拦截（`--c-page-bg: #dcded1`、`--sidebar-w: 13.9%`、`[data-stage3d]` 内禁 `.hero__img` 与 `.stage3d__tone`），正反双测均通过
- [x] 全量 `10` 个 JS/MJS 文件通过 `node --check`，`scaffold.mjs` + `verify.mjs` 脱离 `package.json` 与 `node_modules` 独立跑通全绿
- [x] 示范工程二次深查与视觉对齐：
  - `layout.css`：`.section--paper` 切换至 `var(--c-page-bg)`（`#dcded1`），修正 `.section__bleed`（`-13.9cqw`）与 `.hero__media` / `.hero__inner`（`calc(-100% * 13.9 / 86.1)`）以匹配 `13.9%` 左栏、`86.1%` 主区；`.hero__veil` 与 `stage3d.css` 切图接地阴影改用冷青蓝暗部 `rgba(20,23,34)`（C-01）
  - 清除 `assets/starter/` 下全部旧版 V2 文档指向（`style-kit` / `tech-truth` / `page-recipes.md` / `cinema-audit.md` / `design-spec.md`），统一改指 V3 `references/01..06`
- [x] 确认 `audit/v3/` 三表完整留档后，彻底移除 Web App 框架与依赖（`src/`、`vite.config.ts`、`tsconfig.json`、`metadata.json`、`.env.example`、`index.html`、`bun.lock`、`node_modules/`），仅保留一份零依赖 12 行 `package.json` 供 AI Studio 沙盒直接预览 `assets/starter/serve.mjs`（端口 `3000`）与运行 `verify.mjs`

## 阶段 C · V3.1 实战蒸馏与全量主动审查修补（已完成）

- [x] **10 条实战教训沉淀入六份手册与主入口**：补齐四维人-物-境因果简报、锐边高定现代物件标准、跨屏四锚点、物理接地与胸腔微呼吸、5 层剧场深纵模式（`-260/-165/-75/0/+42/+82px`）、亚像素关节精抠 + 袖口遮挡 + 200% 实景复查、活体微动红线（禁实心头发狂甩）、零点击自演与离线 Web Audio 432 Hz 声场、静息隐形热区（`opacity: 0`）。
- [x] **Starter 模板补齐清单欠账与性能优化**：
  1. `assets/starter/css/layout.css` & `js/motion.js`：补齐 **C-09**（`body` 默认底色改 `var(--c-page-bg)`，暗色章由 `html[data-nav-theme="dark"]` 覆写）与 **C-11**（首屏中央 `340×464` `1px` 细线框目录卡解锁组件 `.toc-card[data-toc-dock]`，滚过 `100px` 停靠 `13.9%` 左栏）。
  2. `assets/starter/css/stage3d.css` & `js/stage3d.js`：新增 `data-stage-mode="theater"` 5 层剧场深纵与滚动前景退场、共享阻尼指针、静息隐形热区（修正统一引用 `var(--c-magenta)`，清除未定义变量名）。
  3. `assets/starter/js/ambient-director.js`：新增零依赖离线程序化 Web Audio 声场（`EditionsSoundEngine`）与零点击交替编导（`EditionsSceneDirector`）。
  4. `assets/starter/js/cinema.js` & `motion.js`：后台标签页（`document.hidden`）与离屏自动暂停 `rAF`，消除空转耗电；清除 starter 内全部残余 V2 文档注释引用与失效预览图链接。
- [x] **脚本与质量闸门强化**：
  1. `scripts/verify.mjs`：由 `3` 条升级为 **6 条零依赖硬拦截**（新增真 RGBA Alpha 检测与 `_qa_*` 清零拦截、全介质 HTML/CSS/JS/内联 `<style>` 零外联与零 `<video>` + `vm.Script` JS 语法校验、多 `[data-stage3d]` 舞台逐个校验多层与 `data-autoplay`）。
  2. `scripts/scaffold.mjs`：新增 `--template editorial|portfolio` 范式选择与 `_qa_*` 临时图清理。
  3. `package.json`：升至 `3.1.0`，`lint` 同步对 `assets/starter` 与 `demo-mona-lisa` 执行双回归验收。

## 议题收口记录

- **Q-01（已实证核查并回写 `01`）**：已直接拉取原始 `SidekickScene.theatre-project-state_14_910d17ff-f5fb-4da0-920e-1b66f8d229b3@@v=1787919817.json` 核验 —— `02 Sidekick` 的确**不含**顶层 `bloom-effect` 对象（时间轴共 `11` 个对象），而是将 `"bloom": {"intensity": 0.2}` 作为静态字段嵌套在 `effects` 对象内部；已在 `references/01-overturns-and-truth.md` 同步收口，消除「未实证」遗留项。
- **Q-02（已关闭）**：已在 `assets/starter/js/hero-intro.js` 中保存 `breathTween` 句柄并在 `yieldToUser()` 滚动交接时同步 `kill()`，彻底消除 `3.03s` 后滚动抢相机风险。

## 已裁决记录

- **D-01**：十六进制色码隔离口径 —— `01` 保留实测证据色码，`02` 为全库唯一 CSS 变量与色码定义表，`03 / 04 / 05 / 06 / SKILL.md` 严格 0 命中。
- **D-02**：四层 `translateZ` 数学推导唯一归属 —— 完整推导归 `04 §二`，已验收的 `03 §二` 精简为单句指针指向 `04 §二`。
- **D-03**：动效库体积预算口径 —— 全量离线打包 `25` 个 GSAP `3.15.1` 插件（`472 KB` 本地 vendor，零外链开箱即用），HTML 按需加载 `<script>`。
- **D-04**：拉取完整素材与脚本、修完已知缺陷并跑通零依赖六重静态校验后，保持纯 Markdown 技能仓库 + 零依赖离线 starter。
- **D-05**：`10` 条贝塞尔缓动曲线单点定义 —— 原始 `cubic-bezier(...)` 数值唯一落在 `02 §1.5`，`04 §四` 只引用 `--e-*` 变量名与运动角色。
