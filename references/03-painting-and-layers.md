# 绘画与分层

本文件覆盖从空白画布到合格四层透明素材的全部绘画、提示词组装、分层抠图与像素验收流程。所有硬数值裁决以 `references/01-overturns-and-truth.md` 为最高依据；十六进制色码只存于 `01 §一`，本文件一律使用颜料名与色温词，绝不重复抄写色码 `← 01 §一, layers-breakdown.md §一`。

---

## 一 十二维测量卡

本节是全库画面质量与盲测验收的唯一尺子，`references/05-page-recipes-and-verification.md` 验收时直接按本节序号引用。具体原稿的分块边缘能量与高饱和像素实测数值见 `01 §四`，本节只给测量方法、容差判据与不合格症状 `← layers-breakdown.md §零, §三, decomposition-features.md §一`。

| # | 维度 | 量什么 | 怎么量 | 容差 / 判据 |
|---|---|---|---|---|
| 1 | **画幅** | 宽高比 | 读取生成原图像素宽高并计算比值 | `1.62:1` ±`0.02`（对应原稿 `2880×1780`） `← layers-breakdown.md §零` |
| 2 | **暗部色相** | 最暗 `20%` 像素的平均色相 | 对背景与阴影暗区采样转 HSL，看色相角 H 落点 | `189°–224°` 冷青蓝区间，出界即不合格 `← 01 §一, 6 张原稿像素采样` |
| 3 | **荧光** | 最高饱和 `1%` 像素的色相 + 全图高饱和点缀面积占比 | 吸取道具高光处色相并统计占全图面积比例 | 色相 `309°–339°`（洋红至玫红；单图允许辅以 `67°` 酸黄绿），面积占比 `0%–8%`（`0–2` 处） `← 01 §一, §二 #2` |
| 4 | **中性底** | 天空或室内墙面大面积平坦区的中位色 | 取背景无遮挡平坦区域中位明度与饱和度 | 明度 `40%–75%`（户外天空区），饱和度 `<12%`（极克制的灰蓝/粉灰云） `← layers-breakdown.md §一, §三` |
| 5 | **光源** | 画面是否存在单一方向硬投影 | 检查人物鼻下、下巴、领口与物体背面边缘 | 必须无硬投影；有硬边黑影即不合格 `← 01 §二 #5, corrections.md #5` |
| 6 | **皮肤笔触** | 人物脸部与手背的高频纹理密度 | 放大 `400%` 观察额头、脸颊与手背过渡 | 必须为 `0`（光滑平涂过渡） `← 01 §二 #4, 02/04/05/06 脸部特写` |
| 7 | **背景平涂** | 天空、远景或净底墙面的笔触与裂纹 | 放大 `400%` 检查大面积背景平坦区 | 必须为 `0` 笔触、`0` 裂纹 `← 01 §二 #4, §四` |
| 8 | **笔触允许区** | 哪些位置**应该**保留可辨识笔触 | 检查树冠叶片、头发丝、金属碎点高光与粗织物褶皱暗部 | 允许且应当存在，但严格限定在暗部与上述四类局部区域 `← layers-breakdown.md §三` |
| 9 | **道具边缘** | 现代道具轮廓与背景的过渡宽度 | 放大 `400%` 观察手机、滑板、卡片或广告牌外沿 | 硬切（贴纸感，可带极细不规则深色描边），不许柔边 `← 01 §二 #3, corrections.md #3` |
| 10 | **材质三态** | 皮肤光滑 / 织物树冠有笔触 / 道具锐边平涂 | 同屏对照脸部、衣袍褶皱与现代道具三处局部 | 三态必须同时成立，缺一则整幅画面垮掉 `← decomposition-features.md §二` |
| 11 | **构图原型** | 画面是否能归入 §五 的六种构图原型之一 | 对照 §五 的结构与层组合定义 | 必须能唯一归类到其中一种，禁止拼凑混搭 `← decomposition-features.md §〇` |
| 12 | **接地阴影** | 人物鞋底、桌脚或桌面静物与接触面交界处 | 检查物体贴地或贴桌面底边 | 有极柔和的接触暗部，无拖长或锐边投影 `← layers-breakdown.md §六, scene-production.md §3.1` |

**十二维逐项不合格症状**：1) 画幅做成方图/竖图，进横舞台后头脚被裁；2) 暗部发黄发棕（落入 `40°–70°` 暖棕）或死黑无冷倾向；3) 荧光变成大面积赛博紫（`265°`），或屏幕光染红手指、占比超标；4) 天空高饱和蔚蓝，或室内墙面过亮抢主体；5) 鼻下与下巴出现刀切硬黑影（单灯硬光），或脸部一侧死黑过曝；6) 脸部 `400%` 放大现油画刀痕、厚涂堆叠或麻点；7) 天空/墙面布满画布粗纹或龟裂纹；8) 全图塑料光面，衣袍、发丝与树冠毫无笔触；9) 现代道具边缘有 `3px` 以上柔化羽化，或刷满厚涂被油画同化；10) 三态退化成单一全图厚涂或全图塑料渲染；11) 人物居中站桩挡死左侧巨字，或把两种原型硬揉一图；12) 抠图脚底悬空发飘（缺接触暗），或拖出硬边长黑影。

