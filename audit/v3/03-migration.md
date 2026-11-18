# 交付物 1 · 20 项文件迁移表（SKILL.md + 19 份 references）

> 彻底砍掉第一版遗留的 93.8KB 污染源 `style-kit.md` 及错误契约文件，将 19 份散乱文档按「工作流工序」重组为 6 份零冲突核心手册（文件总数 106 → 93，references 19 → 6）。

---

## M-01 · `SKILL.md`

- **出处**：`SKILL.md`（原大小：`30.2 KB`）
- **裁决**：保留并重写 → 新位置：`SKILL.md`
- **依据**：重写第一屏：把「三份推翻层最高优先级」与「生图/网页双轨色板隔离表」置顶；修正 Z 轴深度与 3.03s 自动序列的二手转述错误；接入 11 个本机/第三方 skill 分工表
- **层级**：主入口路由重构

---

## M-02 · `references/corrections.md`

- **出处**：`references/corrections.md`（原大小：`6.6 KB`）
- **裁决**：合并收编 → 新位置：`references/01-overturns-and-truth.md`
- **依据**：与 layers-breakdown.md、real-page.md、tech-truth.md 合并为第三版最高权威宪章《01-overturns-and-truth.md》（推翻与实测总表），消除三处分散查阅
- **层级**：第1级·像素/逐帧实测

---

## M-03 · `references/layers-breakdown.md`

- **出处**：`references/layers-breakdown.md`（原大小：`20.4 KB`）
- **裁决**：合并收编 → 新位置：`references/01-overturns-and-truth.md + references/03-painting-and-layers.md`
- **依据**：15 条像素实测推翻并入《01-overturns-and-truth.md》；6 张原稿的 12 维像素测量卡与 4 层拆解规范并入《03-painting-and-layers.md》
- **层级**：第1级·像素/逐帧实测

---

## M-04 · `references/real-page.md`

- **出处**：`references/real-page.md`（原大小：`13.8 KB`）
- **裁决**：合并收编 → 新位置：`references/01-overturns-and-truth.md + references/02-design-tokens.md`
- **依据**：29 帧录屏实测的 #dcded1 底色、13.9% 导航、首屏细线框目录卡片直接升格为《02-design-tokens.md》唯一正式标准，不再作为「补丁文件」存在
- **层级**：第1级·像素/逐帧实测

---

## M-05 · `references/tech-truth.md`

- **出处**：`references/tech-truth.md`（原大小：`13.0 KB`）
- **裁决**：合并收编 → 新位置：`references/01-overturns-and-truth.md`
- **依据**：四大引擎真相与 13 个 Theatre.js 状态机关键帧数据并入《01-overturns-and-truth.md》第二章，作为动效与图层的底层源码证据
- **层级**：第2级·源码行号

---

## M-06 · `references/design-spec.md`

- **出处**：`references/design-spec.md`（原大小：`19.1 KB`）
- **裁决**：保留并重写 → 新位置：`references/02-design-tokens.md`
- **依据**：整合 blueprint.md 的 DOM 契约，并用 real-page.md 的实测值（#dcded1 主底色、13.9% 侧栏）修正 D1 与 D5，成为网页端唯一令牌字典
- **层级**：第2级·源码行号 + 第1级·实测修正

---

## M-07 · `references/blueprint.md`

- **出处**：`references/blueprint.md`（原大小：`20.8 KB`）
- **裁决**：合并收编 → 新位置：`references/02-design-tokens.md + references/05-page-recipes-and-verification.md`
- **依据**：DOM data-* 契约与 CSS 类名对照表并入《02-design-tokens.md》；组件骨架与资产命名规范并入《05-page-recipes-and-verification.md》
- **层级**：第2级·源码行号

---

## M-08 · `references/STYLE-CONTRACT.md`

