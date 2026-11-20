# 推翻与实测总纲

## 〇 优先级

本文件是全库最高权威宪章，只负责裁定事实对错、锁定实测硬数值、封杀已被推翻的旧说法。库内任何文件、脚本、样式表与本文件冲突时，无条件以本文件为准。

全库实行三层效力结构：

1. **第 1 层（最高裁决层）：`references/01-overturns-and-truth.md`（本文件）**
   汇集第 1 级证据（6 张 `2880×1780` 官方原稿像素采样 `← layers-breakdown.md §零`、29 帧 `2160×1368` 全站滚动录屏实测 `← real-page.md §零`）与第 2 级证据（`589MB` 源码镜像内 `1448` 条资产清单、`13` 个 Theatre.js 状态机、`50` 个 `.glb` 模型、`tailwind-G-N6aznT.css` 与 `hero-intro.js` 源码行号 `← tech-truth.md §零`）。
2. **第 2 层（执行令牌层）：`references/02-design-tokens.md` 与 `assets/starter/css/tokens.css`**
   将本文件裁定后的网页硬数值（色板、四族字体、`12` 级字阶、`1px` 间距刻度、`13.9%` 侧栏、`9` 级断点、`10` 条贝塞尔曲线）固化为唯一 CSS 变量源 `← audit/v3/02-dedup-matrix.md D-03`。
3. **第 3 层（方法层）：`references/03` 至 `references/06` 四份工序手册**
   分别管生图与分层（`03`）、3D 舞台与动效（`04`）、跨场景页面装配与验收（`05`）、新站提取与技能接线（`06`）。方法层可替换主题与文案，但严禁违反前两层硬数值 `← audit/v3/03-migration.md`。

**旧稿清理铁律**：旧版 `references/style-kit.md`（`93.8KB` / 约 `6.6` 万字）、旧版 `references/STYLE-CONTRACT.md`（四条网页契约，其中两条写错：侧栏 `20%`、巨字 `HWCigars`）、旧版 `references/theme-baseline.css` 已整份删除。**本句是全库唯一允许出现这三个文件名的位置**（用于标记删除），其余任何地方再出现即属旧稿污染残留 `← audit/v3/03-migration.md M-08`。

---

## 一 色彩双轨总表（插画 / 网页，两张表，不许并成一张）

生图插画与网页前端使用两套完全独立的色板 `← real-page.md §零`。两张表严禁合并。

### 表 1-A · 插画通道（生图用）

数值全部来自 6 张 `2880×1780` 官方原稿像素采样 `← layers-breakdown.md §一`。写生图提示词时严禁写十六进制码，必须转写为对应颜料与色温词 `← layers-breakdown.md §一`。

| 角色 | 色值 | 色相 | 用途与实测出处 | 禁止 |
|---|---|---|---|---|
| 暗部主色 | `#141722` | `224°` `← 6 张原稿像素采样` | 插画暗部、阴影、深色衣料、深蓝黑净底（`02-Sidekick.jpg` 背景，明度 `L=8%`） `← layers-breakdown.md §一` | 不许换成 `#292919` `← corrections.md #1` |
| 暗部辅色 | `#0c282d` / `#394b55` / `#4a6873` | `189°` / `202°` / `196°` `← 6 张原稿像素采样` | 冷青蓝墙面与远空过渡（`06` 墙面 `#0c282d` `L=10%`、`03` 天空 `#394b55` `L=20%`、`01` 天空 `#4a6873` `L=26%`、`03` 湖面 `#1a2f38`） `← layers-breakdown.md §一` | 严禁写暖褐或死黑阴影 `← corrections.md #1` |
| 荧光主色 | `#ff0cdb` / `#ea135e` | `309°` / `339°` `← 01/03/04 原稿采样` | `0–2` 处点缀，占画面 `0%–8%`（`01` 购物袋亮面 `#ff0cdb`、袋面 `#ea135e` `S=0.92, V=0.92`、`01` 冰杯 `#db1875` `S=0.89, V=0.86`） `← layers-breakdown.md §一` | 不许用 `#8051ff` `← corrections.md #2` |
| 荧光辅色 | `#ae188a` | `314°` `← 01/03/04 原稿采样` | 亚光纸质/塑料/织物次要点缀（`01` 滑板 `#ae188a` `S=0.86, V=0.68`、`04` 针织帽 `#a7195b` `S=0.85, V=0.65`、`04` 卡片 `#ac2268` `S=0.80, V=0.67`） `← layers-breakdown.md §一` | 禁止光晕外溢照亮手指 `← layers-breakdown.md §二` |
| 酸色 | `#a1af33` | `67°` `← 01/03/04 原稿采样` | 第二种酸色，只在一张图里出现（`03-Marketing.jpg` 广告牌 `"muse skate"` 字样，色相带 `67°–72°`） `← corrections.md #2` | 禁止大面积铺底 `← layers-breakdown.md §一` |
| 暖主体色 | `#793419` / `#946a32` / `#55381b` / `#4c361b` | `16°–38°` `← layers-breakdown.md §一` | 衣袍与木桌（`01` 男袍 `#793419`、`01` 白袍暗部 `#946a32`、`06` 木桌 `#55381b`、`06` 织锦 `#4c361b`；另含 `02` 紫袍 `#4a2038`、`04` 绿袍 `#4a5340`、`05` 粉袍 `#c98a8e`） `← layers-breakdown.md §一` | 禁止暖色侵入背景暗部 `← layers-breakdown.md §一` |
| 双态肤色 | `#e5af95`–`#efcab2` / `#b2705b`–`#8f5b54` | `19°–22°` / `6°–14°` `← audit/v3/02-dedup-matrix.md` | 状态 A 年轻/女性橙粉腮红（`01` 女、`04` 女）；状态 B 学者/室内苍白无血色（`02` 男、`06` 第四人） `← corrections.md #6` | 禁止全员统一写红润肤色 `← corrections.md #6` |

