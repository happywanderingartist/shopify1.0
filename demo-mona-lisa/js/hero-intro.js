/* =====================================================================
 * 剧场级首屏自动运镜序列（demo-mona-lisa/js/hero-intro.js）
 * ---------------------------------------------------------------------
 * 10 秒电影级横向大弧轨推进，一眼拉开 5 层独立敞廊景深：
 *   0.00–1.80s  大幅横向弧轨推镜（x: -54→18, ry: -6.8°→2.8°, z: -72→138），
 *               蒙娜丽莎与背后独立石柱/雕花栏杆清晰横向错位
 *   1.77s ★     冷北光爆发点 + 触发蒙娜丽莎低头拧旋钮调音动作回调
 *   2.13–2.72s  舒缓回落停驻于黄金机位（z → 18px, bgPush → 1.05）
 *   3.03s 起    持续缓慢剧场摇臂巡航（仅摇移相机，5 层视差自然呼吸流动）
 * ===================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector("[data-stage3d][data-autoplay]");
  if (!stage || !window.gsap) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var flash = stage.querySelector(".stage3d__flash");
  var sparks = [].slice.call(stage.querySelectorAll(".stage3d__spark"));

  var cam = {
    x: -54,
    y: 12,
    z: -72,
    rx: 2.4,
    ry: -6.8,
    bgPush: 1.0,
    flash: 0
  };

  window.__stage3dAutoOffset = { x: cam.x, y: cam.y, rx: cam.rx, ry: cam.ry };

  function apply() {
    stage.style.setProperty("--cam-z", cam.z.toFixed(2) + "px");
    stage.style.setProperty("--bg-push", cam.bgPush.toFixed(3));
    window.__stage3dAutoOffset.x = cam.x;
    window.__stage3dAutoOffset.y = cam.y;
    window.__stage3dAutoOffset.rx = cam.rx;
    window.__stage3dAutoOffset.ry = cam.ry;
    if (flash) flash.style.opacity = cam.flash.toFixed(3);
  }

  window.__stage3dAuto = true;
  stage.dataset.autoplayState = "playing";
  apply();

  var orbitTween = null;

  var tl = gsap.timeline({
    delay: 0.22,
    onUpdate: apply,
    onComplete: function () {
      stage.dataset.autoplayState = "orbiting";
    }
  });

  /* 1. 剧场级横向弧轨推镜 0 → 1.80s */
  tl.to(cam, { x: 18, y: -5, z: 138, rx: -0.4, ry: 2.8, duration: 1.80, ease: "power2.inOut" }, 0);

  /* 2. 廊外远山独立推进 0.50 → 1.80s */
  tl.to(cam, { bgPush: 1.32, duration: 1.30, ease: "power1.inOut" }, 0.50);

  /* 3. 1.77s 爆发点：60ms 闪亮 / 460ms 衰减 + 联动蒙娜丽莎抬手调音 */
  tl.call(function () {
    window.dispatchEvent(new CustomEvent("gioconda:intro-bloom"));
  }, null, 1.55);
  tl.to(cam, { flash: 0.78, duration: 0.06, ease: "none" }, 1.77);
  tl.to(cam, { flash: 0, duration: 0.46, ease: "power2.out" }, 1.83);

  if (sparks.length) {
    tl.to(sparks, { scale: 2.1, opacity: 1, duration: 0.06, ease: "none" }, 1.77);
    tl.to(sparks, { scale: 1, opacity: 0.72, duration: 0.46, ease: "power2.out" }, 1.83);
  }

  /* 4. 回落归中 2.13 → 2.72s */
  tl.to(cam, { x: 0, y: 0, z: 18, rx: 0, ry: 0, bgPush: 1.05, duration: 0.59, ease: "power2.out" }, 2.13);

  /* 5. 3.03s 起：缓慢剧场级摇臂绕轨，持续展现 5 层独立空间深度 */
  tl.call(function () {
    if (!window.__stage3dAuto) return;
    orbitTween = gsap.timeline({ repeat: -1, yoyo: true, onUpdate: apply });
    orbitTween
      .to(cam, { x: 24, y: -5, z: 32, ry: 3.4, rx: 1.1, bgPush: 1.12, duration: 5.2, ease: "sine.inOut" })
      .to(cam, { x: -24, y: 5, z: 10, ry: -3.4, rx: -0.9, bgPush: 1.03, duration: 5.6, ease: "sine.inOut" });
  }, null, 3.03);

  function yieldToUser() {
    if (!window.__stage3dAuto) return;
    if (window.scrollY < 16) return;
    window.__stage3dAuto = false;
    stage.dataset.autoplayState = "yielded";
    tl.kill();
    if (orbitTween) {
      orbitTween.kill();
      orbitTween = null;
    }
  }
  window.addEventListener("scroll", yieldToUser, { passive: true });

  function replay() {
    if (orbitTween) {
      orbitTween.kill();
      orbitTween = null;
    }
    cam.x = -54;
    cam.y = 12;
    cam.z = -72;
    cam.rx = 2.4;
    cam.ry = -6.8;
    cam.bgPush = 1.0;
    cam.flash = 0;
    window.__stage3dAuto = true;
    stage.dataset.autoplayState = "playing";
    apply();
    tl.restart(true);
  }

  window.__heroIntro = { cam: cam, timeline: tl, yield: yieldToUser, replay: replay };
})();
