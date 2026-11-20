# 风格提取与技能接线

**第一条总原则：Shopify Editions 特有的视觉与工程决策（冷青蓝暗场、洋红荧光配额、高定现代物件、人-物-境因果、`13.9%` 侧栏、4/5 层 Z 轴、首屏 `10s` 自动序列、活体微动红线与头颈锁定、纯视觉静音自演与 WebGL 防坑）全部留在本技能库；通用的画面特征对比、Token 固化、提示词反推与 GSAP 基础用法一律外接专业技能，绝不在本库重造轮子或重讲教程** `← audit/v3/03-migration.md M-20, gsap-library.md §8, V3.3`。

本手册解决两件事：1) 换一个新目标站点时，如何用四步流程与脚本机械重提一套新的 `14` 维规范；2) 在日常生图、做页、加动效的每一环，何时调用哪一个本机技能或第三方工具包 `← extraction-workflow.md §1-§4`。本手册严禁出现十六进制色码。

---

## 一 四步新站重提流程（换站不靠猜）

本库内置的数值全部来自 Shopify Editions Winter 2026；遇到新参考站要求「按这个站做新页」时，严禁直接套用旧数值，也严禁只凭截图瞎猜字号或色值，必须按以下四步重提 `← extraction-workflow.md §1, §2`：

### 第 1 步 · 喂截图与抓取源码镜像（双轨取证）
- **视觉侧**：收集目标站 `1440×900` 全页长图、首屏与章节切换关键帧录屏（至少覆盖加载首 `3s`、首屏滚出、浅/深切换三态），用本机 `visual-feature-analyst` 提炼「撑起画面的不变量」并做移除测试 `← extraction-workflow.md §1, 03 §六`。
- **源码侧**：获取可读的字节镜像或源码目录（至少含构建后的主 CSS、字体 CSS 与展开后的 HTML），按文件体积找出主样式表 `tailwind-*.css / app-*.css / index-*.css` 与 `fonts-*.css` `← extraction-workflow.md §2 Step 1`：
  ```bash
  find <mirror> -type f -name "*.css" -printf "%s %p\n" | sort -rn | head -20
  ```
- **铁律**：每条写进新规范的数值必须能定位到本地源码行号或像素采样坐标；定位不到的直接标「未实证」，绝不靠经验补空 `← extraction-workflow.md §1`。

### 第 2 步 · 机械提取 Token 候选 + 上下文核对
- 运行 `node scripts/extract-tokens.mjs <main.css> --out tokens.json` 生成候选清单（字段说明见 §二） `← extraction-workflow.md §2 Step 2`。
- **人工必核五项上下文**（严禁把脚本输出直接抄进规范） `← extraction-workflow.md §2 Step 3`：
  1. **断点归属**：按 `tokens.json` 的 `typography[].media` 对位源码，区分基础值与 `@media` 桌面覆盖，防止把手机字号写成桌面字号。
  2. **大字号 `clamp()`**：核对 `clamp()` 实际生效的 `@media` 断点区间。
  3. **间距刻度**：核实项目是用 `1px/单位`（如 Editions）还是默认 `4px/单位`，从 `--spacing` 与实际类定义确认。
  4. **字体分工**：联合 `@font-face` 与 HTML 实际引用确认每族字体归属，不靠文件名猜。
  5. **深浅主题反转**：核查 HTML 根元素 `data-*-theme` 属性与对应语义色类在不同章节的反转关系。

### 第 3 步 · 提取动效参数与拆解标准范式章
- **动效 DNA 提取**：从展开 JS bundle 中定位平滑滚动 `lerp`、鼠标阻尼、斥力距离/强度、缓动曲线与首屏时间轴关键帧；必要时配合仓库 `motion-dna-main.zip` 思路沉淀动效参数字典 `← extraction-workflow.md §3 D8-D9`。
- **拆一页作范式**：从展开后的 HTML 选一个完整、无 WebGL 依赖的静态内容章（Editions 选 `sidekick` 第 `690–830` 行），逐项记录区块顺序、`section` 类名、栅格列数、间距类名、媒体比例、按钮尺寸与主题切换点 `← extraction-workflow.md §2 Step 4`。