### 表 1-B · 网页通道（CSS 变量用）

数值全部来自 29 帧录屏实测 `← real-page.md §六` 与 `tailwind-G-N6aznT.css` `← tokens.css:40-59`。

| 变量 | 值 | 用途与实测出处 |
|---|---|---|
| `--c-page-bg` | `#dcded1` | 全站主底色（录屏三处取点全为 `RGB(220, 222, 209)`，占全站一半以上浏览时长） `← real-page.md §零 #2, §六` |
| `--c-card-paper` | `#f7f7ee` | 卡片/浮层/按钮底色（录屏实测 `#f3f6ef`–`#fafcf7`；深色章巨字反白实测 `#f6f9f0`） `← tokens.css:42, real-page.md §六` |
| `--c-ink` | `#292919` | 墨色文字、深色底块（色相 `60°`；浅色区小标题实测 `#36382a`） `← tokens.css:43, real-page.md §六` |
| `--c-deep` | `#161c1e` | 深色章节底（深空章浏览器渲染值 `#080a07`、树林章 `#2c2a1e`、暮色章 `#1e1d19`、深色实验卡 `#2d2f22`） `← real-page.md §四, §六` |
| `--c-accent` | `#8051ff` | 按钮激活态（色相 `265°`；Sidekick SVG 眼罩 `#7126ff`、脸部 `#1c004f`） `← tokens.css:55, cinema.css:26-27` |
| `--c-grey-light` | `#dcdcd0` | 浅灰块、`1px` 分割线（`.rule`）、CTA 边框 `← tokens.css:44, layout.css:328,391` |
| `--c-grey-mid` | `#909083` | 中灰次级文字 `← tokens.css:45` |
| `--c-grey-dark` | `#5c5c4e` | 正文链接、散落斜杠标签文字（配透明度 `0.6`） `← tokens.css:46, real-page.md §四` |
| `--c-magenta` | `#ea135e` | 仅限章节过渡「织物擦镜」遮罩（`.pd-veil--wipe`）瞬态渐变起色 `← tokens.css:56, details.css:64-67` |

**`#292919` 永远不进生图提示词，`#dcded1` 永远不进插画。** 两套混用会直接导致「图发黄、页发蓝」，这是已经踩过的坑 `← real-page.md §零, corrections.md #1`。

---

## 二 十二条硬结论（每条一段，含出处与反例）

本节由 `audit/v3/01-conflict-rulings.md` 的 16 条冲突归并而成（`C-02/C-03/C-07` 合并为第 2 条，`C-16` 并入第 11 条，`C-13` 与 `C-15` 独立成条） `← audit/v3/01-conflict-rulings.md`。

1. **插画暗部色相锁定冷青蓝 `189°–224°`（主色 `#141722`），严禁使用 `#292919`**
   6 张原稿最暗部采样全部落在冷青蓝带：`02` 背景 `#141722`（`224°`）、`06` 墙面 `#0c282d`（`189°`）、`01` 天空 `#4a6873`（`196°`）、`03` 天空 `#394b55`（`202°`），物理成因是原站使用 `studio_small_09_1k.pmrem.ktx2` 摄影棚冷色环境贴图反射暗部 `← 6 张原稿像素采样, tech-truth.md §一 #2`。反例：旧版把网页 CSS 墨色 `#292919`（`60°` 橄榄棕）写进生图提示词，并在 `stage3d.css:119-128` 叠加 `.stage3d__tone` 橄榄褐遮罩，导致生成的油画全部发黄发脏 `← corrections.md #1, audit/v3/01-conflict-rulings.md C-01`。

2. **插画荧光色锁定洋红至玫红 `309°–339°`（主色 `#ff0cdb` / `#ea135e`，酸黄绿 `#a1af33` `67°`），配额 `0–2` 处（占画面 `0%–8%`）**
   `01` 购物袋亮面实测 `#ff0cdb`（HSL 色相精确值 `308.9°` 四舍五入为 `309°`；`layers-breakdown.md` 第 47 行表内记为 `309°`，第 58、240、320 行概括时漏了第一行写成 `314°–339°`，本版统一裁定为 `309°–339°`） `← 01/03/04 原稿采样, audit/v3/01-conflict-rulings.md C-03`。`06-Operations.jpg` 全图荧光占比实测为 `0%`，`02` 仅 `1.3%`，证明荧光色允许为 `0` `← layers-breakdown.md §一`。反例：旧版把网页按钮紫 `#8051ff`（`265°`）当主荧光，且死守「每图必有 `10%` 波普色」，把古典群像毁成赛博朋克风 `← corrections.md #2, #5`。

3. **现代道具是「锐边高定」，不被油画同化但绝非粗糙廉价贴纸；边缘可以硬，材质必须精密、透视必须接地、光必须同源**
   `05` 手机四周有清晰的不规则深色剪纸描边且带真实 iPhone 灵动岛与拉丁字列表；`01` 滑板边缘锐利无投影；`03` 广告牌在状态机里是独立对象 `billboard` 并带独立 `blur-intensity` 属性 `← corrections.md #3, layers-breakdown.md §六, tech-truth.md §四`。实战补充：绝不能把「贴纸感」误解成粗糙低精度矢量图或塑料反光 CGI——现代物件表面必须具备真实工业设计精度（如拉丝阳极氧化铝、精密滚花纹理、熏黑微反光玻璃），受光严格吃进阴天冷北光、透视与承托面 1:1 贴合，且与人物产生真实接触互动 `← V3.1 实战蒸馏`。反例：旧版 `visual-dictionary.md` §4.1 教「同化四步」把道具糊进背景；或矫枉过正把廉价塑料 3D 块悬空硬贴在油画角落，两者均立毁高级感 `← audit/v3/01-conflict-rulings.md C-04`。

