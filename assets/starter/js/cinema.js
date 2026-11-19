/* =====================================================================
 * cinema.js — 滚动驱动的镜头 / 景深 / 明亮微交互引擎（零依赖）
 *
 * 参数出处（均为 Winter '26 镜像实测，非目测）：
 *   Lenis lerp .1 / easeOutExpo            motion.js 已实现，本文件复用其滚动位置
 *   鼠标阻尼 current += (target-current)*.15   source/_pretty/Background-C8-YYu8Q.js:34139
 *   视差 -15px                             同文件
 *   三层景深 0.2x / 0.6x / 1.2x              §2.1 三层景深剥离
 *   Theatre 相机 6DOF 由滚动 p∈[0,1] 插值   各 *.theatre-project-state*.json
 *   斥力场 300/20                           motion.js 已实现
 *   emoji duration ≈ scale × 2.0s           §3.4
 *
 * HTML 契约：
 *   <div class="cine-stage" data-rig="dolly" data-rig-label="Dolly through">
 *     <div class="cine-layer" data-depth="0.2">…</div>
 *     <div class="cine-layer" data-depth="0.6">…</div>
 *     <div class="cine-layer" data-depth="1.2">…</div>
 *     <div class="cine-hud"></div>
 *   </div>
 *
 * 加载顺序：motion.js → cinema.js（都 defer）。
 * 本文件不修改 DOM 结构，只写 transform / filter / data-* / CSS 变量。
 * ===================================================================== */
