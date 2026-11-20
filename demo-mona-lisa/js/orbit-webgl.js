/* =====================================================================
 * orbit-webgl.js — Act 0 零外链原生 WebGL 引擎套件（V3.3 四镜分镜实装版）
 * ---------------------------------------------------------------------
 * 1. OrbitGirlRig       : 30×30 连续 WebGL 蒙皮（无束腰铅白飞领迎风上扬 +
 *                         宽袍失重鼓动 + 双脚起跳点板 + 左指轻推笔电 +
 *                         冰美式零重力浮冰 + 自然瓷感眨眼）
 * 2. OrbitProps3D       : 原生 WebGL PBR 质感贴图真 3D 硬件引擎：
 *                         (a) 拟真拉丝银铝 14 寸 78 键笔电（高清键帽/扬声器网孔/
 *                             触控板纹理 + 铝背壳纹理 + 实时第一幕屏；开场贴合左手
 *                             背对观众使用，第二阶段翻转飞向镜头才揭晓屏幕）
 *                         (b) 文艺复兴洋红卷草纹双翘 3D 滑板（真实 11 段双翘弧度、
 *                             顶部磨砂砂纸与 8 枚螺钉、底面高清 UV 贴图文艺复兴雕版画、
 *                             金属银铝 T 型桥架 + 4 颗发光半透荧光紫轮）
 * 3. OrbitMosaicShatter : 原生 WebGL 达芬奇黄金比例网格马赛克后处理着色器
 *                         （深空裂隙底幕 + 56 块 3D 错位翻转油画图块 + GPU RGB
 *                         色散 + 720+ 荧光紫/电光粉超能像素粒子流）
 * ===================================================================== */