- **出处**：`references/STYLE-CONTRACT.md`（原大小：`2.8 KB`）
- **裁决**：彻底删除 → 新位置：`（删除，正确约束并入 SKILL.md 第一屏）`
- **依据**：其中 2 条硬约束是错的（把侧栏写成 20%、把巨字标题写成 HWCigars smcp 衬线体），保留会误导生成
- **层级**：错误契约清理

---

## M-09 · `references/theme-baseline.css`

- **出处**：`references/theme-baseline.css`（原大小：`3.4 KB`）
- **裁决**：彻底删除 → 新位置：`（删除，统一使用 assets/starter/css/tokens.css）`
- **依据**：与 starter/css/tokens.css 重复且含错误定义（将 --font-display 设为 HWCigars 衬线体，漏掉 #dcded1 主底色）
- **层级**：重复与错误令牌清理

---

## M-10 · `references/style-kit.md`

- **出处**：`references/style-kit.md`（原大小：`93.8 KB`）
- **裁决**：彻底删除 → 新位置：`（删除，未推翻的构图蓄力/留白准则提炼入 03-painting-and-layers.md）`
- **依据**：全库最大污染源（93.8KB 几乎全是第一版未修正的旧结论：#292919 暗部、#8051ff 生图、道具油画同化、皮肤可见笔触、左上暖金戏剧光、20% 侧栏、三图同传），与三份推翻层处处互斥
- **层级**：第1级推翻层强制清理

---

## M-11 · `references/visual-dictionary.md`

- **出处**：`references/visual-dictionary.md`（原大小：`32.2 KB`）
- **裁决**：保留并重写 → 新位置：`references/03-painting-and-layers.md`
- **依据**：彻底清洗内部精神分裂：删除 §4.1「道具同化四步」、删除 CONST-1/3 的「皮肤可见笔触」、将 electric violet 改为洋红玫红 #ea135e/#ff0cdb，与 scene-production、prompt-recipes 合成为统一的生图与分层手册
- **层级**：第1级·像素/逐帧实测清洗

---

## M-12 · `references/scene-production.md`

- **出处**：`references/scene-production.md`（原大小：`11.7 KB`）
- **裁决**：合并收编 → 新位置：`references/03-painting-and-layers.md`
- **依据**：修正 §3.1 背景提示词里的 olive-brown #292919 与 §3.3 道具提示词里的 thick impasto，将分层六步 SOP 并入《03-painting-and-layers.md》
- **层级**：第1级·像素/逐帧实测修正

---

## M-13 · `references/prompt-recipes.md`

- **出处**：`references/prompt-recipes.md`（原大小：`6.6 KB`）
- **裁决**：合并收编 → 新位置：`references/03-painting-and-layers.md`
- **依据**：单图挂载规则（权重 0.4–0.6）与 6 张原稿原型匹配表直接并入《03-painting-and-layers.md》生图工作流章节
- **层级**：第1级·实测排坑

---

## M-14 · `references/decomposition-features.md`

- **出处**：`references/decomposition-features.md`（原大小：`13.0 KB`）
- **裁决**：合并收编 → 新位置：`references/03-painting-and-layers.md`
- **依据**：移除测试法（Removal Test）与 12 维逐图识别卡升级并入《03-painting-and-layers.md》及独立测量卡章节
- **层级**：第1级·像素/逐帧实测

---

## M-15 · `references/generator.md`

- **出处**：`references/generator.md`（原大小：`54.5 KB`）
- **裁决**：合并收编 → 新位置：`references/05-page-recipes-and-verification.md`
- **依据**：删去 40KB 空洞的伪数学公式（G1-G8 抽象代号）和旧暖光描述，只保留「换主体不跑味」的实操替换表（作品集 / 产品发布页 / 活动议程页三套跨场景映射），并入《05-page-recipes-and-verification.md》
- **层级**：方法层提纯

---

## M-16 · `references/page-recipes.md`

- **出处**：`references/page-recipes.md`（原大小：`19.7 KB`）
- **裁决**：保留并重写 → 新位置：`references/05-page-recipes-and-verification.md`
- **依据**：保留 [源码] / [推导] / [禁用] 三级证据机制与 6 种页面配方，补齐「尺子 2（作品集/产品页/活动页三页同手）」与「尺子 3（站内第 14 页四项硬衔接）」验收表
- **层级**：第2级·源码行号 + 第4级·推导

