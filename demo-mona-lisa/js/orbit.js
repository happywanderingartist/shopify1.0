/* =====================================================================
 * orbit.js — Act 0 四镜分镜实装滚动总控引擎（V3.3）
 * ---------------------------------------------------------------------
 * 阶段 1（0% – 25%）：古典失重起跳与手持背对使用笔电
 *   - 开场双脚红帆布鞋精准贴合文艺复兴洋红卷草纹双翘 3D 滑板，14 寸银铝笔电紧贴女孩
 *     左手且背对观众（观众仅见拉丝铝背盖与侧边，屏幕朝向女孩完全保密）；周围五件现代
 *     青年物件（复古掌机、监听音响、机械键盘、亮玫红零食袋、电光紫电吉他）立体漂浮点亮深空。
 *   - 滚动起步：底字退散、女孩双脚轻点弹起、无束腰飞领长袍迎风鼓动、冰美式冰块微浮，
 *     滑板脱离鞋底顺滑完成 360° Kickflip 亮出底面文艺复兴雕版画与荧光紫轮。
 * 阶段 2（25% – 60%）：指尖轻推与单台笔电翻转揭晓屏幕
 *   - 女孩左手指尖前推释放笔电后与翻滚滑板、五大现代物件一齐沿 Z 轴退入深空并渐进虚化；
 *   - 那一台银铝 14 寸笔电迎面飞向镜头，从「背对侧面」顺滑 3D 翻转朝向观众，高清呈现
 *     78 键键盘与首次揭晓的第一幕《蒙娜丽莎》屏幕，直至精确铺满 100% 视口。
 * 阶段 3（60% – 85%）：边框消融与达芬奇网格马赛克裂变
 *   - 银框消融，画面沿达芬奇黄金比例网格裂开为 56 块带深空缝隙的 3D 错位油画块，
 *     叠加 GPU RGB 色散与 760+ 荧光紫/电光粉超能像素方块爆发。
 * 阶段 4（85% – 100%）：重组凝结进入第一幕《Gioconda》
 *   - 粒子散去，底层 1:1 真实五层活体佛罗伦萨敞廊、左侧罗马数字目录与大标题浮现；全过程可逆。
 * ===================================================================== */
