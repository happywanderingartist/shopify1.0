/* =====================================================================
 * cinematic.js — 镜头层（GSAP / ScrollTrigger）
 *
 * 职责边界：只做「画面运动」。滚动平滑、主题切换、侧栏高亮仍由 motion.js 负责。
 * 两者不互相写对方的变量；本文件只读 DOM，不改 data-nav-theme 等属性。
 *
 * 参数来源（全部来自官网反代源码实测，见 references/04-motion-and-stage3d.md §四）：
 *   四段式入场 720ms / 1320ms 延迟链  tailling CSS --slide-delay:200ms + 520ms
 *   几何线描线 6s + 4s 渐隐            @keyframes timeline-start (cqw + rotate)
 *   光斑游移 / 呼吸缩放                官网 WebGL 背景的等效 DOM 近似
 *   滚动推镜 scrub                     官网 Lenis + 视差层的滚动绑定手法
 *
 * 依赖：vendor/gsap/gsap.min.js + ScrollTrigger.min.js（本地，保持零外联）
 * 降级：prefers-reduced-motion 或缺 GSAP 时，所有元素恢复静态且完全可见。
 * ===================================================================== */
(() => {
  "use strict";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HAS_GSAP = typeof window.gsap !== "undefined";
  const HAS_ST = HAS_GSAP && typeof window.ScrollTrigger !== "undefined";
  const root = document.documentElement;

  /* 标记：CSS 用它决定要不要预隐藏。无 JS / reduced-motion 时不加 js-cine，
     元素保持 opacity:1，绝不出现"动画没跑，内容也不见"的白屏。 */
  if (!REDUCED && HAS_GSAP) root.classList.add("js-cine");

  /* 降级契约：任何原因不跑动画，都把所有钩子元素恢复可见。 */
  const restore = () => {
    document.querySelectorAll("[data-cine]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  };
  if (REDUCED || !HAS_GSAP) { restore(); return; }

  const { gsap } = window;
  if (HAS_ST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------
   * 1. 首屏四段式入场编舞
   *    官网时间链：slide-delay = 200 + 520 = 720ms；
   *               Renaissance 两段在 1320ms 起淡入（600 + 720）。
   *    这里把两行巨字当作 AI 词 / Renaissance 两段，状态行最后收尾。
   * --------------------------------------------------------------- */
  const hero = document.querySelector(".hero");
  if (hero) {
    const lines = [...hero.querySelectorAll(".hero__title > [data-cine]")];
    const statusLine = hero.querySelector(".hero__status [data-cine]")
                    || hero.querySelector(".hero__status[data-cine]");
    const geometry = document.querySelector(".cine-geometry");

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    /* 首段（720ms）：名字，从左侧滑入。官网用 -898px，那是满宽巨字；
       个人页名字短，按字重与容器宽取 -18%，保留"推"的动势但不飞出画。 */
    if (lines[0]) {
      intro.fromTo(lines[0],
        { xPercent: -18, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.72 }, 0.72);
    }
    /* 第二段（1320ms）：身份，淡入 + 极短上移。 */
    if (lines[1]) {
      intro.fromTo(lines[1],
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.52 }, 1.32);
    }
    /* 收尾：状态行与那枚紫点。 */
    if (statusLine) {
      intro.fromTo(statusLine,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }, 1.6);
    }

    /* 几何线：6s 描线，4s 渐隐（官网 timeline-start 实测）。
       <img> 无法描边，改用 clip-path 从右侧揭开，视觉等价。 */
    if (geometry && !geometry.classList.contains("cine-geometry--static")) {
      gsap.fromTo(geometry,
        { clipPath: "inset(0 100% 0 0)", opacity: 0.5 },
        {
          clipPath: "inset(0 0% 0 0)", duration: 6, ease: "none",
          onComplete: () => gsap.to(geometry, { opacity: 0, duration: 4, ease: "power1.in" }),
        });
    }
  }

  /* ---------------------------------------------------------------
   * 2. 滚动推镜（本轮核心）
   *    图放大 + 下移；巨字反向缓慢上移。两者速率不同 → 景深与"镜头靠近"。
   *    scrub:1 让运动黏住滚动，不是 discrete 触发。
   * --------------------------------------------------------------- */
  if (HAS_ST && hero && !hero.querySelector("[data-stage3d]")) {
    const img = hero.querySelector(".hero__img");
    /* 父元素整块参与推镜；子行的入场由 intro 管，二者不写同一属性。 */
    const title = hero.querySelector(".hero__title");
    const status = hero.querySelector(".hero__status");
    const glow = hero.querySelector(".hero__glow");

    const dolly = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    /* 画面：纯 scale 推近 1 → 1.22，不做 yPercent 位移。
       位移会让放大中途盖不住容器、顶部露黑边；"镜头偏上摇"的错觉改由
       transform-origin:50% 42% 提供（CSS 里已对齐 object-position）。 */
    if (img) {
      dolly.to(img, { scale: 1.22, ease: "none" }, 0);
    }
    /* 巨字：比画面慢，且向上 14%，产生前后分层。父块动，子行不动。 */
    if (title) {
      dolly.to(title, { yPercent: -14, opacity: 0.15, ease: "none" }, 0);
    }
    if (status) {
      dolly.to(status, { opacity: 0, ease: "none" }, 0);
    }
    /* 光斑横向游移，比底图慢一拍。 */
    if (glow) {
      dolly.to(glow, { xPercent: -16, ease: "none" }, 0);
    }
  }

  /* ---------------------------------------------------------------
   * 3. 正文区滚动视差：每个 [data-parallax] 按自身速率轻微位移。
   *    默认 0.06；写 data-parallax="0.12" 可调。只动 transform，不触发布局。
   * --------------------------------------------------------------- */
  if (HAS_ST) {
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.06;
      gsap.fromTo(el,
        { yPercent: speed * 100 },
        {
          yPercent: -speed * 100, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
        });
    });
  }

  /* ---------------------------------------------------------------
   * 4. 作品卡进场：75ms stagger（官网 --stagger-fade-in-delay 实测）。
   *    只接管标了 data-cine-stagger 的容器；其余走 motion.js 的 data-reveal。
   * --------------------------------------------------------------- */
  if (HAS_ST) {
    gsap.utils.toArray("[data-cine-stagger]").forEach((group) => {
      const items = [...group.querySelectorAll("[data-cine-step]")];
      if (!items.length) return;
      gsap.fromTo(items,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.075,
          scrollTrigger: { trigger: group, start: "top 82%", once: true },
        });
    });
  }

  /* ---------------------------------------------------------------
   * 5. 命名分层滚动：不同层级随滚动各走各的速率
   *    依据 04 §四 的四层结构 bg / title / subject / prop
   *    （原站用归一化鼠标坐标驱动，系数 -15 / -4 / +10 / +28）。
   *    这里换成滚动 scrub，按同一快慢与方向关系重参数化为整屏位移：
   *      bg      负值 → 相对下坠，显得最远最慢
   *      title   微负 → 比正文慢一拍
   *      subject 正值 → 略快于页面
   *      prop    大正 → 前景最快，穿过卡片形成遮挡
   *    语义同源，数值不是 1:1 还原，不冒充原站实测值。
   *    和数值型 data-parallax 不要写在同一元素上（两者都写 yPercent）。
   * --------------------------------------------------------------- */
  if (HAS_ST) {
    const LAYER_RATE = { bg: -6, title: -2, subject: 5, prop: 14 };
    gsap.utils.toArray("[data-scroll-layer]").forEach((el) => {
      const rate = LAYER_RATE[el.dataset.scrollLayer];
      if (rate === undefined) return;
      const scope = el.closest("[data-section-scope]") || el;
      gsap.fromTo(el,
        { yPercent: rate },
        {
          yPercent: -rate, ease: "none",
          scrollTrigger: {
            trigger: scope, start: "top bottom", end: "bottom top",
            scrub: 1, invalidateOnRefresh: true,
          },
        });
    });
  }

  /* 字体/布局变化后让 ScrollTrigger 重新量一次，避免推镜错位。 */
  if (HAS_ST) {
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }

  /* 兜底：若 ticker 因任何原因停滞（后台标签页、受限环境、无头截图），
      intro 的 from 态会把文字永久留在 opacity:0。3s 后仍未点亮的，直接写内联
      style 强制可见（不依赖 GSAP，GSAP 挂了也能救回内容）。
      GSAP 正常运行时元素已是 1，这里不触发，不会造成可见跳变。 */
  setTimeout(() => {
    document.querySelectorAll("[data-cine]").forEach((el) => {
      if (parseFloat(el.style.opacity || "1") === 0) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }, 3000);
})();