---

## 二 图层拆解：四层怎么分

原站全站 `13` 个场景没有「一张带背景带人物的整图」，全部由 `*_bg`（纯背景，无人）与 `*_desktop`（纯主体，透明底）成对拆分后再叠加独立道具与动效层，完整对象清单见 `01 §五` `← corrections.md §二, tech-truth.md §六`。在纯前端网页中复刻时，按四层拆解并映射至 CSS 3D 透视空间（以下 `z` 值均为 **CSS 3D 空间重参数化值，非原站 Three.js 世界坐标** `← stage3d.css:11, 60-63`）：

| 层 | 放什么（内容定义） | 生成与准备方式 | 对应 `z` 值（重参数化，非原站坐标） | 常见错 |
|---|---|---|---|---|
| **bg 背景层** | 天空、远山、树林、古典室内净底墙面，严禁出现任何人物与现代道具 | 单独生成不透明横图（`1536×1024`），显式写 `no people, no foreground objects`，预留人物占位空区 `← scene-production.md §3.1` | `-240px`（额外乘 `scale(calc(1.32 * var(--bg-push, 1)))`） `← stage3d.css:60` | 背景图里顺手画了路人或半截道具，后期抠不掉；或画面太亮太暖，后期滤镜救不回来 `← scene-production.md §3.1` |
| **subject 主体层** | 单人或双人古典衣袍主体（含手持主物件），作为画面视觉锚点 | 单独生成竖图（`1024×1536`），经 `erase` 去水印 + `matting` 抠出真透明 Alpha 通道；网页中用 `object-fit: contain`（宽约 `44%`、高约 `78%`、右移 `margin-left: 54%` 给左侧巨字让位） `← stage3d.css:69-73, scene-production.md §2` | `0px` `← stage3d.css:61` | 轻信生图模型输出的假透明底（实为白底或棋盘格实色）；或用 `object-fit: cover` 裁掉人物头脚 `← scene-production.md §4, §5` |
| **fx 动效层** | 达芬奇神圣几何线（`svg.davinci-lines`）、漂浮柔光斑（`.stage3d__spark`）、闪光爆发与微尘 | **绝不通过生图模型画进油画里**，全部由网页 SVG 与 CSS 径向渐变动态生成，并设 `pointer-events: none` `← corrections.md #4, stage3d.css:80-102` | `+40px` `← stage3d.css:62` | 把金色几何网格线与静态粒子写进生图提示词，既显得像廉价科幻，又完全动不起来 `← corrections.md #4` |
| **prop 前景道具层** | 贴近镜头的独立现代小物或象征物（如悬浮滑板、手机、卡片、广告牌、仪盘） | 单独生成方图（`1024×1024`），保持锐边平涂贴纸质感并抠出真 Alpha；网页中缩小至约 `22%` 宽 / `34%` 高挂于右上角（`margin-left: 76%`），避免遮挡人物脸部；无合适道具时直接砍掉本层，只留三层，绝不凑数 `← stage3d.css:74-78, scene-production.md §2` | `+90px` `← stage3d.css:63` | 道具边缘被柔化成烟熏边导致跟背景糊在一起；或首屏近层尺寸太大，镜头一推近直接糊满全屏 `← scene-production.md §2` |

**层高是数学约束，不是审美选择。** 在 `perspective: 1000px` 的 CSS 3D 舞台中，`hero-intro.js` 首屏强推镜会把相机推到 `--cam-z: 150px` `← hero-intro.js:58`。如果照旧稿错误注释把 `subject` 挪到 `+40px`、把 `prop` 挪到 `+180px`，相机推进后道具层合成深度会达到 `150 + 180 = 330px`，在 `1000px` 视距下放大倍率飙升至 `1000 / (1000 - 330) = 1.49` 倍，前景道具会被剧烈放大并越界裁切穿帮；同时背景层 `-240px` 若不乘 `1.32` 基础补边系数，则会因缩小到 `0.806` 倍而在推镜摇晃时露黑边 `← audit/v3/01-conflict-rulings.md C-13, stage3d.css:60-63`。因此工程上真实可用的稳定层深组合只有 `-240px / 0px / +40px / +90px`。

**层间不是切开的，是同一光源下的。** 记住这条核心法则：**边缘可以硬，光必须同源。** 原站之所以把背景贴图、透明人物与三维道具叠在一起却像同一个世界，是因为 `13` 个场景统一由 `studio_small_09_1k.pmrem.ktx2` 摄影棚冷色漫射环境贴图照明 `← tech-truth.md §一 #2`。分层生图时，背景层、人物层、道具层必须在提示词首段写死完全一致的光源方向与冷色环境漫射描述；如果背景是阴天漫射冷光、人物却写了室内暖金侧光，合成后一眼就能看出是粗糙拼贴 `← layers-breakdown.md §六, scene-production.md §0`。

---

## 三 生图提示词：正负对照

**本节不写任何十六进制色码。** 原因有二：第一，`01 §一` 已经明确裁定生图提示词严禁直接书写十六进制码，必须转译为颜料名与色温词（直接写色码会让模型给出刺眼的平面色块 `← layers-breakdown.md §一, visual-dictionary.md §10`）；第二，色值只准有一个唯一出处（`01 §一`），本文件绝不重复抄表以防日后改色漏改 `← audit/v3/02-dedup-matrix.md D-01`。

