import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  GitMerge,
  Trash2,
  Eye,
  Compass,
  Ruler,
  Search,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface ConflictItem {
  id: string;
  topic: string;
  sideA: { file: string; claim: string };
  sideB: { file: string; claim: string };
  verdict: string;
  basis: string;
  tier: '第1级·像素/逐帧实测' | '第2级·源码行号' | '代码Bug裁决';
  action: string;
}

const CONFLICTS: ConflictItem[] = [
  {
    id: 'C-01',
    topic: '插画暗部色相 vs 网页深色变量',
    sideA: {
      file: 'V1 SKILL.md §3.1 / style-kit.md §1 F1 & §3.1 / scene-production.md §3.1 / stage3d.css:116',
      claim: '插画暗部是「乌菲兹暗夜绿棕」#292919（色相 40°–70° / 60° 橄榄褐），提示词写 dark olive-brown #292919'
    },
    sideB: {
      file: 'corrections.md #1 / layers-breakdown.md §一 / real-page.md §六 / visual-dictionary.md §1.1.6',
      claim: '6 张原稿像素实测暗部全是冷青蓝/深蓝黑（189°–224°）：#0c282d(189°)、#4a6873(196°)、#394b55(202°)、#141722(224°)。#292919 是网页 CSS 变量'
    },
    verdict: '生图与插画暗部一律定为冷青蓝 189°–224°（严禁出现 #292919 / olive-brown）；#292919 仅限网页 CSS 墨色文字与深色底块使用',
    basis: '6 张 2880×1780 官方原稿像素采样（第 1 级证据）。两套色板混用会直接导致「生图发黄、网页发蓝」',
    tier: '第1级·像素/逐帧实测',
    action: '删除 style-kit.md、scene-production.md §3.1 的 olive-brown 提示词；拔除 stage3d.css 的 .stage3d__tone 橄榄褐罩染层'
  },
  {
    id: 'C-02',
    topic: '插画荧光色相（洋红玫红 vs 电光紫）',
    sideA: {
      file: 'V1 SKILL.md / style-kit.md §3.3 / visual-dictionary.md §0 & §1.3',
      claim: '荧光主打色是 #8051ff（265° 电光紫 electric violet）与 #d0ff00（柠檬酸绿）'
    },
    sideB: {
      file: 'corrections.md #2 / layers-breakdown.md §一 & §二 #12',
      claim: '原稿像素实测主荧光是洋红到玫红（#ff0cdb 309°、#ea135e 339°、#ae188a 314°），第二酸色是 03 牌面黄绿 #a1af33（67°）。#8051ff 是网页按钮激活色'
    },
    verdict: '生图荧光色锁定洋红–玫红（309°–339°，主用 #ff0cdb / #ea135e）及黄绿 #a1af33（67°）；#8051ff 归入网页 CSS 按钮激活态（--c-accent）',
    basis: '01 购物袋/滑板、03 牌面、04 针织帽像素实测（第 1 级证据）。02 眼罩为局部半透紫纱（276°–315°），非通用高光色',
    tier: '第1级·像素/逐帧实测',
    action: '将 visual-dictionary.md 中所有 electric violet 替换为 fluorescent magenta-pink (#ea135e / #ff0cdb)'
  },
  {
    id: 'C-03',
    topic: '荧光色相区间微小度数差（309°–339° vs 314°–339°）',
    sideA: {
      file: 'layers-breakdown.md 第 58、240、320 行',
      claim: '文字概括写成「314°–339°（洋红→玫红）」，但同页第 47 行实测表格内明确列出 01 荧光袋亮面 #ff0cdb 为 H=309°'
    },
    sideB: {
      file: 'corrections.md #2（第 24 行）',
      claim: '直接引用 01 购物袋亮面实测值 `#ff0cdb`（309°）与 `#ea135e`（339°）'
    },
    verdict: '统一修正为 309°–339°（含 #ff0cdb 的 309°、#ae188a 的 314°、#ea135e 的 339°）',
    basis: 'RGB(#ff0cdb) 换算 HSL 色相精确值为 308.9°（四舍五入 309°）；layers-breakdown.md 概括时漏掉了表格第一行的 309°',
    tier: '第1级·像素/逐帧实测',
    action: '在第三版《色彩双轨总表》与《推翻与实测》中统一写 309°–339°'
  },
  {
    id: 'C-04',
    topic: '现代道具边缘质感（锐边贴纸 vs 油画厚涂同化）',
    sideA: {
      file: 'V1 SKILL.md §2 / style-kit.md F8 & 定律5 / visual-dictionary.md §4.1 / scene-production.md §3.3',
      claim: '现代道具必须「油画同化四步」、厚涂笔触、烟熏柔边 sfumato，严禁贴纸剪贴感'
    },
    sideB: {
      file: 'corrections.md #3 / layers-breakdown.md §二 #4 & §三',
      claim: '05 手机有一圈不规则深色描边、边缘锐利；01 滑板边缘干净利落无投影；03 广告牌在 Theatre.js 状态机中是独立对象带独立 blur-intensity'
    },
    verdict: '现代道具定为「锐边平面贴纸 / 独立图层质感，受同一漫射光源照射」，严禁给手机/屏幕/滑板刷厚油画肌理',
    basis: '01/03/05 原稿局部放大像素检查 + Theatre.js 状态机独立对象属性（第 1 级 + 第 2 级双重证据）',
    tier: '第1级·像素/逐帧实测',
    action: '彻底删除 visual-dictionary.md §4.1「同化四步」与 scene-production.md §3.3 的 impasto 道具提示词'
  },
  {
    id: 'C-05',
    topic: '人物皮肤与背景笔触（零笔触平涂 vs 厚涂笔触）',
    sideA: {
      file: 'style-kit.md F3 & CONST-1/3 / visual-dictionary.md §1.4 & §6 & §8',
      claim: 'skin painted with visible brushwork; brushwork visible on fabric, metal, glass and skin alike（全画面可见笔触与裂纹）'
    },
    sideB: {
      file: 'corrections.md #4 / layers-breakdown.md §二 #1, #2, #3',
      claim: '6 张原稿人物脸部皮肤、天空、背景墙面全部是光滑平涂（0 笔触、0 裂纹），笔触只存在于树叶和粗织物褶皱暗部'
    },
    verdict: '脸部皮肤、天空、背景墙面强制平涂（smooth poreless airbrushed/flat-shaded skin, zero brushwork on face）；负面词必加 impasto on face, textured skin, craquelure',
    basis: '02/04/05/06 脸部特写像素实测（第 1 级证据）',
    tier: '第1级·像素/逐帧实测',
    action: '重写 CONST-1 / CONST-3 材质锚定段，把「皮肤可见笔触」改为「皮肤零笔触光滑平涂」'
  },
  {
    id: 'C-06',
    topic: '布光方式（柔和漫射光 vs 戏剧伦勃朗硬光/烛光）',
    sideA: {
      file: 'V1 SKILL.md / style-kit.md F2 & §7.2 CONST-2 / generator.md §1.2',
      claim: 'Single warm golden key light from upper left, deep chiaroscuro, Caravaggio tenebrism（左上暖金单灯、卡拉瓦乔戏剧明暗、深黑死影）'
    },
    sideB: {
      file: 'corrections.md #5 / layers-breakdown.md §二 #8 / visual-dictionary.md §5.0',
      claim: '原稿全部是阴天散射天光或室内大面积漫射光，鼻下与下巴几乎无硬投影，暗部是冷青蓝环境色而非死黑阴影'
    },
    verdict: '统一采用「柔和均匀漫射天光（soft even diffused overcast daylight, minimal cast shadows）」，禁用 Caravaggio / chiaroscuro / dramatic candlelit',
    basis: '6 张原稿光影采样（第 1 级证据）。写 chiaroscuro 会把画面直接推向泛黄巴洛克宗教画',
    tier: '第1级·像素/逐帧实测',
    action: '替换 CONST-2 光影段；把 Caravaggio / tenebrism / chiaroscuro 移入负面词总表'
  },
  {
    id: 'C-07',
    topic: '荧光配额与 06 号群像（是否每张图必须有荧光色）',
    sideA: {
      file: 'V1 SKILL.md §2 / style-kit.md F5 & 定律2 / decomposition-features.md §1',
      claim: '任何画面必须含 2%–5%（或 5%–10%）电光酸色刺穿，移除荧光色就不是 Shopify'
    },
    sideB: {
      file: 'corrections.md #4 / layers-breakdown.md §一(06) & §二 #13',
      claim: '06 群像全图 0% 荧光色（最高饱和度仅红木桌 63%），靠都铎王朝严肃正面排布与冷绿墙面成立。荧光配额是 0–2 处（0%–8%）'
    },
    verdict: '荧光配额定为「0–2 处（占比 0%–8%）」，允许零荧光的古典群像或静物章节存在',
    basis: '06-Operations.jpg 全图像素统计（第 1 级证据）',
    tier: '第1级·像素/逐帧实测',
    action: '修正配额公式为 0%–8%（0–2 处），解除「每张必加荧光」的死规定'
  },
  {
    id: 'C-08',
    topic: '生图参考图挂载数量（单张 vs 3 张同传）',
    sideA: {
      file: 'style-kit.md §7.4 / visual-dictionary.md §9.2',
      claim: '推荐一次同时上传 3 张官方原稿（01 + 02 + 04）提取共性画风'
    },
    sideB: {
      file: 'corrections.md #9 / prompt-recipes.md §二 / 00-看图说话.txt §五',
      claim: '一次只能挂 1 张原稿（权重 0.4–0.6）。挂多张会导致模型把多图的构图、背景和人物硬拼在一起'
    },
    verdict: '生图时严格规定「每次只挂 1 张最匹配构图原型的官方原稿，参考权重 0.4–0.6」',
    basis: '多模态生图实测验证（第 1 级实测结论）',
    tier: '第1级·像素/逐帧实测',
    action: '删除 style-kit.md §7.4 与 visual-dictionary.md §9.2 的三图同传指令'
  },
  {
    id: 'C-09',
    topic: '网页主底色（#dcded1 灰绿底 vs #f7f7ee 米白 vs #000000 纯黑）',
    sideA: {
      file: 'design-spec.md D1 / tokens.css:42-47 / layout.css:12',
      claim: 'body 默认背景是 #000000（纯黑），浅色态是 #dcdcd0（--c-grey-light），主浅色是 #f7f7ee（--c-paper）'
    },
    sideB: {
      file: 'real-page.md §一 & §六 / corrections.md #6 / stage3d.css:23',
      claim: '29 帧真实网页录屏像素采样：全站超过一半时间主背景是冷灰绿 #dcded1（RGB 220,222,209）；#f7f7ee 只是卡片底色'
    },
    verdict: '页面默认主底色定为 #dcded1（--c-page-bg）；#f7f7ee 严格命名为 --c-card-paper（卡片/浮层底色）；深色章节底色为 #292919 / #161c1e',
    basis: '29 帧官方录屏实测采样（第 1 级证据）优于 tailwind 构建产物静态未激活类名',
    tier: '第1级·像素/逐帧实测',
    action: '更新 tokens.css 与 layout.css 的 body 默认背景色为 #dcded1'
  },
  {
    id: 'C-10',
    topic: '左侧罗马数字导航栏宽度（13.9% vs 20%）',
    sideA: {
      file: 'design-spec.md D5 / blueprint.md §1 / tokens.css:94 / style-kit.md §5.1 / STYLE-CONTRACT.md §1',
      claim: '左侧栏宽度 20%（对应源码 aside.w-1/5），右侧内容区 80%'
    },
    sideB: {
      file: 'real-page.md §二 / corrections.md #7',
      claim: '1440×900 录屏实测：左侧导航文字+罗马数字+右边界实测仅占 ~200px = 13.9% 视口宽（因内部 nav 有 max-width 与内边距收窄），右侧有效舞台占 86.1%'
    },
    verdict: '视觉与布局导航列有效宽度锁定为 13.9%（1440 视口下 200px），右侧主内容区 86.1%',
    basis: '1440×900 真实渲染帧像素测量（第 1 级证据）。直接按 20% 切栏会让左栏显得蠢宽，违反尺子 3（站内可用）',
    tier: '第1级·像素/逐帧实测',
    action: '在 tokens.css 中将 --sidebar-w 从 20% 改为 13.9%，--content-w 改为 86.1%'
  },
  {
    id: 'C-11',
    topic: '首屏第一眼结构（细线框目录卡片 vs 巨字压左海报）',
    sideA: {
      file: 'layout.css:466 / page-recipes.md §2.2 / portfolio.html',
      claim: '原站首屏 = 全幅油画 + 巨字标题压左 + 侧栏浮在画上'
    },
    sideB: {
      file: 'real-page.md §三（f0001–f0002） / corrections.md #8 / tech-truth.md §4.1',
      claim: '首屏（0–1s）画面中央是 340×464 的 1px 细线框目录卡片（The Renaissance Edition + I–XII 居中目录），根本没有巨型标题；滚出首屏后目录解锁飞向左侧栏，第二章封面才出现巨字'
    },
    verdict: '站内级复刻（尺子 3）首屏必须带中央 1px 细线框目录卡片（svg.davinci-lines 340×464），滚动后解锁停靠左侧 13.9% 导航栏；巨字封面从章节切换开始',
    basis: '录屏 f0001–f0004 逐帧实测 + index.pretty.html Loader 状态机（第 1 级 + 第 2 级双重证据）',
    tier: '第1级·像素/逐帧实测',
    action: '修正 layout.css 注释与 starter 首屏结构，提供标准中央细线框目录卡解锁组件'
  },
  {
    id: 'C-12',
    topic: '章节巨字字体族（NeueMontreal 无粗衬线 vs HWCigars 衬线）',
    sideA: {
      file: 'STYLE-CONTRACT.md §2 / theme-baseline.css:40 / style-kit.md §4.1 / stage3d.css:137',
      claim: '章节巨字标题（.ChapterTitle / .stage3d__title）使用 HWCigars 衬线体，甚至开启 smcp 小型大写字母'
    },
    sideB: {
      file: 'design-spec.md D2 & D3 / blueprint.md §2.3 / layout.css:158 / real-page.md §三 & §五',
      claim: '源码 .headline-1 到 .headline-6 全部是 NeueMontreal Bold (700) 无衬线体（巨字 120–220px，line-height 0.9，letter-spacing -0.03em）；HWCigars 仅用于 .narrative-1..4 叙事段落与罗马数字'
    },
    verdict: '章节巨字（.headline-1..3）100% 锁定 NeueMontreal Bold 无衬线体（严禁开 smcp）；HWCigars 仅用于叙事导语（.narrative-*）与罗马数字序号',
    basis: 'tailwind-G-N6aznT.css 源码 `.headline-1` 声明与 29 帧截图实测（第 1 级 + 第 2 级证据）',
    tier: '第2级·源码行号',
    action: '废弃 STYLE-CONTRACT.md §2 与 theme-baseline.css 的错误字体映射；修复 stage3d.css:137 的 .stage3d__title 字体为 var(--f-sans)'
  },
  {
    id: 'C-13',
    topic: '真 3D 舞台四层 translateZ 数值（两套 Z 值打架）',
    sideA: {
      file: 'SKILL.md 第 153 行 / stage3d.css 第 8 行文件头注释',
      claim: '四层 translateZ 为：bg -240px / subject +40px / fx +100px / prop +180px'
    },
    sideB: {
      file: 'stage3d.css 第 60–63 行真实代码 / motion-playbook.md §5 表格（第 264–269 行）',
      claim: '实际生效 CSS 为：bg -240px（乘 scale(calc(1.32 * var(--bg-push, 1)))）/ subject 0px / fx +40px / prop +90px'
    },
    verdict: '以真实运行且不穿帮的 CSS 代码为准：bg -240px / subject 0px / fx +40px / prop +90px（并明确标注为「CSS 3D 空间重参数化值，非原站 Three.js 原始坐标」）',
    basis: 'stage3d.css:60-63 实际生效代码。若 subject 放 +40、prop 放 +180，在 camera z 推到 +150 时（合计 z=330，perspective 1000）道具会过度放大裁切穿帮',
    tier: '代码Bug裁决',
    action: '修正 SKILL.md 与 stage3d.css 第 8 行注释，统一为 -240px / 0px / +40px / +90px'
  },
  {
    id: 'C-14',
    topic: '首屏自动序列（hero-intro.js）时间轴与呼吸幅度描述失真',
    sideA: {
      file: 'SKILL.md 第 46 行 & 第 157 行',
      claim: '概括写成「0–3.03s 强推镜 + 1.77s 爆发，3.03s 后 ±6px 呼吸（围绕 16 做 ±6）」'
    },
    sideB: {
      file: 'assets/starter/js/hero-intro.js 第 47–99 行源码 / tech-truth.md §3.1',
      claim: '0–1.80s 强推镜（cam.z -60→150, power2.in；0.50–1.80s bgPush 1→1.52）；1.77s 爆发（60ms 亮 / 460ms 退）；2.13–2.67s 回落（cam.z 150→10, power2.out）；3.03s 起 cam.z 从 10 到 16 做 5s yoyo 循环（幅度 6px，中心 13px）'
    },
    verdict: '严格按 hero-intro.js 源码逐段标注：0–1.80s 强推(-60→150) → 1.77s 爆发 → 2.13–2.67s 回落(150→10) → 3.03s 起呼吸(10↔16，5s yoyo)',
    basis: 'hero-intro.js 真实执行代码与 tech-truth.md 01_Hero.json 关键帧（第 2 级源码证据）',
    tier: '第2级·源码行号',
    action: '修正 SKILL.md 与 motion-playbook.md 的二手概括，消除「0–3.03s 一直在推镜」的误导'
  },
  {
    id: 'C-15',
    topic: '三套舞台动效脚本混用打架（stage3d.js vs cinematic.js vs details.js）',
    sideA: {
      file: 'assets/starter/portfolio.html 第 48–60 行 & 第 400–404 行',
      claim: 'portfolio.html 在同一个 .hero 里既写了 data-stage3d（4层真3D舞台），又给背景图加了 class="hero__img"，并在底部同时加载 cinematic.js + stage3d.js + hero-intro.js + details.js'
    },
    sideB: {
      file: 'motion-playbook.md §5d（第 344 行） / cinematic.js 第 106–113 行',
      claim: 'motion-playbook.md 明令禁止：「和 .cine-stage / cinematic.js 的 hero 推镜不要同时作用同一舞台」；因为 cinematic.js 会抓 .hero__img 写 transform: scale(1.22)，直接覆盖 stage3d.css 背景层的 translateZ(-240px) scale(calc(1.32 * var(--bg-push)))！'
    },
    verdict: '修复 starter 代码 Bug：3D 舞台背景图禁止挂 .hero__img 类名（改用 .stage3d__img），且 cinematic.js 检测到 [data-stage3d] 时自动跳过 dolly 推镜',
    basis: 'CSS transform 覆盖机制：GSAP 内联 transform 会直接抹掉 stage3d.css 的 translateZ(-240px)，导致 3D 景深瞬间塌成 2D 平面',
    tier: '代码Bug裁决',
    action: '在第三版 starter 中移除 portfolio.html 背景图的 .hero__img 类名，并在 cinematic.js 中加入 if (hero.querySelector("[data-stage3d]")) return 保护锁'
  },
  {
    id: 'C-16',
    topic: '1.77s 爆发点实现重复（hero-intro.js vs details.js）',
    sideA: {
      file: 'assets/starter/js/hero-intro.js 第 69–82 行',
      claim: '在 [data-stage3d][data-autoplay] 上实现 1.77s 爆发：操控 .stage3d__flash (0→1→0) 与 .stage3d__spark (scale 1.9→1)'
    },
    sideB: {
      file: 'assets/starter/js/details.js 第 97–107 行',
      claim: '在 [data-shot] 上又实现了一遍 1.77s 爆发：操控 [data-burst-dust] 与 [data-burst-fog]，但 starter 两个 HTML 里根本没写 data-burst-* 元素'
    },
    verdict: '首屏 3D 舞台统一由 hero-intro.js 负责 1.77s 爆发；details.js 仅保留章节切换遮罩（擦镜）与 60×3 粒子流，删除未使用的重复 1.77s 镜头代码',
    basis: '避免同一时间轴节点存在两套冗余脚本与孤儿 CSS 选择器',
    tier: '代码Bug裁决',
    action: '精简 details.js 与 details.css，把镜头推拉统一收归 stage3d.js + hero-intro.js'
  }
];