(() => {
  "use strict";

  const DEG = Math.PI / 180;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function invLerp(a, b, v) { return clamp((v - a) / (b - a), 0, 1); }
  function smoothstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function easeOutCubic(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* -------------------------------------------------------------------
   * 轻量列主序 4×4 矩阵工具（零外部依赖）
   * ------------------------------------------------------------------- */
  function mat4Identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }
  function mat4Mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        o[c * 4 + r] =
          a[0 * 4 + r] * b[c * 4 + 0] +
          a[1 * 4 + r] * b[c * 4 + 1] +
          a[2 * 4 + r] * b[c * 4 + 2] +
          a[3 * 4 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad * 0.5);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }
  function mat4Translate(x, y, z) {
    const m = mat4Identity();
    m[12] = x; m[13] = y; m[14] = z;
    return m;
  }
  function mat4Scale(x, y, z) {
    const m = mat4Identity();
    m[0] = x; m[5] = y; m[10] = z;
    return m;
  }
  function mat4RotateX(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
  }
  function mat4RotateY(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }
  function mat4RotateZ(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]);
  }

  function compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function createProgram(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  function createTexture2D(gl, source) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 23, 34, 255]));
    }
    return tex;
  }

  /* ===================================================================
   * 程序化高清材质贴图生成器（离屏 Canvas 2D → WebGL 纹理，零外链）
   * =================================================================== */
  function buildBrushedAluminumLidCanvas() {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");

    // 真实中性冷银阳极氧化铝渐变（彻底摒弃塑料天蓝）
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0.00, "#dce0e5");
    grad.addColorStop(0.42, "#ccd2d8");
    grad.addColorStop(0.78, "#b7bec6");
    grad.addColorStop(1.00, "#adb5be");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 柔和冷北光漫反射光泽
    const sheen = ctx.createRadialGradient(168, 138, 24, 256, 256, 360);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0.24)");
    sheen.addColorStop(0.55, "rgba(255, 255, 255, 0.04)");
    sheen.addColorStop(1, "rgba(40, 48, 58, 0.14)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, 512, 512);

    // 极细腻金属横向拉丝微纹
    ctx.fillStyle = "rgba(255,255,255,0.032)";
    for (let y = 0; y < 512; y += 2) {
      if ((y * 17) % 5 < 2) ctx.fillRect(0, y, 512, 1);
    }
    ctx.fillStyle = "rgba(32,38,46,0.025)";
    for (let y = 1; y < 512; y += 3) {
      ctx.fillRect(0, y, 512, 1);
    }

    // CNC 边缘微倒角亮边
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 504);

    // 居中克制抛光哑银微章（呼应极简硬件美学，不印任何第三方品牌标志）
    ctx.save();
    ctx.translate(256, 252);
    const badge = ctx.createLinearGradient(-28, -28, 28, 28);
    badge.addColorStop(0, "rgba(74, 82, 92, 0.42)");
    badge.addColorStop(0.5, "rgba(130, 140, 152, 0.26)");
    badge.addColorStop(1, "rgba(56, 62, 72, 0.48)");
    ctx.fillStyle = badge;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    return c;
  }

  function buildKeyboardDeckCanvas() {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 680;
    const ctx = c.getContext("2d");

    // 底座全铝顶面底色
    const g = ctx.createLinearGradient(0, 0, 1024, 680);
    g.addColorStop(0, "#d9dde2");
    g.addColorStop(0.5, "#c8ced5");
    g.addColorStop(1, "#b8c0c9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 680);

    // 细拉丝金属微粒
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let y = 0; y < 680; y += 2) ctx.fillRect(0, y, 1024, 1);

    // 边缘 CNC 高光边线
    ctx.strokeStyle = "rgba(255,255,255,0.52)";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 1016, 672);

    // 顶部转轴暗槽
    ctx.fillStyle = "#141820";
    ctx.fillRect(148, 0, 728, 24);

    // 左右 CNC 微孔扬声器阵列
    function drawSpeaker(sx, sy, sw, sh) {
      ctx.fillStyle = "rgba(38, 44, 52, 0.52)";
      for (let y = sy; y < sy + sh; y += 7) {
        for (let x = sx; x < sx + sw; x += 7) {
          ctx.beginPath();
          ctx.arc(x, y, 1.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    drawSpeaker(30, 72, 64, 300);
    drawSpeaker(930, 72, 64, 300);

    // 下凹深炭黑键盘槽
    const wx = 112, wy = 56, ww = 800, wh = 336;
    ctx.fillStyle = "#161920";
    ctx.beginPath();
    ctx.roundRect(wx, wy, ww, wh, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 78 颗高清独立哑黑巧克力键帽 + 精致微白字符（清晰到特写级）
    const rows = [
      { h: 32, labels: ["esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","○"], weights: [1.3,1,1,1,1,1,1,1,1,1,1,1,1,1.1] },
      { h: 46, labels: ["~","1","2","3","4","5","6","7","8","9","0","-","=","delete"], weights: [1,1,1,1,1,1,1,1,1,1,1,1,1,1.65] },
      { h: 46, labels: ["tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"], weights: [1.55,1,1,1,1,1,1,1,1,1,1,1,1,1.1] },
      { h: 46, labels: ["caps","A","S","D","F","G","H","J","K","L",";","'","return"], weights: [1.85,1,1,1,1,1,1,1,1,1,1,1,1.8] },
      { h: 46, labels: ["shift","Z","X","C","V","B","N","M",",",".","/","shift"], weights: [2.35,1,1,1,1,1,1,1,1,1,1,2.3] },
      { h: 48, labels: ["fn","ctrl","opt","cmd","","cmd","opt","◀","▲▼","▶"], weights: [1,1,1,1.3,5.2,1.3,1,0.95,0.95,0.95] }
    ];
    const padX = 14, gap = 7;
    let curY = wy + 12;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const sumW = row.weights.reduce((a, b) => a + b, 0);
      const availW = ww - padX * 2 - gap * (row.labels.length - 1);
      let curX = wx + padX;
      for (let k = 0; k < row.labels.length; k++) {
        const kw = availW * (row.weights[k] / sumW);
        const kh = row.h;
        // 键帽阴影底座
        ctx.fillStyle = "#0b0d12";
        ctx.beginPath();
        ctx.roundRect(curX, curY + 2, kw, kh, 6);
        ctx.fill();
        // 键帽顶面微渐变
        const kg = ctx.createLinearGradient(curX, curY, curX, curY + kh);
        kg.addColorStop(0, "#2b303a");
        kg.addColorStop(1, "#1e222b");
        ctx.fillStyle = kg;
        ctx.beginPath();
        ctx.roundRect(curX + 1, curY, kw - 2, kh - 2, 5);
        ctx.fill();
        // 键帽顶部微弱冷北光倒角边
        ctx.strokeStyle = "rgba(220, 232, 245, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 精细键帽字符
        const lbl = row.labels[k];
        if (lbl) {
          ctx.fillStyle = "rgba(232, 236, 242, 0.72)";
          ctx.font = lbl.length > 2 ? "500 10px system-ui, sans-serif" : "600 13px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(lbl, curX + kw * 0.5, curY + kh * 0.48);
        }
        curX += kw + gap;
      }
      curY += row.h + 7;
    }

    // 居中 Force Touch 玻璃触控板（精确倒角边界 + 微反光）
    const tx = 312, ty = 420, tw = 400, th = 224;
    const tg = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
    tg.addColorStop(0, "#cfd5dc");
    tg.addColorStop(1, "#bcc4cd");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(62, 70, 80, 0.48)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 前缘开盖拇指凹槽
    ctx.fillStyle = "rgba(58, 66, 76, 0.36)";
    ctx.beginPath();
    ctx.roundRect(436, 662, 152, 16, 8);
    ctx.fill();

    return c;
  }

  function buildGripTapeCanvas() {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 192;
    const ctx = c.getContext("2d");

    // 细腻磨砂黑灰滑板砂纸底
    const g = ctx.createLinearGradient(0, 0, 512, 192);
    g.addColorStop(0, "#1c2028");
    g.addColorStop(0.5, "#171b22");
    g.addColorStop(1, "#12161d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 192);

    // 砂纸微颗粒反光（确定性伪随机）
    let s = 419;
    const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (let i = 0; i < 3600; i++) {
      const x = rand() * 512, y = rand() * 192;
      const v = 35 + Math.floor(rand() * 48);
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.42)`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // 两条极细的冷灰防滑压线
    ctx.strokeStyle = "rgba(218, 224, 232, 0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(118, 8); ctx.lineTo(118, 184);
    ctx.moveTo(394, 8); ctx.lineTo(394, 184);
    ctx.stroke();

    // 8 枚银铝桥架固定螺钉头（前后各 4 颗）
    for (const bx of [136, 162, 350, 376]) {
      for (const by of [72, 120]) {
        ctx.fillStyle = "#b8c4d0";
        ctx.beginPath();
        ctx.arc(bx, by, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2c3440";
        ctx.beginPath();
        ctx.arc(bx, by, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return c;
  }

  /* ===================================================================
   * 1. OrbitGirlRig — 30×30 连续 WebGL 网格蒙皮 + 眨眼 + 零重力冰美式浮冰
   *    精确对齐 V3 腾跃无束腰飞领女孩立绘（852×809）实测解剖锚点：
   *      EYE_L = (0.574, 0.149), EYE_R = (0.616, 0.150)
   *      SKIN_PORCELAIN = rgb(217, 186, 163)
   *      COFFEE_MOUTH   = u ∈ [0.28, 0.36], v_top = 0.436
   *      LEFT_FINGERTIP = (0.922, 0.448)
   *      SNEAKERS       = back (0.476, 0.904), front (0.853, 0.953)
   * =================================================================== */
  class OrbitGirlRig {
    constructor(meshCanvas, overlayCanvas, imgUrl) {
      this.canvas = meshCanvas;
      this.overlay = overlayCanvas;
      this.octx = overlayCanvas ? overlayCanvas.getContext("2d", { alpha: true }) : null;
      this.cols = 30;
      this.rows = 30;
      this.ready = false;
      this.ok = false;

      this.gl = meshCanvas ? meshCanvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: "high-performance"
      }) : null;
      this.c2d = (!this.gl && meshCanvas) ? meshCanvas.getContext("2d", { alpha: true }) : null;

      this.img = new Image();
      this.img.decoding = "async";
      this.img.onload = () => {
        this.ready = true;
        if (this.gl) this._initGL();
      };
      this.img.src = imgUrl;

      // 失重冰美式 3 颗半透方冰（实测杯口 u ∈ [0.28, 0.36], v_top = 0.436）
      this.iceCubes = [
        { u: 0.305, v: 0.436, sz: 10.5, ph: 0.4,  driftX: -5.5, rise: 24, spin:  0.85 },
        { u: 0.338, v: 0.432, sz: 11.5, ph: 1.9,  driftX:  4.5, rise: 32, spin: -0.75 },
        { u: 0.320, v: 0.442, sz: 8.8,  ph: 3.6,  driftX: -1.5, rise: 19, spin:  1.15 }
      ];
    }

    _initGL() {
      const gl = this.gl;
      const vs = `
        precision mediump float;
        attribute vec2 a_uv;
        uniform float u_time;
        uniform float u_leap;
        uniform float u_kick;
        uniform float u_push;
        uniform float u_billow;
        uniform float u_coil;
        uniform float u_pop;
        uniform float u_flick;
        uniform float u_tuck;
        uniform float u_counter;
        uniform float u_catch;
        varying vec2 v_uv;

        void main() {
          vec2 uv = a_uv;
          float x = uv.x;
          float y = uv.y;
          vec2 d = vec2(0.0);

          // 严格刚性保护头部、面部与颈部（y < 0.285 零扭曲、零拉扯，绝不晃脖子！）
          float bodyBelowNeck = smoothstep(0.285, 0.360, y);
          float belowShoulders = smoothstep(0.320, 0.415, y);

          // 极轻柔的站姿自然呼吸平衡（静止开场也不僵硬，脚稳踩板面、身体微晃找重心）
          float idleMask = clamp(1.0 - (u_pop + u_tuck) * 0.85, 0.0, 1.0);
          float idleSway = sin(u_time * 1.65) * 0.0085 * idleMask;
          float idleKnee = (0.5 + 0.5 * sin(u_time * 2.15 + 0.6)) * 0.009 * idleMask;

          // 1. 阶段一「蓄力压膝 Coil」与阶段二「点板爆起 Pop」躯干弹性起伏
          float torsoBand = bodyBelowNeck * (1.0 - smoothstep(0.74, 0.90, y));
          float hipBand   = smoothstep(0.48, 0.62, y) * (1.0 - smoothstep(0.80, 0.92, y));
          float shoulderBand = smoothstep(0.30, 0.36, y) * (1.0 - smoothstep(0.46, 0.56, y));

          // 蓄力时胸腹与胯部微沉（+Y），爆起与收膝腾空时舒展上提（-Y）
          d.y += torsoBand * (u_coil * 0.022 + idleKnee - u_pop * 0.018 - u_tuck * 0.020);
          d.x += hipBand * (u_coil * 0.012 + idleSway);

          // 2. 阶段五「肩胯反向平衡 Counter-Rotation」：真实滑板空中对抗力学
          //    胯部向右下方微摆，双肩与上躯干向相反方向轻盈扭转稳住空中重心，颈部中心始终稳定
          float offNeckX = smoothstep(0.072, 0.145, abs(x - 0.56));
          d.x += hipBand * (u_counter * 0.024 - u_flick * 0.014);
          d.x -= shoulderBand * offNeckX * (u_counter * 0.026 + u_leap * 0.012);
          d.y += shoulderBand * offNeckX * ((x - 0.56) * u_counter * 0.052);

          // 3. 大红色街头双肩包与两侧背带（x ∈ [0.27, 0.68], y ∈ [0.22, 0.52]）随起跳惯性微弹
          float packMask = smoothstep(0.24, 0.34, x) * (1.0 - smoothstep(0.48, 0.56, x))
                         * smoothstep(0.20, 0.28, y) * (1.0 - smoothstep(0.44, 0.54, y)) * offNeckX;
          float packLag = u_coil * 0.014 - u_pop * 0.016 - u_tuck * 0.012 + sin(u_time * 2.6) * 0.003;
          d.y += packMask * packLag;
          d.x -= packMask * (u_counter * 0.014 + u_billow * 0.008);

          // 4. 飞扬敞开外领与双肩翻领（刻意避开颈部中心，只让外领随风轻盈上扬）
          float collarMask = smoothstep(0.25, 0.31, y) * (1.0 - smoothstep(0.40, 0.48, y))
                           * smoothstep(0.28, 0.38, x) * (1.0 - smoothstep(0.68, 0.78, x)) * offNeckX;
          float collarLift = (0.55 + 0.45 * sin(u_time * 2.5 + x * 9.0)) * (0.38 + u_billow * 0.78 + u_tuck * 0.35);
          d.y -= collarMask * (0.010 + 0.014 * collarLift);
          d.x += collarMask * sin(u_time * 2.1 + y * 11.0) * 0.007;

          // 5. 无束腰铅白长袍下摆与阔腿袍浪（起跳气压鼓风 + 空中失重翻飞）
          float leftCloak = smoothstep(0.45, 0.06, x) * smoothstep(0.35, 0.56, y);
          float lowerHem  = smoothstep(0.50, 0.78, y) * (1.0 - smoothstep(0.80, 0.90, y) * smoothstep(0.38, 0.95, x));
          float waveA = sin(u_time * 2.55 + y * 9.2 - x * 6.4);
          float waveB = cos(u_time * 3.15 + x * 11.2 - y * 7.0);
          float robePower = 0.011 + u_billow * 0.025 + u_tuck * 0.020 + u_pop * 0.012;
          d.x += (leftCloak * 1.18 + lowerHem * 0.62) * (waveA * 0.65 + waveB * 0.35) * robePower;
          d.y -= (leftCloak * 0.92 + lowerHem * 0.68) * (0.36 + 0.64 * waveA) * (0.008 + u_billow * 0.022 + u_tuck * 0.014);

          // 6. 栗色短卷发仅外缘发梢迎风轻拂（头脸与脖子绝对零形变）
          float hairMask = (1.0 - smoothstep(0.14, 0.21, y)) * smoothstep(0.35, 0.44, x) * (1.0 - smoothstep(0.66, 0.74, x));
          float hairTip  = smoothstep(0.088, 0.165, abs(x - 0.56));
          d.x += hairMask * hairTip * sin(u_time * 3.1 + y * 16.0) * (0.005 + u_billow * 0.009);
          d.y -= hairMask * hairTip * cos(u_time * 2.6 + x * 14.0) * (0.004 + u_billow * 0.007);

          // 7. 真实滑板 Ollie / Kickflip 六阶段双腿、双膝与双脚联动力学！
          //    - 后腿/后脚（左红帆布鞋 x ∈ [0.36, 0.62]）：
          //      蓄力压膝微屈 → 爆起瞬间踝部猛然下踩点板(+0.042 Y) → 双膝高收上提(-0.076 Y) 避让 360° 翻转滑板 → 空中落脚接板准备(+0.024 Y)
          //    - 前腿/前脚（右红帆布鞋 x ∈ [0.64, 0.99]）：
          //      蓄力压膝微收 → 斜刷板头凹槽猛然前踢勾脚(+0.052 X, -0.044 Y) 触发 Kickflip → 高收腿腾空(-0.062 Y) → 舒展接板
          float backLeg   = smoothstep(0.58, 0.74, y) * smoothstep(0.34, 0.44, x) * (1.0 - smoothstep(0.56, 0.66, x));
          float backFoot  = smoothstep(0.74, 0.86, y) * smoothstep(0.36, 0.44, x) * (1.0 - smoothstep(0.56, 0.65, x));
          float frontLeg  = smoothstep(0.58, 0.75, y) * smoothstep(0.64, 0.76, x);
          float frontFoot = smoothstep(0.74, 0.88, y) * smoothstep(0.68, 0.80, x);

          // 后腿与后脚：蓄力微沉 → 点板爆发下踩 → 敏捷高收膝 → 空中舒展接板
          d.y += backLeg  * (u_coil * 0.016 - u_tuck * 0.046 + u_catch * 0.014);
          d.y += backFoot * (u_pop * 0.042 - u_tuck * 0.034 + u_catch * 0.016);
          d.x += backLeg  * (-u_coil * 0.010 - u_tuck * 0.028 + u_catch * 0.010);

          // 前腿与前脚：蓄力内收 → 沿砂纸斜刷板头外侧勾踢(Flick) → 双膝高收腾空 → 伸腿接板
          d.x += frontLeg  * (-u_coil * 0.014 + u_flick * 0.030 - u_tuck * 0.018 + u_catch * 0.012);
          d.x += frontFoot * (u_flick * 0.032 - u_tuck * 0.010);
          d.y += frontLeg  * (u_coil * 0.014 - u_flick * 0.026 - u_tuck * 0.042 + u_catch * 0.016);
          d.y += frontFoot * (-u_flick * 0.024 - u_tuck * 0.024 + u_catch * 0.014);

          // 8. 左前臂与空出五指：开场自然轻敲面前笔电 → 腾空时辅助平衡 → 阶段 2 真实前推释放
          float armMask = smoothstep(0.68, 0.88, x) * smoothstep(0.32, 0.40, y) * (1.0 - smoothstep(0.50, 0.58, y));
          float typeTap = sin(u_time * 5.2) * (1.0 - u_push) * 0.0045;
          d.x += armMask * (u_push * 0.070 + u_counter * 0.014 + typeTap * 0.5);
          d.y -= armMask * (u_push * 0.024 + u_tuck * 0.018 + u_pop * 0.012 + typeTap);

          // 9. 右手冰美式手臂随滑板平衡自然外抬与失重微浮
          float rightArm = smoothstep(0.18, 0.30, x) * (1.0 - smoothstep(0.40, 0.47, x))
                         * smoothstep(0.35, 0.44, y) * (1.0 - smoothstep(0.55, 0.63, y));
          d.x -= rightArm * (u_tuck * 0.020 + u_counter * 0.016);
          d.y -= rightArm * (sin(u_time * 2.0) * 0.005 + u_tuck * 0.024 + u_pop * 0.014 - u_coil * 0.010);

          vec2 pos = vec2((x + d.x) * 2.0 - 1.0, 1.0 - (y + d.y) * 2.0);
          gl_Position = vec4(pos, 0.0, 1.0);
          v_uv = uv;
        }
      `;
      const fs = `
        precision mediump float;
        uniform sampler2D u_tex;
        varying vec2 v_uv;
        void main() {
          vec4 c = texture2D(u_tex, v_uv);
          if (c.a < 0.01) discard;
          gl_FragColor = vec4(c.rgb * c.a, c.a);
        }
      `;
      this.prog = createProgram(gl, vs, fs);
      if (!this.prog) return;

      const uvs = [];
      const idx = [];
      for (let r = 0; r <= this.rows; r++) {
        for (let c = 0; c <= this.cols; c++) {
          uvs.push(c / this.cols, r / this.rows);
        }
      }
      const stride = this.cols + 1;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const i0 = r * stride + c;
          const i1 = i0 + 1;
          const i2 = i0 + stride;
          const i3 = i2 + 1;
          idx.push(i0, i1, i2, i1, i3, i2);
        }
      }
      this.idxCount = idx.length;

      this.uvBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

      this.idxBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

      this.tex = createTexture2D(gl, this.img);
      this.loc = {
        uv:      gl.getAttribLocation(this.prog, "a_uv"),
        time:    gl.getUniformLocation(this.prog, "u_time"),
        leap:    gl.getUniformLocation(this.prog, "u_leap"),
        kick:    gl.getUniformLocation(this.prog, "u_kick"),
        push:    gl.getUniformLocation(this.prog, "u_push"),
        billow:  gl.getUniformLocation(this.prog, "u_billow"),
        coil:    gl.getUniformLocation(this.prog, "u_coil"),
        pop:     gl.getUniformLocation(this.prog, "u_pop"),
        flick:   gl.getUniformLocation(this.prog, "u_flick"),
        tuck:    gl.getUniformLocation(this.prog, "u_tuck"),
        counter: gl.getUniformLocation(this.prog, "u_counter"),
        catchP:  gl.getUniformLocation(this.prog, "u_catch"),
        tex:     gl.getUniformLocation(this.prog, "u_tex")
      };
      this.ok = true;
    }

    render(tSec, leap, kick, push, billow, trick) {
      if (!this.ready) return;
      const tr = trick || {};
      if (this.ok) {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(this.loc.tex, 0);
        gl.uniform1f(this.loc.time, tSec);
        gl.uniform1f(this.loc.leap, leap);
        gl.uniform1f(this.loc.kick, kick);
        gl.uniform1f(this.loc.push, push);
        gl.uniform1f(this.loc.billow, billow);
        gl.uniform1f(this.loc.coil, tr.coil || 0);
        gl.uniform1f(this.loc.pop, tr.pop || 0);
        gl.uniform1f(this.loc.flick, tr.flick || 0);
        gl.uniform1f(this.loc.tuck, tr.tuck || 0);
        gl.uniform1f(this.loc.counter, tr.counter || 0);
        gl.uniform1f(this.loc.catchP, tr.catchP || 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuf);
        gl.enableVertexAttribArray(this.loc.uv);
        gl.vertexAttribPointer(this.loc.uv, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuf);
        gl.drawElements(gl.TRIANGLES, this.idxCount, gl.UNSIGNED_SHORT, 0);
      } else if (this.c2d) {
        this.c2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.c2d.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
      }

      this._renderOverlay(tSec, leap);
    }

    _renderOverlay(tSec, leap) {
      if (!this.octx || !this.overlay) return;
      const ctx = this.octx;
      const w = this.overlay.width;
      const h = this.overlay.height;
      ctx.clearRect(0, 0, w, h);

      // 1. 零重力冰美式浮冰（起跳阶段冰块轻盈上浮出液面）
      const floatAmt = clamp(0.24 + leap * 0.92, 0, 1.15);
      for (const cube of this.iceCubes) {
        const bob = Math.sin(tSec * 2.1 + cube.ph) * 3.2;
        const cx = cube.u * w + cube.driftX * floatAmt;
        const cy = cube.v * h - cube.rise * floatAmt + bob;
        const sz = cube.sz;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tSec * cube.spin * 0.5 + cube.ph);
        ctx.fillStyle = "rgba(232, 240, 246, 0.44)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.roundRect(-sz * 0.5, -sz * 0.5, sz, sz * 0.88, 2.2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
        ctx.fillRect(-sz * 0.30, -sz * 0.32, sz * 0.32, sz * 0.14);
        ctx.restore();
      }

      // 2. 自然周期瓷感眨眼（严格取样自新立绘肤色 rgb(217, 186, 163)）
      const cyc = tSec % 5.4;
      let blink = 0;
      if (cyc > 4.65 && cyc < 4.90) {
        const bt = (cyc - 4.65) / 0.25;
        blink = Math.sin(bt * Math.PI);
      }
      if (blink > 0.02) {
        const eyes = [
          { x: 0.574 * w, y: 0.149 * h, rx: 13.5, ry: 7.4 },
          { x: 0.616 * w, y: 0.150 * h, rx: 12.2, ry: 7.0 }
        ];
        for (const e of eyes) {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.fillStyle = `rgba(217, 186, 163, ${(blink * 0.94).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(0, -e.ry * (1 - blink) * 0.42, e.rx, Math.max(1.2, e.ry * blink * 1.12), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(92, 66, 54, ${(blink * 0.58).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(0, -e.ry * 0.08, e.rx * 0.84, 0.15 * Math.PI, 0.85 * Math.PI);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  /* ===================================================================
   * 2. OrbitProps3D — 原生 WebGL PBR 贴图真 3D 笔电 + 文艺复兴图文双翘滑板
   * =================================================================== */
  function createMeshBuilder() {
    const pos = [], norm = [], col = [], uv = [], idx = [];
    let vOff = 0;

    function pushQuad(p0, p1, p2, p3, n, c, uvs) {
      const pts = [p0, p1, p2, p3];
      const tcs = uvs || [[0,0],[1,0],[1,1],[0,1]];
      for (let i = 0; i < 4; i++) {
        pos.push(pts[i][0], pts[i][1], pts[i][2]);
        norm.push(n[0], n[1], n[2]);
        col.push(c[0], c[1], c[2], c[3] ?? 1);
        uv.push(tcs[i][0], tcs[i][1]);
      }
      idx.push(vOff, vOff + 1, vOff + 2, vOff, vOff + 2, vOff + 3);
      vOff += 4;
    }

    function addBox(cx, cy, cz, w, h, d, cTop, cSide, cBot, skipTop) {
      const cT = cTop;
      const cS = cSide || cTop;
      const cB = cBot || cSide || cTop;
      const hx = w * 0.5, hy = h * 0.5, hz = d * 0.5;
      const x0 = cx - hx, x1 = cx + hx;
      const y0 = cy - hy, y1 = cy + hy;
      const z0 = cz - hz, z1 = cz + hz;
      pushQuad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1], [0,0,1], cS);
      pushQuad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0], [0,0,-1], cS);
      if (!skipTop) pushQuad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0], [0,1,0], cT);
      pushQuad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1], [0,-1,0], cB);
      pushQuad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1], [1,0,0], cS);
      pushQuad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0], [-1,0,0], cS);
    }

    function addCylinderZ(cx, cy, cz, radius, length, segs, colorSide, colorCap) {
      const hz = length * 0.5;
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = ((i + 1) / segs) * Math.PI * 2;
        const c0 = Math.cos(a0), s0 = Math.sin(a0);
        const c1 = Math.cos(a1), s1 = Math.sin(a1);
        const nm = [Math.cos((a0 + a1) * 0.5), Math.sin((a0 + a1) * 0.5), 0];
        pushQuad(
          [cx + c0 * radius, cy + s0 * radius, cz - hz],
          [cx + c1 * radius, cy + s1 * radius, cz - hz],
          [cx + c1 * radius, cy + s1 * radius, cz + hz],
          [cx + c0 * radius, cy + s0 * radius, cz + hz],
          nm, colorSide
        );
        const capC = colorCap || colorSide;
        pos.push(cx, cy, cz + hz, cx + c0 * radius, cy + s0 * radius, cz + hz, cx + c1 * radius, cy + s1 * radius, cz + hz);
        norm.push(0,0,1, 0,0,1, 0,0,1);
        for (let k = 0; k < 3; k++) { col.push(capC[0], capC[1], capC[2], 1); uv.push(0,0); }
        idx.push(vOff, vOff + 1, vOff + 2);
        vOff += 3;

        pos.push(cx, cy, cz - hz, cx + c1 * radius, cy + s1 * radius, cz - hz, cx + c0 * radius, cy + s0 * radius, cz - hz);
        norm.push(0,0,-1, 0,0,-1, 0,0,-1);
        for (let k = 0; k < 3; k++) { col.push(capC[0], capC[1], capC[2], 1); uv.push(0,0); }
        idx.push(vOff, vOff + 1, vOff + 2);
        vOff += 3;
      }
    }

    return {
      pushQuad,
      addBox,
      addCylinderZ,
      build(gl) {
        const bPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

        const bNorm = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bNorm);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);

        const bCol = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bCol);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);

        const bUv = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bUv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

        const bIdx = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

        return { bPos, bNorm, bCol, bUv, bIdx, count: idx.length };
      }
    };
  }

  class OrbitProps3D {
    constructor(canvas, skateArtUrl) {
      this.canvas = canvas;
      this.gl = canvas ? canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        depth: true,
        premultipliedAlpha: true,
        powerPreference: "high-performance"
      }) : null;
      this.ok = false;
      this.fovRad = 34 * DEG;
      this.aspect = 16 / 9;

      // 屏幕内框在笔电上盖局部坐标系中的精确宽高（p=0.60 严丝合缝铺满 100% 视口）
      this.scrW = 2.08;
      this.scrH = 1.24;
      this.lidH = 1.38;

      if (this.gl) {
        this._init();
        if (skateArtUrl) this._loadSkateArt(skateArtUrl);
      }
    }

    _init() {
      const gl = this.gl;
      const vs = `
        attribute vec3 a_pos;
        attribute vec3 a_norm;
        attribute vec4 a_col;
        attribute vec2 a_uv;
        uniform mat4 u_mvp;
        uniform mat4 u_model;
        varying vec3 v_norm;
        varying vec4 v_col;
        varying vec2 v_uv;
        varying vec3 v_worldPos;
        void main() {
          vec4 wp = u_model * vec4(a_pos, 1.0);
          v_worldPos = wp.xyz;
          v_norm = normalize((u_model * vec4(a_norm, 0.0)).xyz);
          v_col = a_col;
          v_uv = a_uv;
          gl_Position = u_mvp * vec4(a_pos, 1.0);
        }
      `;
      const fs = `
        precision mediump float;
        uniform float u_texMode;  // 0=纯材质着色 1=自发光玻璃屏 2=受光 PBR 贴图（键盘/铝背盖/滑板图文）
        uniform float u_charge;
        uniform float u_alpha;
        uniform float u_emissive;
        uniform float u_specPow;
        uniform float u_specAmt;
        uniform sampler2D u_tex;
        varying vec3 v_norm;
        varying vec4 v_col;
        varying vec2 v_uv;
        varying vec3 v_worldPos;
        void main() {
          vec3 N = normalize(v_norm);
          vec3 V = normalize(vec3(0.0, 0.0, 3.0) - v_worldPos);
          // 中性高级棚拍冷北光漫射照明（还原真实银铝质感，告别发蓝塑料感）
          vec3 L1 = normalize(vec3(-0.32, 0.74, 0.72));
          vec3 L2 = normalize(vec3(0.56, -0.18, 0.78));
          float diff1 = max(dot(N, L1), 0.0);
          float diff2 = max(dot(N, L2), 0.0);
          vec3 H1 = normalize(L1 + V);
          float spec = pow(max(dot(N, H1), 0.0), max(8.0, u_specPow)) * u_specAmt;
          float rim = pow(1.0 - max(dot(N, V), 0.0), 3.2) * 0.24;

          vec3 baseRgb;
          if (u_texMode > 0.5 && u_texMode < 1.5) {
            // 模式 1：实时第一幕玻璃屏
            vec4 tc = texture2D(u_tex, v_uv);
            float glass = smoothstep(0.18, 0.88, 1.0 - (v_uv.x * 0.62 + v_uv.y * 0.52)) * 0.065;
            float edge = max(abs(v_uv.x - 0.5), abs(v_uv.y - 0.5)) * 2.0;
            float edgeGlow = smoothstep(0.84, 1.0, edge) * u_charge;
            baseRgb = tc.rgb + vec3(0.84, 0.89, 0.94) * glass + vec3(0.92, 0.14, 0.84) * edgeGlow * 0.75;
          } else {
            vec3 albedo = v_col.rgb;
            if (u_texMode >= 1.5) {
              albedo *= texture2D(u_tex, v_uv).rgb;
            }
            vec3 amb  = vec3(0.42, 0.44, 0.47);
            vec3 key  = vec3(0.72, 0.74, 0.77) * diff1;
            vec3 fill = vec3(0.24, 0.28, 0.34) * diff2;
            vec3 lit = albedo * (amb + key + fill)
                     + vec3(0.96, 0.97, 0.99) * spec
                     + vec3(0.72, 0.80, 0.88) * rim;
            baseRgb = mix(lit, albedo * 1.18, u_emissive);
          }

          float a = v_col.a * u_alpha;
          gl_FragColor = vec4(baseRgb * a, a);
        }
      `;
      this.prog = createProgram(gl, vs, fs);
      if (!this.prog) return;

      this.loc = {
        pos:      gl.getAttribLocation(this.prog, "a_pos"),
        norm:     gl.getAttribLocation(this.prog, "a_norm"),
        col:      gl.getAttribLocation(this.prog, "a_col"),
        uv:       gl.getAttribLocation(this.prog, "a_uv"),
        mvp:      gl.getUniformLocation(this.prog, "u_mvp"),
        model:    gl.getUniformLocation(this.prog, "u_model"),
        texMode:  gl.getUniformLocation(this.prog, "u_texMode"),
        charge:   gl.getUniformLocation(this.prog, "u_charge"),
        alpha:    gl.getUniformLocation(this.prog, "u_alpha"),
        emissive: gl.getUniformLocation(this.prog, "u_emissive"),
        specPow:  gl.getUniformLocation(this.prog, "u_specPow"),
        specAmt:  gl.getUniformLocation(this.prog, "u_specAmt"),
        tex:      gl.getUniformLocation(this.prog, "u_tex")
      };

      this._buildLaptopMeshes();
      this._buildSkateboardMeshes();

      this.screenTex   = createTexture2D(gl, null);
      this.aluLidTex   = createTexture2D(gl, buildBrushedAluminumLidCanvas());
      this.keyDeckTex  = createTexture2D(gl, buildKeyboardDeckCanvas());
      this.gripTapeTex = createTexture2D(gl, buildGripTapeCanvas());
      this.skateArtTex = createTexture2D(gl, null);

      this.ok = true;
    }

    _loadSkateArt(url) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!this.ok) return;
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.skateArtTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      };
      img.src = url;
    }

    uploadScreenCanvas(srcCanvas) {
      if (!this.ok || !srcCanvas) return;
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.screenTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
    }

    _buildLaptopMeshes() {
      const gl = this.gl;
      // 真实中性银铝（彻底消除发蓝低模感）
      const aluSide   = [0.76, 0.78, 0.81, 1];
      const aluBottom = [0.64, 0.67, 0.70, 1];
      const keyTop    = [0.14, 0.16, 0.19, 1];
      const keySide   = [0.07, 0.08, 0.10, 1];
      const bezelCol  = [0.05, 0.06, 0.08, 1];
      const portCol   = [0.06, 0.07, 0.09, 1];

      const bw = 2.24, bd = 1.48, bh = 0.078;

      // ---- A1. 笔电底部机身侧面/底面 + 侧边 USB-C/HDMI 接口 + 78 颗微妙立体键帽浮雕 ----
      const base = createMeshBuilder();
      base.addBox(0, -bh * 0.5, bd * 0.5, bw, bh, bd, aluSide, aluSide, aluBottom, true);
      // 四枚低矮防滑垫脚
      for (const sx of [-0.90, 0.90]) {
        for (const sz of [0.22, 1.24]) {
          base.addBox(sx, -bh - 0.006, sz, 0.13, 0.012, 0.13, keySide, keySide, keySide);
        }
      }
      // 左侧双 USB-C 雷电接口 + 耳机口；右侧 HDMI 与 SD 卡槽
      base.addBox(-bw * 0.5 - 0.003, -bh * 0.5, 0.28, 0.008, 0.020, 0.075, portCol, portCol, portCol);
      base.addBox(-bw * 0.5 - 0.003, -bh * 0.5, 0.42, 0.008, 0.020, 0.075, portCol, portCol, portCol);
      base.addBox( bw * 0.5 + 0.003, -bh * 0.5, 0.34, 0.008, 0.022, 0.115, portCol, portCol, portCol);
      // 沿 X 轴精密黑色转轴铰链条
      base.addBox(0, 0.007, 0.028, 1.56, 0.034, 0.052, bezelCol, bezelCol, bezelCol);

      // 78 颗微妙凸起 3D 键帽（与下方高清键盘贴图叠加产生真实侧视立体厚度）
      const kw = 1.72, kz0 = 0.125;
      const rowsSpec = [
        { count: 14, h: 0.066, gap: 0.016, widths: [1.3,1,1,1,1,1,1,1,1,1,1,1,1,1.1] },
        { count: 14, h: 0.092, gap: 0.016, widths: [1,1,1,1,1,1,1,1,1,1,1,1,1,1.65] },
        { count: 14, h: 0.092, gap: 0.016, widths: [1.55,1,1,1,1,1,1,1,1,1,1,1,1,1.1] },
        { count: 13, h: 0.092, gap: 0.016, widths: [1.85,1,1,1,1,1,1,1,1,1,1,1,1.8] },
        { count: 12, h: 0.092, gap: 0.016, widths: [2.35,1,1,1,1,1,1,1,1,1,1,2.3] },
        { count: 10, h: 0.096, gap: 0.016, widths: [1,1,1,1.3,5.2,1.3,1,0.95,0.95,0.95] }
      ];
      const padX = 0.032;
      const innerW = kw - padX * 2;
      let curZ = kz0 + 0.022;
      for (let r = 0; r < rowsSpec.length; r++) {
        const rs = rowsSpec[r];
        const sumW = rs.widths.reduce((a, b) => a + b, 0);
        const availW = innerW - rs.gap * (rs.count - 1);
        let curX = -innerW * 0.5;
        for (let k = 0; k < rs.count; k++) {
          const keyW = availW * (rs.widths[k] / sumW);
          base.addBox(curX + keyW * 0.5, 0.008, curZ + rs.h * 0.5, keyW, 0.014, rs.h, keyTop, keySide, keySide);
          curX += keyW + rs.gap;
        }
        curZ += rs.h + 0.016;
      }
      this.laptopBaseBody = base.build(gl);

      // ---- A2. 笔电键盘顶板高清贴图面（UV 完整映射 1024×680 扬声器+键盘+触控板细节） ----
      const deck = createMeshBuilder();
      deck.pushQuad(
        [-bw * 0.5, 0.001, bd],
        [ bw * 0.5, 0.001, bd],
        [ bw * 0.5, 0.001, 0],
        [-bw * 0.5, 0.001, 0],
        [0, 1, 0],
        [1, 1, 1, 1],
        [[0, 1], [1, 1], [1, 0], [0, 0]]
      );
      this.laptopDeckTop = deck.build(gl);

      // ---- B1. 笔电上盖边框与铝侧边（不含背壳主面） ----
      const lw = 2.24, lh = this.lidH, lt = 0.048;
      const lidRim = createMeshBuilder();
      // 四条铝侧边（不含 -Z 背板与 +Z 正面）
      const hx = lw * 0.5;
      // Top edge
      lidRim.pushQuad([-hx, lh, 0], [hx, lh, 0], [hx, lh, -lt], [-hx, lh, -lt], [0,1,0], aluSide);
      // Bottom edge
      lidRim.pushQuad([-hx, 0, -lt], [hx, 0, -lt], [hx, 0, 0], [-hx, 0, 0], [0,-1,0], aluSide);
      // Right edge
      lidRim.pushQuad([hx, 0, 0], [hx, 0, -lt], [hx, lh, -lt], [hx, lh, 0], [1,0,0], aluSide);
      // Left edge
      lidRim.pushQuad([-hx, 0, -lt], [-hx, 0, 0], [-hx, lh, 0], [-hx, lh, -lt], [-1,0,0], aluSide);

      // 正面极窄黑玻璃边框 + 刘海槽
      const bThick = 0.010;
      const sx = this.scrW * 0.5;
      const sy0 = 0.075, sy1 = sy0 + this.scrH;
      lidRim.addBox(0, sy0 * 0.5, bThick * 0.5, lw - 0.03, sy0, bThick, bezelCol, bezelCol, bezelCol);
      const topH = lh - sy1;
      lidRim.addBox(0, sy1 + topH * 0.5, bThick * 0.5, lw - 0.03, topH, bThick, bezelCol, bezelCol, bezelCol);
      const sideW = (lw - 0.03 - this.scrW) * 0.5;
      lidRim.addBox(-sx - sideW * 0.5, (sy0 + sy1) * 0.5, bThick * 0.5, sideW, this.scrH, bThick, bezelCol, bezelCol, bezelCol);
      lidRim.addBox( sx + sideW * 0.5, (sy0 + sy1) * 0.5, bThick * 0.5, sideW, this.scrH, bThick, bezelCol, bezelCol, bezelCol);
      lidRim.addBox(0, sy1 - 0.022, bThick + 0.002, 0.28, 0.044, 0.006, bezelCol, bezelCol, bezelCol);
      this.laptopLidRim = lidRim.build(gl);

      // ---- B2. 笔电拉丝铝背壳主面（UV 映射高清拉丝铝纹理，0% 背对观众时极其高级） ----
      const lidBack = createMeshBuilder();
      lidBack.pushQuad(
        [ hx, 0,  -lt],
        [-hx, 0,  -lt],
        [-hx, lh, -lt],
        [ hx, lh, -lt],
        [0, 0, -1],
        [1, 1, 1, 1],
        [[0, 1], [1, 1], [1, 0], [0, 0]]
      );
      this.laptopLidBack = lidBack.build(gl);

      // ---- C. 实时屏幕显示面（严格与第一幕 1:1 映射） ----
      const scr = createMeshBuilder();
      scr.pushQuad(
        [-sx, sy0, bThick + 0.001],
        [ sx, sy0, bThick + 0.001],
        [ sx, sy1, bThick + 0.001],
        [-sx, sy1, bThick + 0.001],
        [0, 0, 1],
        [1, 1, 1, 1],
        [[0, 1], [1, 1], [1, 0], [0, 0]]
      );
      this.laptopScreen = scr.build(gl);
    }

    _buildSkateboardMeshes() {
      const gl = this.gl;
      const plyMaple = [0.84, 0.74, 0.60, 1];
      const plyMag   = [0.90, 0.14, 0.58, 1]; // 7 层枫木中间夹层洋红细线
      const truckAlu = [0.86, 0.89, 0.93, 1];
      const truckDk  = [0.50, 0.54, 0.60, 1];
      const wheelCol = [0.76, 0.24, 0.98, 1]; // 发光荧光紫聚氨酯轮
      const wheelCap = [0.95, 0.64, 1.00, 1];
      const bearCol  = [0.82, 0.86, 0.90, 1];

      // 11 段平滑圆头双翘滑板轮廓（总长 2.36，最宽 0.64，真实 7 层板厚 0.056）
      const profile = [
        { x: -1.18, y: 0.155, w: 0.22 },
        { x: -1.10, y: 0.120, w: 0.44 },
        { x: -0.98, y: 0.068, w: 0.58 },
        { x: -0.82, y: 0.022, w: 0.63 },
        { x: -0.64, y: 0.000, w: 0.64 },
        { x:  0.00, y: -0.004, w: 0.64 },
        { x:  0.64, y: 0.000, w: 0.64 },
        { x:  0.82, y: 0.022, w: 0.63 },
        { x:  0.98, y: 0.068, w: 0.58 },
        { x:  1.10, y: 0.120, w: 0.44 },
        { x:  1.18, y: 0.155, w: 0.22 }
      ];
      const th = 0.056;
      const xMin = -1.18, xSpan = 2.36;

      // 1. 顶部磨砂砂纸面（UV 映射 gripTapeTex）
      const topMesh = createMeshBuilder();
      // 2. 底部文艺复兴洋红卷草纹画布面（UV 映射 orbit-skate-art.jpg）
      const botMesh = createMeshBuilder();
      // 3. 7 层枫木板边 + 银铝 CNC 桥架（纯材质高光）
      const hwMesh  = createMeshBuilder();

      for (let i = 0; i < profile.length - 1; i++) {
        const a = profile[i], b = profile[i + 1];
        const u0 = (a.x - xMin) / xSpan;
        const u1 = (b.x - xMin) / xSpan;
        const az = a.w * 0.5, bz = b.w * 0.5;
        const vTopA0 = 0.5 - (a.w / 0.64) * 0.48, vTopA1 = 0.5 + (a.w / 0.64) * 0.48;
        const vTopB0 = 0.5 - (b.w / 0.64) * 0.48, vTopB1 = 0.5 + (b.w / 0.64) * 0.48;

        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nTop = [-dy / len, dx / len, 0];
        const nBot = [dy / len, -dx / len, 0];

        // 顶部砂纸面
        topMesh.pushQuad(
          [a.x, a.y + th * 0.5,  az], [b.x, b.y + th * 0.5,  bz],
          [b.x, b.y + th * 0.5, -bz], [a.x, a.y + th * 0.5, -az],
          nTop, [1, 1, 1, 1],
          [[u0, vTopA1], [u1, vTopB1], [u1, vTopB0], [u0, vTopA0]]
        );

        // 底部文艺复兴卷草雕版画（完整铺满无畸变）
        botMesh.pushQuad(
          [a.x, a.y - th * 0.5, -az], [b.x, b.y - th * 0.5, -bz],
          [b.x, b.y - th * 0.5,  bz], [a.x, a.y - th * 0.5,  az],
          nBot, [1, 1, 1, 1],
          [[u0, vTopA0], [u1, vTopB0], [u1, vTopB1], [u0, vTopA1]]
        );

        // 前后 7 层枫木板边（上半层自然枫木 + 下半层克制洋红夹心线）
        const midA = a.y, midB = b.y;
        hwMesh.pushQuad([a.x, midA, az], [b.x, midB, bz], [b.x, b.y + th * 0.5, bz], [a.x, a.y + th * 0.5, az], [0,0,1], plyMaple);
        hwMesh.pushQuad([a.x, a.y - th * 0.5, az], [b.x, b.y - th * 0.5, bz], [b.x, midB, bz], [a.x, midA, az], [0,0,1], plyMag);

        hwMesh.pushQuad([b.x, midB, -bz], [a.x, midA, -az], [a.x, a.y + th * 0.5, -az], [b.x, b.y + th * 0.5, -bz], [0,0,-1], plyMaple);
        hwMesh.pushQuad([b.x, b.y - th * 0.5, -bz], [a.x, a.y - th * 0.5, -az], [a.x, midA, -az], [b.x, midB, -bz], [0,0,-1], plyMag);
      }

      // 前后端封边
      const first = profile[0], last = profile[profile.length - 1];
      hwMesh.pushQuad(
        [first.x, first.y - th*0.5, -first.w*0.5], [first.x, first.y - th*0.5, first.w*0.5],
        [first.x, first.y + th*0.5, first.w*0.5],  [first.x, first.y + th*0.5, -first.w*0.5],
        [-1, 0, 0], plyMaple
      );
      hwMesh.pushQuad(
        [last.x, last.y - th*0.5, last.w*0.5], [last.x, last.y - th*0.5, -last.w*0.5],
        [last.x, last.y + th*0.5, -last.w*0.5], [last.x, last.y + th*0.5, last.w*0.5],
        [1, 0, 0], plyMaple
      );

      // 前后 CNC 银铝 T 型桥架（底座 + 减震主销 + 桥架横梁 + 轴承芯）
      for (const tx of [-0.58, 0.58]) {
        hwMesh.addBox(tx, -0.044, 0, 0.22, 0.032, 0.24, truckDk, truckAlu, truckDk);
        hwMesh.addBox(tx, -0.105, 0, 0.082, 0.115, 0.095, truckAlu, truckDk, truckAlu);
        hwMesh.addBox(tx, -0.155, 0, 0.068, 0.062, 0.58, truckAlu, truckAlu, truckDk);
        hwMesh.addCylinderZ(tx, -0.155, 0, 0.022, 0.72, 10, bearCol, truckDk);
      }

      this.boardTop = topMesh.build(gl);
      this.boardBot = botMesh.build(gl);
      this.boardHw  = hwMesh.build(gl);

      // 4 颗自发光半透荧光紫聚氨酯滑板轮（微导角圆柱）
      const wh = createMeshBuilder();
      for (const wx of [-0.58, 0.58]) {
        for (const wz of [-0.29, 0.29]) {
          wh.addCylinderZ(wx, -0.155, wz, 0.098, 0.118, 20, wheelCol, wheelCap);
        }
      }
      this.boardWheels = wh.build(gl);
    }

    resize(w, h, dpr) {
      if (!this.canvas) return;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.aspect = Math.max(0.4, w / Math.max(1, h));
    }

    _drawMesh(mesh, modelMat, vpMat, opts) {
      const gl = this.gl;
      const mvp = mat4Mul(vpMat, modelMat);
      gl.uniformMatrix4fv(this.loc.mvp, false, mvp);
      gl.uniformMatrix4fv(this.loc.model, false, modelMat);
      gl.uniform1f(this.loc.texMode, opts.texMode || 0);
      gl.uniform1f(this.loc.charge, opts.charge || 0);
      gl.uniform1f(this.loc.alpha, opts.alpha ?? 1);
      gl.uniform1f(this.loc.emissive, opts.emissive || 0);
      gl.uniform1f(this.loc.specPow, opts.specPow || 36);
      gl.uniform1f(this.loc.specAmt, opts.specAmt ?? 0.45);

      if (opts.tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, opts.tex);
        gl.uniform1i(this.loc.tex, 0);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bPos);
      gl.enableVertexAttribArray(this.loc.pos);
      gl.vertexAttribPointer(this.loc.pos, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bNorm);
      gl.enableVertexAttribArray(this.loc.norm);
      gl.vertexAttribPointer(this.loc.norm, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bCol);
      gl.enableVertexAttribArray(this.loc.col);
      gl.vertexAttribPointer(this.loc.col, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bUv);
      gl.enableVertexAttribArray(this.loc.uv);
      gl.vertexAttribPointer(this.loc.uv, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.bIdx);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    }

    render(state) {
      if (!this.ok) return;
      const gl = this.gl;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.prog);

      const proj = mat4Perspective(this.fovRad, this.aspect, 0.1, 40.0);

      // ---- 1. 渲染文艺复兴图文双翘 3D 滑板（仅当 boardAlpha > 0.01 且未关闭） ----
      if (state.drawBoard !== false && state.boardAlpha > 0.01) {
        let bm = mat4Translate(state.boardX, state.boardY, state.boardZ);
        bm = mat4Mul(bm, mat4RotateZ(state.boardRotZ * DEG));
        bm = mat4Mul(bm, mat4RotateY(state.boardRotY * DEG));
        bm = mat4Mul(bm, mat4RotateX(state.boardRotX * DEG));
        bm = mat4Mul(bm, mat4Scale(state.boardScale, state.boardScale, state.boardScale));

        this._drawMesh(this.boardTop, bm, proj, {
          texMode: 2, tex: this.gripTapeTex, alpha: state.boardAlpha, specPow: 14, specAmt: 0.16
        });
        this._drawMesh(this.boardBot, bm, proj, {
          texMode: 2, tex: this.skateArtTex, alpha: state.boardAlpha, specPow: 24, specAmt: 0.28
        });
        this._drawMesh(this.boardHw, bm, proj, {
          texMode: 0, alpha: state.boardAlpha, specPow: 52, specAmt: 0.62
        });
        this._drawMesh(this.boardWheels, bm, proj, {
          texMode: 0, alpha: state.boardAlpha, emissive: 0.56, specPow: 28, specAmt: 0.35
        });
      }

      // ---- 2. 渲染拟真 PBR 贴图 3D 78 键银铝苹果笔电（仅当 laptopAlpha > 0.01 且未关闭） ----
      if (state.drawLaptop !== false && state.laptopAlpha > 0.01) {
        const halfTan = Math.tan(this.fovRad * 0.5);
        const zFitH = (this.scrH * 0.5) / halfTan;
        const zFitW = (this.scrW * 0.5) / (halfTan * this.aspect);
        const zLock = -Math.min(zFitH, zFitW) - 0.010;
        const curZ = lerp(state.laptopZFar, zLock, state.lockT);

        // 上盖屏幕几何中心距铰链的 Y 偏移 = 0.075 + 1.24 / 2 = 0.695
        const scrCenterY = 0.075 + this.scrH * 0.5;
        let root = mat4Translate(state.laptopX, state.laptopY, curZ);
        root = mat4Mul(root, mat4RotateY(state.laptopRotY * DEG));
        root = mat4Mul(root, mat4RotateX(state.laptopRotX * DEG));
        root = mat4Mul(root, mat4RotateZ(state.laptopRotZ * DEG));
        root = mat4Mul(root, mat4Scale(state.laptopScale, state.laptopScale, state.laptopScale));

        const pivot = mat4Translate(0, -scrCenterY, 0);
        const bodyRoot = mat4Mul(root, pivot);

        // 底座（全铝外壳 + 高清 78 键键盘贴图顶面）
        if (state.baseAlpha > 0.01) {
          const baseM = mat4Mul(bodyRoot, mat4RotateX(state.baseFoldDeg * DEG));
          this._drawMesh(this.laptopBaseBody, baseM, proj, {
            texMode: 0, alpha: state.laptopAlpha * state.baseAlpha, specPow: 44, specAmt: 0.50
          });
          this._drawMesh(this.laptopDeckTop, baseM, proj, {
            texMode: 2, tex: this.keyDeckTex, alpha: state.laptopAlpha * state.baseAlpha, specPow: 28, specAmt: 0.30
          });
        }

        // 上盖（拉丝银铝背壳 + 极窄黑玻璃框 + 实时第一幕屏幕）
        const lidM = mat4Mul(bodyRoot, mat4RotateX(state.lidTiltDeg * DEG));
        if (state.bezelAlpha > 0.01) {
          this._drawMesh(this.laptopLidBack, lidM, proj, {
            texMode: 2, tex: this.aluLidTex, alpha: state.laptopAlpha * state.bezelAlpha, specPow: 48, specAmt: 0.55
          });
          this._drawMesh(this.laptopLidRim, lidM, proj, {
            texMode: 0, alpha: state.laptopAlpha * state.bezelAlpha, specPow: 40, specAmt: 0.42
          });
        }
        this._drawMesh(this.laptopScreen, lidM, proj, {
          texMode: 1, tex: this.screenTex, charge: state.charge, alpha: state.laptopAlpha
        });
      }
    }
  }

  /* ===================================================================
   * 3. OrbitMosaicShatter — 原生 WebGL 达芬奇黄金比例网格马赛克着色器
   *    关键视觉升级（100% 还原分镜三）：
   *    - 底层带深空暗青蓝裂隙遮罩，让 56 块错位图块之间露出震撼深空缝隙
   *    - 每块图块真实 3D 偏移/偏转 + GPU RGB 色散 + 荧光紫/电光粉脉冲切边
   *    - 沿达芬奇几何切缝高密度迸发 760 枚方形像素马赛克粒子流
   * =================================================================== */
  class OrbitMosaicShatter {
    constructor(canvas) {
      this.canvas = canvas;
      this.w = 1440;
      this.h = 900;
      this.dpr = 1;
      this.ok = false;
      this.tiles = [];
      this.particles = [];
      this._buildDaVinciGrid();
      this._initGL();
    }

    _buildDaVinciGrid() {
      let seed = 202614;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const PHI = 0.6180339;
      const queue = [{ x: 0, y: 0, w: 1, h: 1, depth: 0 }];
      const leaves = [];

      while (queue.length) {
        const r = queue.shift();
        const area = r.w * r.h;
        if (r.depth >= 5 || (r.depth >= 3 && area < 0.015) || (r.depth >= 4 && rand() < 0.30)) {
          leaves.push(r);
          continue;
        }
        const splitV = r.w * 1.48 >= r.h;
        const ratio = (r.depth % 2 === 0) ? PHI : (1 - PHI);
        const jitter = (rand() - 0.5) * 0.07;
        const t = clamp(ratio + jitter, 0.34, 0.66);
        if (splitV) {
          const w1 = r.w * t;
          queue.push({ x: r.x, y: r.y, w: w1, h: r.h, depth: r.depth + 1 });
          queue.push({ x: r.x + w1, y: r.y, w: r.w - w1, h: r.h, depth: r.depth + 1 });
        } else {
          const h1 = r.h * t;
          queue.push({ x: r.x, y: r.y, w: r.w, h: h1, depth: r.depth + 1 });
          queue.push({ x: r.x, y: r.y + h1, w: r.w, h: r.h - h1, depth: r.depth + 1 });
        }
      }

      const palette = [
        [0.74, 0.24, 1.00], // 荧光紫
        [1.00, 0.08, 0.84], // 电光粉/洋红
        [0.92, 0.10, 0.48], // 玫红
        [0.86, 0.54, 1.00], // 高亮浅紫
        [0.95, 0.96, 1.00]  // 像素白核
      ];

      this.tiles = leaves.map((r) => {
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.5;
        const dx = cx - 0.5;
        const dy = cy - 0.5;
        const dist = Math.hypot(dx, dy) / 0.72;
        const ang = Math.atan2(dy + (rand() - 0.5) * 0.22, dx + (rand() - 0.5) * 0.22);
        return {
          x: r.x, y: r.y, w: r.w, h: r.h, cx, cy, dist,
          delay: dist * 0.22 + rand() * 0.10,
          vx: Math.cos(ang) * (0.14 + dist * 0.26 + rand() * 0.16),
          vy: Math.sin(ang) * (0.14 + dist * 0.26 + rand() * 0.16),
          vz: 0.65 + rand() * 1.25,
          rx: (rand() - 0.5) * 1.15,
          ry: (rand() - 0.5) * 1.25,
          rz: (rand() - 0.5) * 0.32,
          flickerSeed: rand() * 40.0
        };
      });

      // 沿达芬奇几何网格裂缝撒下 760+ 荧光紫/电光粉像素方块粒子
      for (const t of this.tiles) {
        const count = 12 + Math.floor(rand() * 7);
        for (let i = 0; i < count; i++) {
          const edge = Math.floor(rand() * 4);
          let px = t.x + rand() * t.w;
          let py = t.y + rand() * t.h;
          if (edge === 0) py = t.y;
          else if (edge === 1) py = t.y + t.h;
          else if (edge === 2) px = t.x;
          else px = t.x + t.w;

          const ang = Math.atan2(py - 0.5, px - 0.5) + (rand() - 0.5) * 1.15;
          const spd = 0.16 + rand() * 0.44;
          this.particles.push({
            x: px, y: py,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            delay: t.delay * 0.55 + rand() * 0.16,
            size: 4.5 + rand() * 11.5,
            col: palette[Math.floor(rand() * palette.length)],
            seed: rand() * 30.0
          });
        }
      }
    }

    _initGL() {
      if (!this.canvas) return;
      const gl = this.canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: "high-performance"
      });
      if (!gl) {
        this.c2d = this.canvas.getContext("2d", { alpha: true });
        return;
      }
      this.gl = gl;

      // Shader 0: 深空裂隙遮罩（统一 precision mediump float 杜绝 WebGL1 链接精度冲突）
      const bgVS = `
        precision mediump float;
        attribute vec2 a_p;
        void main() { gl_Position = vec4(a_p, 0.0, 1.0); }
      `;
      const bgFS = `
        precision mediump float;
        uniform float u_bgAlpha;
        void main() {
          vec3 col = vec3(0.032, 0.048, 0.088);
          gl_FragColor = vec4(col * u_bgAlpha, u_bgAlpha);
        }
      `;

      // Shader A: 达芬奇矩形油画马赛克块（统一 precision mediump float + 真实像素级细裂边，杜绝粗紫条与纵拉畸变）
      const tileVS = `
        precision mediump float;
        attribute vec2 a_corner;
        attribute vec4 a_rect;
        attribute vec4 a_motion;
        attribute vec4 a_rot;
        uniform float u_crack;
        uniform float u_burst;
        uniform float u_sweep;
        uniform float u_aspect;
        uniform float u_time;
        uniform vec2 u_res;
        varying vec2 v_uv;
        varying vec2 v_local01;
        varying vec2 v_tilePx;
        varying float v_energy;
        varying float v_alpha;
        varying float v_flicker;

        void main() {
          float delay = a_motion.x;
          float lt = clamp((u_burst - delay) / 0.52, 0.0, 1.0);
          float e = sin(lt * 3.1415926);
          float burstPeak = lt * lt * (3.0 - 2.0 * lt);
          float sw = clamp((u_sweep - delay * 0.40) / 0.56, 0.0, 1.0);
          float swE = sw * sw;

          v_uv = a_rect.xy + (a_corner + 0.5) * a_rect.zw;
          v_local01 = a_corner + 0.5;
          v_tilePx = a_rect.zw * u_res;

          // 裂开时微微内缩留出清晰深空几何裂隙
          float gapShrink = 1.0 - (u_crack * 0.018 + e * 0.056);
          vec3 lp = vec3(a_corner.x * a_rect.z * 2.0 * u_aspect * gapShrink,
                        -a_corner.y * a_rect.w * 2.0 * gapShrink, 0.0);

          float rotAmt = e * 0.36 + swE * 0.55;
          float angX = a_rot.x * rotAmt;
          float angY = a_rot.y * rotAmt;
          float angZ = a_rot.z * (e * 0.32 + swE * 0.45);

          float cx = cos(angX), sx = sin(angX);
          lp = vec3(lp.x, lp.y * cx - lp.z * sx, lp.y * sx + lp.z * cx);
          float cy = cos(angY), sy = sin(angY);
          lp = vec3(lp.x * cy + lp.z * sy, lp.y, -lp.x * sy + lp.z * cy);
          float cz = cos(angZ), sz = sin(angZ);
          lp = vec3(lp.x * cz - lp.y * sz, lp.x * sz + lp.y * cz, lp.z);

          float cxNdc = ((a_rect.x + a_rect.z * 0.5) * 2.0 - 1.0) * u_aspect;
          float cyNdc = (1.0 - (a_rect.y + a_rect.w * 0.5) * 2.0);

          float zShift = (e * 0.20 + swE * 0.85) * a_motion.w;
          float persp = 1.0 / max(0.56, 1.0 - zShift * 0.26);

          float shiftMag = e * 0.17 + swE * 0.72;
          float ox = cxNdc + a_motion.y * shiftMag * u_aspect;
          float oy = cyNdc - a_motion.z * shiftMag;

          vec2 finalPos = vec2((ox + lp.x) * persp / u_aspect, (oy + lp.y) * persp);
          gl_Position = vec4(finalPos, 0.0, 1.0);

          v_energy = clamp(u_crack * 0.85 + burstPeak * 0.85, 0.0, 1.0);
          v_flicker = 0.5 + 0.5 * sin(u_time * 14.0 + a_rot.w);
          v_alpha = clamp(1.0 - pow(sw, 1.15), 0.0, 1.0);
        }
      `;

      const tileFS = `
        precision mediump float;
        uniform sampler2D u_tex;
        uniform float u_crack;
        uniform float u_burst;
        varying vec2 v_uv;
        varying vec2 v_local01;
        varying vec2 v_tilePx;
        varying float v_energy;
        varying float v_alpha;
        varying float v_flicker;

        void main() {
          if (v_alpha <= 0.008) discard;
          // 克制精致的 GPU RGB 色散（不把人物糊成大彩虹块）
          float split = (0.0012 + v_energy * 0.0068) * (0.40 + u_burst * 0.80);
          float r = texture2D(u_tex, clamp(v_uv + vec2( split, 0.0), 0.0, 1.0)).r;
          float g = texture2D(u_tex, clamp(v_uv, 0.0, 1.0)).g;
          float b = texture2D(u_tex, clamp(v_uv - vec2( split, 0.0018 * v_energy), 0.0, 1.0)).b;
          vec3 col = vec3(r, g, b);

          // 像素级 1.8px 锐利荧光紫/电光粉几何切边（在片元着色器中逐像素计算，绝不填满图块！）
          vec2 pxFromEdge = min(v_local01, 1.0 - v_local01) * v_tilePx;
          float edgePx = min(pxFromEdge.x, pxFromEdge.y);
          float border = 1.0 - smoothstep(1.2, 2.5, edgePx);
          float outerHalo = (1.0 - smoothstep(2.0, 7.5, edgePx)) * 0.24;
          float glow = (border + outerHalo) * clamp(u_crack * 0.90 + u_burst * 0.82, 0.0, 1.0);
          vec3 neon = mix(vec3(0.76, 0.24, 1.00), vec3(1.00, 0.08, 0.84), v_flicker);
          col = mix(col, neon * 1.18, clamp(glow * 0.88, 0.0, 0.92));

          gl_FragColor = vec4(col * v_alpha, v_alpha);
        }
      `;

      // Shader B: 760+ 荧光紫/电光粉发光像素马赛克粒子流
      const partVS = `
        precision mediump float;
        attribute vec2 a_origin;
        attribute vec2 a_vel;
        attribute vec3 a_meta;
        attribute vec3 a_col;
        uniform float u_partT;
        uniform float u_dpr;
        uniform float u_time;
        varying vec3 v_col;
        varying float v_alpha;
        void main() {
          float lt = clamp((u_partT - a_meta.x) / 0.70, 0.0, 1.0);
          if (lt <= 0.001 || lt >= 0.999) {
            gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
            gl_PointSize = 0.0;
            v_alpha = 0.0;
            v_col = a_col;
            return;
          }
          float moveE = 1.0 - pow(1.0 - lt, 2.5);
          float x = a_origin.x + a_vel.x * moveE * 0.42;
          float y = a_origin.y + a_vel.y * moveE * 0.42 - sin(lt * 3.1415926) * 0.022;
          gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
          float pulse = 0.78 + 0.24 * sin(u_time * 20.0 + a_meta.z);
          gl_PointSize = a_meta.y * (1.18 - lt * 0.52) * u_dpr * pulse;
          v_alpha = sin(lt * 3.1415926) * 0.95;
          v_col = a_col;
        }
      `;
      const partFS = `
        precision mediump float;
        varying vec3 v_col;
        varying float v_alpha;
        void main() {
          if (v_alpha <= 0.01) discard;
          vec2 d = abs(gl_PointCoord - 0.5);
          float core = step(max(d.x, d.y), 0.34);
          vec3 c = mix(v_col, vec3(1.0, 0.96, 1.0), core * 0.52);
          gl_FragColor = vec4(c * v_alpha, v_alpha);
        }
      `;

      this.bgProg   = createProgram(gl, bgVS, bgFS);
      this.tileProg = createProgram(gl, tileVS, tileFS);
      this.partProg = createProgram(gl, partVS, partFS);
      if (!this.bgProg || !this.tileProg || !this.partProg) {
        this.gl = null;
        this.c2d = this.canvas.getContext("2d", { alpha: true });
        return;
      }

      const mkBuf = (arr, target) => {
        const b = gl.createBuffer();
        gl.bindBuffer(target, b);
        gl.bufferData(target, target === gl.ELEMENT_ARRAY_BUFFER ? new Uint16Array(arr) : new Float32Array(arr), gl.STATIC_DRAW);
        return b;
      };

      this.bgBuf = mkBuf([-1,-1, 1,-1, 1,1, -1,-1, 1,1, -1,1], gl.ARRAY_BUFFER);

      const tCorners = [], tRects = [], tMotions = [], tRots = [], tIdx = [];
      let v = 0;
      const quadC = [[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]];
      for (const t of this.tiles) {
        for (const c of quadC) {
          tCorners.push(c[0], c[1]);
          tRects.push(t.x, t.y, t.w, t.h);
          tMotions.push(t.delay, t.vx, t.vy, t.vz);
          tRots.push(t.rx, t.ry, t.rz, t.flickerSeed);
        }
        tIdx.push(v, v + 1, v + 2, v, v + 2, v + 3);
        v += 4;
      }
      this.tileIdxCount = tIdx.length;
      this.tBuf = {
        corner: mkBuf(tCorners, gl.ARRAY_BUFFER),
        rect:   mkBuf(tRects, gl.ARRAY_BUFFER),
        motion: mkBuf(tMotions, gl.ARRAY_BUFFER),
        rot:    mkBuf(tRots, gl.ARRAY_BUFFER),
        idx:    mkBuf(tIdx, gl.ELEMENT_ARRAY_BUFFER)
      };

      const pOrig = [], pVel = [], pMeta = [], pCol = [];
      for (const pt of this.particles) {
        pOrig.push(pt.x, pt.y);
        pVel.push(pt.vx, pt.vy);
        pMeta.push(pt.delay, pt.size, pt.seed);
        pCol.push(pt.col[0], pt.col[1], pt.col[2]);
      }
      this.partCount = this.particles.length;
      this.pBuf = {
        orig: mkBuf(pOrig, gl.ARRAY_BUFFER),
        vel:  mkBuf(pVel, gl.ARRAY_BUFFER),
        meta: mkBuf(pMeta, gl.ARRAY_BUFFER),
        col:  mkBuf(pCol, gl.ARRAY_BUFFER)
      };

      this.tex = createTexture2D(gl, null);
      this.ok = true;
    }

    uploadAct1Snapshot(srcCanvas) {
      this.snapCanvas = srcCanvas;
      if (!this.ok || !srcCanvas) return;
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
    }

    resize(w, h, dpr) {
      this.w = Math.max(320, Math.round(w));
      this.h = Math.max(320, Math.round(h));
      this.dpr = dpr;
      if (!this.canvas) return;
      this.canvas.width = Math.round(this.w * dpr);
      this.canvas.height = Math.round(this.h * dpr);
    }

    render(p, tSec) {
      // 每帧兜底校验真实 CSS 视口尺寸，防止 iframe/全屏切换导致纵横比畸变拉伸
      if (this.canvas) {
        const cw = Math.round(this.canvas.clientWidth || window.innerWidth);
        const ch = Math.round(this.canvas.clientHeight || window.innerHeight);
        if (cw >= 320 && ch >= 320 && (Math.abs(cw - this.w) > 2 || Math.abs(ch - this.h) > 2)) {
          this.resize(cw, ch, Math.min(window.devicePixelRatio || 1, 2));
        }
      }

      if (this.ok) {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (p < 0.592 || p > 0.935) return;

        const crack = invLerp(0.595, 0.650, p);
        const burst = invLerp(0.612, 0.855, p);
        const sweep = invLerp(0.805, 0.925, p);
        const partT = invLerp(0.605, 0.930, p);
        const bgAlpha = smoothstep(invLerp(0.592, 0.615, p)) * (1 - smoothstep(invLerp(0.80, 0.90, p))) * 0.94;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        const activeLocs = [];
        const bindA = (prog, name, buf, size) => {
          const loc = gl.getAttribLocation(prog, name);
          if (loc < 0) return;
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
          activeLocs.push(loc);
        };
        const clearAttribs = () => {
          while (activeLocs.length) gl.disableVertexAttribArray(activeLocs.pop());
        };

        // 0. 绘制深空裂隙底幕
        if (bgAlpha > 0.005) {
          gl.useProgram(this.bgProg);
          gl.uniform1f(gl.getUniformLocation(this.bgProg, "u_bgAlpha"), bgAlpha);
          bindA(this.bgProg, "a_p", this.bgBuf, 2);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          clearAttribs();
        }

        // 1. 绘制达芬奇黄金比例矩形油画马赛克块
        gl.useProgram(this.tileProg);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(gl.getUniformLocation(this.tileProg, "u_tex"), 0);
        gl.uniform1f(gl.getUniformLocation(this.tileProg, "u_crack"), crack);
        gl.uniform1f(gl.getUniformLocation(this.tileProg, "u_burst"), burst);
        gl.uniform1f(gl.getUniformLocation(this.tileProg, "u_sweep"), sweep);
        gl.uniform1f(gl.getUniformLocation(this.tileProg, "u_aspect"), this.w / Math.max(1, this.h));
        gl.uniform1f(gl.getUniformLocation(this.tileProg, "u_time"), tSec);
        gl.uniform2f(gl.getUniformLocation(this.tileProg, "u_res"), this.w, this.h);

        bindA(this.tileProg, "a_corner", this.tBuf.corner, 2);
        bindA(this.tileProg, "a_rect",   this.tBuf.rect,   4);
        bindA(this.tileProg, "a_motion", this.tBuf.motion, 4);
        bindA(this.tileProg, "a_rot",    this.tBuf.rot,    4);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.tBuf.idx);
        gl.drawElements(gl.TRIANGLES, this.tileIdxCount, gl.UNSIGNED_SHORT, 0);
        clearAttribs();

        // 2. 叠加荧光紫/电光粉超能像素方块粒子流
        if (partT > 0.005 && partT < 0.995) {
          gl.useProgram(this.partProg);
          gl.uniform1f(gl.getUniformLocation(this.partProg, "u_partT"), partT);
          gl.uniform1f(gl.getUniformLocation(this.partProg, "u_dpr"), this.dpr);
          gl.uniform1f(gl.getUniformLocation(this.partProg, "u_time"), tSec);
          bindA(this.partProg, "a_origin", this.pBuf.orig, 2);
          bindA(this.partProg, "a_vel",    this.pBuf.vel,  2);
          bindA(this.partProg, "a_meta",   this.pBuf.meta, 3);
          bindA(this.partProg, "a_col",    this.pBuf.col,  3);
          gl.drawArrays(gl.POINTS, 0, this.partCount);
          clearAttribs();
        }
        return;
      }

      // Canvas 2D 兜底
      if (!this.c2d) return;
      const ctx = this.c2d;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.w, this.h);
      if (p < 0.592 || p > 0.968) return;
      const crack = invLerp(0.595, 0.655, p);
      const burst = invLerp(0.615, 0.875, p);
      const sweep = invLerp(0.835, 0.962, p);
      const bgAlpha = smoothstep(invLerp(0.592, 0.615, p)) * (1 - smoothstep(invLerp(0.82, 0.94, p))) * 0.92;
      ctx.fillStyle = `rgba(8, 12, 22, ${bgAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, this.w, this.h);
      for (const t of this.tiles) {
        const lt = invLerp(t.delay, t.delay + 0.52, burst);
        const e = Math.sin(lt * Math.PI);
        const sw = invLerp(t.delay * 0.42, t.delay * 0.42 + 0.58, sweep);
        const alpha = clamp(1 - Math.pow(sw, 1.2), 0, 1);
        if (alpha <= 0.01) continue;
        const sc = (1 - e * 0.06) + sw * sw * 0.85;
        const cx = (t.cx + t.vx * (e * 0.14 + sw * sw * 0.65)) * this.w;
        const cy = (t.cy + t.vy * (e * 0.14 + sw * sw * 0.65)) * this.h;
        const tw = t.w * this.w, th = t.h * this.h;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(t.rz * (e * 0.45 + sw * 0.7));
        ctx.scale(sc, sc);
        if (this.snapCanvas) {
          ctx.drawImage(this.snapCanvas, t.x * this.w, t.y * this.h, tw, th, -tw * 0.5, -th * 0.5, tw, th);
        }
        ctx.strokeStyle = `rgba(218, 56, 255, ${(crack * 0.9).toFixed(2)})`;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-tw * 0.5, -th * 0.5, tw, th);
        ctx.restore();
      }
    }
  }

  window.OrbitWebGL = {
    OrbitGirlRig,
    OrbitProps3D,
    OrbitMosaicShatter,
    clamp,
    lerp,
    invLerp,
    smoothstep,
    easeOutCubic,
    easeInOutCubic
  };
})();
