/* =====================================================================
 * orbit.js — Two-Act Scrub Director, Silent Act I Cadence & Astrolabe Compass TOC
 * ---------------------------------------------------------------------
 * V3.3 Compliant:
 *   - Default 100% silent (zero Web Audio oscillator drones)
 *   - Smooth scroll scrub + Play Sequence ↓ / Replay Orbit autoplay
 *   - Asymmetric props parallax synchronized with Act 0 progress
 *   - Fullscreen Matte Bronze Astrolabe Compass TOC:
 *       * Hover right-hand chapter list OR drag compass needle on left
 *       * Spring-damped bronze needle + glowing magenta tip + live bearing readout
 *       * Active chapter scales & shimmers; click jumps cleanly & closes overlay
 * ===================================================================== */
(function () {
  "use strict";

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ---------- 1. Act 0 WebGL Loop + Scroll Scrub + Props Parallax ---------- */
  var track = document.getElementById("orbit");
  var canvas = document.getElementById("orbit-canvas");
  var skyLayer = document.getElementById("orbit-sky-layer");
  var progressBar = document.getElementById("orbit-progress-bar");
  var hud = document.getElementById("orbit-hud");
  var phaseItems = Array.prototype.slice.call(document.querySelectorAll("[data-orbit-phase]"));
  var propEls = Array.prototype.slice.call(document.querySelectorAll("[data-orbit-prop]"));

  var renderer = canvas && window.createOrbitWebGL ? window.createOrbitWebGL(canvas) : null;

  var targetP = 0;
  var smoothP = 0;
  var ptrX = 0, ptrY = 0;
  var smoothMx = 0, smoothMy = 0;
  var autoplayTween = null;

  function computeScrollProgress() {
    if (!track) return 0;
    var rect = track.getBoundingClientRect();
    var scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function updatePhaseUI(p) {
    var activeIdx = p < 0.30 ? 0 : (p < 0.58 ? 1 : (p < 0.88 ? 2 : 3));
    for (var i = 0; i < phaseItems.length; i++) {
      phaseItems[i].classList.toggle("is-active", i === activeIdx);
    }
    if (progressBar) {
      progressBar.style.width = (p * 100).toFixed(2) + "%";
    }
    if (hud) {
      var hudOpacity = clamp(1 - (p - 0.08) / 0.24, 0, 1);
      hud.style.opacity = hudOpacity.toFixed(3);
      hud.style.transform = "translate3d(0," + (p * 34).toFixed(1) + "px,0)";
    }
  }

  function updateProps(p, mx, my, t) {
    var fade = clamp(1 - (p - 0.44) / 0.20, 0, 1);
    for (var i = 0; i < propEls.length; i++) {
      var el = propEls[i];
      var depth = Number(el.getAttribute("data-depth") || 1);
      var dx = Number(el.getAttribute("data-dx") || 0);
      var dy = Number(el.getAttribute("data-dy") || 0);
      var baseRot = Number(el.getAttribute("data-rot") || 0);
      var bob = Math.sin(t * (1.1 + i * 0.21) + i * 1.7) * 7 * depth;
      var tx = mx * 24 * depth + dx * p * 160;
      var ty = my * 18 * depth + dy * p * 140 + bob;
      var rot = baseRot + Math.sin(t * 0.9 + i) * 3.5 + dx * p * 14;
      var sc = 1 + p * 0.14 * depth;
      el.style.opacity = fade.toFixed(3);
      el.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) rotate(" + rot.toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")";
    }
  }

  window.addEventListener("pointermove", function (e) {
    ptrX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    ptrY = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
  }, { passive: true });

  window.addEventListener("scroll", function () {
    if (!autoplayTween) {
      targetP = computeScrollProgress();
    }
  }, { passive: true });

  // Phase click jumps smoothly to that beat inside Act 0
  var phaseTargets = [0.0, 0.44, 0.72, 1.0];
  phaseItems.forEach(function (item, idx) {
    item.addEventListener("click", function () {
      if (!track) return;
      var scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
      var destY = track.offsetTop + scrollable * phaseTargets[idx];
      window.scrollTo({ top: destY, behavior: "smooth" });
    });
  });

  function playOrbitSequence(fromTop) {
    if (!track) return;
    if (autoplayTween && autoplayTween.kill) autoplayTween.kill();
    var scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
    var startY = fromTop ? 0 : window.scrollY;
    var endY = track.offsetTop + scrollable + 12;
    if (fromTop) window.scrollTo(0, 0);

    var proxy = { y: startY };
    if (window.gsap) {
      autoplayTween = window.gsap.to(proxy, {
        y: endY,
        duration: 5.4,
        ease: "power2.inOut",
        onUpdate: function () {
          window.scrollTo(0, proxy.y);
          targetP = computeScrollProgress();
        },
        onComplete: function () { autoplayTween = null; }
      });
    } else {
      window.scrollTo({ top: endY, behavior: "smooth" });
    }
  }

  // Cancel autoplay cleanly if user manually wheels or touches
  function cancelAutoplay() {
    if (autoplayTween && autoplayTween.kill) {
      autoplayTween.kill();
      autoplayTween = null;
    }
  }
  window.addEventListener("wheel", cancelAutoplay, { passive: true });
  window.addEventListener("touchstart", cancelAutoplay, { passive: true });

  var btnPlay = document.getElementById("btn-play-sequence");
  var btnReplay = document.getElementById("btn-replay-orbit");
  if (btnPlay) btnPlay.addEventListener("click", function () { playOrbitSequence(false); });
  if (btnReplay) btnReplay.addEventListener("click", function () { playOrbitSequence(true); });

  var startClock = performance.now();
  function tick(now) {
    if (!document.hidden) {
      var t = (now - startClock) * 0.001;
      targetP = computeScrollProgress();
      smoothP += (targetP - smoothP) * 0.14;
      smoothMx += (ptrX - smoothMx) * 0.08;
      smoothMy += (ptrY - smoothMy) * 0.08;

      if (skyLayer) {
        var skyScale = 1.06 + smoothP * 0.14;
        var skyX = -smoothMx * 14;
        var skyY = -smoothMy * 10 - smoothP * 28;
        skyLayer.style.transform = "translate3d(" + skyX.toFixed(1) + "px," + skyY.toFixed(1) + "px,0) scale(" + skyScale.toFixed(3) + ")";
      }
      if (renderer) {
        renderer.setProgress(smoothP);
        renderer.setPointer(smoothMx, smoothMy);
        renderer.render(t);
      }
      updatePhaseUI(smoothP);
      updateProps(smoothP, smoothMx, smoothMy, t);
    }
    requestAnimationFrame(tick);
  }
  if (!REDUCED) {
    requestAnimationFrame(tick);
  } else {
    if (renderer) renderer.render(0);
  }

  /* ---------- 2. Act I Living Florentine Loggia Silent Cadence Director ---------- */
  var act1Stage = document.getElementById("act1-stage");
  var cadenceBtns = Array.prototype.slice.call(document.querySelectorAll("[data-act1-cadence]"));
  var cadenceNote = document.getElementById("act1-cadence-note");
  var dialHotspot = document.getElementById("act1-dial-hotspot");
  var oscPathA = document.getElementById("osc-wave-a");
  var oscPathB = document.getElementById("osc-wave-b");

  var cadenceCopy = {
    stillness: "Quiet Loggia Study — grounded five-plane perspective with zero audio drone",
    wind: "Loggia Wind — Tuscan valley gusts ripple her silk veil as she leans gently into the breeze",
    pulse: "Harmonic Pulse — knurled aluminum console sweeps a silent magenta wave across the glass screen"
  };

  function setAct1Cadence(mode) {
    if (!act1Stage) return;
    act1Stage.classList.toggle("is-wind", mode === "wind");
    cadenceBtns.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-act1-cadence") === mode);
    });
    if (cadenceNote && cadenceCopy[mode]) {
      cadenceNote.textContent = cadenceCopy[mode];
    }
    if (mode === "pulse" && dialHotspot) {
      dialHotspot.classList.remove("is-pulsing");
      void dialHotspot.offsetWidth;
      dialHotspot.classList.add("is-pulsing");
    }
  }

  cadenceBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setAct1Cadence(btn.getAttribute("data-act1-cadence"));
    });
  });

  if (dialHotspot) {
    dialHotspot.addEventListener("click", function () {
      setAct1Cadence("pulse");
    });
  }

  // Zero-click silent visual director cycling Act I cadences
  if (window.EditionsSceneDirector && act1Stage) {
    var modes = ["stillness", "wind", "pulse"];
    var dir = window.EditionsSceneDirector({
      intervalMs: 5200,
      firstDelayMs: 2000,
      onAmbient: function (step) { setAct1Cadence(modes[step % 3]); },
      onAction: function (step) { setAct1Cadence(modes[step % 3]); }
    });
    dir.start();
  }

  // Gentle live SVG waveform on the console glass
  if (oscPathA && oscPathB && !REDUCED) {
    var waveStart = performance.now();
    function tickWave(now) {
      if (!document.hidden) {
        var t = (now - waveStart) * 0.0022;
        var dA = "M 0 24";
        var dB = "M 0 24";
        for (var x = 0; x <= 200; x += 10) {
          var env = Math.sin((x / 200) * Math.PI);
          var yA = 24 + Math.sin(x * 0.08 + t) * 12 * env;
          var yB = 24 + Math.cos(x * 0.065 - t * 1.25) * 9 * env;
          dA += " L " + x + " " + yA.toFixed(1);
          dB += " L " + x + " " + yB.toFixed(1);
        }
        oscPathA.setAttribute("d", dA);
        oscPathB.setAttribute("d", dB);
      }
      requestAnimationFrame(tickWave);
    }
    requestAnimationFrame(tickWave);
  }

  /* ---------- 3. Sidebar & Theme Sync Across Dark/Light Chapters ---------- */
  var chapters = [
    { id: "orbit",     roman: "I",   name: "Orbit",     deg: 0,   theme: "dark"  },
    { id: "gioconda",  roman: "II",  name: "Gioconda",  deg: 72,  theme: "dark"  },
    { id: "stillness", roman: "III", name: "Stillness", deg: 144, theme: "light" },
    { id: "grammar",   roman: "IV",  name: "Grammar",   deg: 216, theme: "light" },
    { id: "colophon",  roman: "V",   name: "Colophon",  deg: 288, theme: "light" }
  ];

  var railItems = Array.prototype.slice.call(document.querySelectorAll("[data-rail-id]"));
  var navLinks  = Array.prototype.slice.call(document.querySelectorAll("[data-nav-id]"));
  var activeChapterIndex = 0;

  function updateSectionThemes() {
    var probeY = window.innerHeight * 0.42;
    var bestIdx = 0;
    for (var i = 0; i < chapters.length; i++) {
      var el = document.getElementById(chapters[i].id);
      if (!el) continue;
      var rect = el.getBoundingClientRect();
      if (rect.top <= probeY) bestIdx = i;
    }
    activeChapterIndex = bestIdx;
    var ch = chapters[bestIdx];
    document.documentElement.setAttribute("data-nav-theme", ch.theme);
    document.documentElement.setAttribute("data-sidebar-theme", ch.theme);
    railItems.forEach(function (li) {
      li.classList.toggle("is-active", li.getAttribute("data-rail-id") === ch.id);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-nav-id") === ch.id);
    });
  }
  window.addEventListener("scroll", updateSectionThemes, { passive: true });
  updateSectionThemes();

  /* ---------- 4. Fullscreen Renaissance Matte Bronze Astrolabe Compass TOC ---------- */
  var overlay = document.getElementById("compass-overlay");
  var compassSvg = document.getElementById("compass-svg");
  var needleGroup = document.getElementById("compass-needle");
  var readoutDeg = document.getElementById("compass-bearing-deg");
  var readoutName = document.getElementById("compass-bearing-name");
  var compassRows = Array.prototype.slice.call(document.querySelectorAll("[data-compass-idx]"));
  var compassStations = Array.prototype.slice.call(document.querySelectorAll("[data-station-idx]"));
  var openBtns = Array.prototype.slice.call(document.querySelectorAll("[data-open-compass]"));
  var closeBtn = document.getElementById("compass-close");

  var compassOpen = false;
  var needleCurrent = 0;
  var needleTarget = 0;
  var pointedIdx = 0;
  var dragging = false;

  function padDeg(d) {
    var n = ((Math.round(d) % 360) + 360) % 360;
    return (n < 10 ? "00" : (n < 100 ? "0" : "")) + n + "\u00B0";
  }

  function shortestAngleTarget(current, desired) {
    var diff = ((desired - current + 540) % 360) - 180;
    return current + diff;
  }

  function setCompassIndex(idx, moveNeedle) {
    pointedIdx = clamp(idx, 0, chapters.length - 1);
    var ch = chapters[pointedIdx];
    if (moveNeedle !== false) {
      needleTarget = shortestAngleTarget(needleCurrent, ch.deg);
    }
    compassRows.forEach(function (row) {
      row.classList.toggle("is-active", Number(row.getAttribute("data-compass-idx")) === pointedIdx);
    });
    compassStations.forEach(function (st) {
      st.classList.toggle("is-active", Number(st.getAttribute("data-station-idx")) === pointedIdx);
    });
    if (readoutName) {
      readoutName.textContent = ch.roman + " \u00B7 " + ch.name.toUpperCase();
    }
  }

  function openCompass() {
    if (!overlay) return;
    compassOpen = true;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setCompassIndex(activeChapterIndex, true);
  }

  function closeCompass() {
    if (!overlay) return;
    compassOpen = false;
    dragging = false;
    if (compassSvg) compassSvg.classList.remove("is-dragging");
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function navigateToChapter(idx) {
    var ch = chapters[clamp(idx, 0, chapters.length - 1)];
    closeCompass();
    var targetEl = document.getElementById(ch.id);
    if (targetEl) {
      window.scrollTo({ top: targetEl.offsetTop, behavior: "smooth" });
    }
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", openCompass);
  });
  if (closeBtn) closeBtn.addEventListener("click", closeCompass);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && compassOpen) {
      closeCompass();
    } else if ((e.key === "c" || e.key === "C") && !compassOpen && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      if (tag !== "input" && tag !== "textarea") openCompass();
    }
  });

  compassRows.forEach(function (row) {
    var idx = Number(row.getAttribute("data-compass-idx"));
    row.addEventListener("mouseenter", function () {
      if (!dragging) setCompassIndex(idx, true);
    });
    row.addEventListener("focus", function () {
      if (!dragging) setCompassIndex(idx, true);
    });
    row.addEventListener("click", function () {
      navigateToChapter(idx);
    });
  });

  compassStations.forEach(function (st) {
    var idx = Number(st.getAttribute("data-station-idx"));
    st.addEventListener("mouseenter", function () {
      if (!dragging) setCompassIndex(idx, true);
    });
    st.addEventListener("click", function (e) {
      e.stopPropagation();
      navigateToChapter(idx);
    });
  });

  function pointerToAngle(e) {
    var rect = compassSvg.getBoundingClientRect();
    var cx = rect.left + rect.width * 0.5;
    var cy = rect.top + rect.height * 0.5;
    var rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    var deg = (rad * 180 / Math.PI) + 90;
    return ((deg % 360) + 360) % 360;
  }

  function updateFromPointer(e) {
    var deg = pointerToAngle(e);
    needleTarget = shortestAngleTarget(needleCurrent, deg);
    var nearest = Math.round(deg / 72) % chapters.length;
    setCompassIndex(nearest, false);
  }

  if (compassSvg) {
    compassSvg.addEventListener("pointerdown", function (e) {
      if (e.target.closest && e.target.closest("[data-station-idx]")) return;
      dragging = true;
      compassSvg.classList.add("is-dragging");
      if (compassSvg.setPointerCapture) compassSvg.setPointerCapture(e.pointerId);
      updateFromPointer(e);
    });
    compassSvg.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      updateFromPointer(e);
    });
    compassSvg.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      compassSvg.classList.remove("is-dragging");
      // Snap cleanly to the nearest chapter station
      setCompassIndex(pointedIdx, true);
    });
    compassSvg.addEventListener("pointercancel", function () {
      dragging = false;
      compassSvg.classList.remove("is-dragging");
    });
  }

  function tickCompass() {
    if (compassOpen && needleGroup) {
      var damp = dragging ? 0.32 : 0.14;
      needleCurrent += (needleTarget - needleCurrent) * damp;
      needleGroup.setAttribute("transform", "rotate(" + needleCurrent.toFixed(2) + " 220 220)");
      if (readoutDeg) {
        readoutDeg.textContent = padDeg(needleCurrent);
      }
    }
    requestAnimationFrame(tickCompass);
  }
  requestAnimationFrame(tickCompass);
})();
