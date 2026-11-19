/* =====================================================================
 * 首屏自动序列（hero-intro.js）
 * ---------------------------------------------------------------------
 * Shopify 首页的灵魂不是滚动视差，是「加载即播的 10 秒时间轴」。
 * 关键帧来自 references/01-overturns-and-truth.md §五（13 个 theatre state 里唯一逐帧读全的场景）：
 *
 *   0.00–0.50   资产淡入
 *   0.77–1.80   向前扑（asset 位移 0 → 5.84）
 *   1.77 ★      爆发点：bloom 4→1（0.46s 暴跌）、effects 3.5→1→0.2
 *   2.13–2.67   相机回落
 *   3.03–10.00  主动作停，容器缓慢归位（呼吸感）
 *
 *   相机 Z：t0=-18.57 → t1=6.45 → t1.8=10.34（强推）→ t2.67=-2.29（回落）
 *   背景层自己也在动：位移 0→124、缩放 1→1.52 —— 背景比人物动得多，
 *   这才是一次推镜里视差的真正来源，不是给每层手写四个滚动速率。
 *   灯：0 个关键帧。所有东西都在动，唯独光不动，画面才不乱。
 *
 * 映射到 CSS 3D 舞台（stage3d.css）：只写 --cam-z / --cam-rx / --bg-push
 * 三个变量和爆发层的 opacity，层位移由透视自动算。数值是语义同源的
 * 空间重参数化（Three.js Z → CSS px），不冒充原站实测像素。
 *
 * 与 stage3d.js 的关系：本引擎播放期间置 window.__stage3dAuto = true，
 * stage3d.js 的 tick 跳过 z/rx 写入（鼠标 x/y 视差仍可叠加）。用户一滚动，
 * 本引擎 kill 时间轴并交还控制权 —— 自动序列不跟用户的滚动意图抢相机。
 * ===================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector("[data-stage3d][data-autoplay]");
  if (!stage || !window.gsap) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var flash = stage.querySelector(".stage3d__flash");
  var sparks = [].slice.call(stage.querySelectorAll(".stage3d__spark"));

  /* 代理对象：GSAP tween 它，onUpdate 统一写 CSS 变量（幂等）。
     多个 tween 在爆发点重叠也没关系，apply 每次读全部当前值。 */
  var cam = {
    /* 强推镜：起点远 → 1.8s 冲到峰值 → 2.67s 回落到停驻位 */
    z: -60,        /* 对应 t0 -18.57 */
    rx: 1.6,       /* 容器俯仰，随推镜归零 */
    bgPush: 1,     /* 背景层额外缩放系数：1 → 1.52，比人物动得多 */
    flash: 0       /* 爆发亮度：先亮 60ms，后暗 460ms */
  };

  function apply() {
    stage.style.setProperty("--cam-z", cam.z.toFixed(2) + "px");
    stage.style.setProperty("--cam-rx", cam.rx.toFixed(2) + "deg");
    stage.style.setProperty("--bg-push", cam.bgPush.toFixed(3));
    if (flash) flash.style.opacity = cam.flash.toFixed(3);
  }

  /* 接管相机 z 控制权 */
  window.__stage3dAuto = true;
  stage.dataset.autoplayState = "playing";

  apply();

  var tl = gsap.timeline({
    delay: 0.35,                 /* 等首帧绘制，也对应 0.37s 资产淡入 */
    onUpdate: apply,
    onComplete: function () {
      stage.dataset.autoplayState = "idle";
    }
  });

  /* ---- 1. 强推镜 0 → 1.80s：power2.in 越推越快，冲过去 ---- */
  tl.to(cam, { z: 150, rx: 0.5, duration: 1.80, ease: "power2.in" }, 0);

  /* ---- 2. 背景自己在放大：0.5 → 1.8s，1 → 1.52 ----
     01 §五: landscape t1.17→2.30 缩放 1→1.52。背景比人物动得多。 */
  tl.to(cam, { bgPush: 1.52, duration: 1.30, ease: "power1.in" }, 0.50);

  /* ---- 3. 爆发点 1.77s：先亮后暗，上升快于衰减 ---- */
  tl.to(cam, { flash: 1, duration: 0.06, ease: "none" }, 1.77);
  tl.to(cam, { flash: 0, duration: 0.46, ease: "power2.out" }, 1.83);

  /* 星尘在爆发瞬间迸开：scale 1 → 1.9 → 1，Slow out。 */
  if (sparks.length) {
    tl.to(sparks, { scale: 1.9, opacity: 1, duration: 0.06, ease: "none" }, 1.77);
    tl.to(sparks, { scale: 1, duration: 0.46, ease: "power2.out" }, 1.83);
  }

  /* ---- 4. 相机回落 2.13 → 2.67s：150 → 10，停住 ---- */
  tl.to(cam, { z: 10, duration: 0.54, ease: "power2.out" }, 2.13);

  var breathTween = null;

  /* ---- 5. 3.03s 后呼吸：容器缓慢归位，z 在停驻位 10 与 16 间做 5s yoyo 循环 ----
     01 §五: cube t0 旋转 2.43 → t10 全部归零，10 秒一个循环，
     后 7 秒不是死寂，是极缓慢的呼吸。这里用 z 微幅 yoyo 表达。 */
  tl.call(function () {
    if (!window.__stage3dAuto) return;
    breathTween = gsap.to(cam, {
      z: 16,
      duration: 5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      onUpdate: apply
    });
  }, null, 3.03);

  /* ---- 用户一开始滚动就把相机交还：自动序列与呼吸循环同步停止 ---- */
  function yieldToUser() {
    if (!window.__stage3dAuto) return;
    window.__stage3dAuto = false;
    stage.dataset.autoplayState = "yielded";
    tl.kill();
    if (breathTween) {
      breathTween.kill();
      breathTween = null;
    }
  }
  window.addEventListener("scroll", yieldToUser, { passive: true, once: true });

  /* 暴露给自动化断言 */
  window.__heroIntro = { cam: cam, timeline: tl, yield: yieldToUser };
})();