### 第 4 步 · 落盘新页面与静态验收
1. 运行 `node scripts/scaffold.mjs --out <dir> --title "<标题>"` 复制 starter 骨架 `← extraction-workflow.md §4`。
2. 把新站令牌写入新目录 `css/tokens.css` 的 `--c-* / --f-* / --motion-*`，保持既有类名结构不变 `← extraction-workflow.md §4`。
3. 按第 3 步拆出的区块顺序替换 `index.html` 的文案槽位与本地图片，动效常数同步写入 `js/motion.js` `← extraction-workflow.md §4`。
4. **必须通过本地 HTTP 服务预览**（`node serve.mjs`，严禁 `file://`，Chromium 会因 CORS 拦掉 `.woff2` 字体），随后跑 `node scripts/verify.mjs <dir>` 验通七重硬拦截全绿并完成无头浏览器关键帧目检（报错修复见 `05 §五, §六`） `← extraction-workflow.md §4, V3.3`。

**提取落地高频十坑速查（实测留档）** `← extraction-workflow.md §5`：
1. HTML 说明注释里不要写完整 `<!-- SLOT -->` 字面量，防止注释提前闭合漏出正文。
2. JS 读 `data-nav-theme` 必须用驼峰 `dataset.navTheme`，连字符访问会致浅色侧栏文字隐身。
3. 侧栏长标签用 `flex + space-between` 会折成多行，改用固定标签宽 + 右对齐数字的网格。
4. Windows 路径用 `path.normalize` 会把斜杠变反斜杠致 `404`，服务层改用 `path.posix.normalize`。
5. 旧服务占端口时，Windows 用 PowerShell `Stop-Process`，勿依赖 bash `kill`。
6. 离线 Remix/React 水合报 418 号错误清空 DOM 时，切静态安全模式保留源码、停用 module hydration。
7. Tailwind v4 主题变量可能藏在 `@layer theme` 内，提取脚本须同时兼容 `@theme` 与 `@layer theme`。
8. 浅色章当前激活侧栏项必须显式覆盖为深墨变量，否则文字与纸面底色融在一起消失。
9. 中文首字绝不挂西文花体 Drop Cap（处理详见 `05 §1.3`）；缺 `favicon` 报 `404` 时用内联 SVG `data:` 兜底。
10. **版权边界**：镜像字体与示例图权属归原权利人，默认仅本地研究预览；公开上线前必须替换为有授权的字体与自产素材，商业后台、支付、登录与追踪链路一律不复制 `← extraction-workflow.md §6`。

---

## 二 `extract-tokens.mjs` 使用说明与输出结构

`scripts/extract-tokens.mjs` 是零依赖 Node.js 机械提取脚本，专门把压缩或展开后的 CSS 变成可核对的结构化 JSON `← extract-tokens.mjs:1-10`：

```bash
node scripts/extract-tokens.mjs path/to/tailwind-XXXX.css --out tokens.json
# 不加 --out 时直接打印到标准输出：
node scripts/extract-tokens.mjs path/to/main.css
```

| 输出 JSON 字段 | 提取逻辑与代码位置 | 用途与复核重点 |
|---|---|---|
| `source` / `bytes` | 输入绝对路径与 CSS 总字符数 `← extract-tokens.mjs:118-119` | 留档证据源，防止版本漂移 |
| `themeVars` | 兼容扫描 `@theme` 与 `@layer theme` 块内全部 `--*` 变量 `← extract-tokens.mjs:60-82` | 快速收齐色板、圆角、字族与动效自定义属性 |
| `spacing` | 匹配全部 `--spacing*` 声明 `← extract-tokens.mjs:84` | 判断站点间距基数（`1px` 或 `4px`） |
| `breakpoints` | 去重并升序提取所有 `min-width`（自动把 `rem` 乘 `16` 换算 `px`） `← extract-tokens.mjs:86-89` | 直接生成 §四 `D11` 断点表 |
| `fontFaces` | 提取每个 `@font-face` 的 `family / src / weight / display` `← extract-tokens.mjs:91-96` | 核对本地字体清单与字重 |
| `keyframes` | 列出全部 `@keyframes` 动画名 `← extract-tokens.mjs:98` | 定位 CSS 侧内置关键帧 |
| `typography` | 按 `BASE` 与各 `@media` 条件分组抓取标题、叙事、栅格核心类规则 `← extract-tokens.mjs:100-105` | 避免把移动端与桌面端字号混为一谈 |
| `clamps` | 最多前 `120` 条 `clamp()` 表达式及其所属 `@media` 与上下文 `← extract-tokens.mjs:107-113, 126` | 直接核对流体字阶与流体列距 |
| `colorClasses` | 前 `80` 条 `.bg-/.text-/.border-` 语义色类声明 `← extract-tokens.mjs:115` | 核对深浅主题反转色对 |