### 3.1 核心正负短语对照表（直接复制使用）

| 要写进去（正向锚定短语） | 要写进负面词（彻底封杀） |
|---|---|
| `soft even diffused overcast daylight, cool ambient light from a large overhead diffuser` | `harsh directional light`, `dramatic chiaroscuro`, `tenebrism`, `Caravaggio`, `candlelit`, `golden hour` |
| `smooth poreless flat-shaded skin, zero brushwork on face and hands` | `visible brushwork on skin`, `impasto on face`, `textured skin`, `heavy brushstrokes on face` |
| `smooth flat sky, smooth matte wall, no canvas texture` | `craquelure`, `heavy canvas weave`, `aged crackle`, `oil paint cracks` |
| `crisp hard-edged modern object, sticker-like cut-out with a thin dark outline, casting no shadow of its own, lit by the same diffused light` | `sfumato`, `soft blended edges`, `painterly phone`, `thick impasto on modern prop`, `blurred modern object` |
| `deep blue-black ground, dark teal-blue wall, the shadow side turning cool blue-green` | `warm brown shadows`, `olive-brown ground`, `muddy yellow-brown`, `pure black void` |
| `fluorescent magenta-pink accents, sparing, one to two spots` | `electric violet`, `neon purple`, `cyberpunk glow`, `neon light spilling onto fingers` |
| `overcast studio lighting, minimal cast shadows, no nose shadow` | `single warm golden key light from upper left`, `strong rim light on outdoor figure` |
| `composed sixteenth-century portrait expression, eyes slightly off-axis, fine faint eyebrows` | `smiling`, `looking at camera`, `surprised`, `thick dark eyebrows`, `modern makeup` |

### 3.2 三条不可逾越的生图硬规则

1. **一次只挂 `1` 张参考图，权重锁死 `0.4–0.6`（`medium`）。** 挂 `2–3` 张会把多图元素硬拼；权重拉到 `high` 会变成数码照片 `← corrections.md #9, 00-看图说话.txt §六`。首句必加防抄构图句：`Match the exact painting technique, colour temperature, diffused lighting and flat-shaded skin of the reference image. Do NOT copy its composition, figures, props or layout. Produce a completely new scene in that same hand.`，负面词补 `identical composition to the reference, same pose as reference, copy of reference layout` `← 00-看图说话.txt §五, §六`。
2. **画风必须在生图步写对，不靠后期 CSS 罩染救场。** 错写 `airy sunlit stone courtyard, warm ivory` 生成暖米色底图后，后期任何遮罩都救不回冷青蓝暗场，只会把人物压脏 `← scene-production.md §3.1`。
3. **「透明底」绝不轻信模型。** 哪怕选了 `transparent`，多数模型仍输出白底或假棋盘格 RGB 图；主体与道具出图后必须走 `matting` 并用程序校验四角 `alpha == 0` `← scene-production.md §4`。

### 3.3 五段式提示词填空骨架

总长 `250–500` 英文词，按顺序组装；**古典主体写完后另起一段写现代道具的贴纸属性**，防止道具被染上油画笔触 `← layers-breakdown.md §六, prompt-recipes.md §二`：

```text
[光源与氛围] + [材质三态] + [主体与构图] + [点缀色与配额] + [画幅与景别]
```

- **`[光源与氛围]`**：阴天漫射光或大型顶置柔光箱漫射光 + 冷青蓝/深蓝黑暗部反射；禁写左上暖金单灯、烛光、戏剧明暗或纯黑底 `← corrections.md §三 #1`。
- **`[材质三态]`**：脸与天空墙面零笔触平涂 + 头发/织物褶皱/树冠/哑光颗粒金保留笔触 + 现代道具锐边深描边贴纸不投自身影；禁写全图厚涂、裂纹或道具柔边 `← 01 §二 #3, #4`。
- **`[主体与构图]`**：先定 §五 原型，再填八头身重量感、腿部姿态、五指分离抓握、不看镜头平静表情（极细淡眉 + 红润或苍白两态肤色）与古典面料；禁写 `smiling`、`looking at camera` 或画面渲染文字 `← visual-dictionary.md §2, §7.2`。
- **`[点缀色与配额]`**：洋红/玫红（或单处酸黄绿）仅配给 `0–2` 件现代道具，区分哑光织物与高亮塑料载体，总面积 `≤8%`（群像写 `no fluorescent accents`）；禁写电光紫与霓虹光晕 `← layers-breakdown.md §一, §二`。
- **`[画幅与景别]`**：横幅 `1.62:1`（或 `16:9`），人物占右三分之二、左三分之一留空给巨字，显式写 `do not render any letters or text` `← visual-dictionary.md §7.1, §7.2`。

### 3.4 清洗版英文高频词库与故障速查

以下词条已剔除 `01 §三` 全部死句，直接填入骨架 `← layers-breakdown.md §五, visual-dictionary.md §2, §3, §10`：