4. **人物皮肤零笔触、天空墙面平涂；笔触只出现在树叶、头发、金属与粗织物褶皱暗部**
   4 倍放大下 6 张原稿人脸与手背全部磨平零笔触，眉毛极细极淡；墙面与天空的笔触密度只有树冠/织锦的十分之一量级（分块边缘能量实测值见 §四）；亮部白袍允许接近纯白（`01` 中 `L>200` 占 `3.1%`） `← 02/04/05/06 脸部特写, layers-breakdown.md §三, corrections.md #7`。反例：旧版写 `skin painted with visible brushwork`、`craquelure` 并禁纯白 `#FFFFFF`，导致人脸长满油画刀痕、白袍变脏灰 `← audit/v3/01-conflict-rulings.md C-05`。

5. **光源是柔和漫射天光（户外高阴天 / 室内大顶光），无定向硬投影**
   原站 `13` 个场景中 `9` 个无灯对象，全靠 `studio_small_09_1k.pmrem.ktx2` 摄影棚环境贴图漫射照明；人物鼻下与下巴无硬边黑影，手机屏幕光绝不外溢照亮手指 `← corrections.md #5, §三 #1, layers-breakdown.md §二`。反例：旧版写 `Single warm golden key light from upper left, deep chiaroscuro, Caravaggio tenebrism`，做出泛黄硬影的宗教画 `← audit/v3/01-conflict-rulings.md C-06`。

6. **每次生图只准挂 `1` 张参考图，参考权重锁定 `0.4–0.6`**
   原稿是高精度渲染图，参考权重拉满会把塑料杯学成照片；同时挂 `2` 张以上参考图会把第二张图的构图和背景硬拼进来 `← prompt-recipes §二, corrections.md #9, 00-看图说话.txt §六`。反例：旧版要求一次同传 `01 + 02 + 04` 三张原稿提取共性，导致构图精神分裂 `← audit/v3/01-conflict-rulings.md C-08`。

7. **网页全局主底色是冷灰绿 `#dcded1`，`#f7f7ee` 只是卡片色**
   29 帧录屏浅色内容区三处取点均为 `#dcded1`（`RGB(220, 222, 209)`），卡片与按钮为 `#f7f7ee`（实测 `#f3f6ef`–`#fafcf7`）；两栏对比卡片完全不靠边框线，仅靠 `#f7f7ee` 卡片浮在 `#dcded1` 底色上的明度差分割 `← 29 帧录屏采样, real-page.md §零 #2, §四`。反例：旧版 `tokens.css:42-47` 把 `body` 设为 `#000000`、把 `#f7f7ee` 当浅色页面底，导致整页发白失真 `← audit/v3/01-conflict-rulings.md C-09`。

8. **左侧罗马数字导航栏占 `13.9%`（`1440` 视口下约 `200px`），右侧内容区占 `86.1%`**
   录屏 `1080` 宽下实测章名左对齐 `x=17px`、罗马数字右对齐 `x=145px`；`13.9%` 按导航列**含右内边距的截面宽度约 `150px`** 计，若只按罗马数字右缘 `145px` 计为 `13.4%`，做 CSS 时取 `13.9%`（`--sidebar-w: 13.9%`），与录屏视觉边距一致；列表从 `I Sidekick` 到 `XII Developer` 共 `12` 章（`Hero` 不进列表，当前章加粗并隐去罗马数字） `← real-page.md §二`。反例：旧版照抄外层容器 `w-1/5` 设成 `--sidebar-w: 20%`，忽略内层 `nav` 收窄，导致左栏过宽无法接入原站 `← audit/v3/01-conflict-rulings.md C-10`。

9. **首屏是中央 `1px` 细线框目录卡片（`340×464`），滚出后飞向左侧栏；巨字从第二章封面才出现**
   录屏 `f0001–f0004` 实测首屏中央为 `1px` 白色半透细线框（透明度 `0.4`，占宽 `27%`、占高 `60%`，对应 `svg.davinci-lines` `viewBox="550 208 340 464"`），内含 `"The Ren///ssance Edition"` 与 `12` 章目录；首屏无巨字 `← 录屏 f0001–f0004, real-page.md §三, cinema.css:193-223`。反例：旧版 `layout.css:466` 把首屏做成巨字压左海报 `← audit/v3/01-conflict-rulings.md C-11`。

10. **章节巨字是 `NeueMontreal Bold` 无衬线体（不开 `smcp`，顶部被半透顶栏遮掉一截）；`HWCigars` 只用于叙事段与罗马数字**
    `.headline-1..6` 绑定 `NeueMontreal Bold 700`（`.headline-1` 为 `clamp(7.5rem, 35.7895px + 10.9649vw, 13.75rem)` 即 `120px–220px`，行高 `0.9`，字距 `-0.03em`），贴章节顶部放置并被 `50px–56px` 半透明顶栏遮住上半截；`HWCigars` 用于 `.narrative-1..4` 与罗马数字；`ImperialScript` 只用于 Drop Cap 首字母 `← tailwind-G-N6aznT.css, layout.css:158-239, real-page.md §三, §五`。反例：旧版已删契约与 `stage3d.css:137` 把巨字写成 `HWCigars` 并开 `smcp` `← audit/v3/01-conflict-rulings.md C-12`。

11. **真 3D 舞台四层 z 值锁定 `-240px / 0px / +40px / +90px`（标「重参数化」），自动序列严格按 `hero-intro.js` 四阶段运行**
    `stage3d.css:60-63` 真实生效层深为 `bg: -240px`（乘 `scale(calc(1.32 * var(--bg-push, 1)))`）、`subject: 0px`、`fx: +40px`、`prop: +90px` `← stage3d.css:60-63, 重参数化，非原站坐标`。首屏自动序列（延迟 `0.35s`）：`0–1.80s` 强推 `cam.z -60 → 150`（`power2.in`）且 `0.50–1.80s` `--bg-push: 1 → 1.52`；`1.77s` 爆发（亮 `60ms`、退 `460ms`）；`2.13–2.67s` 回落 `150 → 10`（`power2.out`）；`3.03s` 起 `10 ↔ 16` 做 `5s` yoyo 呼吸；用户一滚动即 `tl.kill()` 交接 `← hero-intro.js:47-106`。反例：旧版 `SKILL.md:153` 与 `stage3d.css:8` 注释错写成 `-240/+40/+100/+180` 且把推镜错写成 `0–3.03s`，`details.js:97-107` 还重复写了一遍 `1.77s` 爆发 `← audit/v3/01-conflict-rulings.md C-13, C-14, C-16`。

