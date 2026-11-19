/* =====================================================================
 * details.js — 页面细节引擎（页面过渡遮罩 / 动画粒子背景）
 *
 * 职责边界（C-16）：
 *   首屏推镜与 1.77s 爆发统一由 stage3d.js + hero-intro.js 负责，
 *   本文件已移除重复的 [data-shot] / [data-burst-*] 逻辑，仅保留：
 *     1. 跨章节过渡遮罩（白闪 180ms/260ms + 织物擦镜 wipe）
 *     2. 60 线 × 3 粒子 Canvas 动画背景（源码常量对齐 04 §四）
 *
 * 依赖：零。只用 Web Animations API + Canvas 2D，和 GSAP 完全解耦。
 * 降级：prefers-reduced-motion 下静态画一帧/不开 anim；不会出现空白或隐藏内容。
 * ===================================================================== */
(() => {
  "use strict";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* ===================================================================
   * 2. 页面过渡：跨章节的白闪 / 织物擦镜
   *    白闪是 white-overlay 的真实手法：0→1(180ms)→0(260ms)，纸白，
   *    在峰值那一帧换背景。静态页没有后台可换，保留闪光与节奏。
   *    擦镜来自 V2 视频：大块织物从画面上方扫入（精确时长源码未给，标注推断）。
   * =================================================================== */
  let veilFlash = null, veilWipe = null;

  function ensureVeils() {
    if (!veilFlash) {
      veilFlash = document.createElement("div");
      veilFlash.className = "pd-veil pd-veil--flash";
      veilFlash.setAttribute("aria-hidden", "true");
      document.body.appendChild(veilFlash);
    }
    if (!veilWipe) {
      veilWipe = document.createElement("div");
      veilWipe.className = "pd-veil pd-veil--wipe";
      veilWipe.setAttribute("aria-hidden", "true");
      document.body.appendChild(veilWipe);
    }
  }

  function playFlash() {
    ensureVeils();
    veilFlash.animate([
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 180 / 440 },   // 180ms 上升
      { opacity: 0, offset: 1 },           // 260ms 衰减
    ], { duration: 440, easing: "linear" });
  }

  function playWipe() {
    ensureVeils();
    /* 织物从上方扫入再扫出。时长 720ms 为推断（V2 只有 4 帧，测不到精确值）。 */
    veilWipe.animate([
      { clipPath: "inset(0 0 100% 0)", offset: 0 },
      { clipPath: "inset(0 0 0% 0)", offset: 0.5 },
      { clipPath: "inset(100% 0 0 0)", offset: 1 },
    ], { duration: 720, easing: "cubic-bezier(.41,.19,.13,.95)" });
  }

  function initTransitions() {
    const targets = $("[data-transition]");
    if (!targets.length || REDUCED || typeof Element.prototype.animate !== "function") return;
    targets.forEach((sec) => {
      const kind = sec.dataset.transition || "flash";
      let last = false;
      const check = () => {
        const r = sec.getBoundingClientRect();
        const entering = r.top <= window.innerHeight * 0.55 && r.bottom >= window.innerHeight * 0.45;
        if (entering && !last) {
          last = true;
          if (kind === "flash") playFlash();
          else if (kind === "wipe") playWipe();
        } else if (!entering) {
          last = false;   // 允许来回滚动再次触发
        }
      };
      window.addEventListener("scroll", check, { passive: true });
      check();
    });
  }

  /* ===================================================================
   * 3. 元素变幻：金色星尘粒子场（动画背景）
   *    源码常量逐条对齐 blueprint §3.4；无外联、无图片、DPR 自适应。
   *    离屏暂停、resize 重建；reduced-motion 只画一帧静态纹理。
   * =================================================================== */
  const FIELD = {
    LINE_COUNT: 60, PARTICLES_PER_LINE: 3, PARTICLE_RADIUS: 1,
    SPEED_MIN: 0.01, SPEED_MAX: 0.05, SPEED_K: 0.005,   // 实测速度 ×.005
    LINE_WIDTH: 0.3, LINE_OPACITY: 0.51,
    DOT_COLOR: "#808080", DOT_OPACITY: 0.29,
    SCALE_W: 0.64, SCALE_H: 0.76, OFFSET_X: 5, OFFSET_Y: -30,
    EDGE_POWER: 0.99, WOBBLE: 0.021, LEN_VAR: 0.23,
    SPLIT_1: 0.33, SPLIT_2: 0.67, JITTER: 1.5,
  };

  /* 边缘聚集：blueprint §3.4 的 pr(e,t)，pow .99 逼近阶跃 */
  function edgeCluster(u) {
    const i = u * 2 - 1;
    return (Math.sign(i) * Math.pow(Math.abs(i), FIELD.EDGE_POWER) + 1) / 2;
  }

  function initParticleFields() {
    const canvases = $("[data-particle-field]");
    if (!canvases.length) return;

    canvases.forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let lines = [], w = 0, h = 0, dpr = 1, raf = 0, visible = true;

      const build = () => {
        const box = canvas.parentElement.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        w = Math.max(1, Math.round(box.width * FIELD.SCALE_W));
        h = Math.max(1, Math.round(box.height * FIELD.SCALE_H));
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const n = FIELD.LINE_COUNT;
        lines = [];
        for (let i = 0; i < n; i++) {
          const u = n === 1 ? 0.5 : i / (n - 1);
          const y = edgeCluster(u) * h + FIELD.OFFSET_Y;
          const len = w * (1 - Math.random() * FIELD.LEN_VAR);
          const x0 = (w - len) / 2 + FIELD.OFFSET_X;
          const particles = [];
          for (let j = 0; j < FIELD.PARTICLES_PER_LINE; j++) {
            particles.push({
              t: Math.random(),
              speed: (FIELD.SPEED_MIN + Math.random() * (FIELD.SPEED_MAX - FIELD.SPEED_MIN)) * FIELD.SPEED_K,
            });
          }
          lines.push({ y, x0, len, particles, phase: Math.random() * Math.PI * 2 });
        }
      };

      /* 三次贝塞尔：三段 + 轻微 wobble（源码 bezierCurveTo + lineTo 的等效） */
      const at = (line, t) => {
        const k = clamp(t);
        const x = line.x0 + line.len * k;
        const y = line.y + Math.sin(k * Math.PI * 2 + line.phase) * FIELD.WOBBLE * line.len * 0.35;
        return [x, y];
      };

      const paint = (advance) => {
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = FIELD.LINE_WIDTH;
        ctx.strokeStyle = `rgba(0,0,0,${FIELD.LINE_OPACITY})`;
        ctx.fillStyle = FIELD.DOT_COLOR;

        lines.forEach((line) => {
          const a = at(line, 0), b = at(line, FIELD.SPLIT_1);
          const c = at(line, FIELD.SPLIT_2), d = at(line, 1);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]);
          ctx.stroke();

          /* 端点灰点，带 ±1.5px 抖动 */
          ctx.globalAlpha = FIELD.DOT_OPACITY;
          [a, d].forEach((p) => {
            ctx.beginPath();
            ctx.arc(p[0] + (Math.random() - 0.5) * FIELD.JITTER, p[1], FIELD.PARTICLE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;

          line.particles.forEach((p) => {
            if (advance && !REDUCED) {
              p.t += p.speed;
              if (p.t > 1) p.t -= 1;
            }
            const [px, py] = at(line, p.t);
            ctx.globalAlpha = FIELD.LINE_OPACITY;
            ctx.beginPath();
            ctx.arc(px, py, FIELD.PARTICLE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          });
        });
      };

      const loop = () => {
        paint(true);
        raf = requestAnimationFrame(loop);
      };
      const start = () => { if (!raf && !REDUCED && visible) raf = requestAnimationFrame(loop); };
      const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

      build();
      paint(false);                 // 首帧静态纹理，任何环境都不会空白
      if (!REDUCED) start();

      let rt;
      const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { stop(); build(); paint(false); start(); }, 150); };
      window.addEventListener("resize", onResize, { passive: true });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((e) => { visible = e.isIntersecting; visible ? start() : stop(); });
        }, { threshold: 0.01 }).observe(canvas);
      }
    });
  }

  /* ------------------------------------------------------------------- */
  const boot = () => { initTransitions(); initParticleFields(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