- **六种古典面料**（至少选一种面料 + 两种褶法）：
  - 丝绒：`heavy silk velvet, its nap catching a dull sheen rather than a highlight, the folds wide and soft with no sharp crease`
  - 缎面：`lustrous satin silk, wide soft highlights running along the crest of every fold`
  - 织锦/哑光颗粒金：`a gold-thread brocade, the metal reading as scattered points of light rather than a continuous shine, bordered with narrow gold-embroidered bands in dull matte gold`
  - 细褶棉麻：`coarse white linen, lead-white warm and slightly chalky, its folds dense and small, the shadow side turning cool blue-grey`
  - 蕾丝立领：`a fine white lace collar, its edge a row of tiny scallops`
  - 白皮草毛领：`a broad collar of white fur, the hairs drawn in single sweeping strokes, all falling the same direction`
- **古典剪裁与褶法**（至少选三条）：无拉链排扣靠系带固定（`single uncut length of cloth wrapped and bound with a knotted sash, no zippers, no buttons, no ribbed cuffs`）；衣宽达身宽 `1.6` 倍以上配悬链线大褶（`deep vertical catenary folds`）；关节内侧加密挤压褶（`tight compression folds at elbow and waist`）；领袖露浅色内衬；飘动必写风向（`caught in a wind from the left`） `← visual-dictionary.md §3.2, §3.3`。
- **姿态与手脚防翻车**：腿部防坐下加 `strictly not sitting, not cross-legged, not crouching`，站立用 `caught mid-stride, weight on the back leg` 或 `three-quarter standing turn, head turned back over shoulder`；鞋履必写（`soft leather low-cut shoes, creased at the toe` 或 `modern white leather sneakers with a thick sole, anachronism deliberate`）；手部防六指用 `hands anatomically resolved, five separated fingers with visible joints, gripping the object with real contact`；肤色按角色二选一（`soft orange-rose flush on cheekbone, extremely fine pale eyebrows` 或 `complexion pale to the point of bloodlessness, extremely fine faint eyebrows, composed unsmiling gaze off-axis`） `← visual-dictionary.md §2.2, §2.3, §3.4, corrections.md #6`。
- **翻车速查**：发黄发暖 → 删 `warm golden/amber/olive-brown`，改 `cool ambient light` + `deep blue-black / dark teal shadows`；脸现麻点刀痕 → 补 `smooth poreless flat-shaded skin, zero brushwork on face` + 负面 `impasto on face`；道具糊进油画 → 删 `sfumato`，将道具独立置末段加 `crisp cut-out edge with a thin dark outline, flat-shaded`；长出星点网格 → 删 `stars/geometric lines`（归网页 `fx` 层）；构图抄原稿 → 降回单张参考图 `0.4–0.6` 并补防抄句 `← corrections.md #1, #4, layers-breakdown.md §六, 00-看图说话.txt §六`。

---

## 四 分层生成 SOP（六步）

**核心铁律**：背景、主体、道具必须分三张独立生成，绝不从一张合成整图里硬切（合成图里的边缘与反光已经焊死，切开必留白边与空洞） `← scene-production.md §3`。动手前先告知用户生图成本：每张约 `5–10` credits，三层合计约 `15–30` credits `← scene-production.md §3.4`。

### 第一步：定构图原型与层清单
- **输入**：业务主题与页面章节角色（首屏 / 章节封面 / 产品发布 / 活动议程）。
- **动作**：从 §五 选唯一原型；按 §二 定层数（无合适现代小物直接砍 `prop`，留三层不凑数）；选 `1` 张最匹配的官方原稿作风格参考 `← scene-production.md §2, corrections.md #9`。
- **输出**：原型编号 + 单张参考图路径 + 生图清单。
- **失败长什么样**：未定原型就画，人物居中挡死左侧巨字，或硬塞无关悬浮道具凑层。

### 第二步：生成背景层（`bg`，不透明）
- **输入**：选定的冷青蓝背景世界（户外蓝灰天+深绿密林，或室内深蓝黑/深青绿净底墙）。
- **动作**：横向 `1536×1024`、`quality: high`、`background: opaque`；套用清洗版骨架：
  ```text
  Full-bleed painterly background plate for an editorial website hero,
  no people, no figures, no faces, no foreground objects, no text.
  [场景环境：深蓝黑/深青绿净墙 或 蓝灰平涂天空配粉白积云与深绿密林]
  Cool ambient overcast diffused daylight, deep cool teal-blue shadows,
  smooth flat sky and matte wall with zero brushwork and no craquelure,
  visible brushstrokes reserved strictly for distant foliage only.
  Wide 1.62:1 panoramic composition with open empty center-right space
  intended for a figure to be composited in front.
  ```
- **输出**：纯环境不透明底图（待去水印）。
- **失败长什么样**：混入路人或前景物；误写 `airy sunlit warm ivory` 导致暖米黄底，后期救不回 `← scene-production.md §3.1`。

