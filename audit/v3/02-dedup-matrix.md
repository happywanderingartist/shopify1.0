# 表 B · 9 组数值去重矩阵（唯一归属表）

> 第二版同一个数值在 4–6 份文档里反复抄写，一处改了另一处没改就会产生新冲突。第三版严格实行「单一事实源」：一个硬数值只准活在一个主文件里，其他文件只准引用。

---

## D-01 · 插画暗部色板（4 个核心色值 + 色相区间）

- **出处（第二版被去重的重复文件）**：`corrections.md`、`layers-breakdown.md`、`real-page.md`、`visual-dictionary.md`、`style-kit.md (错写为#292919)`、`scene-production.md (错写为#292919)`
- **裁决（第三版唯一权威数值）**：`189°–224° 冷青蓝：#0c282d (189°), #4a6873 (196°), #394b55 (202°), #141722 (224°)`
- **依据（第三版唯一归属文件）**：`references/01-overturns-and-truth.md §1（生图词库仅做引用）`
- **层级**：像素实测

---

## D-02 · 插画荧光色板与配额

- **出处（第二版被去重的重复文件）**：`corrections.md`、`layers-breakdown.md`、`visual-dictionary.md`、`style-kit.md (错写为#8051ff)`
- **裁决（第三版唯一权威数值）**：`洋红–玫红 309°–339° (#ff0cdb, #ae188a, #ea135e) + 黄绿 67° (#a1af33)；每图 0–2 处（0%–8%）`
- **依据（第三版唯一归属文件）**：`references/01-overturns-and-truth.md §1`
- **层级**：像素实测

---

## D-03 · 网页 CSS 色板（底色 / 卡片 / 墨色 / 灰阶 / 激活色）

- **出处（第二版被去重的重复文件）**：`tokens.css`、`theme-baseline.css`、`design-spec.md`、`real-page.md`、`blueprint.md`、`style-kit.md`
- **裁决（第三版唯一权威数值）**：`页面主底 #dcded1 | 卡片 #f7f7ee | 墨色 #292919 | 灰阶 #dcdcd0 / #909083 / #5c5c4e | 按钮激活紫 #8051ff`
- **依据（第三版唯一归属文件）**：`assets/starter/css/tokens.css（文档端仅在 references/02-design-tokens.md 列表）`
- **层级**：像素实测

---

## D-04 · 四族字体分工与 12 级字阶 clamp 公式

- **出处（第二版被去重的重复文件）**：`design-spec.md`、`blueprint.md`、`layout.css`、`theme-baseline.css (错)`、`STYLE-CONTRACT.md (错)`、`style-kit.md`
- **裁决（第三版唯一权威数值）**：`NeueMontreal Bold (.headline-1..6, .bodycopy-1..2) | HWCigars (.narrative-1..4, 罗马数字) | ImperialScript (Drop Cap) | Inter-Variable (UI 小字)`
- **依据（第三版唯一归属文件）**：`assets/starter/css/tokens.css + layout.css（文档端归入 references/02-design-tokens.md）`
- **层级**：源码行号

---

## D-05 · 容器、栅格、左侧导航宽度与 9 级断点

- **出处（第二版被去重的重复文件）**：`real-page.md (13.9%)`、`design-spec.md (20%)`、`blueprint.md (20%)`、`tokens.css (20%)`、`STYLE-CONTRACT.md (20%)`
- **裁决（第三版唯一权威数值）**：`max-w 105rem (1680px) | 12 列 gap clamp(12px,1vw,16px) | 左侧栏 13.9% (1440 下 200px) | 右主区 86.1%`
- **依据（第三版唯一归属文件）**：`references/02-design-tokens.md + assets/starter/css/tokens.css`
- **层级**：像素实测

---

## D-06 · 10 条 CSS 贝塞尔曲线与 16 项过渡时长