12. **3D 舞台背景图严禁挂 `.hero__img`，阻断 `cinematic.js` 与 `stage3d.js` 抢 `transform`**
    `cinematic.js:113` 会对 `.hero__img` 直接写入 GSAP 内联 `transform: scale(1.22)`，瞬间抹掉 `stage3d.css:60` 背景层的 `translateZ(-240px)`，让 3D 舞台塌成 2D 平面 `← cinematic.js:106-113, stage3d.css:60`。反例：`portfolio.html:52, 400-404` 在 `[data-stage3d]` 里给背景图挂了 `.hero__img` 并同时加载两个脚本 `← audit/v3/01-conflict-rulings.md C-15`。

---

## 三 被推翻的旧说法（只列已死的，不列对的）

以下左栏均为旧稿死句原文，写作或审校时搜出任何一条即判定为违规复发 `← audit/v3/01-conflict-rulings.md`。

| 已死的旧说法原文（严禁再写） | 为什么死（致死原因与出处） |
|---|---|
| `skin painted with visible brushwork` / `brushwork visible on fabric, metal, glass and skin alike` | 脸是平涂，零笔触；写这句会让生图模型把人脸画满刀痕麻点 `← layers-breakdown.md §零 #5` |
| `single warm golden key light from upper left` | 漫射天光 / 摄影棚冷色环境光，无定向暖金硬光 `← corrections.md §三 #1, layers-breakdown.md §二` |
| `Caravaggio` / `chiaroscuro` / `tenebrism` | 会把画推向泛黄死黑的巴洛克宗教画 `← corrections.md #5, layers-breakdown.md §二` |
| `dark olive-brown #292919` / `乌菲兹暗夜绿棕` / `色相 40°–70°` | `#292919`（`60°`）是网页变量，不是插画暗部 `← corrections.md #1` |
| `electric violet #8051ff` / `#7126ff` 作为生图荧光 | `#8051ff`（`265°`）是网页按钮色，不是插画荧光 `← corrections.md #2` |
| `thick impasto` / `sfumato` / `同化四步` 用于手机/滑板/屏幕 | 道具是锐边贴纸，同化会糊成脏色块 `← corrections.md #3, audit/v3/01-conflict-rulings.md C-04` |
| `一次上传 3 张参考图（01 + 02 + 04）` | 只能挂 `1` 张，权重 `0.4–0.6`；挂多张会硬拼构图 `← corrections.md #9, prompt-recipes §二` |
| `左侧栏 20%（--sidebar-w: 20%）` | 录屏实测 `13.9%`（`1440` 下 `200px`），`20%` 会让左栏蠢宽 `← real-page.md §零 #3, §二` |
| `首屏全幅油画 + 巨字压左` | 首屏是中央 `1px` 细线框目录卡片（`340×464`），无巨字 `← real-page.md §零 #1, §三` |
| `章节巨字用 HWCigars 衬线 + smcp` | 巨字用 `NeueMontreal Bold` 无衬线，不开 `smcp` `← layout.css:158-170, real-page.md §五` |
| `90% 古典 + 10% 波普` / `荧光必须占 2%–5%` | `06` 群像荧光为 `0%`，允许零荧光 `← corrections.md #5, layers-breakdown.md §零 #15` |
| `深空背景画入金色几何网格线 + 星点` | `02` 背景是平滑深蓝黑净底，几何线是网页 `svg.davinci-lines` `← corrections.md #4` |
| `人物统一 rose blushing ivory skin` | 肤色分橙粉红润与苍白无血色两态，学者型禁红润 `← corrections.md #6` |
| `严禁纯白 #FFFFFF` | `01` 白袍亮部（`L>200`）占 `3.1%`，禁白会让白袍变脏灰 `← corrections.md #7` |
| `页面底色是 #f7f7ee` / `13 屏油画连着排` | 页面底色是 `#dcded1`，`#f7f7ee` 是卡片色；深色封面与浅色内容区交替出现 `← real-page.md §零 #2, #4` |
| `AI Studio 的 System Instructions 在左侧` | 实际在右侧面板 `← corrections.md #8` |
| `人物、物件、远景各自生图后硬叠三明治（人物悬空在远山中，道具飘在角落）` | 违反物理与空间因果，一眼像廉价拼贴；必须先立承托面、建筑框景与人-物真实接触（如敞廊石桌） `← V3.1 实战蒸馏` |
| `把「锐边贴纸」画成低精度剪贴画或高反光塑料 CGI 块` | 粗糙物件与古典油画格格不入；现代物件必须具备真实工业材质细节、准确透视与同源冷北光反射 `← V3.1 实战蒸馏` |
| `给整个人物加整体上下浮动充当呼吸` | 会把人物变成失重飘荡的气球；呼吸只允许锚定在桌面/腰线对胸腔做 `±0.65%` 微起伏 `← V3.1 实战蒸馏` |
| `在 JS 运行期用硬矩形遮罩裁切手指/关节，或用单色 fillRect 糊底图` | 一转就会「手指断了」并露出深灰横条；必须离线亚像素色键精抠整件 + 真实纹理补齐底图 + 袖口外沿遮片 `← V3.1 实战蒸馏` |
| `用非黑即白的硬二值阈值抠手，且只在纯白底上验收` | 必带锯齿灰边与桌面阴影毛刺；必须走连续柔边 Alpha + 去灰污，并叠在真实背景上放大 `200%` 验收 `← V3.1 实战蒸馏` |
| `切大片实心头发做大摆幅波浪，或给自带发光的道具叠一层常态可见按钮边框` | 头发狂甩破坏古典静谧感（仅最外沿薄纱允许 `±0.7–2.1px` 轻颤）；常态按钮框会叠出难看的双层椭圆环（热区须常态 `opacity: 0`） `← V3.1 实战蒸馏` |
| `画现代齐刘海波波头/网红美妆/CG 水光肌人物穿古装，或把「少年感」直译成「中性人物」` | 官方 8 幕全屏大人物全部为 15–16 世纪古典油画肖像（露平滑额头、极细淡拱眉、古典自然卷发、哑光平涂瓷釉脸），遮掉现代道具后必须能进 1520 年代美术馆展厅；性别与角色必须清晰锁死 `← V3.2 八幕大人物实测` |
| `深蓝黑/深青暗背景下仍给主角穿深青/深黑衣袍，或把荧光粉配荧光绿糊满整双球鞋` | 暗底配暗衣直接吞没轮廓（官方深暗背景章节全部以铅白长袍、雪白宽袖、白皮草或亮粉缎拉开 `≥45%` 明暗差）；球鞋等大面积穿戴须哑光沉稳色，荧光严格限 `0–2` 处小点缀（`≤3%–8%`） `← V3.2 八幕大人物实测` |
| `用扁平 CSS 色块伪造大角度翻转的笔记本（看不见键盘），或拿 2D 纸片滑板做 360° 翻转` | 平面方块斜视即退化为无键盘粗糙平板，2D 纸片转至 `90°` 消失成细线；大幅翻转与特写推近的现代工业件必须采用原生 WebGL 真 3D 立体结构（真实铝身厚度、立体键盘键帽、双翘板厚与桥架滚轮） `← V3.2 实战蒸馏` |
| `页面加载自动启播离线 Web Audio 432 Hz 合成背景音 / 粉红噪声长音，并挂 [data-sound-toggle]` | 纯振荡器与滤波噪声合成的持续低频底噪在真实耳机/外放里听感像**耳鸣嗡嗡叫**，严重破坏高级感与专注体验；V3.3 起彻底推翻旧声场规则，全库**默认全程静音**，仅做纯视觉自演（`verify.mjs` 硬拦截 7 强制封杀） `← V3.3 实战推翻` |
| `人物网格蒙皮连带扭动头部与颈部，或让腾跃/滑板动态角色穿紧身束腰死板衣裙、开场脚离板悬空平移` | 蒙皮波及头颈必现「脖子拧过头」的诡异畸变；束腰衣裙僵硬且开场离板穿帮；必须锁死头颈零形变刚体保护区、动态角色改用无束腰鼓风飞领宽袍、先查真实生物力学分段驱动（如滑板 6 阶段）并保持开场脚板接触 `← V3.3 实战蒸馏` |
| `角色正在使用的笔记本/工具开场就大尺寸正对观众，或把漂浮现代小物件排成规整一列/对称方阵` | 违背人物行为叙事且像货架陈列；开场使用中的工具须小比例贴手且面朝角色本人（切换下一幕翻转时再把屏幕掀向观众），补景零碎小物件须颜色鲜亮、非对称散点并穿插前中景深度 `← V3.3 实战蒸馏` |
| `在 WebGL 顶点着色器里算极细像素描边、多 Pass 切换不清理顶点属性，或粘性全屏画布不锁视口高度上限` | 顶点插值极易糊成整块宽粉边，状态污染会导致后续 Pass 渲染崩坏，分栏/嵌框下画布会被拉成长条畸变；必须放片元着色器逐像素算 `1.5–2px` 细边、切换着色器清理属性并显式声明精度、容器锁 `100svh / max-height: 100vh` 配 `ResizeObserver` `← V3.3 实战蒸馏` |
| `在 JS 中硬编码 SVG 命名空间字面量，或仅凭静态脚本过关就交付、不看真机截图` | 硬编码 `http://` 字面量会触发零外联脚本误报，仅跑静态检查会漏掉顶栏透字、侧栏底栏压住末章与窄屏畸变；创建 SVG 须读取现有节点 `namespaceURI`，全屏浮层 `z-index` 须高于顶栏、侧栏预留底距，交付前必走无头浏览器关键帧截图目检并清零临时图 `← V3.3 实战蒸馏` |

