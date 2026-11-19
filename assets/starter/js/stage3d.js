/* =====================================================================
 * 3D 分层舞台驱动（stage3d.js）
 * ---------------------------------------------------------------------
 * 只写 .stage3d__camera 一个元素的 transform，四层由固定 translateZ
 * 在 CSS 透视里自动产生不同位移 —— 对应 Shopify 首页的单一相机原理。
 *
 * 相机轨迹语义来自 references/01-overturns-and-truth.md §五 / references/04-motion-and-stage3d.md §四：
 *   Hero dolly: Z +12 → +2.5，FOV 35°→50°，穿云推进。
 * 这里把 Three.js 相机重参数化为 CSS 3D：z 0 → +150px，rx 微俯仰。
 * 鼠标视差沿用 −15px × depth 的语义，改为写透视原点（更接近真相机）。
 * 数值语义同源、空间不同源，不标 1:1。
 * ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stages = [].slice.call(document.querySelectorAll("[data-stage3d]"));
  if (!stages.length || REDUCED) return;

  var cam = stages.map(function (el) {
    var isTheater = el.dataset.stageMode === "theater";
    return {
      el: el,
      inner: el.querySelector(".stage3d__camera"),
      isTheater: isTheater,
      p: 0,
      visible: false,
      /* 相机推进幅度可由 data-dolly 覆盖：标准 150px，剧场模式 180px */
      dolly: Number(el.dataset.dolly || (isTheater ? 180 : 150)),
      /* 鼠标视差幅度：标准 18px，剧场模式 36px */
      drift: Number(el.dataset.drift || (isTheater ? 36 : 18))
    };
  });

  var hasTheater = cam.some(function (s) { return s.isTheater; });
  var mx = 0, my = 0;         // 鼠标目标（−1..1）
  var cx = 0, cy = 0;         // 阻尼后的当前值

  /* 暴露阻尼后的归一化指针，供活体角色视线/微转头同步复用 */
  window.__stage3dPointer = { x: 0, y: 0 };

  /* 鼠标只记录目标，阻尼在 tick 里做（0.15 系数来自 cinema-audit §3） */
  window.addEventListener("pointermove", function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* 只对进入视口的舞台跑计算 */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var s = cam.find(function (x) { return x.el === e.target; });
        if (s) s.visible = e.isIntersecting;
      });
      if (hasTheater) ensureTheaterLoop();
    }, { rootMargin: "10% 0px 10% 0px" });
    cam.forEach(function (s) { io.observe(s.el); });
  } else {
    cam.forEach(function (s) { s.visible = true; });
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function readProgress(s) {
    var r = s.el.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    /* p=0 当舞台顶边进视口底；p=1 当底边出视口顶 */
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  }

  function stepPointer() {
    var damp = hasTheater ? 0.08 : 0.15;
    cx += (mx - cx) * damp;
    cy += (my - cy) * damp;
    window.__stage3dPointer.x = cx;
    window.__stage3dPointer.y = cy;
  }

  function write(s) {
    if (!s.inner) return;
    s.p = readProgress(s);
    var p = s.p;

    /* 相机推进：Z 从负起点到 dolly。
       负起点让前景层退回设计尺寸，避免首屏就被推近放大糊满屏。 */
    var z = -60 + p * (s.dolly + 60);
    var rx = s.isTheater
      ? ((1 - p) * 2.2 - 1.1 - cy * 2.6)
      : ((1 - p) * 1.6 - 0.8);
    var ry = cx * (s.isTheater ? 6.5 : 1.6);

    /* 相机平移：鼠标反向微移，制造"往鼠标方向看"的错觉 */
    var x = -cx * s.drift;
    var y = -cy * s.drift * (s.isTheater ? 0.55 : 0.6);

    /* 透视原点随鼠标走（正号，与平移配合成视差） */
    var ox = 50 + cx * (s.isTheater ? 6 : 4);
    var oy = 50 + cy * (s.isTheater ? 4 : 3);

    s.el.style.setProperty("--cam-x", x.toFixed(2) + "px");
    s.el.style.setProperty("--cam-y", y.toFixed(2) + "px");
    /* 首屏自动序列在播时，z/rx 归 hero-intro.js；这里只保留鼠标视差。
       用户一滚动 hero-intro.js 会置 __stage3dAuto=false，z/rx 自动回到本引擎。 */
    if (!s.el.hasAttribute("data-autoplay") || !window.__stage3dAuto) {
      s.el.style.setProperty("--cam-z", z.toFixed(2) + "px");
      s.el.style.setProperty("--cam-rx", rx.toFixed(2) + "deg");
    }
    s.el.style.setProperty("--cam-ry", ry.toFixed(2) + "deg");
    s.el.style.setProperty("--cam-origin-x", ox.toFixed(2) + "%");
    s.el.style.setProperty("--cam-origin-y", oy.toFixed(2) + "%");

    /* 5 层剧场模式：滚出首屏时，前景拱框（+82px）向外推开并淡出，避免遮挡正文 */
    if (s.isTheater) {
      var peel = 1 + clamp((p - 0.35) / 0.65, 0, 1) * 0.22;
      var fgOpacity = 1 - clamp((p - 0.55) / 0.45, 0, 1) * 0.85;
      s.el.style.setProperty("--fg-peel", peel.toFixed(3));
      s.el.style.setProperty("--fg-opacity", fgOpacity.toFixed(3));
    }
  }

  var scheduled = false;
  var theaterRaf = 0;

  function tick() {
    scheduled = false;
    stepPointer();
    cam.forEach(function (s) { if (s.visible) write(s); });
  }

  function requestTick() {
    if (scheduled || theaterRaf) return;
    scheduled = true;
    requestAnimationFrame(tick);
  }

  function theaterFrame() {
    theaterRaf = 0;
    var anyVisible = cam.some(function (s) { return s.isTheater && s.visible; });
    if (!anyVisible || document.hidden) return;
    stepPointer();
    cam.forEach(function (s) { if (s.visible) write(s); });
    theaterRaf = requestAnimationFrame(theaterFrame);
  }

  function ensureTheaterLoop() {
    if (!hasTheater || theaterRaf || document.hidden) return;
    if (cam.some(function (s) { return s.isTheater && s.visible; })) {
      theaterRaf = requestAnimationFrame(theaterFrame);
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });
  window.addEventListener("pointermove", requestTick, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && hasTheater) ensureTheaterLoop();
  });

  /* 初始化静止态 + 暴露给自动化断言 */
  cam.forEach(write);
  if (hasTheater) ensureTheaterLoop();
  window.__stage3d = cam;
})();