(() => {
  "use strict";

  const WGL = window.OrbitWebGL;
  if (!WGL) return;
  const { clamp, lerp, invLerp, smoothstep, easeOutCubic, easeInOutCubic } = WGL;

  const REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cinema        = document.querySelector("[data-two-act-cinema]");
  const orbitStage    = document.querySelector("[data-orbit-stage]");
  const bgEl          = document.querySelector("[data-orbit-bg]");
  const davinciEl     = document.querySelector("[data-orbit-davinci]");
  const girlRigEl     = document.querySelector("[data-orbit-girl-rig]");
  const girlMeshCvs   = document.querySelector("[data-orbit-girl-mesh]");
  const girlOverCvs   = document.querySelector("[data-orbit-girl-overlay]");
  const board3dCvs    = document.querySelector("[data-orbit-board3d]");
  const props3dCvs    = document.querySelector("[data-orbit-props3d]");
  const shatterCvs    = document.querySelector("[data-orbit-shatter]");
  const hudEl         = document.querySelector("[data-orbit-hud]");
  const barEl         = document.querySelector("[data-orbit-progress-bar]");
  const launchBtn     = document.querySelector("[data-orbit-launch]");
  const replayBtn     = document.querySelector("[data-replay-orbit]");
  const phaseEls      = Array.from(document.querySelectorAll("[data-orbit-phase]"));
  const act1Head      = document.querySelector(".two-act-cinema__act1 .gioconda-cover__head");
  const act1Title     = document.querySelector(".two-act-cinema__act1 .gioconda-cover__title--twoact");

  if (!cinema || !orbitStage || !props3dCvs || !shatterCvs) return;

  /* 五大鲜亮现代青年漂浮物件的自由非对称视差参数（彻底打散规整感） */
  const propConfigs = [
    { key: "gameboy",  el: document.querySelector('[data-orbit-prop="gameboy"]'),  baseRot: -25, bobAmp: 10, bobSpd: 1.42, ph: 0.4,  par: 22, driftX: -12, driftY: -12, endScale: 0.60, maxBlur: 5.5 },
    { key: "speaker",  el: document.querySelector('[data-orbit-prop="speaker"]'),  baseRot:  16, bobAmp:  9, bobSpd: 1.18, ph: 2.3,  par: 20, driftX: -16, driftY:   6, endScale: 0.56, maxBlur: 6.0 },
    { key: "keyboard", el: document.querySelector('[data-orbit-prop="keyboard"]'), baseRot:  13, bobAmp: 11, bobSpd: 1.30, ph: 1.1,  par: 28, driftX:  13, driftY: -13, endScale: 0.64, maxBlur: 5.5 },
    { key: "snackbag", el: document.querySelector('[data-orbit-prop="snackbag"]'), baseRot: -23, bobAmp: 12, bobSpd: 1.56, ph: 3.6,  par: 26, driftX:  18, driftY:  -4, endScale: 0.58, maxBlur: 6.0 },
    { key: "guitar",   el: document.querySelector('[data-orbit-prop="guitar"]'),   baseRot:  14, bobAmp: 13, bobSpd: 1.12, ph: 4.7,  par: 38, driftX:  20, driftY:  16, endScale: 1.20, maxBlur: 7.5 }
  ];

  /* 解除单幕版 ScrollTrigger 对粘性容器内第一幕标题的提前淡出 */
  function disarmSingleActCoverTrigger() {
    if (!act1Head || !window.ScrollTrigger) return;
    window.ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger && st.trigger.id === "cover") st.kill();
    });
    if (window.gsap) {
      window.gsap.killTweensOf(act1Head);
      window.gsap.set(act1Head, { clearProps: "yPercent,y,opacity,transform" });
      if (act1Title) {
        window.gsap.killTweensOf(act1Title);
        window.gsap.set(act1Title, { opacity: 1, clearProps: "transform" });
      }
    }
  }
  setTimeout(disarmSingleActCoverTrigger, 120);
  setTimeout(disarmSingleActCoverTrigger, 900);

  /* -----------------------------------------------------------------
   * 初始化原生 WebGL 渲染引擎（滑板独立垫于女孩脚下 z-index: 5，笔电位于前景 z-index: 10）
   * ----------------------------------------------------------------- */
  const girlRig = new WGL.OrbitGirlRig(
    girlMeshCvs,
    girlOverCvs,
    "assets/orbit/orbit-renaissance-girl.png"
  );
  const board3d = board3dCvs ? new WGL.OrbitProps3D(board3dCvs, "assets/orbit/orbit-skate-art.jpg") : null;
  const props3d = new WGL.OrbitProps3D(props3dCvs, null);
  const mosaic  = new WGL.OrbitMosaicShatter(shatterCvs);

  /* -----------------------------------------------------------------
   * 离屏合成第一幕全幅快照（同步喂给 3D 笔记本屏与 WebGL 马赛克着色器）
   * ----------------------------------------------------------------- */
  const act1Snap = document.createElement("canvas");
  const snapCtx  = act1Snap.getContext("2d");
  const snapSources = [
    "assets/mona/gioconda-valley-bg.jpg",
    "assets/mona/gioconda-cypress.png",
    "assets/mona/gioconda-arch-mid.png",
    "assets/mona/gioconda-mona-subject.png",
    "assets/mona/gioconda-fg-ledge.png"
  ];
  const snapImgs = [];
  let loadedCount = 0;

  function drawCover(targetCtx, img, w, h, scaleExtra, ox, oy) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const s = Math.max(w / iw, h / ih) * (scaleExtra || 1);
    const dw = iw * s;
    const dh = ih * s;
    targetCtx.drawImage(img, (w - dw) * (ox ?? 0.5), (h - dh) * (oy ?? 0.44), dw, dh);
  }

  function rebuildAct1Snapshot(w, h) {
    if (loadedCount < snapSources.length) return;
    const sw = Math.min(1600, Math.max(640, Math.round(w)));
    const sh = Math.min(1000, Math.max(400, Math.round(h)));
    act1Snap.width = sw;
    act1Snap.height = sh;
    snapCtx.clearRect(0, 0, sw, sh);
    snapCtx.fillStyle = "#141722";
    snapCtx.fillRect(0, 0, sw, sh);
    drawCover(snapCtx, snapImgs[0], sw, sh, 1.12, 0.5, 0.46);
    drawCover(snapCtx, snapImgs[1], sw, sh, 1.08, 0.5, 0.46);
    drawCover(snapCtx, snapImgs[2], sw, sh, 1.06, 0.5, 0.45);
    drawCover(snapCtx, snapImgs[3], sw, sh, 1.04, 0.5, 0.44);
    drawCover(snapCtx, snapImgs[4], sw, sh, 1.02, 0.5, 0.46);
    const veil = snapCtx.createLinearGradient(0, 0, 0, sh * 0.28);
    veil.addColorStop(0, "rgba(20, 23, 34, 0.52)");
    veil.addColorStop(1, "rgba(20, 23, 34, 0)");
    snapCtx.fillStyle = veil;
    snapCtx.fillRect(0, 0, sw, sh * 0.28);

    props3d.uploadScreenCanvas(act1Snap);
    mosaic.uploadAct1Snapshot(act1Snap);
  }

  snapSources.forEach((src, idx) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      snapImgs[idx] = img;
      loadedCount++;
      if (loadedCount === snapSources.length) {
        rebuildAct1Snapshot(stageW, stageH);
      }
    };
    img.src = src;
  });

  /* -----------------------------------------------------------------
   * 视口尺寸同步（静默无背景音频；含 ResizeObserver 适配分栏与全屏切换）
   * ----------------------------------------------------------------- */
  let act1BloomFired = false;
  let stageW = window.innerWidth;
  let stageH = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function handleResize() {
    const pinEl = cinema.querySelector(".two-act-cinema__pin");
    const rect = (pinEl || orbitStage).getBoundingClientRect();
    const rawW = Math.round(rect.width || window.innerWidth);
    const rawH = Math.round(Math.min(rect.height || window.innerHeight, window.innerHeight));
    stageW = Math.max(320, rawW);
    stageH = Math.max(320, rawH);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (board3d) board3d.resize(stageW, stageH, dpr);
    props3d.resize(stageW, stageH, dpr);
    mosaic.resize(stageW, stageH, dpr);
    if (loadedCount === snapSources.length) {
      rebuildAct1Snapshot(stageW, stageH);
    }
  }
  handleResize();
  window.addEventListener("resize", handleResize, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const pinEl = cinema.querySelector(".two-act-cinema__pin");
    if (pinEl) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(pinEl);
    }
  }

  /* -----------------------------------------------------------------
   * 滚动进度、相位读数与侧栏高亮联动
   * ----------------------------------------------------------------- */
  let targetP = 0;
  let currentP = 0;
  let mx = 0, my = 0;
  let pmx = 0, pmy = 0;
  let activePhase = -1;

  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    mx = 0;
    my = 0;
  }, { passive: true });

  function readTargetProgress() {
    const rect = cinema.getBoundingClientRect();
    const scrollable = Math.max(1, cinema.offsetHeight - window.innerHeight);
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function updatePhaseIndicator(p) {
    let idx = 0;
    if (p >= 0.85) idx = 3;
    else if (p >= 0.60) idx = 2;
    else if (p >= 0.25) idx = 1;
    if (idx === activePhase) return;
    activePhase = idx;
    phaseEls.forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
    });
  }

  function updateSidebarActHighlight(p) {
    const orbitNav = document.querySelector('.side-nav__item[data-target="orbit"]');
    const coverNav = document.querySelector('.side-nav__item[data-target="cover"]');
    if (!orbitNav || !coverNav) return;
    const rect = cinema.getBoundingClientRect();
    if (rect.bottom > window.innerHeight * 0.35 && rect.top <= 12) {
      const inAct1 = p >= 0.85;
      orbitNav.classList.toggle("is-active", !inAct1);
      coverNav.classList.toggle("is-active", inAct1);
    }
  }

  /* -----------------------------------------------------------------
   * 核心分镜渲染：严格对应四张已确认分镜（0-25% / 25-60% / 60-85% / 85-100%）
   * ----------------------------------------------------------------- */
  function applyScene(p, tSec) {
    if (barEl) barEl.style.width = `${(p * 100).toFixed(2)}%`;
    updatePhaseIndicator(p);
    updateSidebarActHighlight(p);

    const curtainVisible = p < 0.625;
    const curtainOp = p < 0.596 ? 1 : clamp(1 - invLerp(0.596, 0.622, p), 0, 1);
    orbitStage.style.opacity = curtainOp.toFixed(4);
    orbitStage.style.visibility = curtainVisible ? "visible" : "hidden";
    orbitStage.classList.toggle("is-revealed", p >= 0.84);

    if (p >= 0.88 && !act1BloomFired) {
      act1BloomFired = true;
      window.dispatchEvent(new CustomEvent("gioconda:intro-bloom"));
    } else if (p < 0.55) {
      act1BloomFired = false;
    }

    const mouseWeight = clamp(1 - invLerp(0.45, 0.59, p), 0, 1);
    const isMobile = stageW < 940;

    if (curtainVisible) {
      const leapT   = smoothstep(invLerp(0.00, 0.25, p));     // 阶段 1：起跳 + 滑板离脚 360° 尖翻
      const pushT   = smoothstep(invLerp(0.20, 0.36, p));     // 阶段 2 初段：左指前推释放笔记本
      const recedeT = easeInOutCubic(invLerp(0.25, 0.60, p)); // 阶段 2：女孩、滑板与五件青年物件向深空退散虚化

      const idleBob = Math.sin(tSec * 1.45) * (1 - recedeT * 0.65);

      /* ---- L1 深空星云缓慢拉远 ---- */
      if (bgEl) {
        const bgScale = lerp(1.06, 0.99, leapT) + recedeT * 0.14;
        const bgX = -pmx * 16 * mouseWeight;
        const bgY = -pmy * 10 * mouseWeight + leapT * 18;
        bgEl.style.transform = `translate3d(${bgX.toFixed(1)}px, ${bgY.toFixed(1)}px, 0) scale(${bgScale.toFixed(4)})`;
      }

      /* ---- L2 达芬奇黄金星轨缓慢扩张 ---- */
      if (davinciEl) {
        const dgScale = lerp(1.0, 1.12, leapT) + recedeT * 0.16;
        const dgOp = clamp(0.88 - recedeT * 0.32 + invLerp(0.52, 0.60, p) * 0.45, 0, 1);
        const dx = -pmx * 24 * mouseWeight;
        const dy = -pmy * 16 * mouseWeight;
        davinciEl.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${dgScale.toFixed(4)})`;
        davinciEl.style.opacity = dgOp.toFixed(3);
      }

      /* ---- L2b & L6 五大现代青年漂浮物件（立体视差微漂 + 阶段 2 退散虚化） ---- */
      const propAlpha = clamp(1 - invLerp(0.46, 0.58, p), 0, 1);
      for (const cfg of propConfigs) {
        if (!cfg.el) continue;
        const bobY = Math.sin(tSec * cfg.bobSpd + cfg.ph) * cfg.bobAmp * (1 - recedeT * 0.5);
        const bobR = Math.cos(tSec * cfg.bobSpd * 0.72 + cfg.ph) * 2.8;
        const px = -pmx * cfg.par * mouseWeight;
        const py = -pmy * (cfg.par * 0.65) * mouseWeight + bobY;
        const dxVw = cfg.driftX * (leapT * 0.25 + recedeT * 1.10);
        const dyVh = cfg.driftY * (leapT * 0.25 + recedeT * 1.10);
        const sc = lerp(1.0, cfg.endScale, recedeT);
        const rot = cfg.baseRot + bobR + (cfg.driftX > 0 ? 1 : -1) * (leapT * 5 + recedeT * 14);
        const blur = recedeT * cfg.maxBlur;
        cfg.el.style.transform =
          `translate(-50%, -50%) translate3d(calc(${dxVw.toFixed(2)}vw + ${px.toFixed(1)}px), calc(${dyVh.toFixed(2)}vh + ${py.toFixed(1)}px), 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
        cfg.el.style.filter = `blur(${blur.toFixed(2)}px) drop-shadow(0 20px 36px rgba(4, 10, 20, 0.58))`;
        cfg.el.style.opacity = propAlpha.toFixed(3);
      }

      /* ---- L3 活体大红背包少女：真实 Ollie / Kickflip 六阶段全身动力学（颈部刚性锁定不扭曲） ---- */
      // 1. 蓄力压膝 Coil (0%–7%)  2. 后脚点板 Pop (5%–12%)  3. 前脚斜刷 Flick (10%–18%)
      // 4. 双膝高收 Tuck (14%–26%) 5. 肩胯反向平衡 Counter (15%–28%) 6. 空中收势接板 Catch (23%–36%)
      const pulse = (a, b, x) => Math.sin(clamp(invLerp(a, b, x), 0, 1) * Math.PI);
      const coilP    = pulse(0.005, 0.075, p);
      const popP     = pulse(0.050, 0.125, p);
      const flickP   = pulse(0.095, 0.185, p);
      const tuckP    = pulse(0.130, 0.275, p);
      const counterP = pulse(0.140, 0.295, p);
      const catchP   = pulse(0.235, 0.365, p);

      const boardKick = easeInOutCubic(invLerp(0.055, 0.285, p));
      const billowAmt = clamp(0.26 + leapT * 0.74 + tuckP * 0.36 + recedeT * 0.25, 0, 1.2);
      girlRig.render(tSec, leapT, boardKick, pushT, billowAmt, {
        coil: coilP,
        pop: popP,
        flick: flickP,
        tuck: tuckP,
        counter: counterP,
        catchP
      });

      if (girlRigEl) {
        // 真实弹跳抛物线：蓄力下沉(+1.8vh) → 点板腾空高跃(-6.8vh) → 滞空缓落 → 深空退远
        const jumpLiftVh = coilP * 1.85 - popP * 2.2 - tuckP * 5.2 + catchP * 1.1;
        const gx = lerp(0, -1.8, leapT) - flickP * 0.65 + counterP * 0.85 + lerp(0, isMobile ? -9 : -15, recedeT);
        const gy = jumpLiftVh + lerp(0, -2.4, leapT) + lerp(0, -7.2, recedeT);
        const gScale = lerp(1.0, 0.96, leapT) * lerp(1.0, 0.56, recedeT);
        // 蓄力微前倾(+2.4°) → 点板刷板起势(-6.6°) → 滞空平衡回摆，保持克制且不晃颈
        const gRot = coilP * 2.4 - popP * 3.0 - tuckP * 4.2 + counterP * 1.6
                   + lerp(0, -6.4, recedeT)
                   + Math.sin(tSec * 1.05) * 0.9 * (1 - recedeT);
        const gBlur = recedeT * 5.8;
        const gBright = lerp(1.0, 0.74, recedeT);
        const gAlpha = clamp(1 - invLerp(0.51, 0.60, p), 0, 1);
        const px = -pmx * 13 * mouseWeight;
        const py = -pmy * 9 * mouseWeight + idleBob * 6.5;

        girlRigEl.style.transform =
          `translate(-50%, -50%) translate3d(calc(${gx.toFixed(2)}vw + ${px.toFixed(1)}px), calc(${gy.toFixed(2)}vh + ${py.toFixed(1)}px), 0) rotate(${gRot.toFixed(2)}deg) scale(${gScale.toFixed(4)})`;
        girlRigEl.style.filter = `blur(${gBlur.toFixed(2)}px) brightness(${gBright.toFixed(3)})`;
        girlRigEl.style.opacity = gAlpha.toFixed(3);
      }

      /* ---- L2c 独立 3D 文艺复兴图文滑板（z-index: 5 稳垫脚底！与六阶段 Ollie/Kickflip 严丝合缝） ---- */
      const detachArc = Math.sin(boardKick * Math.PI);
      const boardStartX = isMobile ? 0.10 : 0.20;
      const boardStartY = isMobile ? -0.60 : -0.63;
      const boardZ = lerp(-5.60, -5.92, leapT) + lerp(0, -4.40, recedeT);
      const boardX = lerp(boardStartX, boardStartX - 0.10, leapT) + flickP * 0.08 + lerp(0, -1.05, recedeT) - pmx * 0.11 * mouseWeight;
      // 蓄力压低板尾(-0.04) → 爆起翘头跟脚升起(+0.18) → 腾空时略低于收起的双膝(-0.14) 让出翻转空隙
      const boardY = boardStartY
                   - coilP * 0.04
                   + popP * 0.10
                   - detachArc * 0.22
                   + lerp(0, 0.28, recedeT)
                   + idleBob * 0.036
                   - pmy * 0.06 * mouseWeight;
      // 绕板身纵轴真实 360° Kickflip（沿 X 翻转），同时叠加 Ollie 点板翘头（Z 轴抬鼻）与前脚刷板偏航
      const boardRotX = 20 + boardKick * 360 + recedeT * 195;
      const boardRotY = -8 + flickP * 22 + detachArc * 16 + recedeT * -28;
      const boardRotZ = -9.5 + popP * 26 + detachArc * 12 - catchP * 8 + recedeT * -14;
      const boardAlpha = clamp(1 - invLerp(0.50, 0.595, p), 0, 1);

      if (board3d) {
        board3d.render({
          drawBoard: true,
          drawLaptop: false,
          boardX, boardY, boardZ,
          boardRotX, boardRotY, boardRotZ,
          boardScale: isMobile ? 0.50 : 0.60,
          boardAlpha
        });
      }

      /* ---- L4 14 寸拉丝银铝 78 键苹果笔电（严格面朝女孩使用 → 推出后 3D 翻转亮出键盘与第一幕屏幕！） ---- */
      const lapStartX = isMobile ? 0.58 : 0.98;
      const lapStartY = isMobile ? 0.24 : 0.34;
      const lapStartZ = isMobile ? -6.2 : -5.60;
      const lapStartScale = isMobile ? 0.27 : 0.33;

      const throwT = easeInOutCubic(invLerp(0.24, 0.57, p));
      const lockT  = Math.pow(easeInOutCubic(invLerp(0.25, 0.598, p)), 1.15);
      const midArc = Math.sin(throwT * Math.PI);

      const laptopX = lerp(lapStartX, lapStartX + 0.14, pushT) * (1 - throwT) + pmx * 0.08 * mouseWeight;
      const laptopY = lerp(lapStartY, lapStartY + 0.08, pushT) * (1 - throwT)
                    + idleBob * 0.038 * (1 - throwT)
                    - pmy * 0.05 * mouseWeight;

      // 关键方向修正：-124°（负角！键盘与屏幕朝向左侧女孩本人，她在打字使用，观众只能看到银铝背盖与轻薄侧面！）
      // 推出后沿 -124° → -34°（p=0.38 黄金 3/4 惊艳展示全 78 键键盘与《蒙娜丽莎》屏）→ 0°（正对锁满全屏）
      const rotProgress = invLerp(0.22, 0.55, p);
      const rotCurve = 0.62 * easeOutCubic(rotProgress) + 0.38 * easeInOutCubic(rotProgress);
      const laptopRotY = lerp(-124, 0, rotCurve);
      const laptopRotX = lerp(-6, 0, throwT) + midArc * 30;
      const laptopRotZ = lerp(4, 0, throwT) + midArc * -6;

      const lidTiltDeg  = lerp(-14, 0, smoothstep(invLerp(0.36, 0.56, p)));
      const baseFoldDeg = lerp(0, 68, smoothstep(invLerp(0.49, 0.58, p)));
      const baseAlpha   = clamp(1 - invLerp(0.50, 0.575, p), 0, 1);
      const bezelAlpha  = clamp(1 - invLerp(0.580, 0.602, p), 0, 1);
      const laptopScale = lerp(lapStartScale, 1.0, smoothstep(invLerp(0.24, 0.57, p)));
      const chargeGlow  = invLerp(0.54, 0.598, p);

      props3d.render({
        drawBoard: false,
        drawLaptop: true,
        laptopX, laptopY,
        laptopZFar: lapStartZ,
        lockT,
        laptopRotX, laptopRotY, laptopRotZ,
        laptopScale,
        lidTiltDeg,
        baseFoldDeg,
        baseAlpha,
        bezelAlpha,
        charge: chargeGlow,
        laptopAlpha: 1.0
      });

      /* ---- L5 压底巨字在起跳初段向下淡退 ---- */
      if (hudEl) {
        const hudFade = invLerp(0.015, 0.16, p);
        hudEl.style.opacity = clamp(1 - hudFade, 0, 1).toFixed(3);
        hudEl.style.transform = `translate3d(0, ${(hudFade * 42).toFixed(1)}px, 0)`;
        hudEl.style.pointerEvents = hudFade > 0.55 ? "none" : "auto";
      }
    }

    /* ---- 阶段 3 & 4：原生 WebGL 达芬奇网格马赛克着色器（60%–96%） ---- */
    mosaic.render(p, tSec);

    /* ---- 阶段 4 末尾（84% → 97%）：第一幕《Gioconda》主标题与声场控制优雅浮现 ---- */
    if (act1Head) {
      const revealT = easeOutCubic(invLerp(0.84, 0.97, p));
      act1Head.style.opacity = revealT.toFixed(3);
      act1Head.style.transform = `translate3d(0, ${((1 - revealT) * 22).toFixed(1)}px, 0)`;
      act1Head.style.pointerEvents = revealT > 0.65 ? "auto" : "none";
    }
  }

  /* -----------------------------------------------------------------
   * 主循环与一键流畅演示 / 章节锚点
   * ----------------------------------------------------------------- */
  let startTs = performance.now();
  function tick(now) {
    if (!document.hidden) {
      targetP = readTargetProgress();
      currentP += (targetP - currentP) * 0.14;
      if (Math.abs(targetP - currentP) < 0.00025) currentP = targetP;

      pmx += (mx - pmx) * 0.10;
      pmy += (my - pmy) * 0.10;

      applyScene(currentP, (now - startTs) * 0.001);
    }
    requestAnimationFrame(tick);
  }

  if (!REDUCED) {
    requestAnimationFrame(tick);
  } else {
    applyScene(0, 0);
  }

  let autoScrollAnim = null;
  function smoothScrollToY(destY, durationMs) {
    if (autoScrollAnim) cancelAnimationFrame(autoScrollAnim);
    if (REDUCED) {
      window.scrollTo(0, destY);
      return;
    }
    const fromY = window.scrollY;
    const t0 = performance.now();
    function step(now) {
      const t = clamp((now - t0) / durationMs, 0, 1);
      window.scrollTo(0, fromY + (destY - fromY) * easeInOutCubic(t));
      if (t < 1) autoScrollAnim = requestAnimationFrame(step);
      else autoScrollAnim = null;
    }
    autoScrollAnim = requestAnimationFrame(step);
  }

  function cancelAutoScroll() {
    if (autoScrollAnim) {
      cancelAnimationFrame(autoScrollAnim);
      autoScrollAnim = null;
    }
  }
  window.addEventListener("wheel", cancelAutoScroll, { passive: true });
  window.addEventListener("touchstart", cancelAutoScroll, { passive: true });

  function getAct1RevealScrollY() {
    const scrollable = Math.max(1, cinema.offsetHeight - window.innerHeight);
    return cinema.offsetTop + Math.round(scrollable * 0.99);
  }

  if (launchBtn) {
    launchBtn.addEventListener("click", () => {
      smoothScrollToY(getAct1RevealScrollY(), 4600);
    });
  }
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      smoothScrollToY(0, 1200);
    });
  }

  document.querySelectorAll('a[href="#cover"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollToY(getAct1RevealScrollY(), 1800);
    });
  });

  document.querySelectorAll('a[href="#orbit"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollToY(0, 1200);
    });
  });

  function getCurrentChapterId() {
    const cinemaRect = cinema.getBoundingClientRect();
    if (cinemaRect.bottom > window.innerHeight * 0.45) {
      return currentP >= 0.72 ? "cover" : "orbit";
    }
    const ids = ["study", "tokens", "colophon"];
    let active = "cover";
    const mid = window.innerHeight * 0.42;
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= mid) {
        active = id;
      }
    }
    return active;
  }

  function jumpToChapter(id) {
    if (id === "orbit") {
      smoothScrollToY(0, 1100);
      return;
    }
    if (id === "cover") {
      smoothScrollToY(getAct1RevealScrollY(), 1500);
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top);
      smoothScrollToY(top, 1100);
    }
  }

  window.__orbitCinema = {
    getProgress: () => currentP,
    setImmediateProgress: (val) => {
      const scrollable = Math.max(1, cinema.offsetHeight - window.innerHeight);
      window.scrollTo(0, cinema.offsetTop + Math.round(scrollable * clamp(val, 0, 1)));
      currentP = clamp(val, 0, 1);
      targetP = currentP;
      applyScene(currentP, (performance.now() - startTs) * 0.001);
    },
    launchToAct1: () => smoothScrollToY(getAct1RevealScrollY(), 4600),
    replay: () => smoothScrollToY(0, 1200),
    getCurrentChapterId,
    jumpToChapter,
    girlRig,
    props3D: props3d,
    shatter: mosaic
  };
})();
