/* =====================================================================
 * gioconda.js — Chapter XIV 活体人物表情与关节动画 + 人与环境和谐联动总控
 * ---------------------------------------------------------------------
 * 1. Canvas 2D 活体角色引擎（L4 0px，原生 1376×768 像素精准对位）：
 *    - 稳坐重力底座：大理石桌、音频台底座、下身丝绒与左手 100% 稳定接地零漂浮
 *    - 胸腔微呼吸：以桌面为锚点极轻微起伏，绝不令人物整体漂移
 *    - 丝纱与袖褶实时风浪：按风势在透明黑纱外缘做柔波位移（面部与耳机零变形）
 *    - 颈枢转头与轻点：柔和跟随环境风势、桌面调音与观者鼠标视线
 *    - 活体微表情：
 *        * 双眼虹膜随视线在旋钮 / 廊外山谷 / 观者间自然流转 + 冷北光高光眼神光
 *        * 真实瓷釉肤色上眼睑自然眨眼 + 迎风舒缓轻闭睁眼
 *        * 蒙娜丽莎嘴角微扬与脸颊暖晕柔变（微笑深浅随情绪自然呼吸）
 *    - 肘枢右前臂与手指实拧旋钮：旋钮高光同步旋转 + 洋红底座环呼吸脉冲
 *    - 熏黑玻璃屏实时双轨示波器：精准裁切于实测等轴四角，0.0px 偏移
 * 2. 场景总控（人与环境和谐互动）：
 *    - 微风传导序列（远→近）：远山冷雾(0s) → 廊外柏枝(+0.35s) → 丝纱波纹(+0.70s)
 *      & 前景摊开古书微颤(+0.75s) → 蒙娜丽莎侧耳迎风、望向山谷、轻闭眼舒心微笑(+0.95s)
 *    - 调音互动序列（人→物→境）：低头看旋钮(0s) → 右手拧转旋钮(+0.10s) →
 *      玻璃屏声波跃动 & 光尘升起(+0.18s) → 抬眼望向观者并绽开一抹含蓄笑意(+0.55s)
 * ===================================================================== */