interface DedupItem {
  metric: string;
  authoritativeValue: string;
  v3SingleOwner: string;
  previousDuplicates: string[];
  evidenceLabel: '像素实测' | '源码行号' | '重参数化';
}

const DEDUP_TABLE: DedupItem[] = [
  {
    metric: '插画暗部色板（4 个核心色值 + 色相区间）',
    authoritativeValue: '189°–224° 冷青蓝：#0c282d (189°), #4a6873 (196°), #394b55 (202°), #141722 (224°)',
    v3SingleOwner: 'references/01-overturns-and-truth.md §1（生图词库仅做引用）',
    previousDuplicates: ['corrections.md', 'layers-breakdown.md', 'real-page.md', 'visual-dictionary.md', 'style-kit.md (错写为#292919)', 'scene-production.md (错写为#292919)'],
    evidenceLabel: '像素实测'
  },
  {
    metric: '插画荧光色板与配额',
    authoritativeValue: '洋红–玫红 309°–339° (#ff0cdb, #ae188a, #ea135e) + 黄绿 67° (#a1af33)；每图 0–2 处（0%–8%）',
    v3SingleOwner: 'references/01-overturns-and-truth.md §1',
    previousDuplicates: ['corrections.md', 'layers-breakdown.md', 'visual-dictionary.md', 'style-kit.md (错写为#8051ff)'],
    evidenceLabel: '像素实测'
  },
  {
    metric: '网页 CSS 色板（底色 / 卡片 / 墨色 / 灰阶 / 激活色）',
    authoritativeValue: '页面主底 #dcded1 | 卡片 #f7f7ee | 墨色 #292919 | 灰阶 #dcdcd0 / #909083 / #5c5c4e | 按钮激活紫 #8051ff',
    v3SingleOwner: 'assets/starter/css/tokens.css（文档端仅在 references/02-design-tokens.md 列表）',
    previousDuplicates: ['tokens.css', 'theme-baseline.css', 'design-spec.md', 'real-page.md', 'blueprint.md', 'style-kit.md'],
    evidenceLabel: '像素实测'
  },
  {
    metric: '四族字体分工与 12 级字阶 clamp 公式',
    authoritativeValue: 'NeueMontreal Bold (.headline-1..6, .bodycopy-1..2) | HWCigars (.narrative-1..4, 罗马数字) | ImperialScript (Drop Cap) | Inter-Variable (UI 小字)',
    v3SingleOwner: 'assets/starter/css/tokens.css + layout.css（文档端归入 references/02-design-tokens.md）',
    previousDuplicates: ['design-spec.md', 'blueprint.md', 'layout.css', 'theme-baseline.css (错)', 'STYLE-CONTRACT.md (错)', 'style-kit.md'],
    evidenceLabel: '源码行号'
  },
  {
    metric: '容器、栅格、左侧导航宽度与 9 级断点',
    authoritativeValue: 'max-w 105rem (1680px) | 12 列 gap clamp(12px,1vw,16px) | 左侧栏 13.9% (1440 下 200px) | 右主区 86.1%',
    v3SingleOwner: 'references/02-design-tokens.md + assets/starter/css/tokens.css',
    previousDuplicates: ['real-page.md (13.9%)', 'design-spec.md (20%)', 'blueprint.md (20%)', 'tokens.css (20%)', 'STYLE-CONTRACT.md (20%)'],
    evidenceLabel: '像素实测'
  },
  {
    metric: '10 条 CSS 贝塞尔曲线与 16 项过渡时长',
    authoritativeValue: '--e-back cubic-bezier(.34,1.56,.64,1), --e-scroll cubic-bezier(.41,.19,.13,.95), --e-complete cubic-bezier(.72,.16,.19,.96) 等 10 条',
    v3SingleOwner: 'assets/starter/css/tokens.css（文档端仅在 references/04-motion-and-stage3d.md 索引）',
    previousDuplicates: ['tokens.css', 'design-spec.md D10', 'gsap-library.md §3', 'motion-playbook.md', 'style-kit.md §6'],
    evidenceLabel: '源码行号'
  },
  {
    metric: '真 3D 舞台四层 translateZ 与背景缩放系数',
    authoritativeValue: 'perspective: 1000px | bg: -240px * scale(1.32 * var(--bg-push,1)) | subject: 0px | fx: +40px | prop: +90px',
    v3SingleOwner: 'assets/starter/css/stage3d.css + references/04-motion-and-stage3d.md',
    previousDuplicates: ['stage3d.css (文件头注释与代码自相矛盾)', 'SKILL.md (错写为-240/+40/+100/+180)', 'motion-playbook.md §5'],
    evidenceLabel: '重参数化'
  },
  {
    metric: '首屏 10 秒自动序列（hero-intro.js）关键帧参数',
    authoritativeValue: 'delay 0.35s | 0–1.80s cam.z -60→150 (power2.in), 0.50–1.80s bgPush 1→1.52 | 1.77s flash 60ms亮/460ms退 | 2.13–2.67s 回落 150→10 | 3.03s 起 10↔16 (5s yoyo)',
    v3SingleOwner: 'assets/starter/js/hero-intro.js + references/04-motion-and-stage3d.md',
    previousDuplicates: ['hero-intro.js', 'tech-truth.md §3.1', 'motion-playbook.md §1', 'SKILL.md (二手转述失真)', 'details.js (重复实现)'],
    evidenceLabel: '源码行号'
  },
  {
    metric: 'Canvas 2D 粒子流与鼠标斥力场物理常量',
    authoritativeValue: '60 条流线 × 3 粒子 = 180 粒子 | mouseRepulsionDist: 300 | mouseRepulsionStrength: 20 | damping: 0.15 | Lenis lerp: 0.1',
    v3SingleOwner: 'assets/starter/css/tokens.css + references/04-motion-and-stage3d.md',
    previousDuplicates: ['tech-truth.md §2.3', 'design-spec.md D10', 'tokens.css', 'motion.js', 'details.js'],
    evidenceLabel: '源码行号'
  }
];