---

## M-17 · `references/motion-playbook.md`

- **出处**：`references/motion-playbook.md`（原大小：`24.0 KB`）
- **裁决**：保留并重写 → 新位置：`references/04-motion-and-stage3d.md`
- **依据**：删去通用 GSAP 基础语法复述（改由 gsap-* skill 接线），只保留 Shopify 专属的四层 Z 轴舞台（-240/0/+40/+90）、10s 自动序列、6 种运镜 rig 与擦镜转场
- **层级**：第2级·源码行号 + 重参数化

---

## M-18 · `references/cinema-audit.md`

- **出处**：`references/cinema-audit.md`（原大小：`5.4 KB`）
- **裁决**：合并收编 → 新位置：`references/04-motion-and-stage3d.md`
- **依据**：静态模板 vs 源码六维差距表与 6 种镜头轨迹参数直接并入《04-motion-and-stage3d.md》
- **层级**：第2级·源码行号

---

## M-19 · `references/gsap-library.md`

- **出处**：`references/gsap-library.md`（原大小：`9.9 KB`）
- **裁决**：合并收编 → 新位置：`references/04-motion-and-stage3d.md`
- **依据**：本地 25 个 GSAP 3.15.1 插件清单与加载顺序表精简并入《04-motion-and-stage3d.md》附录，删除与 gsap-* skill 重复的基础 API 教程
- **层级**：第3级·官方文档清单

---

## M-20 · `references/extraction-workflow.md`

- **出处**：`references/extraction-workflow.md`（原大小：`6.3 KB`）
- **裁决**：保留并重写 → 新位置：`references/06-extraction-and-skills-wiring.md`
- **依据**：整合 extract-tokens.mjs 四步重提流程，并新增「11 个第三方工具包 + 11 个本机 skill 完整接线手册」
- **层级**：方法层与工具接线

---

## 逐条执行动作（迁移与 Starter 修复施工单）

1. **文档层 19 → 6 重组施工**：
   - `01-overturns-and-truth.md` 合并收编 `corrections.md` + `layers-breakdown.md` + `real-page.md` + `tech-truth.md`。
   - `02-design-tokens.md` 合并收编 `design-spec.md` + `blueprint.md`（以 `real-page.md` 的 `#dcded1` 底色和 `13.9%` 侧栏覆盖旧值）。
   - `03-painting-and-layers.md` 合并收编 `visual-dictionary.md`（清洗后） + `scene-production.md` + `prompt-recipes.md` + `decomposition-features.md`。
   - `04-motion-and-stage3d.md` 合并收编 `motion-playbook.md` + `cinema-audit.md` + `gsap-library.md`。
   - `05-page-recipes-and-verification.md` 合并收编 `page-recipes.md` + `generator.md`（去伪数学公式后）。
   - `06-extraction-and-skills-wiring.md` 扩写自 `extraction-workflow.md` + 11 个 skill 接线规范。
   - 彻底删除 `style-kit.md`、`STYLE-CONTRACT.md`、`theme-baseline.css`。
2. **Starter 工程顺手修掉的 4 个硬伤**：
   - `tokens.css`：`--sidebar-w` 从 `20%` 改为实测 `13.9%`；新增 `--c-page-bg: #dcded1`。
   - `stage3d.css`：移除把画面染黄的 `.stage3d__tone` 橄榄褐罩染；修正文件头 Z 轴注释与 `.stage3d__title` 字体。
   - `portfolio.html + cinematic.js`：解除 `.hero__img` 与 `stage3d` 同时抢背景图 `transform` 导致 3D 景深坍塌的 Bug。
   - `verify.mjs`：加入对 `#dcded1` 底色、`13.9%` 导航宽度与双脚本冲突的自动静态拦截。