---

## 四 四大引擎真相（tech-truth 的实测部分）

基于本地 `589MB` 源码镜像（`1448` 条 `inventory.tsv` 资产记录、`13` 个 `*Scene.theatre-project-state.json`、`50` 个 `.glb`、`61` 段 `.mp4`、`41` 段 `.webm`、`114` 张 `.jpg`）反推实测 `← tech-truth.md §零, §六`：

### 1. 图层与三维资产引擎：预渲染分层贴图（`.ktx2`） + 实时 3D 现代小道具（`.glb`）
- **背景层是生成/素材库预渲染贴图**：清单中存在 `antonkolisnyk_painting_of_forest_and_flowers_by_Sandro_Botticel-optimized.ktx2`，证实背景油画源自生成图或素材库后期压制，而非从零三维建模 `← tech-truth.md §零`。全站 `13` 章每章均按 `*_bg`（纯背景，无人）与 `*_desktop`（纯主体，透明底）成对拆分（如 `EW26_Sidekick_bg_stars.ktx2`） `← corrections.md #4, §二, tech-truth.md §六`。
- **6 张原稿分块边缘能量与高饱和像素占比实测**：
  - 高饱和像素全图面积占比实测：`01-Hero` 为 `9.1%`（冰杯、购物袋、滑板三处荧光）、`02-Sidekick` 为 `1.3%`（仅半透紫眼罩）、`03-Marketing` 为 `13.9%`（右侧整块广告牌）、`04-Checkout` 为 `24.0%`（针织帽与卡片两处大块）、`05-Finance` 为 `40.8%`（粉绸袍自身高饱和，非荧光色）、`06-Operations` 为 `0%`（零荧光） `← layers-breakdown.md §一, corrections.md #5`。
  - `6×4` 网格分块边缘能量（数值越小越平涂，数值越大笔触越碎密）实测：`01-Hero` 天空区低至 `2.7–3.0`，树冠与前景花丛高达 `22.4–22.9`，其余人物与中景区块介于 `5.7–17.0`；`02-Sidekick` 深蓝黑背景净底仅 `5.4–7.6`，笔记本电脑与桌面物件高达 `16.4–18.2`，其余衣袍与中景区块介于 `6.4–13.4`；`06-Operations` 深青绿背景墙面低至 `0.9–2.3`（全库最平涂区域），人物胸前金棕织锦达 `12.5–12.9`（相差 `10` 倍以上），其余人物与桌面区块介于 `1.8–10.1` `← layers-breakdown.md §三`。
