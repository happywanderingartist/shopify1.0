/* =====================================================================
 * compass.js — 独立全屏文艺复兴哑光古铜星盘罗盘时钟目录交互引擎
 * ---------------------------------------------------------------------
 * 交互规范：
 *   1. 顶栏「Compass」按钮或侧栏入口一键唤出，打开时自动对准当前所在章节。
 *   2. 双向自由联动：
 *      - 鼠标悬停/键盘聚焦右侧任一章节名 → 左侧古铜指针顺滑按最短弧转向对应刻度。
 *      - 直接按住/拖拽旋转左侧古铜表盘或指针 → 实时转动 360°、更新方位读数，
 *        同步让右侧被指向的章节名平滑放大并触发呼吸闪烁微光；松手轻柔吸附最近刻度。
 *   3. 点击任一章节名、罗盘刻度节点或按 Enter → 优雅关闭罗盘并平滑跳转对应章节。
 *   4. 全程 100% 静音无嗡鸣，完整支持 Esc 关闭、方向键切换与 prefers-reduced-motion。
 * ===================================================================== */
(() => {
  "use strict";

  const modal = document.getElementById("compass-directory");
  if (!modal) return;

  const REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CHAPTERS = [
    { id: "orbit",    roman: "I",   title: "Orbit",     angle: 0,   sub: "Act 0 · Weightless Kickflip & 3D Hardware Prologue" },
    { id: "cover",    roman: "II",  title: "Gioconda",  angle: 72,  sub: "Act I · Five-Plane Living Florentine Loggia" },
    { id: "study",    roman: "III", title: "Stillness", angle: 144, sub: "Plate 02 · Marble Desk & Hands Quiet Study" },
    { id: "tokens",   roman: "IV",  title: "Grammar",   angle: 216, sub: "Spatial Rules · Slash Token Architecture" },
    { id: "colophon", roman: "V",   title: "Colophon",  angle: 288, sub: "Craft Record · Two-Act Editorial Specification" }
  ];

  const svgRoot = modal.querySelector(".compass-svg");
  const SVG_NS = svgRoot ? svgRoot.namespaceURI : "";
  const CX = 260;
  const CY = 260;

  const dialWrap      = modal.querySelector("[data-compass-dial]");
  const ticksGroup    = modal.querySelector("[data-compass-ticks]");
  const stationsGroup = modal.querySelector("[data-compass-stations]");
  const needleGroup   = modal.querySelector("[data-compass-needle]");
  const readoutDeg    = modal.querySelector("[data-compass-deg]");
  const readoutName   = modal.querySelector("[data-compass-active-name]");
  const itemEls       = Array.from(modal.querySelectorAll("[data-compass-item]"));
  const openBtns      = Array.from(document.querySelectorAll("[data-compass-open]"));
  const closeBtns     = Array.from(modal.querySelectorAll("[data-compass-close]"));

  let isOpen = false;
  let activeIndex = 0;
  let currentAngle = 0;
  let targetAngle = 0;
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let rafId = null;
  let lastTriggerEl = null;
  const stationEls = [];

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      el.setAttribute(k, String(v));
    }
    return el;
  }

  function normDeg(deg) {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
  }

  function shortestAngleDiff(from, to) {
    return ((to - from + 540) % 360) - 180;
  }

  function angleToChapterIndex(deg) {
    const a = normDeg(deg);
    let bestIdx = 0;
    let bestDist = 999;
    for (let i = 0; i < CHAPTERS.length; i++) {
      const dist = Math.abs(shortestAngleDiff(a, CHAPTERS[i].angle));
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  /* ---- 1. 程序化雕刻 72 条精密古铜刻度与 5 个罗马数字方位节点 ---- */
  function buildDialGraphics() {
    if (ticksGroup) {
      for (let i = 0; i < 72; i++) {
        const deg = i * 5;
        const rad = (deg - 90) * (Math.PI / 180);
        const isMajor = deg % 30 === 0;
        const isChapter = CHAPTERS.some((c) => c.angle === deg);
        const rOuter = 224;
        const rInner = isChapter ? 202 : isMajor ? 208 : 215;

        const line = svgEl("line", {
          x1: (CX + Math.cos(rad) * rInner).toFixed(2),
          y1: (CY + Math.sin(rad) * rInner).toFixed(2),
          x2: (CX + Math.cos(rad) * rOuter).toFixed(2),
          y2: (CY + Math.sin(rad) * rOuter).toFixed(2),
          stroke: isChapter ? "#e0c589" : isMajor ? "rgba(184,155,98,0.62)" : "rgba(184,155,98,0.28)",
          "stroke-width": isChapter ? "1.6" : isMajor ? "1.1" : "0.75"
        });
        ticksGroup.appendChild(line);
      }

      // 东南西北微刻方位字
      const cardinals = [
        { label: "N", deg: 0 },
        { label: "E", deg: 90 },
        { label: "S", deg: 180 },
        { label: "W", deg: 270 }
      ];
      for (const c of cardinals) {
        const rad = (c.deg - 90) * (Math.PI / 180);
        const r = 242;
        const txt = svgEl("text", {
          x: (CX + Math.cos(rad) * r).toFixed(2),
          y: (CY + Math.sin(rad) * r).toFixed(2),
          fill: "rgba(184, 155, 98, 0.48)",
          "font-size": "9.5",
          "letter-spacing": "0.14em",
          "text-anchor": "middle",
          "dominant-baseline": "central",
          "font-family": "var(--f-ui)"
        });
        txt.textContent = c.label;
        ticksGroup.appendChild(txt);
      }
    }

    if (stationsGroup) {
      CHAPTERS.forEach((ch, idx) => {
        const rad = (ch.angle - 90) * (Math.PI / 180);
        const rNode = 178;
        const nx = CX + Math.cos(rad) * rNode;
        const ny = CY + Math.sin(rad) * rNode;
        const rPip = 201;
        const px = CX + Math.cos(rad) * rPip;
        const py = CY + Math.sin(rad) * rPip;

        const g = svgEl("g", {
          class: "compass-station",
          "data-station-index": idx,
          role: "button",
          tabindex: "-1",
          "aria-label": `${ch.roman} ${ch.title}`
        });

        g.appendChild(svgEl("circle", {
          class: "compass-station__pip",
          cx: px.toFixed(2),
          cy: py.toFixed(2),
          r: "3.2"
        }));

        g.appendChild(svgEl("circle", {
          class: "compass-station__ring",
          cx: nx.toFixed(2),
          cy: ny.toFixed(2),
          r: "19"
        }));

        const label = svgEl("text", {
          class: "compass-station__roman",
          x: nx.toFixed(2),
          y: ny.toFixed(2)
        });
        label.textContent = ch.roman;
        g.appendChild(label);

        g.addEventListener("pointerenter", () => {
          if (!isDragging) setActiveChapter(idx, false);
        });
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          if (dragMoved) return;
          navigateToChapter(idx);
        });

        stationsGroup.appendChild(g);
        stationEls.push(g);
      });
    }
  }

  /* ---- 2. 状态同步：更新高亮章节与读数 ---- */
  function setActiveChapter(idx, immediateAngle) {
    const safeIdx = ((idx % CHAPTERS.length) + CHAPTERS.length) % CHAPTERS.length;
    activeIndex = safeIdx;
    const ch = CHAPTERS[safeIdx];

    if (!isDragging) {
      const diff = shortestAngleDiff(currentAngle, ch.angle);
      targetAngle = currentAngle + diff;
      if (immediateAngle || REDUCED) {
        currentAngle = ch.angle;
        targetAngle = ch.angle;
        renderNeedle(currentAngle);
      }
    }

    itemEls.forEach((el, i) => {
      const isAct = i === safeIdx;
      el.classList.toggle("is-active", isAct);
      const btn = el.querySelector("button");
      if (btn) btn.setAttribute("aria-current", isAct ? "true" : "false");
    });

    stationEls.forEach((el, i) => {
      el.classList.toggle("is-active", i === safeIdx);
    });

    if (readoutName) {
      readoutName.textContent = `${ch.roman} · ${ch.title}`;
    }
    if (readoutDeg && !isDragging) {
      readoutDeg.textContent = `${String(Math.round(ch.angle)).padStart(3, "0")}°`;
    }
  }

  function renderNeedle(deg) {
    if (needleGroup) {
      needleGroup.style.transform = `rotate(${deg.toFixed(2)}deg)`;
    }
    if (readoutDeg) {
      const d = Math.round(normDeg(deg)) % 360;
      readoutDeg.textContent = `${String(d).padStart(3, "0")}°`;
    }
  }

  function animateCompass() {
    if (!isOpen) {
      rafId = null;
      return;
    }
    const diff = targetAngle - currentAngle;
    if (Math.abs(diff) > 0.04) {
      currentAngle += diff * (isDragging ? 0.34 : 0.14);
      renderNeedle(currentAngle);
    } else if (Math.abs(diff) > 0) {
      currentAngle = targetAngle;
      renderNeedle(currentAngle);
    }
    rafId = requestAnimationFrame(animateCompass);
  }

  /* ---- 3. 直接拨动/拖拽罗盘指针交互（鼠标 + 触控通用） ---- */
  function pointerAngleFromEvent(e) {
    const rect = dialWrap.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // 12 点钟方向为 0°，顺时针递增
    const rad = Math.atan2(dy, dx);
    return normDeg(rad * (180 / Math.PI) + 90);
  }

  if (dialWrap) {
    dialWrap.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dialWrap.classList.add("is-dragging");
      if (dialWrap.setPointerCapture) {
        try { dialWrap.setPointerCapture(e.pointerId); } catch (_) {}
      }
      const deg = pointerAngleFromEvent(e);
      targetAngle = currentAngle + shortestAngleDiff(currentAngle, deg);
      const nearest = angleToChapterIndex(deg);
      setActiveChapter(nearest, false);
    });

    dialWrap.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > 6) {
        dragMoved = true;
      }
      const deg = pointerAngleFromEvent(e);
      targetAngle = currentAngle + shortestAngleDiff(currentAngle, deg);
      if (REDUCED) {
        currentAngle = deg;
        renderNeedle(currentAngle);
      }
      const nearest = angleToChapterIndex(deg);
      if (nearest !== activeIndex) {
        setActiveChapter(nearest, false);
      }
    });

    function finishDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      dialWrap.classList.remove("is-dragging");
      if (dialWrap.releasePointerCapture) {
        try { dialWrap.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      // 松手后平滑吸附至当前激活章节的精确刻度
      const snapDeg = CHAPTERS[activeIndex].angle;
      targetAngle = currentAngle + shortestAngleDiff(currentAngle, snapDeg);
      if (REDUCED) {
        currentAngle = snapDeg;
        renderNeedle(currentAngle);
      }
      setTimeout(() => { dragMoved = false; }, 60);
    }

    dialWrap.addEventListener("pointerup", finishDrag);
    dialWrap.addEventListener("pointercancel", finishDrag);

    // 滚轮轻拨指针切章
    let wheelLock = 0;
    dialWrap.addEventListener("wheel", (e) => {
      if (!isOpen) return;
      e.preventDefault();
      const now = performance.now();
      if (now - wheelLock < 140) return;
      wheelLock = now;
      const step = e.deltaY > 0 ? 1 : -1;
      setActiveChapter(activeIndex + step, false);
    }, { passive: false });
  }

  /* ---- 4. 右侧五排目录悬停/聚焦/点击联动 ---- */
  itemEls.forEach((item, idx) => {
    const btn = item.querySelector("button");
    if (!btn) return;
    btn.addEventListener("pointerenter", () => {
      if (!isDragging) setActiveChapter(idx, false);
    });
    btn.addEventListener("focus", () => {
      if (!isDragging) setActiveChapter(idx, false);
    });
    btn.addEventListener("click", () => {
      navigateToChapter(idx);
    });
  });

  /* ---- 5. 打开、关闭与章节精准跳转 ---- */
  function detectCurrentIndex() {
    if (window.__orbitCinema && typeof window.__orbitCinema.getCurrentChapterId === "function") {
      const id = window.__orbitCinema.getCurrentChapterId();
      const idx = CHAPTERS.findIndex((c) => c.id === id);
      if (idx >= 0) return idx;
    }
    return 0;
  }

  function openCompass(triggerEl) {
    if (isOpen) return;
    lastTriggerEl = triggerEl || document.activeElement;
    isOpen = true;

    const startIdx = detectCurrentIndex();
    currentAngle = CHAPTERS[startIdx].angle;
    targetAngle = currentAngle;
    setActiveChapter(startIdx, true);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    openBtns.forEach((b) => b.setAttribute("aria-expanded", "true"));

    if (!REDUCED && !rafId) {
      rafId = requestAnimationFrame(animateCompass);
    }

    const activeBtn = itemEls[startIdx] && itemEls[startIdx].querySelector("button");
    if (activeBtn) {
      setTimeout(() => { try { activeBtn.focus({ preventScroll: true }); } catch (_) {} }, 60);
    }
  }

  function closeCompass(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;
    isDragging = false;
    if (dialWrap) dialWrap.classList.remove("is-dragging");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    openBtns.forEach((b) => b.setAttribute("aria-expanded", "false"));
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (restoreFocus && lastTriggerEl && typeof lastTriggerEl.focus === "function") {
      try { lastTriggerEl.focus({ preventScroll: true }); } catch (_) {}
    }
  }

  function navigateToChapter(idx) {
    const ch = CHAPTERS[idx];
    if (!ch) return;
    setActiveChapter(idx, false);
    closeCompass(false);
    setTimeout(() => {
      if (window.__orbitCinema && typeof window.__orbitCinema.jumpToChapter === "function") {
        window.__orbitCinema.jumpToChapter(ch.id);
      } else {
        const el = document.getElementById(ch.id);
        if (el) el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      }
    }, 90);
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => openCompass(btn));
  });
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => closeCompass(true));
  });

  // 点击背景暗场空白处也可关闭
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeCompass(true);
  });

  // 键盘导航：Esc 关闭、方向键顺/逆时针拨转罗盘、回车直达章节
  window.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeCompass(true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveChapter(activeIndex + 1, false);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveChapter(activeIndex - 1, false);
    } else if (e.key === "Enter" && document.activeElement && !document.activeElement.hasAttribute("data-compass-close")) {
      e.preventDefault();
      navigateToChapter(activeIndex);
    }
  });

  buildDialGraphics();
  setActiveChapter(0, true);

  window.__compassDirectory = {
    open: () => openCompass(null),
    close: () => closeCompass(false),
    setChapter: (idx) => setActiveChapter(idx, false),
    getActiveIndex: () => activeIndex,
    isOpen: () => isOpen
  };
})();