(() => {
  "use strict";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;

  if (gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);
    if (window.DrawSVGPlugin) gsap.registerPlugin(window.DrawSVGPlugin);
  }

  /* -----------------------------------------------------------------
   * 1. 共享场景情绪与物理状态（连接 5 层环境、Canvas 人物、旋钮与示波器）
   * ----------------------------------------------------------------- */
  const ACOUSTIC_MODES = {
    stillness: {
      label: "432 Hz Stillness",
      caption: "432 Hz Stillness — serene gaze, gentle loggia breeze, and steady acoustic resonance",
      freqA: 2.2,
      freqB: 4.4,
      speed: 1.55,
      amp: 0.30,
      harmonicMix: 0.24,
      windBase: 0.36,
      windScale: 1.0,
      magentaAlpha: 0.66
    },
    loggia: {
      label: "Loggia Wind",
      caption: "Loggia Wind — Tuscan valley gusts ripple her silk veil as she leans gently into the breeze",
      freqA: 1.4,
      freqB: 5.6,
      speed: 2.5,
      amp: 0.36,
      harmonicMix: 0.46,
      windBase: 0.92,
      windScale: 1.95,
      magentaAlpha: 0.80
    },
    harmonic: {
      label: "Harmonic Pulse",
      caption: "Harmonic Pulse — her fingertips turn the rotary dial, lifting dual-trace fifth overtones",
      freqA: 3.4,
      freqB: 6.8,
      speed: 3.4,
      amp: 0.42,
      harmonicMix: 0.64,
      windBase: 0.48,
      windScale: 1.28,
      magentaAlpha: 0.96
    }
  };
  const MODE_ORDER = ["stillness", "loggia", "harmonic"];
  let currentModeKey = "stillness";

  const rigState = {
    /* 头部与视线 */
    headAngle: 0,       /* deg: 负=向左(廊外山谷)，正=向右 */
    headNod: 0,         /* px: 正=低头看控制台 */
    gazeX: 0,           /* -1..+1 */
    gazeY: 0,           /* -1..+1 (+1=向下看旋钮) */
    catchlight: 0.72,   /* 眼神冷北光亮度 */
    /* 表情 */
    blink: 0,           /* 0=睁眼，1=轻闭眼 */
    smile: 0.22,        /* 0..1 含蓄微笑深浅 */
    browLift: 0.10,     /* 0..1 轻舒眉梢 */
    /* 手部拧旋钮、左手节拍轻抬与设备 */
    handRot: 0,         /* deg 右手肘枢拧转角度（实测清晰可见） */
    handX: 0,           /* px 右手横向拧动位移 */
    handY: 0,           /* px 右手轻抬/按压位移 */
    leftHandLift: 0,    /* 0..1 左手随乐律/微风轻抬幅度 */
    dialAngle: 0,       /* rad 旋钮金属拉丝高光与刻度转角 */
    dialGlow: 0.55,     /* 洋红底座光环强度 */
    /* 环境风势联动 */
    windEnergy: 0.36,   /* 0..1.35 驱动丝纱波浪与古书页角微颤 */
    /* 示波器参数 */
    freqA: ACOUSTIC_MODES.stillness.freqA,
    freqB: ACOUSTIC_MODES.stillness.freqB,
    speed: ACOUSTIC_MODES.stillness.speed,
    amp: ACOUSTIC_MODES.stillness.amp,
    harmonicMix: ACOUSTIC_MODES.stillness.harmonicMix,
    surge: 0
  };

  /* -----------------------------------------------------------------
   * 1.5 静默占位声场接口（遵循用户要求：彻底关闭嗡鸣背景音，仅保留纯视觉波形与微风联动）
   * ----------------------------------------------------------------- */
  const SoundEngine = {
    setMode() {},
    playPluck() {},
    swellWind() {},
    startOrUnlock() {}
  };

  /* -----------------------------------------------------------------
   * 2. 首屏 5 层入场与环境持续动画（远山冷雾、柏枝、光尘、前景古书）
   * ----------------------------------------------------------------- */
  let drawTimeline = null;
  let splitTitle = null;
  let entranceTimelines = [];
  let ambientTweens = [];
  let windTimeline = null;
  let mistTweens = [];
  let conductorTimers = [];

  function clearEntrances() {
    entranceTimelines.forEach((t) => t && t.kill());
    entranceTimelines = [];
  }

  function clearAmbientLayerLife() {
    ambientTweens.forEach((t) => t && t.kill());
    ambientTweens = [];
    windTimeline = null;
    mistTweens = [];
  }

  function clearConductorTimers() {
    conductorTimers.forEach((id) => clearTimeout(id));
    conductorTimers = [];
  }

  function playHeroEntrances() {
    if (REDUCED || !gsap) return;
    clearEntrances();

    const archPlate = document.querySelector(".arch-plate");
    if (archPlate) {
      entranceTimelines.push(gsap.fromTo(archPlate,
        { opacity: 0.84 },
        { opacity: 1, duration: 0.9, ease: "power2.out" }
      ));
    }
    const monaPlate = document.querySelector(".mona-stage-plate");
    if (monaPlate) {
      entranceTimelines.push(gsap.fromTo(monaPlate,
        { opacity: 0.88 },
        { opacity: 1, duration: 0.85, ease: "power2.out" }
      ));
    }

    const paths = document.querySelectorAll(".gioconda-davinci [data-draw]");
    if (paths.length) {
      if (drawTimeline) drawTimeline.kill();
      if (window.DrawSVGPlugin) {
        gsap.set(paths, { drawSVG: "0%" });
        drawTimeline = gsap.timeline({ delay: 0.2 });
        drawTimeline.to(paths, {
          drawSVG: "100%",
          duration: 2.0,
          stagger: 0.045,
          ease: "power2.inOut"
        });
      }
    }

    const titleEl = document.querySelector(".gioconda-cover__title");
    if (titleEl && window.SplitText) {
      if (!splitTitle) {
        splitTitle = new window.SplitText(titleEl, { type: "chars" });
      }
      entranceTimelines.push(gsap.fromTo(splitTitle.chars,
        { yPercent: 34, opacity: 0, rotateX: -18 },
        {
          yPercent: 0, opacity: 1, rotateX: 0,
          duration: 0.85, stagger: 0.042, delay: 0.26, ease: "power3.out",
          clearProps: "transform"
        }
      ));
    }

    const headItems = document.querySelectorAll(".gioconda-cover__lead, .gioconda-cover__controls, .gioconda-cover__scroll");
    if (headItems.length) {
      entranceTimelines.push(gsap.fromTo(headItems,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.72, stagger: 0.1, delay: 0.68, ease: "power3.out" }
      ));
    }
  }

  function startAmbientLayerLife() {
    if (REDUCED || !gsap) return;
    clearAmbientLayerLife();

    /* L1 廊外远山河谷 + 双层冷雾 */
    const valleyActor = document.querySelector(".valley-actor");
    if (valleyActor) {
      ambientTweens.push(gsap.fromTo(valleyActor,
        { xPercent: -2.0 },
        { xPercent: 2.0, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut" }
      ));
    }
    const mistA = document.querySelector(".valley-mist__band--a");
    if (mistA) {
      const ma = gsap.fromTo(mistA,
        { xPercent: -18, opacity: 0.38 },
        { xPercent: 20, opacity: 0.78, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
      ambientTweens.push(ma);
      mistTweens.push(ma);
    }
    const mistB = document.querySelector(".valley-mist__band--b");
    if (mistB) {
      const mb = gsap.fromTo(mistB,
        { xPercent: 16, opacity: 0.26 },
        { xPercent: -18, opacity: 0.62, duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
      ambientTweens.push(mb);
      mistTweens.push(mb);
    }

    /* L2 石栏杆外托斯卡纳柏枝 */
    const cypressActor = document.querySelector(".cypress-actor");
    if (cypressActor) {
      windTimeline = gsap.timeline({ repeat: -1 });
      windTimeline
        .to(cypressActor, { rotation: 3.4, skewX: 2.2, duration: 3.0, ease: "sine.inOut" })
        .to(cypressActor, { rotation: -2.0, skewX: -1.3, duration: 2.6, ease: "sine.inOut" })
        .to(cypressActor, { rotation: 2.6, skewX: 1.7, duration: 2.8, ease: "sine.inOut" })
        .to(cypressActor, { rotation: -2.6, skewX: -1.6, duration: 3.2, ease: "sine.inOut" })
        .to(cypressActor, { rotation: 0, skewX: 0, duration: 2.0, ease: "sine.inOut" });
      ambientTweens.push(windTimeline);
    }

    /* L4 柔和阴天北光掠过石桌与丝绒 */
    const northSheen = document.querySelector(".loggia-north-sheen");
    if (northSheen) {
      ambientTweens.push(gsap.fromTo(northSheen,
        { xPercent: -24, yPercent: 4, opacity: 0.14 },
        { xPercent: 26, yPercent: -6, opacity: 0.64, duration: 7.4, repeat: -1, yoyo: true, ease: "sine.inOut" }
      ));
    }

    /* L5a 达芬奇几何内圈慢转 + 室内冷光尘 */
    const orbitGroup = document.querySelector(".davinci-orbit");
    if (orbitGroup) {
      ambientTweens.push(gsap.to(orbitGroup, {
        rotation: 360,
        duration: 54,
        repeat: -1,
        ease: "none",
        svgOrigin: "720 440"
      }));
    }
    const sparkSpecs = [
      { sel: ".stage3d__spark--a", dx: 24, dy: -20, durX: 6.0, durY: 4.5 },
      { sel: ".stage3d__spark--b", dx: -20, dy: -24, durX: 6.6, durY: 5.0 },
      { sel: ".stage3d__spark--c", dx: 18, dy: 16, durX: 7.2, durY: 5.4 }
    ];
    sparkSpecs.forEach((sp) => {
      const node = document.querySelector(sp.sel);
      if (!node) return;
      ambientTweens.push(gsap.to(node, { x: sp.dx, duration: sp.durX, repeat: -1, yoyo: true, ease: "sine.inOut" }));
      ambientTweens.push(gsap.to(node, { y: sp.dy, opacity: 0.88, duration: sp.durY, repeat: -1, yoyo: true, ease: "sine.inOut" }));
    });
  }

  /* -----------------------------------------------------------------
   * 3. 场景总控（全自动持续演出，无需点击按钮即有音乐、表情、调音与微风）
   * ----------------------------------------------------------------- */
  const fgFrameActor = document.querySelector(".fg-frame-actor");
  const modeButtons = [...document.querySelectorAll("[data-acoustic-mode]")];
  const captionEl = document.querySelector("[data-acoustic-caption]");
  const dialTrigger = document.querySelector("[data-dial-trigger]");
  const dialPulse = document.querySelector(".console-dial-hotspot__pulse");
  const dialRing = document.querySelector(".console-dial-hotspot__ring");
  const sparksAll = [...document.querySelectorAll(".stage3d__spark")];

  let sequenceBusy = false;

  /* 序列 A：托斯卡纳微风穿廊（远山冷雾 0s → 柏枝 +0.35s → 丝纱轻拂与古书微颤 +0.70s → 蒙娜丽莎迎风舒展微笑 +0.90s） */
  function triggerBreezeSequence(isStrong) {
    if (REDUCED || !gsap) return;
    sequenceBusy = true;
    SoundEngine.swellWind(isStrong);

    const baseWind = ACOUSTIC_MODES[currentModeKey].windBase;
    const peakWind = isStrong ? 1.15 : 0.88;
    const tl = gsap.timeline({
      onComplete: () => { sequenceBusy = false; }
    });

    /* 0.00s 远山冷雾加速 */
    mistTweens.forEach((mt) => {
      tl.to(mt, { timeScale: isStrong ? 2.6 : 1.9, duration: 0.5, ease: "power2.out" }, 0);
      tl.to(mt, { timeScale: ACOUSTIC_MODES[currentModeKey].windScale, duration: 2.0, ease: "sine.inOut" }, 2.1);
    });

    /* 0.35s 廊外柏枝迎风倾曳 */
    if (windTimeline) {
      tl.to(windTimeline, { timeScale: isStrong ? 2.4 : 1.8, duration: 0.45, ease: "power2.out" }, 0.35);
      tl.to(windTimeline, { timeScale: ACOUSTIC_MODES[currentModeKey].windScale, duration: 1.9, ease: "sine.inOut" }, 2.2);
    }

    /* 0.70s 穿廊微风极柔和拂动黑纱外缘 */
    tl.to(rigState, { windEnergy: peakWind, duration: 0.85, ease: "power2.out" }, 0.70);
    tl.to(rigState, { windEnergy: baseWind, duration: 2.1, ease: "sine.inOut" }, 2.35);

    /* 0.75s 前景 L5b 摊开的卷页古书轻微被风拂颤 */
    if (fgFrameActor) {
      tl.to(fgFrameActor, { rotation: -0.36, skewX: 0.30, duration: 0.55, ease: "sine.out" }, 0.75);
      tl.to(fgFrameActor, { rotation: 0.14, skewX: -0.12, duration: 0.65, ease: "sine.inOut" }, 1.32);
      tl.to(fgFrameActor, { rotation: 0, skewX: 0, duration: 1.0, ease: "sine.inOut" }, 2.05);
    }

    /* 0.90s 蒙娜丽莎自然侧头望向廊外河谷、轻闭眼感受微风、左手轻抬舒展、嘴角浮现宁静笑意 */
    tl.to(rigState, {
      headAngle: -3.2,
      headNod: -1.4,
      gazeX: -0.84,
      gazeY: -0.22,
      browLift: 0.45,
      leftHandLift: 0.85,
      handRot: -3.2,
      handY: -2.2,
      duration: 0.78,
      ease: "sine.inOut"
    }, 0.90);

    tl.to(rigState, {
      blink: 0.92,
      smile: 0.88,
      duration: 0.42,
      ease: "sine.inOut"
    }, 1.48);

    tl.to(rigState, {
      blink: 0,
      headAngle: 0.6,
      headNod: 0,
      gazeX: 0.08,
      gazeY: 0,
      smile: 0.50,
      browLift: 0.24,
      catchlight: 0.96,
      leftHandLift: 0.15,
      handRot: 0,
      handY: 0,
      duration: 0.95,
      ease: "power2.out"
    }, 2.30);

    tl.to(rigState, {
      headAngle: 0,
      gazeX: 0,
      smile: 0.24,
      browLift: 0.12,
      catchlight: 0.74,
      leftHandLift: 0,
      duration: 1.0,
      ease: "sine.inOut"
    }, 3.45);
  }

  /* 序列 B：低头调音交互（看旋钮 0s → 抬手蓄力 +0.06s → 右手实拧旋钮 +0.28s → 声波拨弦光尘 → 抬眼微笑 +0.86s） */
  function triggerTuningSequence(direction) {
    if (REDUCED || !gsap) return;
    sequenceBusy = true;

    const dir = direction || 1;
    const tl = gsap.timeline({
      onComplete: () => { sequenceBusy = false; }
    });

    /* 0.00s 蒙娜丽莎轻低头，视线落向大理石桌上的银色旋钮，同时右手在白纱袖口内微抬起势 */
    tl.to(rigState, {
      headAngle: -2.4,
      headNod: 3.6,
      gazeX: -0.84,
      gazeY: 0.96,
      smile: 0.34,
      browLift: 0.08,
      handRot: -6.8 * dir,
      handX: -2.8 * dir,
      handY: -4.2,
      leftHandLift: 0.65,
      duration: 0.28,
      ease: "power2.out"
    }, 0);

    /* 0.28s 右手五指完整贴合旋钮并实拧转动（刻度高光同步转 + 洋红光环爆发 + 鲁特琴泛音） */
    tl.call(() => SoundEngine.playPluck(currentModeKey), null, 0.30);
    tl.to(rigState, {
      handRot: 8.8 * dir,
      handX: 4.2 * dir,
      handY: 1.5,
      dialAngle: rigState.dialAngle + dir * 2.15,
      dialGlow: 1.0,
      leftHandLift: 0.1,
      duration: 0.52,
      ease: "power2.inOut"
    }, 0.28);

    /* 0.32s OLED 声波跃起 + 室内冷光尘向上轻扬 */
    tl.fromTo(rigState, { surge: 0.32 }, { surge: 0, duration: 0.75, ease: "power2.out" }, 0.32);
    if (dialPulse) {
      tl.fromTo(dialPulse,
        { scale: 1, opacity: 0.96 },
        { scale: 2.25, opacity: 0, duration: 0.62, ease: "power2.out", overwrite: true },
        0.32
      );
    }
    if (sparksAll.length) {
      tl.to(sparksAll, { y: "-=18", opacity: 0.98, duration: 0.38, stagger: 0.04, ease: "power2.out" }, 0.34);
    }

    /* 0.84s 拧完旋钮后的细腻微调松手 + 满意抬眼望向观者微笑 */
    tl.to(rigState, {
      handRot: 2.2 * dir,
      handX: 1.2 * dir,
      handY: -1.4,
      dialGlow: ACOUSTIC_MODES[currentModeKey].magentaAlpha,
      headAngle: 1.5,
      headNod: -0.6,
      gazeX: 0.14,
      gazeY: -0.05,
      smile: 0.94,
      browLift: 0.38,
      catchlight: 1.0,
      leftHandLift: 0.45,
      duration: 0.58,
      ease: "power2.out"
    }, 0.84);

    /* 1.46s 双手自然落回旋钮与大理石桌面，回归宁静聆听 */
    tl.to(rigState, {
      handRot: 0,
      handX: 0,
      handY: 0,
      leftHandLift: 0,
      headAngle: 0,
      headNod: 0,
      gazeX: 0,
      gazeY: 0,
      smile: 0.26,
      browLift: 0.12,
      catchlight: 0.74,
      duration: 1.05,
      ease: "sine.inOut"
    }, 1.72);
  }

  /* 自然有机眨眼调度（每 2.8–4.8 秒柔和眨一次，偶尔双眨） */
  function scheduleBlink() {
    if (REDUCED || !gsap) return;
    const delay = 2800 + Math.random() * 2000;
    const id = setTimeout(() => {
      if (rigState.blink < 0.2) {
        const btl = gsap.timeline();
        btl.to(rigState, { blink: 1, duration: 0.095, ease: "power2.in" })
           .to(rigState, { blink: 0, duration: 0.14, ease: "power2.out" });
        if (Math.random() < 0.26) {
          btl.to(rigState, { blink: 1, duration: 0.085, ease: "power2.in" }, "+=0.14")
             .to(rigState, { blink: 0, duration: 0.14, ease: "power2.out" });
        }
      }
      scheduleBlink();
    }, delay);
    conductorTimers.push(id);
  }

  /* 全自动持续表演编排：无需点击任何按钮，页面自动交替演出微风穿廊、亲手切频调音与微笑凝视 */
  let autoStep = 0;
  function scheduleEnvironmentCycle() {
    if (REDUCED || !gsap) return;
    const delay = autoStep === 0 ? 4800 : 6200;
    const id = setTimeout(() => {
      if (!sequenceBusy) {
        if (autoStep % 2 === 0) {
          /* 偶数拍：托斯卡纳微风吹拂山谷、柏枝、古书与蒙娜丽莎侧首微笑 */
          triggerBreezeSequence(currentModeKey === "loggia");
        } else {
          /* 奇数拍：蒙娜丽莎自动低头拧旋钮切换下一个声学乐章，音乐和声与示波器同步演进 */
          const nextIdx = (MODE_ORDER.indexOf(currentModeKey) + 1) % MODE_ORDER.length;
          setAcousticMode(MODE_ORDER[nextIdx], true, true);
        }
        autoStep++;
      }
      scheduleEnvironmentCycle();
    }, delay);
    conductorTimers.push(id);
  }

  function setAcousticMode(key, triggerGesture, fromAuto) {
    const cfg = ACOUSTIC_MODES[key];
    if (!cfg) return;
    currentModeKey = key;

    if (!fromAuto) SoundEngine.startOrUnlock();
    SoundEngine.setMode(key);

    modeButtons.forEach((btn) => {
      const active = btn.dataset.acousticMode === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    if (captionEl) captionEl.textContent = cfg.caption;

    if (gsap && !REDUCED) {
      gsap.to(rigState, {
        freqA: cfg.freqA,
        freqB: cfg.freqB,
        speed: cfg.speed,
        amp: cfg.amp,
        harmonicMix: cfg.harmonicMix,
        windEnergy: cfg.windBase,
        dialGlow: cfg.magentaAlpha,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto"
      });
      if (windTimeline) {
        gsap.to(windTimeline, { timeScale: cfg.windScale, duration: 0.65, ease: "power2.out" });
      }
      mistTweens.forEach((mt) => {
        gsap.to(mt, { timeScale: cfg.windScale, duration: 0.65, ease: "power2.out" });
      });
      if (dialRing) {
        gsap.to(dialRing, {
          borderColor: `rgba(234, 19, 94, ${cfg.magentaAlpha})`,
          duration: 0.24
        });
      }
      if (triggerGesture) {
        if (key === "loggia") {
          triggerTuningSequence(-1);
          conductorTimers.push(setTimeout(() => triggerBreezeSequence(true), 780));
        } else {
          triggerTuningSequence(1);
        }
      }
    } else {
      rigState.freqA = cfg.freqA;
      rigState.freqB = cfg.freqB;
      rigState.speed = cfg.speed;
      rigState.amp = cfg.amp;
      rigState.harmonicMix = cfg.harmonicMix;
      rigState.windEnergy = cfg.windBase;
    }
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setAcousticMode(btn.dataset.acousticMode, true, false));
  });

  if (dialTrigger) {
    dialTrigger.addEventListener("click", () => {
      const nextIdx = (MODE_ORDER.indexOf(currentModeKey) + 1) % MODE_ORDER.length;
      setAcousticMode(MODE_ORDER[nextIdx], true, false);
    });
  }

  /* 监听开场 1.77s 爆发钩子，让蒙娜丽莎在首屏自动演出时亲自调音并对观者微笑 */
  window.addEventListener("gioconda:intro-bloom", () => {
    triggerTuningSequence(1);
  });

  /* -----------------------------------------------------------------
   * 4. Canvas 2D 活体角色与桌面示波器引擎（原生 1376×768 像素精准坐标）
   * ----------------------------------------------------------------- */
  const rigCanvas = document.querySelector("[data-mona-rig]");
  const monaPlateEl = document.querySelector(".mona-stage-plate");

  if (rigCanvas) {
    const ctx = rigCanvas.getContext("2d");
    const W = 1376;
    const H = 768;

    /* 实测精确像素坐标（来自 gioconda-mona-subject.png） */
    const EYE_L = { x: 787, y: 175, rx: 14.5, ry: 6.2, lid: "rgb(128,101,83)", under: "rgb(161,132,112)" };
    const EYE_R = { x: 844, y: 174, rx: 14.5, ry: 6.2, lid: "rgb(133,106,86)", under: "rgb(170,143,123)" };
    const MOUTH = { lx: 791, ly: 242, mx: 813, my: 244, rx: 834, ry: 241 };
    const NECK_PIVOT = { x: 832, y: 326 };
    const HAND_PIVOT = { x: 632, y: 576 };
    const LEFT_HAND_PIVOT = { x: 892, y: 618 };
    const DIAL_CAP = { x: 608, y: 653, rx: 33.5, ry: 9.8 };
    const DIAL_RING = { x: 608, y: 671, rx: 41, ry: 8.5 };
    const SCREEN_QUAD = [
      [321, 654], /* front-left */
      [379, 629], /* back-left  */
      [554, 646], /* back-right */
      [513, 675]  /* front-right */
    ];

    /* 离屏缓存拆件，仅在图像加载后构建一次，运行期零 GC 零重绘开销 */
    let srcImg = null;
    let baseCanvas = null;
    let headSprite = null;
    let handSprite = null;
    let leftHandSprite = null;
    let rightCuffSprite = null;
    let leftCuffSprite = null;
    let veilLeftSprite = null;
    let veilRightSprite = null;
    let chestSprite = null;

    function makeOffscreen(w, h) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    }

    function buildFeatheredCutout(img, sx, sy, sw, sh, featherFn) {
      const c = makeOffscreen(sw, sh);
      const g = c.getContext("2d");
      g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const mask = makeOffscreen(sw, sh);
      const mg = mask.getContext("2d");
      featherFn(mg, sw, sh);
      g.globalCompositeOperation = "destination-in";
      g.drawImage(mask, 0, 0);
      g.globalCompositeOperation = "source-over";
      return c;
    }

    function buildSprites(subjectImg, baseImg, rightHandImg, leftHandImg) {
      /* 0. 干净底座 baseCanvas：直接采用像素级去手补齐底图（gioconda-mona-base.png），仅擦除头部与极外沿丝纱 */
      baseCanvas = makeOffscreen(W, H);
      const bg = baseCanvas.getContext("2d");
      bg.drawImage(baseImg, 0, 0, W, H);

      bg.save();
      bg.globalCompositeOperation = "destination-out";

      /* 擦除头部与耳机区域（y: 0..294 完整擦除，294..326 柔和渐变羽化留出锁骨与颈根衬底） */
      bg.fillStyle = "#000";
      bg.fillRect(700, 0, 320, 294);
      const neckFade = bg.createLinearGradient(0, 294, 0, 326);
      neckFade.addColorStop(0, "rgba(0,0,0,1)");
      neckFade.addColorStop(1, "rgba(0,0,0,0)");
      bg.fillStyle = neckFade;
      bg.fillRect(700, 294, 320, 32);

      /* 仅擦除左侧最外沿透明薄纱（x: 702..736，绝不触碰棕色卷发） */
      const vlFade = bg.createLinearGradient(702, 0, 736, 0);
      vlFade.addColorStop(0, "rgba(0,0,0,1)");
      vlFade.addColorStop(0.55, "rgba(0,0,0,0.85)");
      vlFade.addColorStop(1, "rgba(0,0,0,0)");
      bg.fillStyle = vlFade;
      bg.fillRect(702, 238, 34, 130);

      /* 仅擦除右侧肩后半透明黑纱垂尾外沿（x: 982..1142，发丝与肩部稳稳留在底座） */
      const vrFade = bg.createLinearGradient(982, 0, 1044, 0);
      vrFade.addColorStop(0, "rgba(0,0,0,0)");
      vrFade.addColorStop(0.55, "rgba(0,0,0,0.88)");
      vrFade.addColorStop(1, "rgba(0,0,0,1)");
      bg.fillStyle = vrFade;
      bg.fillRect(982, 232, 160, 370);
      bg.restore();

      /* 1. 头部 + 耳机 + 上颈软羽化拆件（用于真实颈枢微转头，绝无硬接缝与重影） */
      headSprite = {
        sx: 700, sy: 34, sw: 318, sh: 306,
        canvas: buildFeatheredCutout(subjectImg, 700, 34, 318, 306, (mg, sw, sh) => {
          mg.fillStyle = "#fff";
          mg.fillRect(0, 0, sw, sh - 44);
          const grad = mg.createLinearGradient(0, sh - 44, 0, sh);
          grad.addColorStop(0, "rgba(255,255,255,1)");
          grad.addColorStop(0.65, "rgba(255,255,255,0.75)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          mg.fillStyle = grad;
          mg.fillRect(0, sh - 44, sw, 44);
        })
      };

      /* 2. 右手与左手：亚像素色键平滑抠图（五指与指甲 100% 完整无毛边，腕部直入弯曲袖口） */
      handSprite = {
        sx: 512, sy: 540, sw: 144, sh: 123,
        canvas: rightHandImg
      };
      leftHandSprite = {
        sx: 695, sy: 580, sw: 210, sh: 83,
        canvas: leftHandImg
      };

      /* 2b. 左右白纱褶皱袖口遮片：叠绘于转动的手腕外侧，使手腕真实在袖筒内转动零穿帮 */
      rightCuffSprite = {
        sx: 612, sy: 534, sw: 54, sh: 80,
        canvas: (() => {
          const c = makeOffscreen(54, 80);
          const g = c.getContext("2d");
          g.drawImage(subjectImg, 612, 534, 54, 80, 0, 0, 54, 80);
          const d = g.getImageData(0, 0, 54, 80);
          for (let i = 0; i < d.data.length; i += 4) {
            const r = d.data[i], gr = d.data[i + 1], b = d.data[i + 2], a = d.data[i + 3];
            const lum = (r + gr + b) / 3;
            /* 仅保留冷色亮白褶皱袖口（排除暖肤色与暗背景） */
            if (a < 80 || r - b > 4 || lum < 92) d.data[i + 3] = 0;
          }
          g.putImageData(d, 0, 0);
          return c;
        })()
      };
      leftCuffSprite = {
        sx: 874, sy: 580, sw: 42, sh: 78,
        canvas: (() => {
          const c = makeOffscreen(42, 78);
          const g = c.getContext("2d");
          g.drawImage(subjectImg, 874, 580, 42, 78, 0, 0, 42, 78);
          const d = g.getImageData(0, 0, 42, 78);
          for (let i = 0; i < d.data.length; i += 4) {
            const px = (i / 4) % 42;
            const py = ((i / 4) / 42) | 0;
            const r = d.data[i], gr = d.data[i + 1], b = d.data[i + 2], a = d.data[i + 3];
            const lum = (r + gr + b) / 3;
            /* 仅保留冷色白纱袖口，避开下方大理石与左侧皮肤 */
            const belowWrist = py > 66 || (py > 58 && px < 14);
            if (a < 80 || r - b > 3 || lum < 90 || belowWrist) d.data[i + 3] = 0;
          }
          g.putImageData(d, 0, 0);
          return c;
        })()
      };

      /* 3. 胸腔与双肩微呼吸软羽化拆件（底部紧贴大理石桌线 y=602，零漂浮） */
      chestSprite = {
        sx: 644, sy: 336, sw: 452, sh: 268,
        canvas: buildFeatheredCutout(subjectImg, 644, 336, 452, 268, (mg, sw, sh) => {
          const rad = mg.createRadialGradient(sw * 0.52, sh * 0.48, sw * 0.22, sw * 0.52, sh * 0.48, sw * 0.50);
          rad.addColorStop(0, "rgba(255,255,255,1)");
          rad.addColorStop(0.74, "rgba(255,255,255,0.84)");
          rad.addColorStop(1, "rgba(255,255,255,0)");
          mg.fillStyle = rad;
          mg.fillRect(0, 0, sw, sh);
        })
      };

      /* 4. 左右半透明丝纱垂边（克制收窄至极外沿薄纱，头发主体纹丝不乱） */
      veilLeftSprite = {
        sx: 702, sy: 238, sw: 40, sh: 130,
        canvas: buildFeatheredCutout(subjectImg, 702, 238, 40, 130, (mg, sw, sh) => {
          const g = mg.createLinearGradient(0, 0, sw, 0);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.58, "rgba(255,255,255,0.88)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          mg.fillStyle = g;
          mg.fillRect(0, 0, sw, sh);
        })
      };

      veilRightSprite = {
        sx: 978, sy: 232, sw: 164, sh: 370,
        canvas: buildFeatheredCutout(subjectImg, 978, 232, 164, 370, (mg, sw, sh) => {
          const g = mg.createLinearGradient(0, 0, sw, 0);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(0.32, "rgba(255,255,255,0.92)");
          g.addColorStop(1, "rgba(255,255,255,1)");
          mg.fillStyle = g;
          mg.fillRect(0, 0, sw, sh);
        })
      };
    }

    function drawVeilWave(sprite, dir, t, windAmp) {
      if (!sprite) return;
      const { sx, sy, sw, sh, canvas } = sprite;
      const sliceH = 5;
      /* 极轻柔古典丝纱微颤：常态 ±0.7px，微风拂过峰值 ±2.1px，慢速柔滑绝不狂甩 */
      const amp = 0.45 + Math.min(1.2, windAmp) * 1.45;
      const freq = 1.15 + Math.min(1.0, windAmp) * 0.45;
      for (let dy = 0; dy < sh; dy += sliceH) {
        const progress = dy / sh;
        const flex = Math.pow(Math.sin(progress * Math.PI * 0.9), 1.35);
        const wave = Math.sin(t * freq - dy * 0.016) * amp * flex;
        const offsetX = wave * dir;
        ctx.drawImage(canvas, 0, dy, sw, sliceH, sx + offsetX, sy + dy, sw, sliceH + 0.6);
      }
    }

    function drawLiveEye(eye, gx, gy, blinkAmt, catchlightAmt) {
      ctx.save();
      /* 杏仁形眼裂裁切区域 */
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, eye.rx, eye.ry, 0, 0, Math.PI * 2);
      ctx.clip();

      /* 1. 虹膜微动：将原眼区虹膜按视线偏移 ±2.8px / ±1.6px 柔和重绘 */
      const dx = gx * 2.8;
      const dy = gy * 1.6;
      if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
        ctx.fillStyle = "rgba(182, 166, 152, 0.55)";
        ctx.fillRect(eye.x - eye.rx, eye.y - eye.ry, eye.rx * 2, eye.ry * 2);
        ctx.drawImage(
          srcImg,
          eye.x - 14, eye.y - 7, 28, 14,
          eye.x - 14 + dx, eye.y - 7 + dy, 28, 14
        );
      }

      /* 2. 冷北光细腻眼神光（迎风或对视观者时微微提亮） */
      const specAlpha = Math.max(0, (1 - blinkAmt * 1.35) * catchlightAmt * 0.72);
      if (specAlpha > 0.02) {
        ctx.fillStyle = `rgba(236, 246, 252, ${specAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(eye.x - 1.8 + dx * 0.9, eye.y - 1.3 + dy * 0.8, 1.55, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 3. 瓷釉肤色上眼睑自然下垂（眨眼 / 迎风轻闭） */
      if (blinkAmt > 0.01) {
        const lidBottom = eye.y - eye.ry - 1 + blinkAmt * (eye.ry * 2 + 2.5);
        const lidGrad = ctx.createLinearGradient(eye.x, eye.y - eye.ry - 2, eye.x, lidBottom);
        lidGrad.addColorStop(0, eye.lid);
        lidGrad.addColorStop(0.75, eye.under);
        lidGrad.addColorStop(1, "rgb(112, 86, 70)");

        ctx.fillStyle = lidGrad;
        ctx.beginPath();
        ctx.rect(eye.x - eye.rx - 2, eye.y - eye.ry - 3, eye.rx * 2 + 4, lidBottom - (eye.y - eye.ry - 3));
        ctx.fill();

        /* 纤细自然睫毛弧线 */
        ctx.strokeStyle = `rgba(56, 38, 28, ${(0.55 + blinkAmt * 0.35).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(eye.x - eye.rx, lidBottom - 0.8);
        ctx.quadraticCurveTo(eye.x, lidBottom + 2.0 * blinkAmt, eye.x + eye.rx, lidBottom - 0.8);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawEnigmaticSmile(smileAmt, browAmt) {
      if (smileAmt <= 0.02 && browAmt <= 0.02) return;
      const s = Math.max(0, Math.min(1, smileAmt));

      ctx.save();
      const lift = s * 1.9;
      ctx.globalAlpha = 0.65 * s;
      /* 左嘴角 */
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(MOUTH.lx + 2, MOUTH.ly - lift * 0.5, 9, 6, -0.18, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(srcImg, MOUTH.lx - 8, MOUTH.ly - 6, 20, 14, MOUTH.lx - 8, MOUTH.ly - 6 - lift, 20, 14);
      ctx.restore();
      /* 右嘴角 */
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(MOUTH.rx - 2, MOUTH.ry - lift * 0.5, 9, 6, 0.18, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(srcImg, MOUTH.rx - 10, MOUTH.ry - 6, 20, 14, MOUTH.rx - 10, MOUTH.ry - 6 - lift, 20, 14);
      ctx.restore();

      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(88, 46, 36, ${(0.22 * s).toFixed(3)})`;
      ctx.lineWidth = 1.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(MOUTH.lx - 1, MOUTH.ly - lift * 0.9);
      ctx.quadraticCurveTo(MOUTH.mx, MOUTH.my + 1.1, MOUTH.rx + 1, MOUTH.ry - lift * 0.9);
      ctx.stroke();

      const cheekAlpha = 0.11 * s;
      [[774, 218], [848, 217]].forEach(([cx, cy]) => {
        const cg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
        cg.addColorStop(0, `rgba(214, 152, 138, ${cheekAlpha.toFixed(3)})`);
        cg.addColorStop(1, "rgba(214, 152, 138, 0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
      });

      if (browAmt > 0.05) {
        const ba = 0.08 * browAmt;
        [[786, 158], [844, 157]].forEach(([bx, by]) => {
          const bg = ctx.createRadialGradient(bx, by, 1, bx, by, 16);
          bg.addColorStop(0, `rgba(242, 224, 206, ${ba.toFixed(3)})`);
          bg.addColorStop(1, "rgba(242, 224, 206, 0)");
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(bx, by, 16, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    }

    function drawIsometricOLED(phase) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(SCREEN_QUAD[0][0], SCREEN_QUAD[0][1]);
      ctx.lineTo(SCREEN_QUAD[1][0], SCREEN_QUAD[1][1]);
      ctx.lineTo(SCREEN_QUAD[2][0], SCREEN_QUAD[2][1]);
      ctx.lineTo(SCREEN_QUAD[3][0], SCREEN_QUAD[3][1]);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = "rgba(12, 18, 28, 0.42)";
      ctx.fillRect(315, 624, 245, 56);

      const leftMid = [(SCREEN_QUAD[0][0] + SCREEN_QUAD[1][0]) * 0.5, (SCREEN_QUAD[0][1] + SCREEN_QUAD[1][1]) * 0.5];
      const rightMid = [(SCREEN_QUAD[2][0] + SCREEN_QUAD[3][0]) * 0.5, (SCREEN_QUAD[2][1] + SCREEN_QUAD[3][1]) * 0.5];
      const normalX = -0.14;
      const normalY = 0.99;

      ctx.strokeStyle = "rgba(216, 236, 246, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftMid[0] + 6, leftMid[1]);
      ctx.lineTo(rightMid[0] - 6, rightMid[1]);
      ctx.stroke();

      const ampPx = (rigState.amp + rigState.surge) * 18;

      ctx.strokeStyle = "rgba(234, 19, 94, 0.72)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const u = i / 64;
        const bx = leftMid[0] + (rightMid[0] - leftMid[0]) * (0.06 + u * 0.88);
        const by = leftMid[1] + (rightMid[1] - leftMid[1]) * (0.06 + u * 0.88);
        const env = Math.sin(u * Math.PI);
        const disp = Math.sin(u * Math.PI * 2 * rigState.freqB - phase * 1.4) * ampPx * 0.56 * env;
        const px = bx + normalX * disp;
        const py = by + normalY * disp;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(238, 248, 252, 0.94)";
      ctx.lineWidth = 1.85;
      ctx.beginPath();
      for (let i = 0; i <= 84; i++) {
        const u = i / 84;
        const bx = leftMid[0] + (rightMid[0] - leftMid[0]) * (0.06 + u * 0.88);
        const by = leftMid[1] + (rightMid[1] - leftMid[1]) * (0.06 + u * 0.88);
        const env = Math.pow(Math.sin(u * Math.PI), 1.2);
        const primary = Math.sin(u * Math.PI * 2 * rigState.freqA + phase);
        const harmonic = Math.sin(u * Math.PI * 2 * rigState.freqB + phase * 1.65) * rigState.harmonicMix;
        const disp = (primary + harmonic) * ampPx * 0.72 * env;
        const px = bx + normalX * disp;
        const py = by + normalY * disp;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const glare = ctx.createLinearGradient(350, 626, 480, 678);
      glare.addColorStop(0, "rgba(255,255,255,0)");
      glare.addColorStop(0.46, "rgba(224,242,250,0.16)");
      glare.addColorStop(0.68, "rgba(255,255,255,0)");
      ctx.fillStyle = glare;
      ctx.fillRect(315, 624, 245, 56);
      ctx.restore();
    }

    function drawDialFeedback(t, liveDialAngle) {
      ctx.save();
      const pulse = 0.72 + Math.sin(t * 2.8) * 0.16;
      const ringAlpha = Math.min(1, rigState.dialGlow * pulse);
      ctx.strokeStyle = `rgba(255, 12, 219, ${(ringAlpha * 0.82).toFixed(3)})`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(234, 19, 94, 0.85)";
      ctx.shadowBlur = 12 * ringAlpha;
      ctx.beginPath();
      ctx.ellipse(DIAL_RING.x, DIAL_RING.y, DIAL_RING.rx, DIAL_RING.ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.ellipse(DIAL_CAP.x, DIAL_CAP.y, DIAL_CAP.rx, DIAL_CAP.ry, 0, 0, Math.PI * 2);
      ctx.clip();

      const a = liveDialAngle;
      const dx = Math.cos(a) * DIAL_CAP.rx * 0.92;
      const dy = Math.sin(a) * DIAL_CAP.ry * 0.92;
      const g = ctx.createLinearGradient(
        DIAL_CAP.x - dx, DIAL_CAP.y - dy,
        DIAL_CAP.x + dx, DIAL_CAP.y + dy
      );
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.40, "rgba(244,250,255,0.34)");
      g.addColorStop(0.50, "rgba(255,255,255,0.62)");
      g.addColorStop(0.60, "rgba(244,250,255,0.34)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(DIAL_CAP.x - DIAL_CAP.rx - 2, DIAL_CAP.y - DIAL_CAP.ry - 2, DIAL_CAP.rx * 2 + 4, DIAL_CAP.ry * 2 + 4);

      /* 随手指真正旋转的银色旋钮指针刻线，一眼看出旋钮正在被拧动 */
      ctx.strokeStyle = "rgba(42, 54, 62, 0.72)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(DIAL_CAP.x + Math.cos(a) * DIAL_CAP.rx * 0.32, DIAL_CAP.y + Math.sin(a) * DIAL_CAP.ry * 0.32);
      ctx.lineTo(DIAL_CAP.x + Math.cos(a) * DIAL_CAP.rx * 0.88, DIAL_CAP.y + Math.sin(a) * DIAL_CAP.ry * 0.88);
      ctx.stroke();
      ctx.restore();
    }

    let visible = true;
    let phase = 0;
    let rafId = 0;
    const startTime = performance.now();

    function renderRigFrame(staticMode) {
      if (!ctx || !srcImg || !baseCanvas) return;
      const t = staticMode ? 0 : (performance.now() - startTime) * 0.001;

      ctx.clearRect(0, 0, W, H);

      /* A. 干净稳坐接地底座（大理石桌 + 音频台 + 躯干，已彻底清理可动部位并补齐桌面/衣褶） */
      ctx.drawImage(baseCanvas, 0, 0, W, H);

      /* B. 丝纱极外缘轻柔微颤（头发主体纹丝不乱） */
      const windNow = rigState.windEnergy + Math.sin(t * 0.9) * 0.12;
      if (staticMode) {
        if (veilLeftSprite) ctx.drawImage(veilLeftSprite.canvas, veilLeftSprite.sx, veilLeftSprite.sy);
        if (veilRightSprite) ctx.drawImage(veilRightSprite.canvas, veilRightSprite.sx, veilRightSprite.sy);
      } else {
        drawVeilWave(veilLeftSprite, -1, t, windNow);
        drawVeilWave(veilRightSprite, 1, t, windNow);
      }

      /* C. 胸腔极轻呼吸（严格锚定在 y=602 桌面线，绝不令人物悬浮） */
      if (!staticMode && chestSprite) {
        const breath = Math.sin(t * 1.45) * 0.0065;
        ctx.save();
        ctx.translate(860, 602);
        ctx.scale(1 + breath * 0.25, 1 + breath);
        ctx.translate(-860, -602);
        ctx.drawImage(chestSprite.canvas, chestSprite.sx, chestSprite.sy);
        ctx.restore();
      }

      /* D. 桌面熏黑玻璃屏实时双轨示波器 + 随右手微调持续旋转的银色旋钮指针与光环 */
      const idleHandWave = staticMode ? 0 : Math.sin(t * 1.35);
      const liveDialAngle = rigState.dialAngle + idleHandWave * 0.32;
      drawIsometricOLED(phase);
      drawDialFeedback(t, liveDialAngle);

      /* E1. 左手：随 432 Hz 音乐律动轻抬与微风舒展，带柔焦桌面接触影并由白纱袖口自然包覆腕部 */
      if (leftHandSprite) {
        const idleLeft = staticMode ? 0 : (Math.sin(t * 1.85) * 0.5 + 0.5);
        const totalLift = staticMode ? 0 : (rigState.leftHandLift + idleLeft * 0.35);
        const lRotRad = (-totalLift * 3.6) * Math.PI / 180;
        const lTy = -totalLift * 3.2;

        /* 极柔和北光接触影（径向柔焦渐变，绝无硬边椭圆） */
        ctx.save();
        ctx.translate(784, 650);
        ctx.scale(1, 0.14);
        const shAlpha = Math.max(0.06, 0.22 - totalLift * 0.08);
        const shGrad = ctx.createRadialGradient(0, 0, 12, 0, 0, 94);
        shGrad.addColorStop(0, `rgba(20, 34, 42, ${shAlpha.toFixed(3)})`);
        shGrad.addColorStop(0.62, `rgba(20, 34, 42, ${(shAlpha * 0.42).toFixed(3)})`);
        shGrad.addColorStop(1, "rgba(20, 34, 42, 0)");
        ctx.fillStyle = shGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 94, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(LEFT_HAND_PIVOT.x, LEFT_HAND_PIVOT.y + lTy);
        ctx.rotate(lRotRad);
        ctx.translate(-LEFT_HAND_PIVOT.x, -LEFT_HAND_PIVOT.y);
        ctx.drawImage(leftHandSprite.canvas, leftHandSprite.sx, leftHandSprite.sy);
        ctx.restore();

        if (leftCuffSprite) {
          ctx.drawImage(leftCuffSprite.canvas, leftCuffSprite.sx, leftCuffSprite.sy);
        }
      }

      /* E2. 右手：亚像素完整五指在白纱袖口内自然拧动旋钮（袖口外沿包覆腕部，零缝隙） */
      if (handSprite) {
        const idleRot = staticMode ? 0 : idleHandWave * 2.6;
        const idleX = staticMode ? 0 : idleHandWave * 1.6;
        const idleY = staticMode ? 0 : Math.cos(t * 1.35) * 1.2;

        const totalRotRad = ((rigState.handRot + idleRot) * Math.PI) / 180;
        const totalTx = staticMode ? 0 : (rigState.handX + idleX);
        const totalTy = staticMode ? 0 : (rigState.handY + idleY);

        ctx.save();
        ctx.translate(HAND_PIVOT.x + totalTx, HAND_PIVOT.y + totalTy);
        ctx.rotate(totalRotRad);
        ctx.translate(-HAND_PIVOT.x, -HAND_PIVOT.y);
        ctx.drawImage(handSprite.canvas, handSprite.sx, handSprite.sy);
        ctx.restore();

        if (rightCuffSprite) {
          ctx.drawImage(rightCuffSprite.canvas, rightCuffSprite.sx, rightCuffSprite.sy);
        }
      }

      /* F. 颈枢微转头 + 耳机 + 活体表情（视线、眼神光、自然眨眼、蒙娜丽莎含蓄微笑） */
      const ptr = window.__stage3dPointer || { x: 0, y: 0 };
      const pointerHeadDeg = sequenceBusy ? 0 : ptr.x * 1.65;
      const pointerNodPx = sequenceBusy ? 0 : ptr.y * 1.4;
      const ambientHeadDeg = staticMode ? 0 : Math.sin(t * 0.65) * 0.55;

      const totalHeadRad = staticMode ? 0 : (((rigState.headAngle + pointerHeadDeg + ambientHeadDeg) * Math.PI) / 180);
      const totalHeadNod = staticMode ? 0 : (rigState.headNod + pointerNodPx + Math.sin(t * 1.45) * 0.8);

      const liveGazeX = staticMode ? 0 : Math.max(-1, Math.min(1, rigState.gazeX + (sequenceBusy ? 0 : ptr.x * 0.52)));
      const liveGazeY = staticMode ? 0 : Math.max(-1, Math.min(1, rigState.gazeY + (sequenceBusy ? 0 : ptr.y * 0.42)));

      if (headSprite) {
        ctx.save();
        ctx.translate(NECK_PIVOT.x, NECK_PIVOT.y + totalHeadNod);
        ctx.rotate(totalHeadRad);
        ctx.translate(-NECK_PIVOT.x, -NECK_PIVOT.y);

        ctx.drawImage(headSprite.canvas, headSprite.sx, headSprite.sy);

        drawLiveEye(EYE_L, liveGazeX, liveGazeY, rigState.blink, rigState.catchlight);
        drawLiveEye(EYE_R, liveGazeX, liveGazeY, rigState.blink, rigState.catchlight);
        drawEnigmaticSmile(rigState.smile, rigState.browLift);

        ctx.restore();
      }

      if (!staticMode) {
        phase += 0.024 * rigState.speed;
      }
    }

    function loadRigImage(src) {
      return new Promise((resolve, reject) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = src;
      });
    }

    Promise.all([
      loadRigImage("assets/mona/gioconda-mona-subject.png"),
      loadRigImage("assets/mona/gioconda-mona-base.png"),
      loadRigImage("assets/mona/gioconda-hand-right.png"),
      loadRigImage("assets/mona/gioconda-hand-left.png")
    ]).then(([subjectImg, baseImg, rightHandImg, leftHandImg]) => {
      srcImg = subjectImg;
      buildSprites(subjectImg, baseImg, rightHandImg, leftHandImg);
      renderRigFrame(REDUCED);
      if (monaPlateEl) monaPlateEl.classList.add("is-rig-ready");

      if (!REDUCED) {
        const loop = () => {
          if (visible) renderRigFrame(false);
          rafId = requestAnimationFrame(loop);
        };
        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver((entries) => {
            visible = entries[0] ? entries[0].isIntersecting : true;
          }, { rootMargin: "12% 0px 12% 0px" });
          io.observe(rigCanvas);
        }
        rafId = requestAnimationFrame(loop);
        window.addEventListener("pagehide", () => cancelAnimationFrame(rafId), { once: true });
      }
    }).catch(() => {});
  }

  playHeroEntrances();
  startAmbientLayerLife();
  scheduleBlink();
  scheduleEnvironmentCycle();

  /* -----------------------------------------------------------------
   * 5. 滚动编舞（ScrollTrigger）：首屏退场 + 第二屏静物揭幕 + 斜杠波浪进场
   * ----------------------------------------------------------------- */
  if (!REDUCED && gsap && window.ScrollTrigger) {
    const coverSection = document.querySelector("#cover");
    const coverHead = document.querySelector(".gioconda-cover__head");
    if (coverSection && coverHead) {
      gsap.to(coverHead, {
        yPercent: -26,
        opacity: 0.12,
        ease: "none",
        scrollTrigger: { trigger: coverSection, start: "top top", end: "bottom top", scrub: 1 }
      });
    }

    const studyHead = document.querySelector("#study .gioconda-section-head");
    const studyCopy = document.querySelector("#study .gioconda-feature__copy");
    const plateFrame = document.querySelector(".gioconda-plate-frame");
    const plateImg = document.querySelector(".gioconda-plate-frame img");

    if (studyHead) {
      gsap.fromTo(studyHead,
        { y: 42, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: studyHead, start: "top 86%", once: true }
        }
      );
    }
    if (studyCopy) {
      gsap.fromTo(studyCopy.children,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.72, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: studyCopy, start: "top 84%", once: true }
        }
      );
    }
    if (plateFrame && plateImg) {
      gsap.fromTo(plateFrame,
        { clipPath: "inset(16% 0% 0% 0%)", opacity: 0.2 },
        {
          clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.0, ease: "power3.out",
          scrollTrigger: { trigger: plateFrame, start: "top 84%", once: true }
        }
      );
      gsap.fromTo(plateImg,
        { scale: 1.12, yPercent: -5 },
        {
          scale: 1.0, yPercent: 5, ease: "none",
          scrollTrigger: { trigger: plateFrame, start: "top bottom", end: "bottom top", scrub: 1 }
        }
      );
    }

    const scrollMark = document.querySelector("#study .scroll-mark");
    if (scrollMark) {
      gsap.fromTo(scrollMark,
        { yPercent: 30, xPercent: 4 },
        {
          yPercent: -30, xPercent: -4, ease: "none",
          scrollTrigger: { trigger: "#study", start: "top bottom", end: "bottom top", scrub: 1 }
        }
      );
    }

    const slashTokens = document.querySelectorAll(".slash-token");
    const slashCard = document.querySelector(".slash-card");
    if (slashTokens.length) {
      gsap.fromTo(slashTokens,
        { y: 34, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.68, stagger: 0.07, ease: "power3.out",
          scrollTrigger: { trigger: ".slash-field", start: "top 84%", once: true }
        }
      );
    }
    if (slashCard) {
      gsap.fromTo(slashCard,
        { y: 36, scale: 0.96, opacity: 0 },
        {
          y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: slashCard, start: "top 86%", once: true }
        }
      );
    }

    const colophonSheet = document.querySelector(".colophon-sheet");
    if (colophonSheet) {
      gsap.fromTo(colophonSheet,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: colophonSheet, start: "top 86%", once: true }
        }
      );
    }
  }

  /* -----------------------------------------------------------------
   * 6. 散落斜杠标签交互 + 轻磁吸斥力
   * ----------------------------------------------------------------- */
  const SPECS = {
    "five-plane-parallax": {
      cmd: "/five-plane-parallax",
      ref: "Depth Separation · 5 Planes",
      val: "−260 · −165 · −75 · 0 · +42 / +82px",
      desc: "Valley, cypress, stone loggia colonnade, seated Mona Lisa, sacred geometry, and near-camera archway each occupy an independent Z plane inside a 900px perspective camera—producing unmistakable parallax separation on every crane sweep and pointer move."
    },
    "living-expression": {
      cmd: "/living-expression",
      ref: "Canvas 2D Rig · Face & Neck",
      val: "Live Gaze, Natural Blink & Enigmatic Smile",
      desc: "Without moving her grounded torso off the marble desk, her irises shift smoothly between the dial, valley, and viewer, porcelain eyelids blink organically, and her classic smile subtly deepens in response to breeze and music."
    },
    "breeze-propagation": {
      cmd: "/breeze-propagation",
      ref: "Scene Conductor · Far → Near",
      val: "Mist (0s) → Cypress (0.35s) → Silk Veil (0.70s) → Smile (0.95s)",
      desc: "Florentine wind travels in real physical sequence from the distant river valley through the stone arch, rippling her translucent dark veil and fluttering the foreground parchment page before she tilts her head serenely into the air."
    },
    "tactile-dial-rig": {
      cmd: "/tactile-dial-rig",
      ref: "Human → Device → Room",
      val: "Elbow-Pivoted Hand Turn + Isometric Live OLED",
      desc: "Clicking the desk dial or switching modes triggers a full physical chain: she glances down, her right hand twists the knurled aluminum cap with rotating metallic sheen, the isometric smoked-glass waveform surges, and she looks back up smiling."
    },
    "cool-teal-shadow": {
      cmd: "/cool-teal-shadow",
      ref: "Measured Pixels · 192.9° & 198.7°",
      val: "Cold Blue-Teal Shadow Field (189°–224°)",
      desc: "Both the 5-layer composite hero (192.9°, 89.7% cool) and Plate 02 still life (198.7°, 99.9% cool) stay cleanly inside the authentic cool blue-teal overcast north-light palette with zero warm olive-brown muddiness."
    },
    "theatrical-camera": {
      cmd: "/theatrical-camera",
      ref: "900px Perspective · Scroll Fly-In",
      val: "Lateral Crane Intro + Responsive ±6.5° Pointer Orbit",
      desc: "An opening lateral crane arc sweeps across the colonnade before settling into a slow theatrical orbit. Scrolling pushes z forward to +210px while peeling the near-camera archway outward cleanly."
    },
    "sage-canvas-dcded1": {
      cmd: "/sage-canvas-dcded1",
      ref: "Page Ground · 13.9% Rail",
      val: "#dcded1 Page Ground · #f7f7ee Paper Sheet",
      desc: "Editorial chapters rest on cool sage-grey #dcded1 alongside the fixed 13.9% Roman-numeral rail, reserving #f7f7ee strictly for archival sheets and cards."
    }
  };

  const tokens = [...document.querySelectorAll("[data-slash-key]")];
  const cardCmd = document.querySelector("[data-slash-cmd]");
  const cardRef = document.querySelector("[data-slash-ref]");
  const cardVal = document.querySelector("[data-slash-val]");
  const cardDesc = document.querySelector("[data-slash-desc]");
  let activeKey = "five-plane-parallax";

  function selectToken(key) {
    if (key === activeKey) return;
    const spec = SPECS[key];
    if (!spec || !cardCmd) return;
    activeKey = key;

    tokens.forEach((btn) => {
      const active = btn.dataset.slashKey === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    cardCmd.textContent = spec.cmd;
    if (cardRef) cardRef.textContent = spec.ref;
    if (cardVal) cardVal.textContent = spec.val;
    if (cardDesc) cardDesc.textContent = spec.desc;

    if (!REDUCED && gsap) {
      gsap.fromTo([cardVal, cardDesc],
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.28, stagger: 0.04, ease: "power2.out" }
      );
    }
  }

  tokens.forEach((btn) => {
    const key = btn.dataset.slashKey;
    btn.addEventListener("click", () => selectToken(key));
    btn.addEventListener("pointerenter", () => selectToken(key));
    btn.addEventListener("focus", () => selectToken(key));
  });

  const slashField = document.querySelector(".slash-field");
  if (!REDUCED && gsap && slashField && matchMedia("(hover: hover)").matches) {
    slashField.addEventListener("pointermove", (e) => {
      const rect = slashField.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      tokens.forEach((btn) => {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rect.left;
        const cy = r.top + r.height / 2 - rect.top;
        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 240) {
          const force = (1 - (dist / 240) ** 2) * 14;
          gsap.to(btn, {
            x: (dx / dist) * force,
            y: (dy / dist) * force,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
        }
      });
    }, { passive: true });
    slashField.addEventListener("pointerleave", () => {
      gsap.to(tokens, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.55)", overwrite: "auto" });
    });
  }

  /* -----------------------------------------------------------------
   * 7. 平滑锚点跳转 + 顶栏 Replay Intro 重播完整开场
   * ----------------------------------------------------------------- */
  document.querySelectorAll("a[href^='#']:not(.side-nav__link)").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY;
      if (window.__w26Smooth && typeof window.__w26Smooth.scrollTo === "function") {
        window.__w26Smooth.scrollTo(y, 1000);
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });

  const replayBtn = document.querySelector("[data-replay-intro]");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      window.scrollTo(0, 0);
      if (window.__w26Smooth) {
        window.__w26Smooth.target = 0;
        window.__w26Smooth.current = 0;
      }
      setTimeout(() => {
        autoStep = 0;
        SoundEngine.startOrUnlock();
        clearConductorTimers();
        clearAmbientLayerLife();
        if (window.__heroIntro && typeof window.__heroIntro.replay === "function") {
          window.__heroIntro.replay();
        }
        playHeroEntrances();
        startAmbientLayerLife();
        scheduleBlink();
        scheduleEnvironmentCycle();
        setAcousticMode(currentModeKey, false, false);
      }, 60);
    });
  }
})();