### 第三步：生成主体层（`subject`）与道具层（`prop`）
- **输入**：人物描述（服饰、姿态、鞋、表情）与独立现代道具描述。
- **动作**：
  - **主体层**：竖向 `1024×1536`、`background: transparent`；光源与冷阴影描述必须与第二步**逐字一致**；脸手写 `smooth poreless flat-shaded skin, zero brushwork on face`，衣袍头发保留笔触，加 `single isolated full-body classical figure for compositing, no ground shadow, no frame, no text` `← scene-production.md §3.2`。
  - **道具层（若有）**：方形 `1024×1024`、`background: transparent`；**严禁照抄旧稿 `thick impasto brushstrokes`**，改用贴纸骨架：`Single isolated modern foreground prop object for compositing, crisp hard-edged flat-shaded cut-out sticker aesthetic with a thin dark outline, no oil-paint brushstrokes on the object, real sharp modern detail, lit by the same cool diffused overcast light, no ground shadow, clean isolated silhouette centered` `← audit/v3/01-conflict-rulings.md C-04, scene-production.md §3.3`。
- **输出**：原始生成图（带右下水印，尚无真 Alpha）。
- **失败长什么样**：主体与背景光向相反；赤脚或六指；现代道具被画成毛糙油画块。

### 第四步：串行去水印（`erase`）
- **输入**：第二、三步产出的 `2–3` 张原始图。
- **动作**：逐张调用 `erase`（`Remove the watermark text in the lower-right corner only. Keep the [figure/object/painting] intact.`）。**必须串行，严禁并发**（并发抢装依赖直接报 `DEPENDENCY_INSTALL_FAILED`）；遇 `HTTP 524` 不重提，用响应 `task_id` 轮询 `← scene-production.md §4`。
- **输出**：无水印中间图。
- **失败长什么样与补救**：**症状 1 · 水印留淡痕或补丁** → 擦除区域扩大至右下 `10%` 并强调 `fill seamlessly with surrounding flat cool dark teal background`，单张重跑 `erase`。

### 第五步：抠真 Alpha 通道（`matting` + 程序验四角）
- **输入**：去水印后的 `subject` 与 `prop` 图（`bg` 不抠）。
- **动作**：跑 `matting`（`Extract the [figure/object] with a clean transparent background.`），随后用程序校验 `RGBA` 与四角 `alpha == 0`（不凭肉眼看棋盘格）：
  ```python
  from PIL import Image
  im = Image.open(path)
  assert im.mode == "RGBA"
  a = im.getchannel("A")
  w, h = im.size
  for pt in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]:
      assert a.getpixel(pt) == 0, f"corner {pt} alpha != 0"
  ```
  通过后按语义名存入 `assets/layers/`，删掉所有带水印原图与中间文件 `← scene-production.md §4`。
- **输出**：四角 `alpha == 0` 的真透明 `PNG` 分层成品。
- **失败长什么样与补救**：
  - **症状 2 · 白底或假棋盘格冒充透明**：`im.mode` 为 `RGB` 或四角 `alpha == 255`，进舞台变白板。**补救**：拒用原图，重跑 `matting` 直至断言通过。
  - **症状 3 · 抠完边缘发白毛刺**：亮底残留半透明白边，叠深青蓝背景现亮框。**补救**：生图改用冷暗灰底再抠，或对 Alpha 内缩 `1px` 并对半透明边缘向冷暗色去污（defringe）。

### 第六步：合入四层舞台 + CSS 补接地接触暗
- **输入**：`assets/layers/` 成品图 + 网页 `fx` 层。
- **动作**：装入 `-240px / 0px / +40px / +90px` 四层结构（舞台与动效详见 `references/04-motion-and-stage3d.md`）。为抠出的 `subject` 与 `prop` 用 CSS `drop-shadow(10px 14px 18px rgba(12, 40, 45, 0.45))` 补冷暗接触暗，并删除旧版发黄的 `.stage3d__tone` 橄榄褐遮罩 `← audit/v3/01-conflict-rulings.md C-01, scene-production.md §3.1`。
- **输出**：四层响应单相机透视推拉、落地不发飘的成品舞台。
- **失败长什么样**：人物悬空发飘（漏接触暗）；整屏泛黄（未删 `.stage3d__tone`）；背景错挂 `.hero__img` 致 3D 塌陷 `← 01 §二 #12`。

---

## 五 六种构图原型

以下六种构图原型直接从 `01 §五` 的全部 `13` 个官方场景状态机归纳而来，严禁脱离 `13` 场景另行发明新原型；任何新页面生图前必须先在六种里选中一种，再按 `prompt-recipes.md` 的「古典油画基底 + 赛博文艺复兴现代覆盖层」两段法叠加提示词 `← 01 §五, decomposition-features.md §〇, prompt-recipes.md §〇, §二`。

