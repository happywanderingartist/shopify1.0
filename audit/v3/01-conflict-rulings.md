# 表 A · 16 条冲突裁决表

> 裁决铁律：像素采样/逐帧录屏（第1级） > 源码行号（第2级） > 官方文档（第3级） > 推导（第4级）。绝不和稀泥。

---

## C-01 · 插画暗部色相 vs 网页深色变量

- **出处**：
  - **旧结论 / 错误方**（`V1 SKILL.md §3.1 / style-kit.md §1 F1 & §3.1 / scene-production.md §3.1 / stage3d.css:116`）：插画暗部是「乌菲兹暗夜绿棕」#292919（色相 40°–70° / 60° 橄榄褐），提示词写 dark olive-brown #292919
  - **实测 / 源码方**（`corrections.md #1 / layers-breakdown.md §一 / real-page.md §六 / visual-dictionary.md §1.1.6`）：6 张原稿像素实测暗部全是冷青蓝/深蓝黑（189°–224°）：#0c282d(189°)、#4a6873(196°)、#394b55(202°)、#141722(224°)。#292919 是网页 CSS 变量
- **裁决**：生图与插画暗部一律定为冷青蓝 189°–224°（严禁出现 #292919 / olive-brown）；#292919 仅限网页 CSS 墨色文字与深色底块使用
- **依据**：6 张 2880×1780 官方原稿像素采样（第 1 级证据）。两套色板混用会直接导致「生图发黄、网页发蓝」
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：删除 style-kit.md、scene-production.md §3.1 的 olive-brown 提示词；拔除 stage3d.css 的 .stage3d__tone 橄榄褐罩染层

---

## C-02 · 插画荧光色相（洋红玫红 vs 电光紫）

- **出处**：
  - **旧结论 / 错误方**（`V1 SKILL.md / style-kit.md §3.3 / visual-dictionary.md §0 & §1.3`）：荧光主打色是 #8051ff（265° 电光紫 electric violet）与 #d0ff00（柠檬酸绿）
  - **实测 / 源码方**（`corrections.md #2 / layers-breakdown.md §一 & §二 #12`）：原稿像素实测主荧光是洋红到玫红（#ff0cdb 309°、#ea135e 339°、#ae188a 314°），第二酸色是 03 牌面黄绿 #a1af33（67°）。#8051ff 是网页按钮激活色