- **人物层是透明贴图 + 顶点波浪微变形**：人物背后完全透明，叠加轻微顶点波浪（状态机内有对象名，无 Shader 源码 `← tech-truth.md §零, §六 未实证`）。
- **现代道具是 `50` 个 `.glb` 真三维模型**：核对 `inventory.tsv` 实有 `skateboard.glb`、`iphone.glb`、`cardreader.glb`、`pos.glb`、`coin-reduced.glb`、`lute.glb`、`compass.glb`、`key.glb`、`ring.glb`、`duck.glb`、`scroll.glb`、`keyhole.glb`、`DancingRenaissanceShoppyv5_compressed.glb` 等 `50` 个模型 `← tech-truth.md §零`。它们占画面约 `40%`，在静止帧与推镜中用「锐边深描边透明贴纸 PNG」即可还原 `80%` 以上效果 `← tech-truth.md §三, §五`。
- **照明源自单一摄影棚 HDRI**：资产含 `studio_small_09_1k.pmrem.ktx2`（Poly Haven Studio Small 09, 1K）。`13` 个场景中仅 `4` 个有 `light-1` 对象，其余 `9` 个纯靠该环境图照明，这是全站「漫射无硬影、暗部偏冷青蓝」的物理根源 `← tech-truth.md §一 #2`。

### 2. Theatre.js 状态机引擎：`01_Hero` 的 `10` 秒实测关键帧（`3` 秒动作 + `7` 秒静止）
从 `HeroScene.theatre-project-state.json` 哈希通道反解的完整时间轴 `← tech-truth.md §二`：
- `0.00s – 3.03s`：全部动作在此窗口完成；`3.03s – 10.00s` 完全静止 `7` 秒（仅 `cube` 容器从 `t0 (-7.33, 4.16, -1.98)` 旋转 `2.43` 缓慢归零至 `t10`） `← tech-truth.md §二`。
- `0.37s / 0.50s`：`asset-1` 透明度上升淡入；`0.77s – 1.80s` `asset-1` 位移 `0 → 5.84`（向前扑） `← tech-truth.md §二`。
- `1.00s`：`asset-2`（第二人物）淡入完成；`1.00s – 2.23s` 第二通道 `0 → 1` `← tech-truth.md §二`。
- `1.00s – 1.13s`：`particles` 透明度达峰值 `0.84` 后回落 `← tech-truth.md §二`。
- `1.00s – 2.10s` & `1.17s – 2.30s`：背景 `landscape` 位移 `0 → 124`，缩放 `1 → 1.52`（同时人物仅放大 `1.08`，文字缩至 `0.96`；同一次推镜里背景比人物动得多，这才是 2.5D 景深的真实来源） `← tech-truth.md §二, §三 配方B`。
- `1.77s`（爆发点）：非粒子系统，而是三层错位衰减——`1.77s – 2.23s`（`0.46s` 内）`bloom-effect` 强度从 `4 → 1` 暴跌；`1.77s – 2.43s` `effects` 从 `3.5 → 1 → 0.2` 三级衰减；配合 `particles` 峰值 `0.84`（CSS 复现为上升 `60ms`、衰减 `460ms`） `← tech-truth.md §二, §三 配方A`。
- `camera` 三通道实测：`Z` 轴 `t0 = -18.57` → `t1 = 6.45` → `t1.8 = 10.34` → `t2.67 = -2.29`（`2.13s – 2.67s` 相机回落）；另一轴 `t0 = -21.80` → `t1 = 1.00` → `t1.8 = 1.00` → `t2.67 = -7.06`；视场 FOV `25 → 22` `← tech-truth.md §二`。
- `light-1`：**`0` 个关键帧**（物件动，光绝不动） `← tech-truth.md §二`。

### 3. 页面骨架与转场引擎：三层 DOM + 顶栏像素坐标 + 白闪叠化
- **固定层逐像素实测（基于 `1080` 宽基准换算）** `← real-page.md §一, §二`：
  - **顶部半透明导航栏（高 `50px–56px`）**：`x=0–25px` Shopify 单线袋标（约 `18px`）；`x=30–200px` `"Shopify Editions"`（常规 `#ffffff`）+ `"Winter '26"`（细体降透明）；`x=255–305px` `"Editions"` 下拉项（5 项入场延迟 `500/540/580/620/660ms` `← cinema.css:103-107`）；`x=375–430px` `"Search"` + 放大镜；右侧 `x=745px` `"Shopify.com"`；右侧 `x=820–930px` `"Start for free"` 胶囊按钮（高约 `30px`）。深色章顶栏底为 `rgba(0,0,0,0.15)`，浅色章为 `rgba(220,222,209,0.85)` + 模糊 `← real-page.md §二`。
  - **左侧 `13.9%` 罗马数字章节导航**：垂直居中偏下，`x=17px` 起左对齐章名，`x=145px` 右对齐罗马数字，每行高约 `28px`、字号约 `16px`。固定 `12` 章顺序（不含 `Hero`）：`I Sidekick`、`II Agentic`、`III Online`、`IV Retail`、`V Marketing`、`VI Checkout`、`VII Operations`、`VIII Shop app`、`IX B2B`、`X Finance`、`XI Shipping`、`XII Developer` `← real-page.md §二`。
  - **左上字标与左下版权**：左上三行 `"The Ren///ssance Edition"`（`26px` 粗体无衬线，行高 `1.0`，`"ai"` 替换为 `"///"`）；左下三行 `"© Shopify Inc / Terms of Service / Privacy Policy"`（`11px` 常规体，透明度 `0.7`） `← real-page.md §二`。