interface MigrationItem {
  oldFile: string;
  oldSize: string;
  status: '保留并重写' | '合并收编' | '彻底删除';
  newLocation: string;
  reason: string;
}

const MIGRATION_MAP: MigrationItem[] = [
  {
    oldFile: 'SKILL.md',
    oldSize: '30.2 KB',
    status: '保留并重写',
    newLocation: 'SKILL.md',
    reason: '重写第一屏：把「三份推翻层最高优先级」与「生图/网页双轨色板隔离表」置顶；修正 Z 轴深度与 3.03s 自动序列的二手转述错误；接入 11 个本机/第三方 skill 分工表'
  },
  {
    oldFile: 'references/corrections.md',
    oldSize: '6.6 KB',
    status: '合并收编',
    newLocation: 'references/01-overturns-and-truth.md',
    reason: '与 layers-breakdown.md、real-page.md、tech-truth.md 合并为第三版最高权威宪章《01-overturns-and-truth.md》（推翻与实测总表），消除三处分散查阅'
  },
  {
    oldFile: 'references/layers-breakdown.md',
    oldSize: '20.4 KB',
    status: '合并收编',
    newLocation: 'references/01-overturns-and-truth.md + references/03-painting-and-layers.md',
    reason: '15 条像素实测推翻并入《01-overturns-and-truth.md》；6 张原稿的 12 维像素测量卡与 4 层拆解规范并入《03-painting-and-layers.md》'
  },
  {
    oldFile: 'references/real-page.md',
    oldSize: '13.8 KB',
    status: '合并收编',
    newLocation: 'references/01-overturns-and-truth.md + references/02-design-tokens.md',
    reason: '29 帧录屏实测的 #dcded1 底色、13.9% 导航、首屏细线框目录卡片直接升格为《02-design-tokens.md》唯一正式标准，不再作为「补丁文件」存在'
  },
  {
    oldFile: 'references/tech-truth.md',
    oldSize: '13.0 KB',
    status: '合并收编',
    newLocation: 'references/01-overturns-and-truth.md',
    reason: '四大引擎真相与 13 个 Theatre.js 状态机关键帧数据并入《01-overturns-and-truth.md》第二章，作为动效与图层的底层源码证据'
  },
  {
    oldFile: 'references/design-spec.md',
    oldSize: '19.1 KB',
    status: '保留并重写',
    newLocation: 'references/02-design-tokens.md',
    reason: '整合 blueprint.md 的 DOM 契约，并用 real-page.md 的实测值（#dcded1 主底色、13.9% 侧栏）修正 D1 与 D5，成为网页端唯一令牌字典'
  },
  {
    oldFile: 'references/blueprint.md',
    oldSize: '20.8 KB',
    status: '合并收编',
    newLocation: 'references/02-design-tokens.md + references/05-page-recipes-and- verification.md',
    reason: 'DOM data-* 契约与 CSS 类名对照表并入《02-design-tokens.md》；组件骨架与资产命名规范并入《05-page-recipes-and-verification.md》'
  },
  {
    oldFile: 'references/STYLE-CONTRACT.md',
    oldSize: '2.8 KB',
    status: '彻底删除',
    newLocation: '（删除，正确约束并入 SKILL.md 第一屏）',
    reason: '其中 2 条硬约束是错的（把侧栏写成 20%、把巨字标题写成 HWCigars smcp 衬线体），保留会误导生成'
  },
  {
    oldFile: 'references/theme-baseline.css',
    oldSize: '3.4 KB',
    status: '彻底删除',
    newLocation: '（删除，统一使用 assets/starter/css/tokens.css）',
    reason: '与 starter/css/tokens.css 重复且含错误定义（将 --font-display 设为 HWCigars 衬线体，漏掉 #dcded1 主底色）'
  },
  {
    oldFile: 'references/style-kit.md',
    oldSize: '93.8 KB',
    status: '彻底删除',
    newLocation: '（删除，未推翻的构图蓄力/留白准则提炼入 03-painting-and-layers.md）',
    reason: '全库最大污染源（93.8KB 几乎全是第一版未修正的旧结论：#292919 暗部、#8051ff 生图、道具油画同化、皮肤可见笔触、左上暖金戏剧光、20% 侧栏、三图同传），与三份推翻层处处互斥'
  },
  {
    oldFile: 'references/visual-dictionary.md',
    oldSize: '32.2 KB',
    status: '保留并重写',
    newLocation: 'references/03-painting-and-layers.md',
    reason: '彻底清洗内部精神分裂：删除 §4.1「道具同化四步」、删除 CONST-1/3 的「皮肤可见笔触」、将 electric violet 改为洋红玫红 #ea135e/#ff0cdb，与 scene-production、prompt-recipes 合成为统一的生图与分层手册'
  },
  {
    oldFile: 'references/scene-production.md',
    oldSize: '11.7 KB',
    status: '合并收编',
    newLocation: 'references/03-painting-and-layers.md',
    reason: '修正 §3.1 背景提示词里的 olive-brown #292919 与 §3.3 道具提示词里的 thick impasto，将分层六步 SOP 并入《03-painting-and-layers.md》'
  },
  {
    oldFile: 'references/prompt-recipes.md',
    oldSize: '6.6 KB',
    status: '合并收编',
    newLocation: 'references/03-painting-and-layers.md',
    reason: '单图挂载规则（权重 0.4–0.6）与 6 张原稿原型匹配表直接并入《03-painting-and-layers.md》生图工作流章节'
  },
  {
    oldFile: 'references/decomposition-features.md',
    oldSize: '13.0 KB',
    status: '合并收编',
    newLocation: 'references/03-painting-and-layers.md',
    reason: '移除测试法（Removal Test）与 12 维逐图识别卡升级并入《03-painting-and-layers.md》及独立测量卡章节'
  },
  {
    oldFile: 'references/generator.md',
    oldSize: '54.5 KB',
    status: '合并收编',
    newLocation: 'references/05-page-recipes-and-verification.md',
    reason: '删去 40KB 空洞的伪数学公式（G1-G8 抽象代号）和旧暖光描述，只保留「换主体不跑味」的实操替换表（作品集 / 产品发布页 / 活动议程页三套跨场景映射），并入《05-page-recipes-and-verification.md》'
  },
  {
    oldFile: 'references/page-recipes.md',
    oldSize: '19.7 KB',
    status: '保留并重写',
    newLocation: 'references/05-page-recipes-and-verification.md',
    reason: '保留 [源码] / [推导] / [禁用] 三级证据机制与 6 种页面配方，补齐「尺子 2（作品集/产品页/活动页三页同手）」与「尺子 3（站内第 14 页四项硬衔接）」验收表'
  },
  {
    oldFile: 'references/motion-playbook.md',
    oldSize: '24.0 KB',
    status: '保留并重写',
    newLocation: 'references/04-motion-and-stage3d.md',
    reason: '删去通用 GSAP 基础语法复述（改由 gsap-* skill 接线），只保留 Shopify 专属的四层 Z 轴舞台（-240/0/+40/+90）、10s 自动序列、6 种运镜 rig 与擦镜转场'
  },
  {
    oldFile: 'references/cinema-audit.md',
    oldSize: '5.4 KB',
    status: '合并收编',
    newLocation: 'references/04-motion-and-stage3d.md',
    reason: '静态模板 vs 源码六维差距表与 6 种镜头轨迹参数直接并入《04-motion-and-stage3d.md》'
  },
  {
    oldFile: 'references/gsap-library.md',
    oldSize: '9.9 KB',
    status: '合并收编',
    newLocation: 'references/04-motion-and-stage3d.md',
    reason: '本地 25 个 GSAP 3.15.1 插件清单与加载顺序表精简并入《04-motion-and-stage3d.md》附录，删除与 gsap-* skill 重复的基础 API 教程'
  },
  {
    oldFile: 'references/extraction-workflow.md',
    oldSize: '6.3 KB',
    status: '保留并重写',
    newLocation: 'references/06-extraction-and-skills-wiring.md',
    reason: '整合 extract-tokens.mjs 四步重提流程，并新增「11 个第三方工具包 + 11 个本机 skill 完整接线手册」'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'conflicts' | 'dedup' | 'architecture' | 'rulers'>('conflicts');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConflicts = CONFLICTS.filter(
    (c) =>
      c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.verdict.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sideA.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sideB.file.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#dcded1] text-[#292919] flex flex-col">
      {/* Top Translucent Editorial Bar (Authentic Winter '26 50px Height) */}
      <header className="sticky top-0 z-50 h-[50px] w-full bg-[#dcded1]/85 backdrop-blur-md border-b border-[#292919]/10 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[13px] tracking-[-0.02em] uppercase">
            Shopify Editions · Winter ’26 Skill V3
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-[3px] bg-[#292919] text-[#f7f7ee] font-medium">
            第 1 批交付 · 裁决与架构方案
          </span>
        </div>
        <div className="flex items-center gap-6 text-[12px] font-bold">
          <span>原版: 6 文件 + 106 文件</span>
          <span>→</span>
          <span className="underline decoration-1 underline-offset-2">第三版: 93 文件 (references 19 → 6)</span>
        </div>
      </header>

      {/* Main Container: 13.9% Left Roman Numeral Nav + 86.1% Right Stage */}
      <div className="max-w-[1680px] w-full mx-auto flex-1 flex flex-col lg:flex-row relative">
        {/* Left Navigation — Strictly 13.9% width per real-page.md measurement */}
        <aside className="w-full lg:w-[13.9%] lg:min-w-[190px] lg:max-w-[230px] border-b lg:border-b-0 lg:border-r border-[#292919]/10 p-5 lg:sticky lg:top-[50px] lg:h-[calc(100vh-50px)] flex flex-col justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[#5c5c4e] mb-4 font-bold">
              Batch 01 · Index
            </div>
            <nav className="flex flex-col gap-2">
              {[
                { id: 'quiz', label: '自证三题 & 读档清单', roman: 'I', count: '100%' },
                { id: 'conflicts', label: '表 A · 冲突裁决表', roman: 'II', count: `${CONFLICTS.length} 项` },
                { id: 'dedup', label: '表 B · 唯一归属去重表', roman: 'III', count: `${DEDUP_TABLE.length} 类` },
                { id: 'architecture', label: '交付物 1 · V3 重构方案', roman: 'IV', count: '19→6' },
                { id: 'rulers', label: '三把尺子 · 像素校准器', roman: 'V', count: '3 把' }
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`group w-full flex items-center justify-between py-2 px-2.5 rounded-[3px] text-left transition-colors ${
                      isActive
                        ? 'bg-[#292919] text-[#f7f7ee]'
                        : 'hover:bg-[#f7f7ee]/70 text-[#292919]'
                    }`}
                  >
                    <span className="text-[14px] font-bold tracking-[-0.02em] truncate">
                      {item.label}
                    </span>
                    <span
                      className={`serif-narrative text-[11px] ml-2 ${
                        isActive ? 'text-[#f7f7ee]/80' : 'text-[#292919]/60'
                      }`}
                    >
                      {item.roman}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dual Palette Hard Separation Reminder Card */}
          <div className="mt-6 p-3.5 rounded-[12px] bg-[#f7f7ee] border border-[#292919]/10 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#292919] mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#ea135e]" />
              双轨色板硬隔离
            </div>
            <div className="space-y-2 text-[11px]">
              <div>
                <div className="text-[#5c5c4e] mb-1">生图暗部 (冷青蓝 189–224°)</div>
                <div className="flex gap-1">
                  <span className="w-5 h-5 rounded-[3px] bg-[#0c282d]" title="#0c282d (189°)" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#4a6873]" title="#4a6873 (196°)" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#141722]" title="#141722 (224°)" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#ea135e]" title="#ea135e (339°)" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#ff0cdb]" title="#ff0cdb (309°)" />
                </div>
              </div>
              <div className="pt-1 border-t border-[#292919]/10">
                <div className="text-[#5c5c4e] mb-1">网页 CSS (严禁喂给生图)</div>
                <div className="flex gap-1">
                  <span className="w-5 h-5 rounded-[3px] bg-[#dcded1] border border-[#292919]/20" title="#dcded1 页面底色" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#f7f7ee] border border-[#292919]/20" title="#f7f7ee 卡片色" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#292919]" title="#292919 墨色 (60°)" />
                  <span className="w-5 h-5 rounded-[3px] bg-[#8051ff]" title="#8051ff 按钮紫 (265°)" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area — 86.1% Width */}
        <main className="w-full lg:w-[86.1%] p-6 lg:p-12 space-y-10">
          {/* Hero Header Block */}
          <section className="bg-[#f7f7ee] rounded-[12px] p-6 lg:p-10 border border-[#292919]/10 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#292919]/10">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5c5c4e] mb-2">
                  Shopify Editions Winter ’26 · 第三版重写工程（第 1 批）
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold tracking-[-0.03em] leading-[0.95]">
                  两版全量交叉审阅与第三版重构总纲
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-[3px] bg-[#dcded1] text-[12px] font-bold">
                  已读文本/代码: 87 / 87 (100%)
                </div>
                <div className="px-3.5 py-2 rounded-[3px] bg-[#292919] text-[#f7f7ee] text-[12px] font-bold">
                  裁决冲突: {CONFLICTS.length} 处
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-[12px] font-bold uppercase text-[#5c5c4e] mb-1">
                  第 1 级最高权威（推翻层）
                </div>
                <p className="text-[14px] leading-relaxed">
                  <code className="mono-code text-[12px] bg-[#dcded1] px-1.5 py-0.5 rounded">corrections.md</code>、
                  <code className="mono-code text-[12px] bg-[#dcded1] px-1.5 py-0.5 rounded">layers-breakdown.md</code>、
                  <code className="mono-code text-[12px] bg-[#dcded1] px-1.5 py-0.5 rounded">real-page.md</code>。
                  凡基于 6 张原稿像素采样与 29 帧录屏实测的结论，直接推翻旧文档。
                </p>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase text-[#5c5c4e] mb-1">
                  核心病因诊断
                </div>
                <p className="text-[14px] leading-relaxed">
                  第二版之所以做出来像「学 Shopify 的人做的」，是因为 93.8KB 的 <code className="mono-code text-[12px] bg-[#dcded1] px-1.5 py-0.5 rounded">style-kit.md</code> 和 starter 代码仍残留大量第一版错误（橄榄褐罩染、20% 宽侧栏、两套推镜脚本打架）。
                </p>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase text-[#5c5c4e] mb-1">
                  第三版瘦身成效
                </div>
                <p className="text-[14px] leading-relaxed">
                  删除 3 份严重污染的旧文档，将 19 份散乱 <code className="mono-code text-[12px] bg-[#dcded1] px-1.5 py-0.5 rounded">references/</code> 收编为 6 份职责单一、零冲突的硬核手册，同时修复 starter 3 处致命代码 Bug。
                </p>
              </div>
            </div>
          </section>

          {/* TAB 1: Self-Verification Quiz & Reading Inventory */}
          {activeTab === 'quiz' && (
            <section className="space-y-6">
              <div className="bg-[#f7f7ee] rounded-[12px] p-6 lg:p-8 border border-[#292919]/10">
                <h2 className="text-2xl font-bold tracking-[-0.02em] mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#292919]" />
                  第三部分 · 先自证：三道题（全部以源码与实测文件逐行核对）
                </h2>

                <div className="space-y-6">
                  <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10">
                    <div className="text-[13px] font-bold uppercase text-[#5c5c4e] mb-2">
                      第 1 题 · 插画暗部色相范围与 #292919 误用溯源
                    </div>
                    <ul className="space-y-2 text-[14px] leading-relaxed">
                      <li>
                        <strong>插画暗部实测色相范围：</strong>
                        <code className="mono-code bg-[#f7f7ee] px-1.5 py-0.5 rounded font-bold">189°–224°</code>（冷青蓝 / 深蓝黑）。
                        6 张官方原稿像素采样实测值：06 背景墙 <code className="mono-code">#0c282d</code>（<strong>189°</strong>）、01 天空 <code className="mono-code">#4a6873</code>（<strong>196°</strong>）、03 天空 <code className="mono-code">#394b55</code>（<strong>202°</strong>）、02 纯净暗底 <code className="mono-code">#141722</code>（<strong>224°</strong>）。
                      </li>
                      <li>
                        <strong>大家常错写成的色值：</strong>
                        <code className="mono-code bg-[#f7f7ee] px-1.5 py-0.5 rounded font-bold">#292919</code>（在旧版与 <code className="mono-code">style-kit.md</code> 中被称为「乌菲兹暗夜绿棕」，色相 <strong>60°</strong>，橄榄褐/黄绿棕）。
                      </li>
                      <li>
                        <strong>为什么它会出现在文档里：</strong>
                        <code className="mono-code">#292919</code> 是原站网页前端 CSS（<code className="mono-code">tailwind-G-N6aznT.css</code>）里的深色背景与正文墨色变量（<code className="mono-code">.bg-dark</code> / <code className="mono-code">.text-dark</code>）。第一版撰写者没有对 6 张插画原稿做像素采样，直接把网页 CSS 变量当成了插画颜料暗部写进生图提示词（甚至在 <code className="mono-code">stage3d.css</code> 里加了 <code className="mono-code">rgba(41,41,25,.22)</code> 的橄榄褐全局罩染），导致生成的画全部发黄发脏。
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10">
                    <div className="text-[13px] font-bold uppercase text-[#5c5c4e] mb-2">
                      第 2 题 · 真 3D 舞台四层 translateZ 与 --bg-push 机制
                    </div>
                    <ul className="space-y-2 text-[14px] leading-relaxed">
                      <li>
                        <strong>四层实际生效的 translateZ（出自 <code className="mono-code">assets/starter/css/stage3d.css</code> 第 60–63 行）：</strong>
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-1 mono-code text-[13px]">
                          <li>.stage3d__layer--bg (背景层): translateZ(-240px) scale(calc(1.32 * var(--bg-push, 1)))</li>
                          <li>.stage3d__layer--subject (人物层): translateZ(0px)</li>
                          <li>.stage3d__layer--fx (动效/几何线层): translateZ(40px)</li>
                          <li>.stage3d__layer--prop (前景现代道具层): translateZ(90px)</li>
                        </ul>
                        <span className="text-[12px] text-[#5c5c4e] block mt-1">
                          （注：发现一处文档自相矛盾：<code className="mono-code">SKILL.md</code> 第 153 行和 <code className="mono-code">stage3d.css</code> 第 8 行注释错写成了 <code className="mono-code">-240 / +40 / +100 / +180</code>，真正在跑的代码和 <code className="mono-code">motion-playbook.md</code> §5 是 <code className="mono-code">-240 / 0 / +40 / +90</code>。）
                        </span>
                      </li>
                      <li>
                        <strong>哪一层是负值：</strong>
                        背景层（<code className="mono-code">.stage3d__layer--bg</code>，<strong>-240px</strong>）。
                      </li>
                      <li>
                        <strong>背景层为什么要额外乘 <code className="mono-code">1.32 * var(--bg-push, 1)</code>：</strong>
                        第一，在 <code className="mono-code">perspective: 1000px</code> 的透视相机下，往负 Z 轴退后 240px 会让背景图按透视比例缩小（<code className="mono-code">1000 / (1000 + 240) ≈ 0.806</code>），如果不预先乘以基础系数 <code className="mono-code">1.32</code> 放大补边，镜头推拉或鼠标摇晃时四周就会露出灰底黑边；第二，在首屏自动入场序列（0.50s–1.80s）中，JS 会把 <code className="mono-code">--bg-push</code> 从 <code className="mono-code">1</code> 推到 <code className="mono-code">1.52</code>（对应原站 <code className="mono-code">01_Hero.json</code> 状态机里 <code className="mono-code">landscape</code> 缩放 <code className="mono-code">1 → 1.52</code>），让远景膨胀速度明显快于人物，制造强烈的镜头前扑张力。
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10">
                    <div className="text-[13px] font-bold uppercase text-[#5c5c4e] mb-2">
                      第 3 题 · hero-intro.js 自动序列精确时间轴与交接方式
                    </div>
                    <ul className="space-y-2 text-[14px] leading-relaxed">
                      <li>
                        <strong>推镜段几秒结束、之后转成什么：</strong>
                        初始延迟 <code className="mono-code">0.35s</code> 后启动时间轴；<strong>强推镜段在 <code className="mono-code">1.80s</code> 结束</strong>（<code className="mono-code">0 → 1.80s</code>，<code className="mono-code">power2.in</code>）；随后在 <strong><code className="mono-code">2.13s → 2.67s</code></strong>（历时 <code className="mono-code">0.54s</code>，<code className="mono-code">power2.out</code>）相机快速回落定格；从 <strong><code className="mono-code">3.03s</code> 起</strong>转入无限循环的 <strong>yoyo 正弦呼吸态</strong>（<code className="mono-code">duration: 5s, ease: "sine.inOut", repeat: -1, yoyo: true</code>）。
                      </li>
                      <li>
                        <strong>镜头 z 从多少到多少：</strong>
                        强推段 <code className="mono-code">0 → 1.80s</code> 从 <strong><code className="mono-code">-60px</code> 推到 <code className="mono-code">+150px</code></strong>（同时俯仰角 <code className="mono-code">rx</code> 从 <code className="mono-code">1.6° → 0.5°</code>）；回落段 <code className="mono-code">2.13s → 2.67s</code> 从 <strong><code className="mono-code">+150px</code> 落回 <code className="mono-code">+10px</code></strong>（<code className="mono-code">rx: 0°</code>）；<code className="mono-code">3.03s</code> 起呼吸段在 <strong><code className="mono-code">+10px ↔ +16px</code></strong> 之间往复（<code className="mono-code">rx: 0° ↔ 0.35°</code>）。
                      </li>
                      <li>
                        <strong>第几秒发生爆发、背景系数到多少：</strong>
                        第 <strong><code className="mono-code">1.77s</code></strong> 发生爆发（<code className="mono-code">.stage3d__flash</code> 在 <code className="mono-code">0.06s</code> 内 opacity <code className="mono-code">0 → 1</code>，同时 <code className="mono-code">.stage3d__spark</code> scale <code className="mono-code">1 → 1.9</code>；<code className="mono-code">1.83s</code> 起用 <code className="mono-code">0.46s</code> 衰减回 0 / 1）。背景系数 <code className="mono-code">bgPush</code> 在 <code className="mono-code">0.50s → 1.80s</code> 从 <strong><code className="mono-code">1</code> 升到 <code className="mono-code">1.52</code></strong>（并在 <code className="mono-code">2.13s → 2.67s</code> 回落到 <code className="mono-code">1</code>）。
                      </li>
                      <li>
                        <strong>用户滚动时用什么方式交接：</strong>
                        通过 <code className="mono-code">{'window.addEventListener("scroll", yieldToUser, { passive: true, once: true })'}</code> 监听首次滚动；一旦触发（且 <code className="mono-code">window.scrollY &gt; 4</code>），立即将全局锁 <code className="mono-code">window.__stage3dAuto = false</code>，标记 <code className="mono-code">{'stage.dataset.autoplayState = "yielded"'}</code>，并执行 <strong><code className="mono-code">tl.kill()</code></strong> 终止 GSAP 自动时间轴，将 <code className="mono-code">--cam-z / --cam-rx</code> 的写入权无缝交还给 <code className="mono-code">stage3d.js</code> 的交互阻尼循环。
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: Table A · Conflict Adjudication Table */}
          {activeTab === 'conflicts' && (
            <section className="space-y-6">
              <div className="bg-[#f7f7ee] rounded-[12px] p-6 lg:p-8 border border-[#292919]/10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-[-0.02em] flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-[#ea135e]" />
                      表 A · 冲突裁决表（共 {CONFLICTS.length} 处：含 12 处文档冲突 + 4 处致命代码打架）
                    </h2>
                    <p className="text-[13px] text-[#5c5c4e] mt-1">
                      裁决铁律：像素采样/逐帧录屏（第1级） &gt; 源码行号（第2级） &gt; 官方文档（第3级） &gt; 推导（第4级）。绝不和稀泥。
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5c4e]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜色值、文件名、冲突点..."
                      className="pl-9 pr-4 py-1.5 rounded-[3px] bg-[#dcded1] text-[13px] border border-[#292919]/15 focus:outline-none focus:border-[#292919]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredConflicts.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-[8px] bg-[#dcded1]/45 border border-[#292919]/12 hover:border-[#292919]/30 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="mono-code text-[12px] font-bold px-2 py-0.5 rounded-[3px] bg-[#292919] text-[#f7f7ee]">
                            {item.id}
                          </span>
                          <h3 className="text-[16px] font-bold tracking-[-0.01em]">
                            {item.topic}
                          </h3>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[3px] ${
                            item.tier === '代码Bug裁决'
                              ? 'bg-[#ea135e] text-white'
                              : 'bg-[#292919]/10 text-[#292919]'
                          }`}
                        >
                          {item.tier}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3 text-[13px]">
                        <div className="p-3 rounded-[6px] bg-[#f7f7ee] border-l-4 border-[#909083]">
                          <div className="mono-code text-[11px] text-[#5c5c4e] mb-1 font-bold">
                            ❌ 旧结论 / 错误方：{item.sideA.file}
                          </div>
                          <div>{item.sideA.claim}</div>
                        </div>
                        <div className="p-3 rounded-[6px] bg-[#f7f7ee] border-l-4 border-[#292919]">
                          <div className="mono-code text-[11px] text-[#292919] mb-1 font-bold">
                            ✓ 实测 / 源码方：{item.sideB.file}
                          </div>
                          <div>{item.sideB.claim}</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-[6px] bg-[#292919] text-[#f7f7ee] text-[13px] space-y-1.5">
                        <div>
                          <span className="font-bold text-[#a1af33]">【第三版最终裁决】</span>{' '}
                          {item.verdict}
                        </div>
                        <div className="text-[12px] text-[#f7f7ee]/80">
                          <span className="font-bold">依据：</span>
                          {item.basis}
                        </div>
                        <div className="text-[12px] text-[#f7f7ee]/80">
                          <span className="font-bold">执行动作：</span>
                          {item.action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: Table B · Deduplication Matrix */}
          {activeTab === 'dedup' && (
            <section className="space-y-6">
              <div className="bg-[#f7f7ee] rounded-[12px] p-6 lg:p-8 border border-[#292919]/10">
                <h2 className="text-2xl font-bold tracking-[-0.02em] mb-2 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#292919]" />
                  表 B · 去重与唯一归属表（一个硬数值只准活在一个主文件里）
                </h2>
                <p className="text-[13px] text-[#5c5c4e] mb-6">
                  第二版同一个数值在 4–6 份文档里反复抄写，一处改了另一处没改就会产生新冲突。第三版严格实行「单一事实源」。
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b-2 border-[#292919] text-[11px] uppercase tracking-wider text-[#5c5c4e]">
                        <th className="py-3 pr-4">硬数值 / 令牌类别</th>
                        <th className="py-3 px-4">第三版唯一权威数值</th>
                        <th className="py-3 px-4">第三版唯一归属文件（其他文件只准引用）</th>
                        <th className="py-3 px-4">第二版被去重的重复文件</th>
                        <th className="py-3 pl-4">证据等级</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#292919]/10">
                      {DEDUP_TABLE.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#dcded1]/40">
                          <td className="py-3.5 pr-4 font-bold">{row.metric}</td>
                          <td className="py-3.5 px-4 mono-code text-[12px]">{row.authoritativeValue}</td>
                          <td className="py-3.5 px-4 mono-code text-[12px] font-bold text-[#292919]">
                            {row.v3SingleOwner}
                          </td>
                          <td className="py-3.5 px-4 text-[12px] text-[#5c5c4e]">
                            {row.previousDuplicates.join('、')}
                          </td>
                          <td className="py-3.5 pl-4">
                            <span className="px-2 py-0.5 rounded-[3px] bg-[#292919] text-[#f7f7ee] text-[11px] font-bold whitespace-nowrap">
                              {row.evidenceLabel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: Deliverable 1 · V3 Architecture & Migration Map */}
          {activeTab === 'architecture' && (
            <section className="space-y-6">
              <div className="bg-[#f7f7ee] rounded-[12px] p-6 lg:p-8 border border-[#292919]/10">
                <h2 className="text-2xl font-bold tracking-[-0.02em] mb-2 flex items-center gap-2">
                  <GitMerge className="w-6 h-6 text-[#292919]" />
                  交付物 1 · 第三版重构方案（文件总数 106 → 93，references 19 → 6）
                </h2>
                <p className="text-[13px] text-[#5c5c4e] mb-6">
                  彻底砍掉第一版遗留的 93.8KB 污染源 <code className="mono-code">style-kit.md</code> 及错误契约文件，将 19 份散乱文档按「工作流工序」重组为 6 份零冲突核心手册。
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="p-5 rounded-[8px] bg-[#292919] text-[#f7f7ee]">
                    <div className="text-[12px] font-bold uppercase tracking-wider text-[#a1af33] mb-3">
                      第三版全新目录树（93 个文件）
                    </div>
                    <pre className="mono-code text-[12px] leading-relaxed overflow-x-auto">
{`shopify-editions-skill-v3/               (共 93 个文件)
├── SKILL.md                             [主入口：置顶推翻层+双轨色板+11技能接线]
├── NOTICE.md                            [版权与商业使用边界声明]
├── references/                          [19 份精简合并为 6 份零冲突核心手册]
│   ├── 01-overturns-and-truth.md        [最高宪章：像素/录屏25条推翻+源码状态机真相]
│   ├── 02-design-tokens.md              [网页令牌总表：#dcded1底色/13.9%侧栏/14维度]
│   ├── 03-painting-and-layers.md        [生图与分层SOP：冷青蓝暗部/12维测量卡/词库]
│   ├── 04-motion-and-stage3d.md         [真3D舞台与镜头：-240/0/40/90+10秒自动序列]
│   ├── 05-page-recipes-and-verification.md [跨场景配方：作品集/产品/活动页+三把尺子验收]
│   └── 06-extraction-and-skills-wiring.md  [新站规范提取四步法 + 11个Skill协同接线表]
├── scripts/                             [3 个零依赖自动化脚本]
│   ├── extract-tokens.mjs               [从任意新站 CSS 抽取令牌 JSON]
│   ├── scaffold.mjs                     [一键生成新页面工程]
│   └── verify.mjs                       [升级版：新增检查 #dcded1 底色、13.9% 侧栏、零外联]
└── assets/
    ├── starter/                         [修复 3 处代码打架后的可运行双页面工程]
    │   ├── index.html / portfolio.html
    │   ├── css/ (tokens / layout / stage3d / cinema / details.css)
    │   ├── js/  (stage3d / hero-intro / cinema / cinematic / details / motion.js)
    │   ├── fonts/ (4 个本地 woff2)
    │   ├── vendor/gsap/ (25 个本地 GSAP 3.15.1 min.js)
    │   └── demo/
    ├── reference/                       [20 张官方原稿/截图/网页实拍 + 00-看图说话.txt]
    └── layers/                          [3 张透明通道分层示范素材 bg / subject / prop]`}
                    </pre>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10">
                      <div className="text-[13px] font-bold uppercase mb-2">
                        为什么从 19 份缩减为 6 份？
                      </div>
                      <p className="text-[13px] leading-relaxed mb-3">
                        第二版最大的问题不是「内容不够」，而是「新旧两代结论同时活在 19 个文件里」。使用者或 AI 读到 <code className="mono-code">corrections.md</code> 知道暗部是冷青蓝，转头读到 <code className="mono-code">scene-production.md</code> 和 <code className="mono-code">style-kit.md</code> 又被要求写 <code className="mono-code">dark olive-brown #292919</code>，结果做出来的画还是发黄。
                      </p>
                      <ul className="space-y-1.5 text-[13px]">
                        <li>• <strong>01 管「防错」</strong>：所有推翻结论与源码真相一处查完。</li>
                        <li>• <strong>02 管「排网页」</strong>：CSS 变量、13.9% 导航、#dcded1 底色。</li>
                        <li>• <strong>03 管「画插画与抠图层」</strong>：12 维像素卡、生图提示词、锐边贴纸道具。</li>
                        <li>• <strong>04 管「动起来」</strong>：四层 3D 舞台、10 秒自动演绎、擦镜与粒子。</li>
                        <li>• <strong>05 管「换内容不换手」</strong>：作品集/产品页/活动页三套配方 + 三把尺子。</li>
                        <li>• <strong>06 管「工具与外部技能调用」</strong>：脚本提取与 11 个 skill 分工。</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10">
                      <div className="text-[13px] font-bold uppercase mb-2">
                        Starter 工程顺手修掉的 4 个硬伤
                      </div>
                      <ul className="space-y-1.5 text-[13px]">
                        <li>1. <strong><code className="mono-code">tokens.css</code></strong>：<code className="mono-code">--sidebar-w</code> 从 <code className="mono-code">20%</code> 改为实测 <code className="mono-code">13.9%</code>；新增 <code className="mono-code">--c-page-bg: #dcded1</code>。</li>
                        <li>2. <strong><code className="mono-code">stage3d.css</code></strong>：移除把画面染黄的 <code className="mono-code">.stage3d__tone</code> 橄榄褐罩染；修正文件头 Z 轴注释与 <code className="mono-code">.stage3d__title</code> 字体。</li>
                        <li>3. <strong><code className="mono-code">portfolio.html + cinematic.js</code></strong>：解除 <code className="mono-code">.hero__img</code> 与 <code className="mono-code">stage3d</code> 同时抢背景图 <code className="mono-code">transform</code> 导致 3D 景深坍塌的 Bug。</li>
                        <li>4. <strong><code className="mono-code">verify.mjs</code></strong>：加入对 <code className="mono-code">#dcded1</code> 底色、<code className="mono-code">13.9%</code> 导航宽度与双脚本冲突的自动静态拦截。</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-3">19 份旧文档去向逐一对照表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b-2 border-[#292919] text-[11px] uppercase tracking-wider text-[#5c5c4e]">
                        <th className="py-2.5 pr-4">旧文件</th>
                        <th className="py-2.5 px-3">原大小</th>
                        <th className="py-2.5 px-3">处置方式</th>
                        <th className="py-2.5 px-4">第三版新位置</th>
                        <th className="py-2.5 pl-4">处置理由</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#292919]/10">
                      {MIGRATION_MAP.map((item, i) => (
                        <tr key={i} className="hover:bg-[#dcded1]/40">
                          <td className="py-3 pr-4 mono-code text-[12px] font-bold">{item.oldFile}</td>
                          <td className="py-3 px-3 mono-code text-[12px] whitespace-nowrap">{item.oldSize}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold whitespace-nowrap ${
                                item.status === '彻底删除'
                                  ? 'bg-[#ea135e] text-white'
                                  : item.status === '保留并重写'
                                  ? 'bg-[#292919] text-[#f7f7ee]'
                                  : 'bg-[#292919]/15 text-[#292919]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 mono-code text-[12px]">{item.newLocation}</td>
                          <td className="py-3 pl-4 text-[12px] leading-relaxed">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: Three Rulers Calibration */}
          {activeTab === 'rulers' && (
            <section className="space-y-6">
              <div className="bg-[#f7f7ee] rounded-[12px] p-6 lg:p-8 border border-[#292919]/10">
                <h2 className="text-2xl font-bold tracking-[-0.02em] mb-6 flex items-center gap-2">
                  <Ruler className="w-6 h-6 text-[#292919]" />
                  第四部分 · 三把尺子硬核量化验收标准（第三版写进 verify.mjs 与 05 手册）
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#ea135e] mb-1">
                        尺子 1 · 盲测（画面与图层）
                      </div>
                      <h3 className="text-lg font-bold mb-3">遮住 Logo 与原稿并排，3 秒内分不出</h3>
                      <ul className="space-y-2 text-[13px] leading-relaxed">
                        <li>• <strong>暗部色相检验</strong>：吸管取暗部 3 点，HSL 色相必须落在 <code className="mono-code">185°–230°</code>（冷青蓝），若落在 <code className="mono-code">35°–75°</code>（黄棕）直接判不及格。</li>
                        <li>• <strong>脸部皮肤零笔触</strong>：放大 200% 看人物面部，必须是平涂柔和明暗，出现油画刀刮痕或裂纹直接判不及格。</li>
                        <li>• <strong>现代道具锐边</strong>：手机/耳机/名牌等道具边缘锐利如剪贴画，光向与人物一致，无烟熏模糊边。</li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#292919]/10 mono-code text-[11px] text-[#5c5c4e]">
                      量化阈值：12 维像素测量卡 ≥ 11 项达标
                    </div>
                  </div>

                  <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#292919] mb-1">
                        尺子 2 · 换内容不换手（跨场景一致性）
                      </div>
                      <h3 className="text-lg font-bold mb-3">作品集 / 产品发布页 / 活动议程页三页同手</h3>
                      <ul className="space-y-2 text-[13px] leading-relaxed">
                        <li>• <strong>作品集</strong>：首屏细线框目录卡 → 章节 II 单词巨字（如 <code className="mono-code">Archive</code>）+ 4 层 3D 肖像舞台 → 12 列双栏项目卡。</li>
                        <li>• <strong>产品发布页</strong>：章节巨字（如 <code className="mono-code">Instrument</code>）+ 风景嵌现代硬件原型（原型 03）+ 发光白卡（<code className="mono-code">.cine-glow-card</code>）+ 斥力云卡片。</li>
                        <li>• <strong>活动议程页</strong>：章节巨字（如 <code className="mono-code">Symposium</code>）+ 都铎式长桌多讲者群像（原型 06，0% 荧光）+ <code className="mono-code">#dcdcd0</code> 1px 横线时刻表。</li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#292919]/10 mono-code text-[11px] text-[#5c5c4e]">
                      量化阈值：三页共用同一份 tokens.css，0 自定义孤立样式
                    </div>
                  </div>

                  <div className="p-5 rounded-[8px] bg-[#dcded1]/60 border border-[#292919]/10 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#292919] mb-1">
                        尺子 3 · 站内可用（塞进官网当第 14 页）
                      </div>
                      <h3 className="text-lg font-bold mb-3">四项硬指标零误差接驳原站</h3>
                      <ul className="space-y-2 text-[13px] leading-relaxed">
                        <li>1. <strong>导航宽度</strong>：左侧罗马数字栏严格占 <code className="mono-code">13.9%</code>（1440px 下 200px），绝不用 20%。</li>
                        <li>2. <strong>页面主底色</strong>：全局浅色底锁定冷灰绿 <code className="mono-code">#dcded1</code>，<code className="mono-code">#f7f7ee</code> 只做卡片底。</li>
                        <li>3. <strong>章节节奏与遮挡</strong>：首屏中央 1px 细线框目录卡；章节巨字顶部被 50px 半透顶栏遮掉一截，底部被前景人物压住 5%–15%。</li>
                        <li>4. <strong>字阶与自动演绎</strong>：巨字 <code className="mono-code">NeueMontreal Bold 120–220px</code>；打开页面无需滚动自动演满 10 秒呼吸序列。</li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#292919]/10 mono-code text-[11px] text-[#5c5c4e]">
                      量化阈值：verify.mjs 自动化静态检查 100% PASS
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