(() => {
  "use strict";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  /* 原站三次 ease-out：1-(1-t)^3，Theatre intro 同曲线 */
  const easeOutCubic = (t) => 1 - (1 - t) ** 3;
  const easeInOut = (t) => t < .5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;

  /* -------------------------------------------------------------------
   * 1. 相机 rig 表：六种运镜，全部由滚动 p 驱动
   *    每项返回 6DOF + scale + blur；数值按文档的镜头轨迹换算到 CSS 空间。
   *    背景层用 depth 0.2，前景层 1.2，因此 scale 的扭曲会被自然放大。
   * ------------------------------------------------------------------- */
  const RIGS = {
    /* 00 · Z 轴穿云推进：Z +12 → +2.5，FOV 35°→50° */
    dolly: (p) => ({
      z: lerp(120, 25, easeInOut(p)),
      scale: lerp(1, 1.55, easeOutCubic(p)),
      x: 0, y: 0, rx: 0, ry: 0,
      bgScale: lerp(1.08, .92, p),
      blur: lerp(0, 2.4, p),
    }),
    /* I · 18° 弧线环绕推近：X -1.8→+0.6，rotY 偏转 -18° */
    orbital: (p) => ({
      x: lerp(-9, 3, easeInOut(p)),
      y: lerp(2, -1, p),
      z: lerp(85, 42, easeOutCubic(p)),
      rx: 0,
      ry: lerp(-18, 0, easeOutCubic(p)),
      scale: lerp(1.05, 1.38, easeOutCubic(p)),
      bgScale: lerp(1.14, .94, p),
      blur: lerp(0, 2.8, p),
    }),
    /* II · 穿窗俯冲越浪：Z 9→3，rotX -8°→+12° */
    truck: (p) => ({
      x: lerp(-16, 12, easeInOut(p)),
      y: lerp(10, -6, p),
      z: lerp(90, 30, easeOutCubic(p)),
      rx: lerp(-8, 12, easeInOut(p)),
      ry: 0,
      scale: lerp(1.04, 1.32, p),
      bgScale: lerp(1.12, .96, p),
      blur: lerp(0, 2.2, p),
    }),
    /* III · 长焦水平横移 + 仰角：X -3.2→+2.4，rotX +22° */
    lateral: (p) => ({
      x: lerp(-16, 12, easeInOut(p)),
      y: lerp(6, -4, p),
      z: lerp(80, 60, p),
      rx: lerp(0, 22, easeOutCubic(p)),
      ry: 0,
      scale: lerp(1.02, 1.16, p),
      bgScale: lerp(1.06, .98, p),
      blur: lerp(0, 1.6, p),
    }),
    /* IV · 希区柯克变焦：Z 10→3.2 同时 FOV 55°→24°，背景反向缩 */
    "dolly-zoom": (p) => {
      const k = easeInOut(p);
      return {
        x: 0, y: 0, z: lerp(100, 32, k),
        rx: 0, ry: 0,
        scale: lerp(1, 1.85, k),
        bgScale: lerp(1.42, .78, k),     /* 反向收窄 → 空间压缩 */
        blur: lerp(0, 3.6, k),
      };
    },
    /* V · 单点透视后拉：Z 1.8→11.5，微距 → 全景 */
    "pull-back": (p) => ({
      x: 0,
      y: lerp(-6, 0, easeOutCubic(p)),
      z: lerp(18, 115, easeInOut(p)),
      rx: lerp(4, 0, p), ry: 0,
      scale: lerp(1.9, 1, easeInOut(p)),
      bgScale: lerp(.82, 1.1, p),
      blur: lerp(2.6, 0, p),
    }),
  };

  const stages = [...document.querySelectorAll(".cine-stage[data-rig]")].map((el) => {
    const layers = [...el.querySelectorAll(".cine-layer")].map((node) => ({
      node,
      depth: Number(node.dataset.depth || 1),
      isBack: Number(node.dataset.depth || 1) <= 0.2,
    }));
    return {
      el, layers,
      rig: RIGS[el.dataset.rig] ? el.dataset.rig : "dolly",
      hud: el.querySelector(".cine-hud"),
      progress: 0,
      visible: false,
    };
  });
  if (!stages.length) return;

  /* -------------------------------------------------------------------
   * 2. 可见性闸门：只对进入视口的 stage 跑 rAF
   * ------------------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const s = stages.find((x) => x.el === e.target);
        if (s) s.visible = e.isIntersecting;
      });
    }, { rootMargin: "20% 0px 20% 0px" });
    stages.forEach((s) => io.observe(s.el));
  } else {
    stages.forEach((s) => (s.visible = true));
  }

  /* -------------------------------------------------------------------
   * 3. 鼠标阻尼：current += (target-current)*.15（每帧）
   *    结果同时写 --cine-mx / --cine-my，供光斑与光晕复用。
   * ------------------------------------------------------------------- */
  let mx = 0, my = 0, tx = 0, ty = 0;
  if (!REDUCED && matchMedia("(hover: hover)").matches) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - .5) * 2;
      ty = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
  }

  /* -------------------------------------------------------------------
   * 4. 主循环
   * ------------------------------------------------------------------- */
  const writeStage = (s) => {
    const box = s.el.getBoundingClientRect();
    /* p=0 当 stage 顶边刚进入视口底部；p=1 当底边离开视口顶部 */
    const p = REDUCED
      ? .5
      : clamp((window.innerHeight - box.top) / (window.innerHeight + box.height));
    s.progress = p;
    const cam = RIGS[s.rig](p);
    const label = s.el.dataset.rigLabel || s.rig;
    if (s.hud) s.hud.textContent = `${label} · p=${p.toFixed(3)}`;

    s.layers.forEach(({ node, depth, isBack }) => {
      /* 视差 -15px：鼠标偏移随层深放大 */
      const px = mx * -15 * depth;
      const py = my * -15 * depth;
      const sc = isBack ? cam.bgScale : 1 + (cam.scale - 1) * depth;
      node.style.transform =
        `translate3d(${(cam.x * depth + px).toFixed(2)}px, ` +
        `${(cam.y * depth + py).toFixed(2)}px, ` +
        `${(cam.z * depth).toFixed(2)}px) ` +
        `rotateX(${(cam.rx * depth).toFixed(2)}deg) ` +
        `rotateY(${(cam.ry * depth).toFixed(2)}deg) ` +
        `scale(${sc.toFixed(4)})`;
      const blur = isBack ? cam.blur * 1.6 : Math.max(0, cam.blur * (1.2 - depth));
      node.style.filter = blur > .05 ? `blur(${blur.toFixed(2)}px)` : "";
      node.style.opacity = String(clamp(1 - p * .12 * (1.2 - depth), .72, 1));
    });
  };

  const tick = () => {
    mx = lerp(mx, tx, .15);
    my = lerp(my, ty, .15);
    root.style.setProperty("--cine-mx", mx.toFixed(4));
    root.style.setProperty("--cine-my", my.toFixed(4));
    stages.forEach((s) => { if (s.visible) writeStage(s); });
    requestAnimationFrame(tick);
  };
  /* 初始化：所有 stage 先写一次静止态，避免不可见章节的 HUD 为空 */
  stages.forEach((s) => {
    const cam = RIGS[s.rig](0);
    if (s.hud) s.hud.textContent = `${s.el.dataset.rigLabel || s.rig} · p=0.000`;
    s.layers.forEach(({ node }) => {
      node.style.transform =
        `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(${cam.scale.toFixed(4)})`;
    });
  });
  if (REDUCED) stages.forEach(writeStage);
  else requestAnimationFrame(tick);

  /* -------------------------------------------------------------------
   * 5. Intro：几何线在 intro 进度 > .35 时解锁描边
   *    原站 5000ms / delay 100ms 由 motion.js 驱动 --intro-progress
   * ------------------------------------------------------------------- */
  const geometry = document.querySelector(".cine-geometry");
  if (geometry) {
    if (REDUCED) geometry.dataset.shown = "true";
    else {
      const wait = () => {
        const v = Number(getComputedStyle(root).getPropertyValue("--intro-progress")) || 0;
        if (v > .35) geometry.dataset.shown = "true";
        else setTimeout(wait, 120);
      };
      setTimeout(wait, 220);
    }
  }

  /* -------------------------------------------------------------------
   * 6. 顶栏交互：Editions 下拉 / Search 抽屉
   * ------------------------------------------------------------------- */
  document.querySelectorAll(".cine-dropdown").forEach((dd) => {
    const trigger = dd.querySelector("[data-dropdown-trigger]");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      dd.dataset.open = String(dd.dataset.open !== "true");
    });
    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target)) dd.dataset.open = "false";
    });
  });
  document.querySelectorAll("[data-search-trigger]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const panel = document.querySelector(".cine-search");
      if (panel) {
        panel.dataset.open = "true";
        const input = panel.querySelector("input");
        if (input) setTimeout(() => input.focus(), 210);
      }
    });
  });
  document.querySelectorAll("[data-search-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.querySelector(".cine-search");
      if (panel) panel.dataset.open = "false";
    });
  });

  /* -------------------------------------------------------------------
   * 7. 彩色粒子迸发：原站 emoji duration ≈ scale × 2.0s
   *    用 CSS 绘制的彩色圆点代替位图，保持零外联、无字体依赖。
   * ------------------------------------------------------------------- */
  const TINTS = ["#7126ff", "#f7c948", "#e06c9f", "#7f77dd", "#d9d9d9", "#c9a227"];
  document.querySelectorAll("[data-burst]").forEach((host) => {
    host.addEventListener("pointerenter", () => {
      if (REDUCED || host.dataset.burstDone === "true") return;
      host.dataset.burstDone = "true";
      const n = 10 + Math.floor(Math.random() * 5); /* 原站 10~14 个 */
      const field = document.createElement("span");
      field.className = "cine-emoji-field";
      for (let i = 0; i < n; i++) {
        const dot = document.createElement("span");
        const scale = .60 + Math.random() * .58;      /* 0.60 ~ 1.18 */
        const duration = scale * 2.0;                  /* 严格正比 */
        const delay = .31 + Math.random() * 1.95;     /* 0.31 ~ 2.26s */
        const left = 50 + (Math.random() * 196 - 98); /* 散布 ±98px */
        dot.className = "cine-emoji";
        dot.style.cssText =
          `--random-scale:${scale.toFixed(3)};` +
          `--random-duration:${duration.toFixed(3)}s;` +
          `--random-delay:${delay.toFixed(3)}s;` +
          `--emoji-left:${left.toFixed(2)}px;` +
          `background:${TINTS[i % TINTS.length]};border-radius:${i % 3 === 0 ? "2px" : "50%"};`;
        field.appendChild(dot);
      }
      host.appendChild(field);
      setTimeout(() => field.remove(), 4600);
    });
  });

  /* 暴露给验收脚本 */
  window.__cine = { stages, RIGS, get mouse() { return { x: mx, y: my }; } };
})();