---

## 三 两张技能接线表（11 本机技能 + 11 第三方工具包）

### 3.1 11 个本机可调用技能流水线接线表

按生产工序串行调用，绝不把通用技能的文档抄进本库 `← audit/v3/03-migration.md M-20, motion-playbook.md §10`：

| 序 | 本机技能名 | 流水线角色 | 什么时候交给它 | 什么必须留在本库（不外包） |
|---|---|---|---|---|
| 1 | **`shopify-editions-design-system`** | 本体中枢 | 贯穿全程的总控与裁决入口 | 全套冷青蓝/荧光裁决、人-物-境因果、`13.9%` 侧栏、4/5 层 Z 轴、亚像素抠图与 200% 质检、头颈锁定与静音自演、六配方、四尺子与七重硬拦截 |
| 2 | **`visual-feature-analyst`** | 参考图拆解 | 换新题材或新参考站时，横向对比多张图提取「撑起画面的不变量」与做移除测试 | Editions 六张原稿的既定 `12` 维实测卡（见 `03 §一, §六`） |
| 3 | **`style-dna`** | 令牌固化 | 把零散视觉意图固化成新项目的变量体系与引用契约 | Editions 既定的 `tokens.css` 唯一字典（见 `02 §一`） |
| 4 | **`image-gen-assistant`** | 提示词与出图 | 匹配生图提示词库并执行文生图/图生图调用 | 单图挂载 `0.4–0.6`、材质三态、零笔触皮肤与贴纸道具铁律（见 `03 §三`） |
| 5 | **`motion-design`** | 动效节奏设计 | 规划新章节情绪、注意力引导、迪士尼原则 UI 化与节拍人格 | 原站 `720/1320ms` 延迟链、`75ms` 错峰与 `1.77s` 爆发节拍（见 `04 §三, §四`） |
| 6 | **`gsap-timeline`** | 时间轴编排 | 编写复杂嵌套 timeline、位置参数与播放控制 | 首屏 `10s` 自动序列与滚动一键交接锁逻辑（见 `04 §三`） |
| 7 | **`gsap-scrolltrigger`** | 滚动驱动 | 编写 `pin`、`scrub`、触发阈值与响应式刷新 | 单图纯 `scale` 推镜纪律与章节四层 `-6/-2/+5/+14`（见 `04 §四`） |
| 8 | **`gsap-plugins`** | 插件应用 | 使用 `SplitText / DrawSVG / CustomEase / Flip / Observer` 具体 API | 本地 `25` 插件离线清册与零外联红线（见 `04 §六, 附录`） |
| 9 | **`gsap-utils`** | 数学映射工具 | 使用 `clamp / mapRange / snap / random` 做响应式数值映射 | 舞台 `p` 进度的负起点 `-60 → +150px` 映射语义（见 `04 §二`） |
| 10 | **`gsap-performance`** | 60fps 调优 | 排查掉帧、合成层升级、避免布局抖动（layout thrashing） | 离屏停算与无头截图两坑兜底（见 `04 §三, §七`） |
| 11 | **`gsap-core`** | 兜底核心 | 查询基础 `to / from / fromTo`、内置 ease、`stagger` 与 `matchMedia` 语法 | 不在本库任何文件重讲基础 API（见 `04 §七`） |

### 3.2 仓库 `11个skill/` 第三方工具包定位表

以下 `11` 个归档包位于上游仓库 `11个skill/` 目录（合计约 `70 MB`）。**诚实声明：下表方向标注基于包名与仓库目录清册，各包具体命令与接口以拆包后各自 `README` 为准，未拆包前标「未实证」** `← 交接总纲 §2.4.1`：

