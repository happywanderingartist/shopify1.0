/* =====================================================================
 * 真 5 层剧场级 3D 敞廊舞台相机驱动（demo-mona-lisa/js/stage3d.js）
 * ---------------------------------------------------------------------
 * 持续 60fps 阻尼循环（离屏自动暂停）：
 *   - 仅驱动单一 900px 透视相机的 x / y / z / rx / ry 与透视原点，
 *     让远山(-260px)、柏枝(-165px)、独立石廊拱门(-75px)、
 *     蒙娜丽莎与大理石桌(0px)、几何线(+42px)、近景石拱与古书(+82px)
 *     在鼠标一动、开场绕轨、滚动穿梭时立刻拉开肉眼分明的立体层次；
 *   - 向下滚动时触发近景门沿向外推开（--fg-peel / --fg-opacity），
 *     制造穿门而入的剧场空间纵深感；
 *   - 同步向 window.__stage3dPointer 暴露阻尼指针坐标，供蒙娜丽莎眼神与轻抬头响应。
 * ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stages = [].slice.call(document.querySelectorAll("[data-stage3d]"));
  if (!stages.length || REDUCED) return;

  var cam = stages.map(function (el) {
    return {
      el: el,
      inner: el.querySelector(".stage3d__camera"),
      p: 0,
      visible: true,
      dolly: Number(el.dataset.dolly || 192),
      drift: Number(el.dataset.drift || 52)
    };
  });

  var mx = 0, my = 0;
  var cx = 0, cy = 0;

  window.__stage3dPointer = { x: 0, y: 0, active: false };

  window.addEventListener("pointermove", function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    window.__stage3dPointer.active = true;
  }, { passive: true });

  window.addEventListener("pointerleave", function () {
    mx = 0;
    my = 0;
    window.__stage3dPointer.active = false;
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var s = cam.find(function (x) { return x.el === e.target; });
        if (s) s.visible = e.isIntersecting;
      });
    }, { rootMargin: "15% 0px 15% 0px" });
    cam.forEach(function (s) { io.observe(s.el); });
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function readScrollRatio(s) {
    var r = s.el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height), 0, 1);
  }

  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;

    window.__stage3dPointer.x = cx;
    window.__stage3dPointer.y = cy;

    var autoOffset = window.__stage3dAutoOffset || { x: 0, y: 0, rx: 0, ry: 0 };

    cam.forEach(function (s) {
      if (!s.visible || !s.inner) return;
      var sr = readScrollRatio(s);
      s.p = sr;

      var useAuto = s.el.hasAttribute("data-autoplay") && window.__stage3dAuto;
      var x = -cx * s.drift + (useAuto ? autoOffset.x : -sr * 34);
      var y = -cy * s.drift * 0.42 + (useAuto ? autoOffset.y : sr * 10);
      var ox = 50 + cx * 12;
      var oy = 50 + cy * 7;
      var ry = cx * 6.5 + (useAuto ? autoOffset.ry : sr * 4.4);

      s.el.style.setProperty("--cam-x", x.toFixed(2) + "px");
      s.el.style.setProperty("--cam-y", y.toFixed(2) + "px");
      s.el.style.setProperty("--cam-ry", ry.toFixed(2) + "deg");
      s.el.style.setProperty("--cam-origin-x", ox.toFixed(2) + "%");
      s.el.style.setProperty("--cam-origin-y", oy.toFixed(2) + "%");

      /* 滚动穿梭时让 L5b 近景拱门与桌角自然向外推开并轻淡，避免穿模挡脸 */
      var fgPeel = 1 + sr * 0.46;
      var fgOpacity = clamp(1 - sr * 1.45, 0, 1);
      s.el.style.setProperty("--fg-peel", fgPeel.toFixed(3));
      s.el.style.setProperty("--fg-opacity", fgOpacity.toFixed(3));

      if (!useAuto) {
        var z = 18 + sr * s.dolly;
        var rx = -cy * 3.2 + sr * 4.2;
        var bgPush = 1.04 + sr * 0.28;
        s.el.style.setProperty("--cam-z", z.toFixed(2) + "px");
        s.el.style.setProperty("--cam-rx", rx.toFixed(2) + "deg");
        s.el.style.setProperty("--bg-push", bgPush.toFixed(3));
      } else {
        var autoRx = (autoOffset.rx || 0) - cy * 2.8;
        s.el.style.setProperty("--cam-rx", autoRx.toFixed(2) + "deg");
      }
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
  window.__stage3d = cam;
})();
