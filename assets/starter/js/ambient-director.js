/* =====================================================================
 * 零点击自主演出编导 & 离线程序化声场引擎（ambient-director.js · V3.1）
 * ---------------------------------------------------------------------
 * 规范出处：references/04-motion-and-stage3d.md §4.5
 * 职责：
 *   1. EditionsSoundEngine：100% 离线 Web Audio API 程序化声场
 *      - 432 Hz 五度静谧共鸣底座 + 慢速低通滤波呼吸
 *      - 柔和粉红噪声环境微风（可由场景风阵脉冲调制）
 *      - 纯净泛音拨弦（用于主体交互/调谐瞬间反馈）
 *      - 零外部音频 URL；页面加载立即尝试启动，被浏览器 autoplay 策略拦截时
 *        在首次 pointerdown / pointermove / wheel / touchstart / keydown 自动静默解锁
 *      - 自动绑定顶栏 [data-sound-toggle] 静音按钮
 *   2. EditionsSceneDirector：零点击自主演出循环编导
 *      - 无需用户点击按钮，按 5.2–6.0s 节拍自动交替触发「环境动态」与「主体动作」
 *      - 尊重 prefers-reduced-motion 与页面后台隐藏（document.hidden）
 * ===================================================================== */
(function () {
  "use strict";

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ===================================================================
   * 一、离线程序化声场引擎（EditionsSoundEngine）
   * =================================================================== */
  var EditionsSoundEngine = (function () {
    var ctx = null;
    var masterGain = null;
    var padGain = null;
    var padFilter = null;
    var windGain = null;
    var windFilter = null;
    var oscA = null;
    var oscB = null;
    var oscC = null;
    var enabled = true;
    var started = false;
    var mode = "stillness";

    var MODE_PRESETS = {
      stillness: { baseFreq: 108, padLevel: 0.085, cutoff: 420, windLevel: 0.018 },
      ambient:   { baseFreq: 121.5, padLevel: 0.075, cutoff: 560, windLevel: 0.036 },
      harmonic:  { baseFreq: 144, padLevel: 0.095, cutoff: 740, windLevel: 0.024 }
    };

    function syncToggleButtons() {
      var btns = document.querySelectorAll("[data-sound-toggle]");
      for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        btn.setAttribute("aria-pressed", enabled ? "true" : "false");
        btn.textContent = enabled ? "Sound On" : "Sound Off";
      }
    }

    function createPinkNoiseBuffer(audioCtx) {
      var seconds = 3;
      var length = audioCtx.sampleRate * seconds;
      var buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      var out = buffer.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (var i = 0; i < length; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }
      return buffer;
    }

    function ensureGraph() {
      if (ctx) return true;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      masterGain.gain.value = 0.0001;
      masterGain.connect(ctx.destination);

      /* 432 Hz 五度静谧共鸣底座（108 Hz / 162 Hz / 216 Hz） */
      padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = MODE_PRESETS.stillness.cutoff;
      padFilter.Q.value = 0.7;

      padGain = ctx.createGain();
      padGain.gain.value = MODE_PRESETS.stillness.padLevel;
      padFilter.connect(padGain);
      padGain.connect(masterGain);

      var lfo = ctx.createOscillator();
      var lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.085;
      lfoGain.gain.value = 95;
      lfo.connect(lfoGain);
      lfoGain.connect(padFilter.frequency);
      lfo.start();

      oscA = ctx.createOscillator();
      oscB = ctx.createOscillator();
      oscC = ctx.createOscillator();
      oscA.type = "sine";
      oscB.type = "triangle";
      oscC.type = "sine";

      var gA = ctx.createGain();
      var gB = ctx.createGain();
      var gC = ctx.createGain();
      gA.gain.value = 0.55;
      gB.gain.value = 0.22;
      gC.gain.value = 0.28;

      oscA.frequency.value = 108;
      oscB.frequency.value = 162;
      oscC.frequency.value = 216.6;

      oscA.connect(gA); gA.connect(padFilter);
      oscB.connect(gB); gB.connect(padFilter);
      oscC.connect(gC); gC.connect(padFilter);

      oscA.start();
      oscB.start();
      oscC.start();

      /* 柔和粉红噪声环境微风 */
      var noise = ctx.createBufferSource();
      noise.buffer = createPinkNoiseBuffer(ctx);
      noise.loop = true;

      windFilter = ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.value = 340;
      windFilter.Q.value = 1.4;

      windGain = ctx.createGain();
      windGain.gain.value = MODE_PRESETS.stillness.windLevel;

      noise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      noise.start();

      return true;
    }

    function applyMasterLevel(rampSeconds) {
      if (!ctx || !masterGain) return;
      var now = ctx.currentTime;
      var target = enabled ? 0.85 : 0.0001;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(target, now, rampSeconds || 0.35);
    }

    function tryStart() {
      if (REDUCED || !enabled) return;
      if (!ensureGraph()) return;
      if (ctx.state === "suspended") {
        ctx.resume().then(function () {
          started = true;
          applyMasterLevel(0.6);
        }).catch(function () {
          /* 被浏览器策略拦截时静默等待首次交互解锁 */
        });
      } else {
        started = true;
        applyMasterLevel(0.6);
      }
    }

    function bindUnlockEvents() {
      var events = ["pointerdown", "pointermove", "wheel", "touchstart", "keydown"];
      function unlock() {
        if (!enabled) return;
        tryStart();
        if (ctx && ctx.state === "running") {
          for (var i = 0; i < events.length; i++) {
            window.removeEventListener(events[i], unlock);
          }
        }
      }
      for (var i = 0; i < events.length; i++) {
        window.addEventListener(events[i], unlock, { passive: true });
      }
    }

    function setMode(nextMode) {
      var preset = MODE_PRESETS[nextMode] || MODE_PRESETS.stillness;
      mode = nextMode;
      if (!ctx) return;
      var now = ctx.currentTime;
      oscA.frequency.setTargetAtTime(preset.baseFreq, now, 0.45);
      oscB.frequency.setTargetAtTime(preset.baseFreq * 1.5, now, 0.45);
      oscC.frequency.setTargetAtTime(preset.baseFreq * 2.005, now, 0.45);
      padFilter.frequency.setTargetAtTime(preset.cutoff, now, 0.45);
      padGain.gain.setTargetAtTime(preset.padLevel, now, 0.45);
      windGain.gain.setTargetAtTime(preset.windLevel, now, 0.45);
    }

    function pulseWind(durationSec) {
      if (!ctx || !enabled || ctx.state !== "running") return;
      var d = durationSec || 2.2;
      var now = ctx.currentTime;
      var base = (MODE_PRESETS[mode] || MODE_PRESETS.stillness).windLevel;
      windGain.gain.cancelScheduledValues(now);
      windGain.gain.setTargetAtTime(base * 2.4, now, 0.35);
      windGain.gain.setTargetAtTime(base, now + d * 0.55, 0.75);
      windFilter.frequency.cancelScheduledValues(now);
      windFilter.frequency.setTargetAtTime(580, now, 0.4);
      windFilter.frequency.setTargetAtTime(340, now + d * 0.55, 0.8);
    }

    function pluck(freq) {
      if (!ctx || !enabled || ctx.state !== "running") return;
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq || 432, now);
      osc.frequency.exponentialRampToValueAtTime((freq || 432) * 1.004, now + 0.6);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.055, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.0);
    }

    function setEnabled(next) {
      enabled = !!next;
      syncToggleButtons();
      if (enabled) {
        tryStart();
      } else {
        applyMasterLevel(0.18);
      }
    }

    function toggle() {
      setEnabled(!enabled);
      return enabled;
    }

    function init(opts) {
      if (opts && typeof opts.enabled === "boolean") enabled = opts.enabled;
      syncToggleButtons();

      document.addEventListener("click", function (e) {
        var btn = e.target && e.target.closest ? e.target.closest("[data-sound-toggle]") : null;
        if (!btn) return;
        toggle();
      });

      bindUnlockEvents();
      if (enabled && !REDUCED) {
        tryStart();
      }
    }

    return {
      init: init,
      setMode: setMode,
      pulseWind: pulseWind,
      pluck: pluck,
      setEnabled: setEnabled,
      toggle: toggle,
      isEnabled: function () { return enabled; },
      isStarted: function () { return started; }
    };
  })();

  /* ===================================================================
   * 二、零点击自主演出循环编导（EditionsSceneDirector）
   * =================================================================== */
  function EditionsSceneDirector(options) {
    var opts = options || {};
    var intervalMs = Number(opts.intervalMs || 5600);
    var firstDelayMs = Number(opts.firstDelayMs || 1800);
    var onAmbient = typeof opts.onAmbient === "function" ? opts.onAmbient : function () {};
    var onAction = typeof opts.onAction === "function" ? opts.onAction : function () {};
    var sound = opts.sound !== false ? EditionsSoundEngine : null;

    var timer = 0;
    var step = 0;
    var running = false;

    function runStep() {
      if (!running || document.hidden || REDUCED) return;
      if (step % 2 === 0) {
        onAmbient(step);
        if (sound) sound.pulseWind(2.2);
      } else {
        onAction(step);
        if (sound) sound.pluck(step % 4 === 1 ? 432 : 324);
      }
      step += 1;
      timer = window.setTimeout(runStep, intervalMs);
    }

    function start() {
      if (running || REDUCED) return;
      running = true;
      timer = window.setTimeout(runStep, firstDelayMs);
    }

    function stop() {
      running = false;
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    }

    function triggerAction() {
      onAction(step);
      if (sound) sound.pluck(432);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (timer) { window.clearTimeout(timer); timer = 0; }
      } else if (running && !timer) {
        timer = window.setTimeout(runStep, 1200);
      }
    });

    return {
      start: start,
      stop: stop,
      triggerAction: triggerAction
    };
  }

  /* 暴露全局接口，并自动激活页面上的 [data-sound-toggle]（如已存在） */
  window.EditionsSoundEngine = EditionsSoundEngine;
  window.EditionsSceneDirector = EditionsSceneDirector;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (document.querySelector("[data-sound-toggle]")) {
        EditionsSoundEngine.init();
      }
    });
  } else if (document.querySelector("[data-sound-toggle]")) {
    EditionsSoundEngine.init();
  }
})();
