/* =====================================================================
 * 零点击纯视觉自主演出编导（ambient-director.js · V3.3 默认全程静音）
 * ---------------------------------------------------------------------
 * 规范出处：references/04-motion-and-stage3d.md §4.5
 * 职责：
 *   EditionsSceneDirector：零点击纯视觉自主演出循环编导
 *   - 无需用户点击按钮，按 5.2–6.0s 节拍自动交替触发「环境动态」与「主体动作」
 *   - 尊重 prefers-reduced-motion 与页面后台隐藏（document.hidden）
 *   - V3.3 铁律：彻底移除旧版 Web Audio 振荡器合成背景音，全站默认全程静音
 * ===================================================================== */
(function () {
  "use strict";

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function EditionsSceneDirector(options) {
    var opts = options || {};
    var intervalMs = Number(opts.intervalMs || 5600);
    var firstDelayMs = Number(opts.firstDelayMs || 1800);
    var onAmbient = typeof opts.onAmbient === "function" ? opts.onAmbient : function () {};
    var onAction = typeof opts.onAction === "function" ? opts.onAction : function () {};

    var timer = 0;
    var step = 0;
    var running = false;

    function runStep() {
      if (!running || document.hidden || REDUCED) return;
      if (step % 2 === 0) {
        onAmbient(step);
      } else {
        onAction(step);
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
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (timer) {
          window.clearTimeout(timer);
          timer = 0;
        }
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

  window.EditionsSceneDirector = EditionsSceneDirector;
})();