| 序 | 归档文件名 | 体积 | 定位方向（以包内 README 为准） | 调阅优先级与建议 |
|---|---|---|---|---|
| 1 | `extract-design-tokens-main.zip` | `38 KB` | 提取设计令牌 JSON/CSS | **★ 优先单独调阅**（与 §二 互补） |
| 2 | `motion-dna-main.zip` | `30 KB` | 提取站点动效参数 DNA | **★ 优先单独调阅**（支撑 §一 第 3 步） |
| 3 | `nuyoah-image-reverse-prompt-main.zip` | `38 KB` | 参考图反推提示词 | **★ 优先单独调阅**（辅助 `03 §三` 词库迭代） |
| 4 | `style-prompt-extractor-main.zip` | `5 KB` | 提取风格提示词模板 | **★ 优先单独调阅**（极轻量） |
| 5 | `mimic-web-master.zip` | `166 KB` | 网页结构复刻参考 | 按需拆看 `README` |
| 6 | `design-system-extractor-main.zip` | `2.5 MB` | 完整设计系统提取 | 体积较大，仅建新大型站时按需调阅 |
| 7 | `ui-clone-skills-main.zip` | `4.5 MB` | UI 克隆流程技能集 | 按需调阅 |
| 8 | `ui-clone-skills-main (1).zip` | `4.5 MB` | 与序号 7 **字节完全相同（重复包）** | **直接忽略，勿重复上传或解压** `← 交接总纲 §2.4.1` |
| 9 | `taste-skill-main.zip` | `10 MB` | 审美判断与视觉把关 | 体积大，按需单独抽阅 |
| 10 | `style-extractor-main.zip` | `11 MB` | 全量风格提取器 | 体积大，按需单独抽阅 |
| 11 | `reanimate-main.zip` | `35 MB` | 动效重做工具集 | 全目录最大，不整包拉取 |

---

## 四 新站提取时的 `14` 维核验清单（量什么 × 容差）

换新站重建规范时，逐项填满以下 `14` 维，每条必须附源码文件与行号/类名，且满足对应容差红线 `← extraction-workflow.md §3, design-spec.md D1-D14`：

| 编号 | 维度 | 量什么 | 实测容差 / 验收红线 |
|---|---|---|---|
| **D1** | 色彩 | 页面底色、卡片底色、墨色、灰阶、透明态与深浅反转色 | 每色必须可追溯 CSS 声明或 `1440×900` 录屏像素采样；色相误差 `≤2°` |
| **D2** | 字体 | 各族用途、`@font-face` 字重、OpenType 特性、降级链 | 四族或目标站全族本地 `.woff2` 全 `200`，角色不串位 |
| **D3** | 排印 | 各级字号（含 `clamp()`）、行高、字距、`text-box`、首字下沉 | 桌面与移动端分列核对，字号与源码误差 `0px` |
| **D4** | 间距 | 间距基数（`1px` 或 `4px`）与高频类名到 `px` 映射 | 严禁凭猜测换算，须在编译 CSS 中实测至少 `5` 个类名 |
| **D5** | 栅格 | 最大容器宽、列数、列/行间距、子网格与侧栏真实渲染占比 | 既查 CSS 容器宽又查真实渲染帧像素占比（如 `13.9%` vs `20%`） |
| **D6** | 组件 | 顶栏、侧栏目录、CTA、播放键、媒体卡、浮层尺寸与态变 | 实测精确到 `1px`，标注是否由 CSS 伪元素生成 |
| **D7** | 形状 | 圆角刻度、边框线宽、阴影与异形圆角 | 全部取自编译 CSS，无近似取整 |
| **D8** | 缓动 | 曲线变量名、原始 `cubic-bezier` 参数与各交互时长 | 逐项核对 `y>1` 过冲曲线，不拿 `ease-out` 糊弄 |
| **D9** | 物理 | 平滑滚动 `lerp`、阻尼、视差、斥力半径/强度、粒子常量 | 标明源码行号或「CSS 空间重参数化，非原站坐标」 |
| **D10** | 状态 | 根元素与章节 `data-*` 主题广播契约与触发阈值 | 逐项验证滚动跨章时 DOM 属性真实切换 |
| **D11** | 断点 | 全部 `min-width` 阈值（`rem` + `px`）与对应布局切换点 | 由 `extract-tokens.mjs` 全量导出并按断点复核规则归属 |
| **D12** | 资产 | 媒体锁比例、文件命名规范与响应式 `srcSet` 宽度档位 | 明确区分静态可复刻资产与 WebGL/Rive 不可复刻边界 |
| **D13** | 节奏 | 首屏高、章节封面高、块间距、sticky 偏移与 `scroll-padding-top` | 逐章量清垂直呼吸感，严禁压缩留白密度 |
| **D14** | 配方 | 从零搭页步骤、适用配方与静态/视觉验收清单 | 跑通 `verify.mjs` 零外联全 `200` + 盲测过关 |