| 原型编号与名称 | 一句话结构描述 | 适合什么内容场景 | 推荐层组合（对应 §二） | 覆盖的 `13` 场景原稿/官方实例（共 `13/13`） |
|---|---|---|---|---|
| **原型 1 · 双人相向（悬空对指 / 对称对峙）** | 两名古典服饰人物分居左右形成斜向或水平动线，中间留出视觉张力空隙，现代物件挂于手脚或居于两人之间 | 品牌首屏宣言、合作/双边平台（B2B）、双人联名活动 | `bg`（风景或建筑凉廊）+ `subject`（双人或双层 `asset-1/2`）+ `fx`（几何线/星尘）+ `prop`（滑板/袋/笔电） | **`Hero`**（双人悬浮指尖将触未触，见 `P01`）、**`B2B`**（古典凉廊双人隔银色笔记本相对） `← 01 §五, 00-看图说话.txt §三` |
| **原型 2 · 单人半身与举物肖像（含对称仪式变体）** | 单个主体占右侧三分之二（或深暗底居中对称上举），左侧或顶部中上留空给巨字压人，手持或佩戴 `1–2` 件锐边现代道具 | 个人作品集封面、AI 助手/核心功能主打、人物专访、金融/支付产品页 | `bg`（净底深蓝黑/山水/暮色暗林）+ `subject`（单人半身或七分身）+ `fx`（可选微尘）+ `prop`（手机/信用卡/笔电/悬浮金盘） | **`Sidekick`**（净底单人+桌面静物，见 `P02`）、**`Checkout`**（山水胸像举卡，见 `P04`）、**`Finance`**（居中对称举手机+悬浮金盘，见 `P05`）、**`ShopApp`**（绿袍少女+白马+紫色帽/手机） `← 01 §五, 00-看图说话.txt §二, §三` |
| **原型 3 · 风景画中画与独立大道具嵌入** | 以古典大风景或深度切片空间为主体（无人或人物极小退至角落），直接把现代大物件以锐边独立层插入画面 | 市场营销页、自动化工作流、物流供应链、没有人物模特的产品发布页 | `bg`（古典山水风景）+ `subject`（极小配角或 `asset-1..4` 景深切片）+ `prop`（锐边现代广告牌或独立三维钥匙大件） | **`Marketing`**（古典风景嵌入锐边 `billboard` 广告牌，见 `P03`）、**`Agentic`**（四层贴图+独立 `key` 道具）、**`Shipping`**（三层贴图+猎豹+独立 `key` 道具） `← 01 §五, layers-breakdown.md §六` |
| **原型 4 · 群像正面围桌（场景翻译，零荧光）** | 多人一字排开正面朝向观众，被前景长桌横切，所有人脸位于同一水平线，靠「把现代会议翻译成都铎宫廷群像」制造荒诞感，**不放现代道具、零荧光色** | 团队介绍、峰会/活动议程页、企业运营与治理章节 | `bg`（深青绿平涂净底墙）+ `subject`（多人等距正面长桌群像）+ 无 `prop` 层 | **`Operations`**（五人围坐红棕长桌都铎群像，见 `P06`） `← 01 §五, decomposition-features.md §一` |
| **原型 5 · 空间叙事与双背景叠化（含背影工作 / 实景空间）** | 主体背对镜头面向多屏代码或置身跨章节叠化空间，依靠前景飘动布幔、双背景交叉淡入或三维实景重建衔接上下文 | 线上工作流、工程开发展示、线下零售门店体验、跨章情绪转折屏 | 双 `bg`（`sidekick-bg` + `online-bg` 叠化）+ `subject`（背影人物与代码屏）+ `fx`（飘动红丝绒擦镜布幔 / 白闪） | **`Online`**（画师背影+双屏代码+红布幔+双背景叠化）、**`Retail`**（四层切片+`retail-splat` 3D 高斯泼溅实景，具体模型内容标「未实证」） `← 01 §五, 00-看图说话.txt §三, tech-truth.md §四` |
| **原型 6 · 纸面素描线稿（收尾去油画态）** | 褪去油画暗场与厚重彩绘，回归文艺复兴达芬奇式浅色纸面铅笔手稿与线条扫描，作为长页面进入浅色文档区的自然收尾 | 开发者文档入口、技术白皮书、页尾关于与附录章 | 浅色纸面 `bg` + 精细铅笔线稿 `subject` + 独立扫描道具（`scan-key` / `key`） | **`Developer`**（素描纸面+双钥匙扫描，紧接结尾浅色文字区） `← 01 §五, real-page.md §七` |

---

## 六 六张原稿的实测卡

以下六张卡片整合了 `2880×1780` 官方原稿的四维视觉扫描、移除测试（Removal Test，按 `1–5` 分评估抽掉该维度后画面是否垮掉）与像素实测结论 `← decomposition-features.md §一, §二, layers-breakdown.md §零, §一`。精确色码与分块边缘能量数据见 `01 §一` 与 `01 §四`，本节全部转写为颜料名与色温词。

### P01 Hero　2880×1780（1.62:1）
- **构图**：原型 1。白袍少女踩滑板在左、珊瑚红袍少年提袋在右，指尖将触未触（致敬《创世纪》），对角动线加中央留白；天空占上 `40%`，深绿密林压左右下半幅，前景花丛压底，右上悬蜂鸟 `← layers-breakdown.md §七, 00-看图说话.txt §二`。
- **主导维度**：**结构（`5/5`） + 材质（`5/5`）**；颜色 `4/5`，氛围 `3/5`。抽掉双人悬指图即垮；滑板油画化则穿越感消失 `← decomposition-features.md §一`。
- **关键色**：冷青蓝天 + 粉白积云 + 深墨绿林；铅白亚麻袍（暗部赭金）与砖红珊瑚袍；三处洋红至艳粉荧光（冰杯、滑板、购物袋，高饱和占 `9.1%`） `← 01 §一, §四`。
- **特殊点**：唯一三处荧光并存，两人穿现代白球鞋；原站循环视频 `V1`（`720×1280`，`4` 帧观察）显示主体稳住，流动的是衣袍、发丝、云、飞鸟与前景花丛 `← decomposition-features.md §三`。
- **推翻了什么**：推翻 `01 §三`「暗部橄榄棕」「道具油画同化」「禁纯白（本图白袍 `L>200` 占 `3.1%`）」「天空厚涂」 `← corrections.md #1, #3, #7`。