- **裁决**：生图荧光色锁定洋红–玫红（309°–339°，主用 #ff0cdb / #ea135e）及黄绿 #a1af33（67°）；#8051ff 归入网页 CSS 按钮激活态（--c-accent）
- **依据**：01 购物袋/滑板、03 牌面、04 针织帽像素实测（第 1 级证据）。02 眼罩为局部半透紫纱（276°–315°），非通用高光色
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：将 visual-dictionary.md 中所有 electric violet 替换为 fluorescent magenta-pink (#ea135e / #ff0cdb)

---

## C-03 · 荧光色相区间微小度数差（309°–339° vs 314°–339°）

- **出处**：
  - **旧结论 / 错误方**（`layers-breakdown.md 第 58、240、320 行`）：文字概括写成「314°–339°（洋红→玫红）」，但同页第 47 行实测表格内明确列出 01 荧光袋亮面 #ff0cdb 为 H=309°
  - **实测 / 源码方**（`corrections.md #2（第 24 行）`）：直接引用 01 购物袋亮面实测值 `#ff0cdb`（309°）与 `#ea135e`（339°）
- **裁决**：统一修正为 309°–339°（含 #ff0cdb 的 309°、#ae188a 的 314°、#ea135e 的 339°）
- **依据**：RGB(#ff0cdb) 换算 HSL 色相精确值为 308.9°（四舍五入 309°）；layers-breakdown.md 概括时漏掉了表格第一行的 309°
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：在第三版《色彩双轨总表》与《推翻与实测》中统一写 309°–339°

---

## C-04 · 现代道具边缘质感（锐边贴纸 vs 油画厚涂同化）

- **出处**：
  - **旧结论 / 错误方**（`V1 SKILL.md §2 / style-kit.md F8 & 定律5 / visual-dictionary.md §4.1 / scene-production.md §3.3`）：现代道具必须「油画同化四步」、厚涂笔触、烟熏柔边 sfumato，严禁贴纸剪贴感
  - **实测 / 源码方**（`corrections.md #3 / layers-breakdown.md §二 #4 & §三`）：05 手机有一圈不规则深色描边、边缘锐利；01 滑板边缘干净利落无投影；03 广告牌在 Theatre.js 状态机中是独立对象带独立 blur-intensity
- **裁决**：现代道具定为「锐边平面贴纸 / 独立图层质感，受同一漫射光源照射」，严禁给手机/屏幕/滑板刷厚油画肌理
- **依据**：01/03/05 原稿局部放大像素检查 + Theatre.js 状态机独立对象属性（第 1 级 + 第 2 级双重证据）
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：彻底删除 visual-dictionary.md §4.1「同化四步」与 scene-production.md §3.3 的 impasto 道具提示词

---

## C-05 · 人物皮肤与背景笔触（零笔触平涂 vs 厚涂笔触）

- **出处**：
  - **旧结论 / 错误方**（`style-kit.md F3 & CONST-1/3 / visual-dictionary.md §1.4 & §6 & §8`）：skin painted with visible brushwork; brushwork visible on fabric, metal, glass and skin alike（全画面可见笔触与裂纹）
  - **实测 / 源码方**（`corrections.md #4 / layers-breakdown.md §二 #1, #2, #3`）：6 张原稿人物脸部皮肤、天空、背景墙面全部是光滑平涂（0 笔触、0 裂纹），笔触只存在于树叶和粗织物褶皱暗部
- **裁决**：脸部皮肤、天空、背景墙面强制平涂（smooth poreless airbrushed/flat-shaded skin, zero brushwork on face）；负面词必加 impasto on face, textured skin, craquelure
- **依据**：02/04/05/06 脸部特写像素实测（第 1 级证据）
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：重写 CONST-1 / CONST-3 材质锚定段，把「皮肤可见笔触」改为「皮肤零笔触光滑平涂」

---

## C-06 · 布光方式（柔和漫射光 vs 戏剧伦勃朗硬光/烛光）

- **出处**：
  - **旧结论 / 错误方**（`V1 SKILL.md / style-kit.md F2 & §7.2 CONST-2 / generator.md §1.2`）：Single warm golden key light from upper left, deep chiaroscuro, Caravaggio tenebrism（左上暖金单灯、卡拉瓦乔戏剧明暗、深黑死影）
  - **实测 / 源码方**（`corrections.md #5 / layers-breakdown.md §二 #8 / visual-dictionary.md §5.0`）：原稿全部是阴天散射天光或室内大面积漫射光，鼻下与下巴几乎无硬投影，暗部是冷青蓝环境色而非死黑阴影
- **裁决**：统一采用「柔和均匀漫射天光（soft even diffused overcast daylight, minimal cast shadows）」，禁用 Caravaggio / chiaroscuro / dramatic candlelit
- **依据**：6 张原稿光影采样（第 1 级证据）。写 chiaroscuro 会把画面直接推向泛黄巴洛克宗教画
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：替换 CONST-2 光影段；把 Caravaggio / tenebrism / chiaroscuro 移入负面词总表

---

## C-07 · 荧光配额与 06 号群像（是否每张图必须有荧光色）

- **出处**：
  - **旧结论 / 错误方**（`V1 SKILL.md §2 / style-kit.md F5 & 定律2 / decomposition-features.md §1`）：任何画面必须含 2%–5%（或 5%–10%）电光酸色刺穿，移除荧光色就不是 Shopify
  - **实测 / 源码方**（`corrections.md #4 / layers-breakdown.md §一(06) & §二 #13`）：06 群像全图 0% 荧光色（最高饱和度仅红木桌 63%），靠都铎王朝严肃正面排布与冷绿墙面成立。荧光配额是 0–2 处（0%–8%）
- **裁决**：荧光配额定为「0–2 处（占比 0%–8%）」，允许零荧光的古典群像或静物章节存在
- **依据**：06-Operations.jpg 全图像素统计（第 1 级证据）
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：修正配额公式为 0%–8%（0–2 处），解除「每张必加荧光」的死规定

---

## C-08 · 生图参考图挂载数量（单张 vs 3 张同传）

- **出处**：
  - **旧结论 / 错误方**（`style-kit.md §7.4 / visual-dictionary.md §9.2`）：推荐一次同时上传 3 张官方原稿（01 + 02 + 04）提取共性画风
  - **实测 / 源码方**（`corrections.md #9 / prompt-recipes.md §二 / 00-看图说话.txt §五`）：一次只能挂 1 张原稿（权重 0.4–0.6）。挂多张会导致模型把多图的构图、背景和人物硬拼在一起
- **裁决**：生图时严格规定「每次只挂 1 张最匹配构图原型的官方原稿，参考权重 0.4–0.6」
- **依据**：多模态生图实测验证（第 1 级实测结论）
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：删除 style-kit.md §7.4 与 visual-dictionary.md §9.2 的三图同传指令

---

## C-09 · 网页主底色（#dcded1 灰绿底 vs #f7f7ee 米白 vs #000000 纯黑）

- **出处**：
  - **旧结论 / 错误方**（`design-spec.md D1 / tokens.css:42-47 / layout.css:12`）：body 默认背景是 #000000（纯黑），浅色态是 #dcdcd0（--c-grey-light），主浅色是 #f7f7ee（--c-paper）
  - **实测 / 源码方**（`real-page.md §一 & §六 / corrections.md #6 / stage3d.css:23`）：29 帧真实网页录屏像素采样：全站超过一半时间主背景是冷灰绿 #dcded1（RGB 220,222,209）；#f7f7ee 只是卡片底色
- **裁决**：页面默认主底色定为 #dcded1（--c-page-bg）；#f7f7ee 严格命名为 --c-card-paper（卡片/浮层底色）；深色章节底色为 #292919 / #161c1e
- **依据**：29 帧官方录屏实测采样（第 1 级证据）优于 tailwind 构建产物静态未激活类名
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：更新 tokens.css 与 layout.css 的 body 默认背景色为 #dcded1

---

## C-10 · 左侧罗马数字导航栏宽度（13.9% vs 20%）

- **出处**：
  - **旧结论 / 错误方**（`design-spec.md D5 / blueprint.md §1 / tokens.css:94 / style-kit.md §5.1 / STYLE-CONTRACT.md §1`）：左侧栏宽度 20%（对应源码 aside.w-1/5），右侧内容区 80%
  - **实测 / 源码方**（`real-page.md §二 / corrections.md #7`）：1440×900 录屏实测：左侧导航文字+罗马数字+右边界实测仅占 ~200px = 13.9% 视口宽（因内部 nav 有 max-width 与内边距收窄），右侧有效舞台占 86.1%
- **裁决**：视觉与布局导航列有效宽度锁定为 13.9%（1440 视口下 200px），右侧主内容区 86.1%
- **依据**：1440×900 真实渲染帧像素测量（第 1 级证据）。直接按 20% 切栏会让左栏显得蠢宽，违反尺子 3（站内可用）
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：在 tokens.css 中将 --sidebar-w 从 20% 改为 13.9%，--content-w 改为 86.1%

---

## C-11 · 首屏第一眼结构（细线框目录卡片 vs 巨字压左海报）

- **出处**：
  - **旧结论 / 错误方**（`layout.css:466 / page-recipes.md §2.2 / portfolio.html`）：原站首屏 = 全幅油画 + 巨字标题压左 + 侧栏浮在画上
  - **实测 / 源码方**（`real-page.md §三（f0001–f0002） / corrections.md #8 / tech-truth.md §4.1`）：首屏（0–1s）画面中央是 340×464 的 1px 细线框目录卡片（The Renaissance Edition + I–XII 居中目录），根本没有巨型标题；滚出首屏后目录解锁飞向左侧栏，第二章封面才出现巨字
- **裁决**：站内级复刻（尺子 3）首屏必须带中央 1px 细线框目录卡片（svg.davinci-lines 340×464），滚动后解锁停靠左侧 13.9% 导航栏；巨字封面从章节切换开始
- **依据**：录屏 f0001–f0004 逐帧实测 + index.pretty.html Loader 状态机（第 1 级 + 第 2 级双重证据）
- **层级**：第1级·像素/逐帧实测
- **逐条执行动作**：修正 layout.css 注释与 starter 首屏结构，提供标准中央细线框目录卡解锁组件

---

## C-12 · 章节巨字字体族（NeueMontreal 无粗衬线 vs HWCigars 衬线）

- **出处**：
  - **旧结论 / 错误方**（`STYLE-CONTRACT.md §2 / theme-baseline.css:40 / style-kit.md §4.1 / stage3d.css:137`）：章节巨字标题（.ChapterTitle / .stage3d__title）使用 HWCigars 衬线体，甚至开启 smcp 小型大写字母
  - **实测 / 源码方**（`design-spec.md D2 & D3 / blueprint.md §2.3 / layout.css:158 / real-page.md §三 & §五`）：源码 .headline-1 到 .headline-6 全部是 NeueMontreal Bold (700) 无衬线体（巨字 120–220px，line-height 0.9，letter-spacing -0.03em）；HWCigars 仅用于 .narrative-1..4 叙事段落与罗马数字
- **裁决**：章节巨字（.headline-1..3）100% 锁定 NeueMontreal Bold 无衬线体（严禁开 smcp）；HWCigars 仅用于叙事导语（.narrative-*）与罗马数字序号
- **依据**：tailwind-G-N6aznT.css 源码 `.headline-1` 声明与 29 帧截图实测（第 1 级 + 第 2 级证据）
- **层级**：第2级·源码行号
- **逐条执行动作**：废弃 STYLE-CONTRACT.md §2 与 theme-baseline.css 的错误字体映射；修复 stage3d.css:137 的 .stage3d__title 字体为 var(--f-sans)

---

## C-13 · 真 3D 舞台四层 translateZ 数值（两套 Z 值打架）

- **出处**：
  - **旧结论 / 错误方**（`SKILL.md 第 153 行 / stage3d.css 第 8 行文件头注释`）：四层 translateZ 为：bg -240px / subject +40px / fx +100px / prop +180px
  - **实测 / 源码方**（`stage3d.css 第 60–63 行真实代码 / motion-playbook.md §5 表格（第 264–269 行）`）：实际生效 CSS 为：bg -240px（乘 scale(calc(1.32 * var(--bg-push, 1)))）/ subject 0px / fx +40px / prop +90px
- **裁决**：以真实运行且不穿帮的 CSS 代码为准：bg -240px / subject 0px / fx +40px / prop +90px（并明确标注为「CSS 3D 空间重参数化值，非原站 Three.js 原始坐标」）
- **依据**：stage3d.css:60-63 实际生效代码。若 subject 放 +40、prop 放 +180，在 camera z 推到 +150 时（合计 z=330，perspective 1000）道具会过度放大裁切穿帮
- **层级**：代码Bug裁决
- **逐条执行动作**：修正 SKILL.md 与 stage3d.css 第 8 行注释，统一为 -240px / 0px / +40px / +90px

---

## C-14 · 首屏自动序列（hero-intro.js）时间轴与呼吸幅度描述失真

- **出处**：
  - **旧结论 / 错误方**（`SKILL.md 第 46 行 & 第 157 行`）：概括写成「0–3.03s 强推镜 + 1.77s 爆发，3.03s 后 ±6px 呼吸（围绕 16 做 ±6）」
  - **实测 / 源码方**（`assets/starter/js/hero-intro.js 第 47–99 行源码 / tech-truth.md §3.1`）：0–1.80s 强推镜（cam.z -60→150, power2.in；0.50–1.80s bgPush 1→1.52）；1.77s 爆发（60ms 亮 / 460ms 退）；2.13–2.67s 回落（cam.z 150→10, power2.out）；3.03s 起 cam.z 从 10 到 16 做 5s yoyo 循环（幅度 6px，中心 13px）
- **裁决**：严格按 hero-intro.js 源码逐段标注：0–1.80s 强推(-60→150) → 1.77s 爆发 → 2.13–2.67s 回落(150→10) → 3.03s 起呼吸(10↔16，5s yoyo)
- **依据**：hero-intro.js 真实执行代码与 tech-truth.md 01_Hero.json 关键帧（第 2 级源码证据）
- **层级**：第2级·源码行号
- **逐条执行动作**：修正 SKILL.md 与 motion-playbook.md 的二手概括，消除「0–3.03s 一直在推镜」的误导

---

## C-15 · 三套舞台动效脚本混用打架（stage3d.js vs cinematic.js vs details.js）

- **出处**：
  - **旧结论 / 错误方**（`assets/starter/portfolio.html 第 48–60 行 & 第 400–404 行`）：portfolio.html 在同一个 .hero 里既写了 data-stage3d（4层真3D舞台），又给背景图加了 class="hero__img"，并在底部同时加载 cinematic.js + stage3d.js + hero-intro.js + details.js
  - **实测 / 源码方**（`motion-playbook.md §5d（第 344 行） / cinematic.js 第 106–113 行`）：motion-playbook.md 明令禁止：「和 .cine-stage / cinematic.js 的 hero 推镜不要同时作用同一舞台」；因为 cinematic.js 会抓 .hero__img 写 transform: scale(1.22)，直接覆盖 stage3d.css 背景层的 translateZ(-240px) scale(calc(1.32 * var(--bg-push)))！
- **裁决**：修复 starter 代码 Bug：3D 舞台背景图禁止挂 .hero__img 类名（改用 .stage3d__img），且 cinematic.js 检测到 [data-stage3d] 时自动跳过 dolly 推镜
- **依据**：CSS transform 覆盖机制：GSAP 内联 transform 会直接抹掉 stage3d.css 的 translateZ(-240px)，导致 3D 景深瞬间塌成 2D 平面
- **层级**：代码Bug裁决
- **逐条执行动作**：在第三版 starter 中移除 portfolio.html 背景图的 .hero__img 类名，并在 cinematic.js 中加入 if (hero.querySelector("[data-stage3d]")) return 保护锁

---

## C-16 · 1.77s 爆发点实现重复（hero-intro.js vs details.js）

- **出处**：
  - **旧结论 / 错误方**（`assets/starter/js/hero-intro.js 第 69–82 行`）：在 [data-stage3d][data-autoplay] 上实现 1.77s 爆发：操控 .stage3d__flash (0→1→0) 与 .stage3d__spark (scale 1.9→1)
  - **实测 / 源码方**（`assets/starter/js/details.js 第 97–107 行`）：在 [data-shot] 上又实现了一遍 1.77s 爆发：操控 [data-burst-dust] 与 [data-burst-fog]，但 starter 两个 HTML 里根本没写 data-burst-* 元素
- **裁决**：首屏 3D 舞台统一由 hero-intro.js 负责 1.77s 爆发；details.js 仅保留章节切换遮罩（擦镜）与 60×3 粒子流，删除未使用的重复 1.77s 镜头代码
- **依据**：避免同一时间轴节点存在两套冗余脚本与孤儿 CSS 选择器
- **层级**：代码Bug裁决
- **逐条执行动作**：精简 details.js 与 details.css，把镜头推拉统一收归 stage3d.js + hero-intro.js