- **浅色内容层三种真实版式（底色 `#dcded1`，左界 `x=212` 即 `19.6%`，右界 `x=930` 即 `86%`）** `← real-page.md §四`：版式 A 两栏无框对比卡片（间距 `40px`，标题 `14px` 粗体无衬线 + 说明 `13px` + `12px` 白底 `3px` 圆角按钮）；版式 B 随机散落斜杠标签（`/monthly-snapshot` 等十余个 `13px–16px` `#5c5c4e` 衬线标签，右下压 `#2d2f22` 直角深色卡 `"/brand-image"` `30px` 衬线）；版式 C 三并排写实 SaaS 产品界面拼贴（边距 `20px`，原样截图不加滤镜） `← real-page.md §四`。
- **节奏分布（29 帧 × 4 秒 = `114` 秒录屏实测）**：`0:00–0:16` `Hero` + `Sidekick`（2 屏深色） → `0:20–0:40` 连续 `5` 屏 `#dcded1` 浅色内容区（全站最长浅色段） → `0:44–0:56` `Agentic` + `Online` 封面 → `1:00–1:12` 深色底产品界面拼贴 → `1:16–1:32` `Checkout` 封面 + 浅色内容 + `Shop app` 封面 → `1:36–1:44` `B2B` + `Finance` + `Shipping` 连续三屏油画封面（中间不插内容） → `1:48–1:56` `Developer` 素描纸面 + 浅色区 `← real-page.md §七`。
- **白闪转场**：`white-overlay`（`#f7f7ee` 全屏遮罩，`opacity: 0 → 1` `180ms`、`1 → 0` `260ms`）在峰值帧切换或叠化背景 `← tech-truth.md §三 配方C`。

### 4. 物理阻尼与粒子引擎：`Background-C8-YYu8Q.js` 常量
- Lenis 平滑滚动 `lerp: 0.1` `← tokens.css:149`；鼠标三层视差（背景 `-8px, -5px`、文字 `-3px, -2px`、人物 `+2px, +1px`）及云卡片视差 `-15px` 均用 `0.15` 阻尼 `← tech-truth.md §三 配方D, tokens.css:150-151`；云卡片鼠标斥力场半径 `300`、强度 `20` `← tokens.css:152-153`；浅色区噪点层 `opacity` 在 `0.03–0.04` 极缓变化，纸面区禁止加多余动画 `← tech-truth.md §三 配方E`。

---

## 五 十三场景的关键帧数据

以下 13 个场景的对象构成与时长全部读自 `*Scene.theatre-project-state.json` `← tech-truth.md §一, §四`。本节是 `03` 图层拆解与 `04` 镜头 rig 的唯一事实源，后文只写「见 `01` §五」。