### P02 Sidekick　2880×1780（1.62:1）
- **构图**：原型 2。深色卷发男占右侧三分之二、视线斜瞥离轴，手搭左下银色笔电，桌面列红玻璃瓶、水果、蒜头、羽毛笔与书；纯净深蓝黑净底，左三分之一留空给巨字，是最佳单人练手模板 `← layers-breakdown.md §七, 00-看图说话.txt §二`。
- **主导维度**：**材质主导（`5/5`）**；结构 `4/5`，氛围 `4/5`，颜色 `3/5`。丝绒、哑光金绣、白蕾丝领、羽毛笔与陶瓶五材质同框 `← decomposition-features.md §一`。
- **关键色**：全库最暗深蓝黑净底（明度 `8%`）；暗葡萄紫红丝绒袍配碎点金绣；苍白无血色肤色；仅半透紫眼罩一处点缀（高饱和 `1.3%`，眼神透纱可见） `← 01 §一, §四, visual-dictionary.md §3.5`。
- **特殊点**：唯一带柔和左上室内侧光倾向（明暗交界极宽极柔，无硬线），且净底平滑无几何线 `← layers-breakdown.md §二`。
- **推翻了什么**：推翻 `01 §三`「深空画几何线星点」「统一红润肤色」「暗部橄榄棕」「荧光必占 `10%`」 `← corrections.md #1, #4, #5, #6`。

### P03 Marketing　2880×1780（1.62:1）
- **构图**：原型 3。向《蒙娜丽莎与湖泊》致敬的古典山水（大树、柏树、深青湖、雾蓝山），右下极小牧羊人与山羊；右上三分之一直立带支架的现代广告牌（占约 `15%`），牌面绘滑板者与酸黄绿 `"muse skate"` 字样 `← layers-breakdown.md §六, §七`。
- **主导维度**：**结构主导（`5/5`）**；材质 `4/5`，颜色 `3/5`，氛围 `3/5`。抽掉画中画广告牌只剩普通风景画 `← decomposition-features.md §一`。
- **关键色**：冷灰蓝天、深青湖、墨绿柏树与土黄小径；牌面深青蓝印刷底配全库唯一酸黄绿字（高饱和占 `13.9%`） `← 01 §一, §四`。
- **特殊点**：零人物主角；源码 `Marketing` 中广告牌是带 `blur-intensity` 的独立 `billboard` 对象（见 `01 §五`），底层实证「贴纸不融合」 `← layers-breakdown.md §六, tech-truth.md §四`。
- **推翻了什么**：推翻 `01 §三`「荧光只有电光紫（实存酸黄绿）」「道具柔边同化」「画面必须以人物为主角」 `← corrections.md #2, #3`。

### P04 Checkout　2880×1780（1.62:1）
- **构图**：原型 2（胸像版）。金红卷发少女偏右、平视不看镜头，戴罗纹毛线帽，穿墨绿方领袍、黑纱披肩与细金链，右手举玫红芯片卡位于左中正对观众 `← decomposition-features.md §一, 00-看图说话.txt §二`。
- **主导维度**：**颜色主导（`5/5`）**；材质 `4/5`，氛围 `3/5`，结构仅 `2/5`（常规胸像全靠玫红点缀与毛线罗纹对比撑场） `← decomposition-features.md §一`。
- **关键色**：蓝绿远山湖泊与暗绿枝叶冷底；灰绿古典袍；红润橙粉腮红肤色；高饱和玫红毛线帽（哑光低明度）与卡片（总高饱和占 `24.0%`） `← 01 §一, §四`。
- **特殊点**：证明织物/纸质荧光载体明度偏低（`0.65–0.67`），低于塑料/印刷袋（`0.92`） `← layers-breakdown.md §一`。
- **推翻了什么**：推翻 `01 §三`「皮肤见笔触」「荧光主打电光紫」「每张都靠强构图撑场（本图结构仅 `2/5`）」 `← decomposition-features.md §二`。

### P05 Finance　2880×1780（1.62:1）
- **构图**：原型 2（对称悬浮变体）。珠光玫瑰粉绸袍女子居中对称，白丝宽袖与两侧悬浮白袍张开，双手 V 形上举，右手举显绿余额界面的手机正对观众，头顶悬浮哑光金盘拱，左右暮色橄榄枝框景 `← decomposition-features.md §一, 00-看图说话.txt §二`。
- **主导维度**：**结构主导（`5/5`）**；颜色 `4/5`，氛围 `4/5`，材质 `3/5`。抽掉对称上举与金盘拱仪式感立刻瓦解 `← decomposition-features.md §一`。
- **关键色**：近黑微蓝/深墨绿暮色底；玫瑰粉缎袍（全图高饱和 `40.8%` 主因粉袍而非荧光）与纯白宽袖；哑光颗粒金盘；清晰绿色手机界面 `← 01 §一, §四, layers-breakdown.md §零 #12`。
- **特殊点**：手机带不规则深描边、灵动岛与模糊拉丁字，且**屏幕与金盘只自身发亮、不向手指外溢环境光** `← layers-breakdown.md §零 #10, #11, §二`。
- **推翻了什么**：推翻 `01 §三`「道具不能带真实 UI」「柔边同化」「亮金箔连续反光」「发光物必照亮手指」 `← layers-breakdown.md §零 #10-#12, §二`。

