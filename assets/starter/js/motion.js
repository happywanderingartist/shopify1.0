/* =====================================================================
 * motion.js — 零依赖动效引擎（参数全部对齐原站真实源码）
 *
 * 来源：
 *   Lenis 配置 / easeOutExpo / 章节进度闸门
 *     source/_pretty/(_locale).editions.winter2026-D2ExMuGP.js:6806-6834, 6530-6550, 7265-7300
 *   斥力场 + 视差
 *     同文件 4697-4699, 4771-4825
 *   3D 阻尼 0.15
 *     source/_pretty/Background-C8-YYu8Q.js:34139-34142
 *   Theatre intro 1-(1-t)^3 / 5000ms / 100ms / 追赶 0.5
 *     source/_pretty/Effects-ByAKepvN.js:101-198
 *   缓动与 stagger 变量
 *     tailwind-G-N6aznT.css（--stagger-fade-in-delay:75ms 等）
 *
 * 用法：<script src="js/motion.js" defer></script>
 * 全部行为默认尊重 prefers-reduced-motion。
 * ===================================================================== */
(() => {
  "use strict";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  /* 原站 easeOutExpo 变体：Math.min(1, 1.001 - 2 ** (-10 * t)) */
  const easeOutExpo = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));

  /* ---------------------------------------------------------------
   * 1. 平滑滚动（Lenis 等价最小实现）
   *    原站：new Lenis({ lerp:.1, smoothWheel:true, syncTouch:false,
   *                     wheelMultiplier:1, autoRaf:false, overscroll:true })
   *    我们用 rAF 把「目标滚动位置」以 lerp .1 逼近，保持 position:fixed/sticky 可用。
   * --------------------------------------------------------------- */
  class SmoothScroll {
    constructor({ lerpFactor = 0.1, wheelMultiplier = 1 } = {}) {
      this.k = lerpFactor;
      this.mult = wheelMultiplier;
      this.target = window.scrollY;
      this.current = window.scrollY;
      this.running = false;
      this.onScroll = [];
      if (REDUCED) return;
      window.addEventListener("wheel", (e) => {
        if (e.ctrlKey) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        this.target = Math.max(0, Math.min(max, this.target + e.deltaY * this.mult));
        if (!this.running) { this.running = true; requestAnimationFrame(this.tick); }
      }, { passive: true });
      window.addEventListener("scroll", () => {
        if (Math.abs(window.scrollY - this.current) > 2) {
          this.target = window.scrollY; this.current = window.scrollY;
        }
      }, { passive: true });
    }
    tick = () => {
      this.current = lerp(this.current, this.target, this.k);
      if (Math.abs(this.target - this.current) < 0.5) {
        this.current = this.target; this.running = false;
      } else {
        requestAnimationFrame(this.tick);
      }
      window.scrollTo(0, this.current);
      this.onScroll.forEach((fn) => fn(this.current));
    };
    /* 章节跳转：duration 1s，easing easeOutExpo（原站 1292-1300 行） */
    scrollTo(y, duration = 1000) {
      const from = window.scrollY;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const v = from + (y - from) * easeOutExpo(p);
        window.scrollTo(0, v);
        this.target = v; this.current = v;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }
  const smooth = new SmoothScroll({ lerpFactor: 0.1, wheelMultiplier: 1 });
  window.__w26Smooth = smooth;

  /* ---------------------------------------------------------------
   * 2. 章节状态机：scrollY > 100px → data-scrolled=true
   *    主题由 IntersectionObserver 从 section[data-nav-theme] 同步到 <html>
   * --------------------------------------------------------------- */
  const root = document.documentElement;
  const hasTocCard = !!document.querySelector(".toc-card[data-toc-dock]");
  let scrolled = null;
  const applyScrollGate = (y) => {
    const next = y > 100;
    if (next !== scrolled) {
      scrolled = next;
      document.querySelectorAll("[data-section-scope]").forEach((el) => {
        el.dataset.scrolled = String(next);
      });
      if (hasTocCard) {
        root.dataset.tocDock = next ? "docked" : "card";
      }
    }
  };
  window.addEventListener("scroll", () => applyScrollGate(window.scrollY), { passive: true });
  smooth.onScroll.push(applyScrollGate);
  applyScrollGate(window.scrollY);

  const themeMap = ["nav-theme", "title-theme", "sidebar-theme"];
  const sections = [...document.querySelectorAll("section[data-section-id]")];
  if (sections.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const sec = visible.target;
      themeMap.forEach((key) => {
        /* getAttribute 而非 dataset：data-nav-theme 对应 dataset.navTheme，
           直接用带连字符的 key 会取到 undefined。 */
        const val = sec.getAttribute(`data-${key}`);
        if (!val) return;
        const prop = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        root.dataset[prop] = val;
      });
      const id = sec.dataset.sectionId;
      document.querySelectorAll(".side-nav__item").forEach((li) => {
        li.classList.toggle("is-active", li.dataset.target === id);
      });
    }, { rootMargin: "-40% 0px -40% 0px", threshold: [0, .25, .5, 1] });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------------------------------------------------------------
   * 3. 进场：IntersectionObserver + 75ms stagger（--index 决定顺序）
   *    原站 CSS：[data-initiated=true] li { animation-delay: calc(var(--index)*75ms) }
   * --------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.dataset.reveal = "in";
        ro.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revealTargets.forEach((el, i) => {
      if (!el.style.getPropertyValue("--index")) el.style.setProperty("--index", i);
      ro.observe(el);
    });
  } else {
    revealTargets.forEach((el) => (el.dataset.reveal = "in"));
  }

  /* ---------------------------------------------------------------
   * 4. 鼠标斥力场 + 视差
   *    原站常数：De = { maxDistance:300, repulsionStrength:20 }
   *    衰减 O = 1 - (D/300)^2；位移 = -(dx/D) * O * 20
   *    视差层：translate3d(-15 * nx, -15 * ny, 0)
   * --------------------------------------------------------------- */
  const REPULSE = { maxDistance: 300, repulsionStrength: 20 };
  const PARALLAX = -15;
  const clouds = [...document.querySelectorAll("[data-cloud-field]")];

  if (!REDUCED && clouds.length && matchMedia("(hover: hover)").matches) {
    clouds.forEach((field) => {
      const cards = [...field.querySelectorAll(".cloud-card-interactive")];
      const layers = [...field.querySelectorAll(".cloud-card-parallax")];
      let pointer = { x: 0, y: 0 }, queued = false;

      const update = () => {
        queued = false;
        const box = field.getBoundingClientRect();
        const nx = pointer.x / box.width - .5;
        const ny = pointer.y / box.height - .5;

        cards.forEach((card) => {
          const r = card.getBoundingClientRect();
          const cx = r.left + r.width / 2 - box.left;
          const cy = r.top + r.height / 2 - box.top;
          const dx = pointer.x - cx, dy = pointer.y - cy;
          const dist2 = dx * dx + dy * dy;
          if (dist2 > REPULSE.maxDistance ** 2) return;
          const D = Math.sqrt(dist2) || 1;
          const O = 1 - (D / REPULSE.maxDistance) ** 2;
          const baseScale = Number(card.dataset.baseScale || 1);
          const baseOpacity = Number(card.dataset.baseOpacity || 1);
          const scale = baseScale + (1 - baseScale) * O;
          const opacity = baseOpacity + (1 - baseOpacity) * O;
          const kx = (-dx / D) * O * REPULSE.repulsionStrength;
          const ky = (-dy / D) * O * REPULSE.repulsionStrength;
          card.style.transition = "none";
          card.style.transform = `translate3d(${kx}px, ${ky}px, 0) scale(${scale})`;
          card.style.opacity = String(opacity);
        });

        layers.forEach((layer) => {
          layer.style.transform = `translate3d(${nx * PARALLAX}px, ${ny * PARALLAX}px, 0)`;
        });
      };

      field.addEventListener("pointermove", (e) => {
        const box = field.getBoundingClientRect();
        pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
        if (!queued) { queued = true; requestAnimationFrame(update); }
      }, { passive: true });

      field.addEventListener("pointerleave", () => {
        cards.forEach((card) => {
          card.style.transition = "";  /* 回到 CSS .4s cubic-bezier(.34,1.56,.64,1) 回弹 */
          card.style.transform = `scale(${Number(card.dataset.baseScale || 1)})`;
          card.style.opacity = String(Number(card.dataset.baseOpacity || 1));
        });
        layers.forEach((layer) => (layer.style.transform = ""));
      });
    });
  }

  /* ---------------------------------------------------------------
   * 5. 3D 视差阻尼（鼠标 → 目标值，每帧逼近 15%）
   *    原站 Background:34140-34141：current += (target - current) * .15
   *    这里把结果写成 CSS 变量，供自定义背景/光晕消费。
   * --------------------------------------------------------------- */
  const dampTargets = document.querySelectorAll("[data-damp]");
  if (!REDUCED && dampTargets.length) {
    let targetX = 0, targetY = 0, curX = 0, curY = 0, dampRaf = 0;
    window.addEventListener("pointermove", (e) => {
      targetX = (e.clientX / window.innerWidth - .5) * 2;
      targetY = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
    const loop = () => {
      dampRaf = 0;
      if (document.hidden) return;
      curX = lerp(curX, targetX, .15);
      curY = lerp(curY, targetY, .15);
      root.style.setProperty("--mouse-x", curX.toFixed(4));
      root.style.setProperty("--mouse-y", curY.toFixed(4));
      dampRaf = requestAnimationFrame(loop);
    };
    const startDamp = () => { if (!dampRaf && !document.hidden) dampRaf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", startDamp);
    startDamp();
  }

  /* ---------------------------------------------------------------
   * 6. Intro：三次 ease-out，5000ms，延迟 100ms
   *    原站：e.current = -1 + (1 - (1 - G) ** 3)
   *    把归一化进度写到 --intro-progress（0→1），可做首屏位移/淡入。
   * --------------------------------------------------------------- */
  if (!REDUCED) {
    const INTRO_MS = 5000, DELAY_MS = 100;
    setTimeout(() => {
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / INTRO_MS);
        const p = 1 - (1 - t) ** 3;
        root.style.setProperty("--intro-progress", p.toFixed(4));
        root.dataset.introDone = "true";
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, DELAY_MS);
  } else {
    root.style.setProperty("--intro-progress", "1");
  }

  /* ---------------------------------------------------------------
   * 7. 侧栏与首屏目录卡点击：easeOutExpo 1s 跳转（原站 1292-1300）
   * --------------------------------------------------------------- */
  document.querySelectorAll(".side-nav__link[href^='#'], .toc-card__link[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      smooth.scrollTo(el.getBoundingClientRect().top + window.scrollY, 1000);
    });
  });
})();