| 序号 | 场景名 | 时长 | 对象数 | 状态机对象清单（原名照录） | 镜头与分层结构分类 |
|---|---|---|---|---|---|
| `01` | **Hero** | `10.00s` `← tech-truth.md §一` | `10` `← tech-truth.md §一` | `cube, asset-1, asset-2, asset-3, camera, light-1, landscape, bloom-effect, effects, particles` `← tech-truth.md §一` | **双人前扑 + `1.77s` 爆发**：全站最重一屏，`10` 对象齐动，`light-1` 零关键帧 `← tech-truth.md §二, §四` |
| `02` | **Sidekick** | `12.48s` `← tech-truth.md §一` | `11` `← tech-truth.md §一` | `cube, asset-1, asset-2, asset-3, stars, camera, particles, background, environment, white-overlay, effects` `← tech-truth.md §一` | **多资产深空 + 白闪转场**：全站对象最多、时长最长，含 `stars`、`particles` 与 `white-overlay` `← tech-truth.md §四` |
| `03` | **Agentic** | `10.00s` `← tech-truth.md §一` | `7` `← tech-truth.md §一` | `asset-1, asset-2, asset-3, asset-4, camera, key, effects` `← tech-truth.md §一` | **四层贴图 + 3D 钥匙**：`4` 层预渲染贴图叠加 `key.glb` 三维道具 `← tech-truth.md §零, §一` |
| `04` | **Online** | `10.00s` `← tech-truth.md §一` | `9` `← tech-truth.md §一` | `asset-1, asset-2, asset-3, camera, sidekick-background, online-background, code, white-overlay, effects` `← tech-truth.md §一` | **双背景交叉叠化 + 代码层**：同时挂两套背景与 `white-overlay`，从 `Sidekick` 叠化过渡 `← tech-truth.md §一 #5, §四` |
| `05` | **Retail** | `9.54s` `← tech-truth.md §一` | `10` `← tech-truth.md §一` | `cube, asset-1, asset-2, asset-3, asset-4, camera, retail-splat, environment, bloom-effect, effects` `← tech-truth.md §一` | **3D 高斯泼溅 + 爆光**：含 `retail-splat`（具体模型内容本地无文件 `← tech-truth.md §四, §六 未实证`） |
| `06` | **Marketing** | `10.00s` `← tech-truth.md §一` | `6` `← tech-truth.md §一` | `cube, asset-1[asset-3], camera, billboard, blur-intensity, effects` `← tech-truth.md §一` | **独立广告牌 + 动态模糊**：`billboard` 与 `blur-intensity` 独立成层（随滚动变清属推断 `← tech-truth.md §四, §六 未实证`） |
| `07` | **Checkout** | `10.00s` `← tech-truth.md §一` | `3` `← tech-truth.md §一` | `asset-1, camera, effects` `← tech-truth.md §一` | **单人半身 + 相机 + 特效**：无 `cube` 无灯，靠高精切层与相机推进成立 `← tech-truth.md §一` |
| `08` | **Operations** | `10.00s` `← tech-truth.md §一` | `6` `← tech-truth.md §一` | `cube, asset-1, asset-3, camera, light-1, effects` `← tech-truth.md §一` | **单层群像 + `cube` + 静态灯**：五人长桌群像（`0%` 荧光）配容器缓动与静态灯 `← tech-truth.md §四` |
| `09` | **ShopApp** | `10.00s` `← tech-truth.md §一` | `2` `← tech-truth.md §一` | `asset-1, camera` `← tech-truth.md §一` | **最简双对象（单人 + 相机）**：无灯无背景层无特效，纯靠画面与相机微推 `← tech-truth.md §四` |
| `10` | **B2B** | `10.00s` `← tech-truth.md §一` | `4` `← tech-truth.md §一` | `asset-1, asset-2, camera, light-1` `← tech-truth.md §一` | **双层资产 + 相机 + 静态灯**：建筑凉廊双人对称构图配静态灯 `← tech-truth.md §四` |
| `11` | **Finance** | `10.00s` `← tech-truth.md §一` | `2` `← tech-truth.md §一` | `asset-1, camera` `← tech-truth.md §一` | **最简双对象（单人 + 相机）**：与 `ShopApp` 同为最省结构，证实现场大量章节偏静态 `← tech-truth.md §四` |
| `12` | **Shipping** | `10.00s` `← tech-truth.md §一` | `5` `← tech-truth.md §一` | `asset-1, asset-2, asset-3, camera, key` `← tech-truth.md §一` | **三层贴图 + 3D 钥匙**：三层画面配 `key.glb`，顶部巨字被导航栏半遮 `← tech-truth.md §一, real-page.md §三` |
| `13` | **Developer** | `10.00s` `← tech-truth.md §一` | `7` `← tech-truth.md §一` | `cube, asset-1, asset-3, camera, light-1, scan-key, key` `← tech-truth.md §一` | **素描纸面 + 双钥匙扫描**：挂载 `scan-key` 与 `key` 两个三维道具及静态灯 `← tech-truth.md §一` |

方括号 `[x]` 表示 `x` 是前一项的替换态，计入同一层，不另算对象数 `← tech-truth.md §一`。

**五条硬规律** `← tech-truth.md §一`：1) 每章仅 `1` 个主资产 `asset-1`，其余为分层补充，全站无整图；2) `light-1` 仅出现 `4` 次（`Hero/B2B/Operations/Developer`），其余 `9` 章全靠 HDRI；3) 顶层 `bloom-effect` 出现 `2` 次（`Hero` / `Retail`）；经直接核查原始 `SidekickScene.theatre-project-state` JSON，`02 Sidekick` **不含**顶层 `bloom-effect` 对象（时间轴共 `11` 个对象），而是将 `"bloom": {"intensity": 0.2}` 静态嵌套于 `effects` 对象内 `← PROGRESS.md Q-01`；4) `particles` 仅出现 `2` 次（`Hero/Sidekick`）；5) `white-overlay` 仅出现 `2` 次（`Online/Sidekick`）。

---

## 六 证据分级规则

全库所有数值严格按以下五级标注 `← audit/v3/01-conflict-rulings.md`：

| 级 | 名称 | 什么算 | 例子 |
|---|---|---|---|
| `1` | 像素/逐帧实测 | 从 6 张原稿或 29 帧录屏采样得出的数值 | 暗部 `189°–224°`、荧光 `309°–339°`、底色 `#dcded1`、左栏 `13.9%` `← layers-breakdown.md §一, real-page.md §二` |
| `2` | 源码行号 | 能从 CSS/JS/JSON 源码里指出具体行号或键名 | `stage3d.css:60-63`、`hero-intro.js:68-95`、`tailwind-G-N6aznT.css` `.headline-1` `← layout.css:158-200` |
| `3` | 官方文档 | Shopify 或第三方库的公开说明文档 | GSAP `3.15.1` 的 `25` 个本地插件清单、Poly Haven `studio_small_09_1k` `← NOTICE.md:14` |
| `4` | 重参数化 | 为了在纯 CSS 3D 里能跑而从 Three.js 换算的值 | 四层 Z 轴 `-240px / 0px / +40px / +90px`、背景补偿倍率 `1.32` `← stage3d.css:11, 60-63` |
| `5` | 未实证 | 推断、估算、无本地二进制文件或仅有 `4` 帧依据 | 织物擦镜 `720ms`、`billboard` 滚动变清、`retail-splat` 内容、其余 `7` 章原稿像素 `← tech-truth.md §六 未实证` |

**使用规则：第 4 级必须标「重参数化，非原站坐标」，第 5 级必须标「未实证」，不许伪装成第 1 级。**

---

## 七 边界：这份文件不管什么

1. **不管生图 prompt 怎么拼、图层怎么抠、12 维怎么量**：归 `references/03-painting-and-layers.md`。
2. **不管完整 CSS 变量字典、响应式断点与 DOM 类名骨架**：归 `references/02-design-tokens.md`。
3. **不管 GSAP 动画挂载、六种运镜 rig 与 25 个插件加载顺序**：归 `references/04-motion-and-stage3d.md`。
4. **不管作品集/产品页/活动页怎么搭、四把尺子怎么验、新站怎么提 token**：归 `references/05-page-recipes-and-verification.md` 与 `references/06-extraction-and-skills-wiring.md`。