### P06 Operations　2880×1780（1.62:1）
- **构图**：原型 4。五名不同族裔盛装人物（黑丝绒蓝金绣男、白金袍青年、白皮草金棕袍男、白三角高帽苍白女、金网发饰深肤女）一字正面排开，被红棕木长桌横切，视线互不交流，背景为平滑深青绿净墙 `← decomposition-features.md §一, 00-看图说话.txt §二`。
- **主导维度**：**结构主导（`5/5`）**；材质 `4/5`，颜色 `3/5`，氛围 `3/5`。抽掉五人围桌，现代会议隐喻消失 `← decomposition-features.md §一`。
- **关键色**：全库最平涂深青绿墙（`189°`，边缘能量 `0.9–2.3`）；红棕桌、金棕织锦、墨蓝丝绒、白皮草与苍白肤色；**荧光严格为 `0%`** `← 01 §一, §四`。
- **特殊点**：唯一无现代道具、无荧光色的特例，靠现代会议翻译成都铎宫廷群像制造冲突（归因属分析推测 `← decomposition-features.md §四 未实证`）。
- **推翻了什么**：推翻 `01 §三`「每张必有 `10%` 波普 / `2%–5%` 荧光」「墙面有厚涂裂纹」「无现代道具不算本风格」 `← corrections.md #5, layers-breakdown.md §零 #7, #15`。

### 跨图共性与时间维度底线
六图四维均值与离散度实测：`材质` 均值 `4.2`（低离散）、`氛围` 均值 `3.3`（最低离散）、`结构` 均值 `4.3`（高离散）、`颜色` 均值 `3.7`（中离散） `← decomposition-features.md §二`：
1. **锁死「同一设计师」的唯一主轴是「材质三态」+「漫射冷底」**，不是固定构图或强塞荧光。
2. **现代冲突仅有两条路**：贴纸插入（`P01–P05`）或古典场景翻译（`P06`） `← decomposition-features.md §二 T6`。
3. **动态画面延展**：参考 `V1` 与 `V2`（Agentic 红金丝绒布幔扫入擦镜，各 `4` 帧观察 `← decomposition-features.md §三, §四 未实证`），主体骨架保持沉稳，动的是分层衣摆、云雾、前景花丛与擦镜遮罩（网页动效见 `references/04-motion-and-stage3d.md`）。

---

## 七 验收：怎么证明这张图对了

按以下**七步命令式顺序**逐项检查，不得跳步：

1. **采最暗 `20%` 像素** → 转 HSL 核对色相落在 `189°–224°` 冷青蓝（落入 `40°–70°` 暖棕立刻打回）。
2. **查荧光色相与面积** → 核对落在 `309°–339°`（或单处 `67°` 黄绿）、面积 `0%–8%`，无电光紫、无光晕染手。
3. **查鼻下、下巴与物体背面** → 确认无单一方向硬投影（有硬影即改回漫射光重出）。
4. **放大 `400%` 盯脸与天空/墙面** → 确认皮肤与背景平坦区 `0` 笔触、`0` 裂纹；树叶、头发、金属与粗织物暗部保留笔触。
5. **放大 `400%` 盯现代道具边缘** → 确认硬切贴纸感（可带极细深描边），无 `3px` 以上柔边或油画同化，光向与人物一致。
6. **逐项勾选下方打勾表**（分层图同步确认四角 `alpha == 0` 断言通过且底部已补冷暗接触暗）。
7. **执行 `3` 秒盲测** → 遮住 Logo 与文案，与 `assets/reference/` 对应原稿并排找人盲看；对方 `3` 秒内犹豫分不出即为通过，否则按 §3.4 翻车速查返工。

### 十二维打勾表（引用 §一）

| # | 维度 | 合格红线 | 结论 |
|---|---|---|---|
| 1 | 画幅 | `1.62:1` ±`0.02` | |
| 2 | 暗部色相 | `189°–224°` 冷青蓝 | |
| 3 | 荧光 | `309°–339°`（或 `67°`），`0%–8%` | |
| 4 | 中性底 | 明度 `40%–75%`、饱和度 `<12%` | |
| 5 | 光源 | 无单一方向硬投影 | |
| 6 | 皮肤笔触 | `400%` 放大为 `0` | |
| 7 | 背景平涂 | `400%` 放大 `0` 笔触、`0` 裂纹 | |
| 8 | 笔触允许区 | 仅限树叶/头发/金属/粗织物暗部 | |
| 9 | 道具边缘 | 硬切贴纸感，无柔边同化 | |
| 10 | 材质三态 | 皮肤光 / 织物有笔触 / 道具锐边齐备 | |
| 11 | 构图原型 | 唯一归入 §五 原型 1–6 之一 | |
| 12 | 接地阴影 | 柔和冷暗接触影，无硬投影边 | |