- **出处（第二版被去重的重复文件）**：`tokens.css`、`design-spec.md D10`、`gsap-library.md §3`、`motion-playbook.md`、`style-kit.md §6`
- **裁决（第三版唯一权威数值）**：`--e-back cubic-bezier(.34,1.56,.64,1), --e-scroll cubic-bezier(.41,.19,.13,.95), --e-complete cubic-bezier(.72,.16,.19,.96) 等 10 条`
- **依据（第三版唯一归属文件）**：`assets/starter/css/tokens.css（文档端仅在 references/04-motion-and-stage3d.md 索引）`
- **层级**：源码行号

---

## D-07 · 真 3D 舞台四层 translateZ 与背景缩放系数

- **出处（第二版被去重的重复文件）**：`stage3d.css (文件头注释与代码自相矛盾)`、`SKILL.md (错写为-240/+40/+100/+180)`、`motion-playbook.md §5`
- **裁决（第三版唯一权威数值）**：`perspective: 1000px | bg: -240px * scale(1.32 * var(--bg-push,1)) | subject: 0px | fx: +40px | prop: +90px`
- **依据（第三版唯一归属文件）**：`assets/starter/css/stage3d.css + references/04-motion-and-stage3d.md`
- **层级**：重参数化

---

## D-08 · 首屏 10 秒自动序列（hero-intro.js）关键帧参数

- **出处（第二版被去重的重复文件）**：`hero-intro.js`、`tech-truth.md §3.1`、`motion-playbook.md §1`、`SKILL.md (二手转述失真)`、`details.js (重复实现)`
- **裁决（第三版唯一权威数值）**：`delay 0.35s | 0–1.80s cam.z -60→150 (power2.in), 0.50–1.80s bgPush 1→1.52 | 1.77s flash 60ms亮/460ms退 | 2.13–2.67s 回落 150→10 | 3.03s 起 10↔16 (5s yoyo)`
- **依据（第三版唯一归属文件）**：`assets/starter/js/hero-intro.js + references/04-motion-and-stage3d.md`
- **层级**：源码行号

---

## D-09 · Canvas 2D 粒子流与鼠标斥力场物理常量

- **出处（第二版被去重的重复文件）**：`tech-truth.md §2.3`、`design-spec.md D10`、`tokens.css`、`motion.js`、`details.js`
- **裁决（第三版唯一权威数值）**：`60 条流线 × 3 粒子 = 180 粒子 | mouseRepulsionDist: 300 | mouseRepulsionStrength: 20 | damping: 0.15 | Lenis lerp: 0.1`
- **依据（第三版唯一归属文件）**：`assets/starter/css/tokens.css + references/04-motion-and-stage3d.md`
- **层级**：源码行号

---

## 逐条执行动作（去重施工单）

1. **D-01 & D-02 执行动作**：将插画暗部 4 色（`#0c282d`、`#4a6873`、`#394b55`、`#141722`）与插画荧光色（`#ff0cdb`、`#ae188a`、`#ea135e`、`#a1af33`）唯一写入 `references/01-overturns-and-truth.md §1`；`references/03-painting-and-layers.md` 只写引用与英文提示词映射，不再重复贴多套色表。
2. **D-03 & D-04 & D-05 执行动作**：将网页 CSS 色板（`--c-page-bg: #dcded1`、`--c-card-paper: #f7f7ee`、`--c-ink: #292919`）、四族字体 12 级字阶 `clamp()` 公式、`13.9%` 左侧栏与 9 级断点唯一归属到 `assets/starter/css/tokens.css` 与 `references/02-design-tokens.md`，彻底删除 `theme-baseline.css` 与 `STYLE-CONTRACT.md`。
3. **D-06 & D-07 & D-08 & D-09 执行动作**：将 10 条贝塞尔曲线、四层 `translateZ`（`-240px / 0px / +40px / +90px`）、10 秒自动序列时间轴与 `60×3` 粒子常量唯一归属到 `references/04-motion-and-stage3d.md` 及对应 starter CSS/JS，在 `SKILL.md` 中只保留一句话导航索引。
