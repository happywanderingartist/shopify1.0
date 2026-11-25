/* =====================================================================
 * orbit-webgl.js — Native WebGL Deep Space + High-Craft 3D Renderer (V3.3)
 * ---------------------------------------------------------------------
 * Export 1 · createSpaceBackdrop(canvas)
 *   - Procedural WebGL FBM deep-space cosmos (189°–224° cold teal-indigo
 *     nebula, 3-depth parallax twinkling stars, 4-point star flares,
 *     distant Renaissance ringed planet, drifting cosmic stardust)
 * Export 2 · createOrbitWebGL(canvas)
 *   - Refined 3D Skateboard (48-seg concave double-kick 7-ply deck with
 *     hot-magenta core ply, 1024px grip tape + Phillips hardware,
 *     baroque filigree underside, CNC baseplates + kingpin bushings +
 *     tapered hangers + axle nuts, lathe-beveled wheels w/ steel bearings)
 *   - Refined 3D CNC Unibody Laptop (1024px backlit chicklet keyboard w/
 *     legends, recessed speaker grilles, chamfered trackpad, hinge barrel,
 *     side USB-C ports, brushed aluminum outer lid w/ Fresnel sheen;
 *     screen faces the girl while keyboard pitches clearly under her
 *     calm resting left hand)
 *   - Girl 40×40 mesh (calm resting hand on keyboard, ZERO body/hand
 *     jitter at p=0, head/neck rigid lock, 6-phase kickflip biomechanics)
 *   - Irregular Da Vinci Mosaic Shatter (per-pixel 1.8px magenta border)
 * ===================================================================== */
(function () {
  "use strict";

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(e0, e1, x) {
    var t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* ---------- Minimal 4x4 Matrix Math (Column-Major for WebGL) ---------- */
  function mat4Identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }
  function mat4Perspective(fovRad, aspect, near, far) {
    var f = 1 / Math.tan(fovRad * 0.5);
    var nf = 1 / (near - far);
    var out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = 2 * far * near * nf;
    return out;
  }
  function mat4Mul(a, b) {
    var out = new Float32Array(16);
    for (var c = 0; c < 4; c++) {
      var b0 = b[c*4], b1 = b[c*4+1], b2 = b[c*4+2], b3 = b[c*4+3];
      out[c*4]   = a[0]*b0 + a[4]*b1 + a[8]*b2  + a[12]*b3;
      out[c*4+1] = a[1]*b0 + a[5]*b1 + a[9]*b2  + a[13]*b3;
      out[c*4+2] = a[2]*b0 + a[6]*b1 + a[10]*b2 + a[14]*b3;
      out[c*4+3] = a[3]*b0 + a[7]*b1 + a[11]*b2 + a[15]*b3;
    }
    return out;
  }
  function mat4Translate(x, y, z) {
    var m = mat4Identity();
    m[12] = x; m[13] = y; m[14] = z;
    return m;
  }
  function mat4Scale(x, y, z) {
    var m = mat4Identity();
    m[0] = x; m[5] = y; m[10] = z;
    return m;
  }
  function mat4RotX(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
  }
  function mat4RotY(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }
  function mat4RotZ(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]);
  }

  /* ---------- WebGL Helpers ---------- */
  function compileShader(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }
  function createProgram(gl, vsSrc, fsSrc) {
    var vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var pr = gl.createProgram();
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(pr));
      return null;
    }
    return pr;
  }
  function createTexture(gl, source, flipY) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return tex;
  }
  function makePlaceholderTex(gl, r, g, b, a) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([r, g, b, a]));
    return tex;
  }


  /* =====================================================================
   * HIGH-RESOLUTION PROCEDURAL TEXTURES (1024px Industrial Craftsmanship)
   * ===================================================================== */
  function createGripTexture(gl) {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 384;
    var ctx = c.getContext("2d");
    // Fine matte silicon-carbide dark grip tape
    var baseG = ctx.createLinearGradient(0, 0, 1024, 384);
    baseG.addColorStop(0, "#141921");
    baseG.addColorStop(0.5, "#1b212b");
    baseG.addColorStop(1, "#13171f");
    ctx.fillStyle = baseG;
    ctx.fillRect(0, 0, 1024, 384);
    // Subtle die-cut grip accent stripe near nose
    ctx.fillStyle = "rgba(255, 12, 219, 0.22)";
    ctx.fillRect(720, 0, 8, 384);
    // Micro sand-grain sparkle
    for (var i = 0; i < 16000; i++) {
      var x = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1) * 1024;
      var y = Math.abs((Math.sin(i * 78.233) * 43758.5453) % 1) * 384;
      var v = 26 + (i % 56);
      ctx.fillStyle = "rgb(" + v + "," + (v + 5) + "," + (v + 12) + ")";
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    // 8 countersunk steel Phillips mounting bolts
    var boltXs = [262, 304, 720, 762];
    var boltYs = [150, 234];
    for (var bx = 0; bx < boltXs.length; bx++) {
      for (var by = 0; by < boltYs.length; by++) {
        var cx = boltXs[bx], cy = boltYs[by];
        ctx.beginPath(); ctx.arc(cx, cy, 8.5, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0e14"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 6.2, 0, Math.PI * 2);
        ctx.fillStyle = "#cfdce8"; ctx.fill();
        ctx.strokeStyle = "#3a4654"; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - 3.5, cy); ctx.lineTo(cx + 3.5, cy);
        ctx.moveTo(cx, cy - 3.5); ctx.lineTo(cx, cy + 3.5);
        ctx.stroke();
      }
    }
    return createTexture(gl, c, false);
  }

  function createBaroqueDeckTexture(gl) {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 384;
    var ctx = c.getContext("2d");
    var grad = ctx.createLinearGradient(0, 0, 1024, 384);
    grad.addColorStop(0, "#e6129f");
    grad.addColorStop(0.5, "#ea135e");
    grad.addColorStop(1, "#c814c6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 384);
    // Fine silkscreen wood-grain undertone
    ctx.strokeStyle = "rgba(20, 8, 24, 0.14)";
    ctx.lineWidth = 1.5;
    for (var y = 0; y < 384; y += 6) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y + Math.sin(y * 0.08) * 4); ctx.stroke();
    }
    // Renaissance gold & ivory astronomical compass rose + botanical filigree
    ctx.strokeStyle = "rgba(255, 246, 232, 0.92)";
    ctx.lineWidth = 2.6;
    for (var k = 0; k < 24; k++) {
      var x = 84 + k * 37;
      var cy = 192 + Math.sin(k * 0.85) * 76;
      ctx.beginPath(); ctx.arc(x, cy, 38 + (k % 3) * 14, 0, Math.PI * 1.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, 384 - cy, 30 + (k % 2) * 16, Math.PI * 0.35, Math.PI * 1.85); ctx.stroke();
    }
    ctx.strokeStyle = "#f2d699";
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(512, 192, 355, 118, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(512, 192, 215, 68, 0, 0, Math.PI * 2); ctx.stroke();
    // Center astrolabe star
    ctx.fillStyle = "#fff6ea";
    ctx.beginPath();
    for (var s = 0; s < 16; s++) {
      var a = (s / 16) * Math.PI * 2;
      var r = (s % 2 === 0) ? 56 : 18;
      var px = 512 + Math.cos(a) * r;
      var py = 192 + Math.sin(a) * r;
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    return createTexture(gl, c, false);
  }

  function createKeyboardDeckTexture(gl) {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 680;
    var ctx = c.getContext("2d");

    // CNC anodized cool-silver aluminum unibody deck
    var g = ctx.createLinearGradient(0, 0, 1024, 680);
    g.addColorStop(0, "#c5d2e4");
    g.addColorStop(0.5, "#aabbd1");
    g.addColorStop(1, "#8ea2bd");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 680);

    // Machined chamfer outer border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 1008, 664);

    // Laser-drilled micro speaker grille dot arrays (left & right)
    ctx.fillStyle = "rgba(20, 30, 42, 0.46)";
    for (var gy = 74; gy < 406; gy += 11) {
      for (var gx = 0; gx < 4; gx++) {
        ctx.beginPath(); ctx.arc(24 + gx * 10, gy, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(970 + gx * 10, gy, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Recessed anodized black keywell with inner bevel
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
    roundRect(74, 52, 876, 368, 14);
    ctx.fillStyle = "#0b1119";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Realistic 5-row QWERTY chicklet key layout with crisp backlit legends
    var rows = [
      ["esc","1","2","3","4","5","6","7","8","9","0","-","=","del"],
      ["tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"],
      ["caps","A","S","D","F","G","H","J","K","L",";","'","return"],
      ["shift","Z","X","C","V","B","N","M",",",".","/","shift"],
      ["fn","ctrl","opt","cmd","","cmd","opt","<","^",">"]
    ];
    ctx.font = "600 17px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var r = 0; r < rows.length; r++) {
      var keys = rows[r];
      var y = 68 + r * 68;
      var totalUnits = 0;
      var units = keys.map(function (k) {
        if (k === "") return 5.2;
        if (k === "shift") return 2.2;
        if (k === "return" || k === "del" || k === "caps") return 1.85;
        if (k === "tab" || k === "cmd") return 1.45;
        return 1.0;
      });
      for (var u = 0; u < units.length; u++) totalUnits += units[u];
      var gap = 9;
      var availW = 844 - gap * (keys.length - 1);
      var x = 90;
      for (var k = 0; k < keys.length; k++) {
        var kw = (units[k] / totalUnits) * availW;
        // Soft backlit key rim under-glow
        roundRect(x - 1, y - 1, kw + 2, 58, 7);
        ctx.fillStyle = "rgba(182, 214, 245, 0.16)";
        ctx.fill();
        // Sculpted dark matte keycap
        roundRect(x, y, kw, 56, 6);
        var kg = ctx.createLinearGradient(x, y, x, y + 56);
        kg.addColorStop(0, "#2c394b");
        kg.addColorStop(1, "#1b2431");
        ctx.fillStyle = kg;
        ctx.fill();
        // Top keycap edge highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Crisp backlit legend
        if (keys[k]) {
          ctx.fillStyle = "rgba(236, 244, 255, 0.86)";
          ctx.fillText(keys[k], x + kw * 0.5, y + 29);
        }
        x += kw + gap;
      }
    }

    // Precision etched glass trackpad with metallic chamfer
    roundRect(334, 444, 356, 198, 12);
    var tg = ctx.createLinearGradient(334, 444, 690, 642);
    tg.addColorStop(0, "#8ea1ba");
    tg.addColorStop(1, "#798da8");
    ctx.fillStyle = tg;
    ctx.fill();
    ctx.strokeStyle = "rgba(38, 52, 70, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Front thumb-open notch shadow
    roundRect(452, 654, 120, 18, 9);
    ctx.fillStyle = "rgba(30, 42, 58, 0.45)";
    ctx.fill();

    return createTexture(gl, c, false);
  }

  function createLaptopLidTexture(gl) {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 640;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 1024, 640);
    g.addColorStop(0, "#c8d6e8");
    g.addColorStop(0.48, "#a7b9d2");
    g.addColorStop(1, "#859ab6");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 640);
    // Fine anisotropic brushed-aluminum horizontal hairline grain
    ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
    for (var y = 0; y < 640; y += 2) {
      if (y % 4 === 0) ctx.fillRect(0, y, 1024, 1);
    }
    // Perimeter machined chamfer line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 1004, 620);
    // Minimal machined concentric astronomical emblem in center
    ctx.strokeStyle = "rgba(74, 92, 118, 0.44)";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(512, 320, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(512, 320, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    ctx.beginPath(); ctx.arc(512, 320, 8, 0, Math.PI * 2); ctx.fill();
    return createTexture(gl, c, false);
  }

  /* =====================================================================
   * HIGH-CRAFT 3D GEOMETRY BUILDERS
   * ===================================================================== */
  function buildGirlGrid(nx, ny) {
    var pos = [], uv = [], idx = [];
    for (var j = 0; j <= ny; j++) {
      for (var i = 0; i <= nx; i++) {
        var u = i / nx, v = j / ny;
        pos.push(u * 2 - 1, 1 - v * 2, 0);
        uv.push(u, v);
      }
    }
    for (var y = 0; y < ny; y++) {
      for (var x = 0; x < nx; x++) {
        var a = y * (nx + 1) + x, b = a + 1, c = a + (nx + 1), d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    return { pos: new Float32Array(pos), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
  }

  function buildBox(w, h, d, faceColorMap) {
    var hw = w * 0.5, hh = h * 0.5, hd = d * 0.5;
    var faces = [
      { n:[0,0,1],  v:[[-hw,-hh,hd],[hw,-hh,hd],[hw,hh,hd],[-hw,hh,hd]], c: faceColorMap.front },
      { n:[0,0,-1], v:[[hw,-hh,-hd],[-hw,-hh,-hd],[-hw,hh,-hd],[hw,hh,-hd]], c: faceColorMap.back },
      { n:[0,1,0],  v:[[-hw,hh,hd],[hw,hh,hd],[hw,hh,-hd],[-hw,hh,-hd]], c: faceColorMap.top },
      { n:[0,-1,0], v:[[-hw,-hh,-hd],[hw,-hh,-hd],[hw,-hh,hd],[-hw,-hh,hd]], c: faceColorMap.bottom },
      { n:[1,0,0],  v:[[-0+hw,-hh,hd],[hw,-hh,-hd],[hw,hh,-hd],[hw,hh,hd]], c: faceColorMap.side },
      { n:[-1,0,0], v:[[-hw,-hh,-hd],[-hw,-hh,hd],[-hw,hh,hd],[-hw,hh,-hd]], c: faceColorMap.side },
    ];
    var pos = [], norm = [], uv = [], col = [], idx = [];
    var base = 0;
    for (var i = 0; i < faces.length; i++) {
      var f = faces[i];
      var uvs = [[0,1],[1,1],[1,0],[0,0]];
      for (var k = 0; k < 4; k++) {
        pos.push(f.v[k][0], f.v[k][1], f.v[k][2]);
        norm.push(f.n[0], f.n[1], f.n[2]);
        uv.push(uvs[k][0], uvs[k][1]);
        col.push(f.c[0], f.c[1], f.c[2]);
      }
      idx.push(base, base+1, base+2, base, base+2, base+3);
      base += 4;
    }
    return {
      pos: new Float32Array(pos), norm: new Float32Array(norm),
      uv: new Float32Array(uv), col: new Float32Array(col), idx: new Uint16Array(idx)
    };
  }

  // Smooth subdivided double-kick concave skateboard deck with seamless 5-band 7-ply laminated edge
  function buildSkateboardDeck() {
    var nx = 32, nz = 10;
    var halfLen = 0.98, halfWid = 0.285, thick = 0.036;

    function deckHalfW(t) {
      var at = Math.abs(t);
      if (at <= 0.62) return halfWid;
      var u = (at - 0.62) / 0.38;
      return halfWid * Math.sqrt(Math.max(0.0004, 1.0 - u * u));
    }
    function deckY(x, z) {
      var kick = Math.max(0, (Math.abs(x) - 0.56) / 0.42);
      var concave = (z / halfWid) * (z / halfWid) * 0.024;
      return kick * kick * 0.112 + concave;
    }
    function deckNormal(x, z, isTop) {
      var ax = Math.abs(x);
      var dydx = ax > 0.56 ? Math.sign(x) * 2.0 * ((ax - 0.56) / 0.42) * 0.112 / 0.42 : 0.0;
      var dydz = 2.0 * z / (halfWid * halfWid) * 0.024;
      var nxv = isTop ? -dydx : dydx;
      var nyv = isTop ? 1.0 : -1.0;
      var nzv = isTop ? -dydz : dydz;
      var l = Math.hypot(nxv, nyv, nzv) || 1;
      return [nxv / l, nyv / l, nzv / l];
    }

    // Cosine-clustered longitudinal samples for ultra-smooth rounded nose & tail curves
    var ts = [];
    for (var ix = 0; ix <= nx; ix++) {
      ts.push(-Math.cos((ix / nx) * Math.PI));
    }

    function buildCap(isTop) {
      var pos = [], norm = [], uv = [], col = [], idx = [];
      var yOff = isTop ? thick * 0.5 : -thick * 0.5;
      for (var i = 0; i <= nx; i++) {
        var t = ts[i];
        var x = t * halfLen;
        var hw = deckHalfW(t);
        for (var j = 0; j <= nz; j++) {
          var s = (j / nz) * 2.0 - 1.0;
          var z = s * hw;
          var y = deckY(x, z) + yOff;
          var n = deckNormal(x, z, isTop);
          pos.push(x, y, z);
          norm.push(n[0], n[1], n[2]);
          uv.push((x / (halfLen * 2.0)) + 0.5, (z / (halfWid * 2.0)) + 0.5);
          col.push(1, 1, 1);
        }
      }
      var stride = nz + 1;
      for (var i2 = 0; i2 < nx; i2++) {
        for (var j2 = 0; j2 < nz; j2++) {
          var a = i2 * stride + j2;
          var b = a + stride;
          var c = a + 1;
          var d = b + 1;
          if (isTop) {
            idx.push(a, c, b, b, c, d);
          } else {
            idx.push(a, b, c, b, d, c);
          }
        }
      }
      return {
        pos: new Float32Array(pos), norm: new Float32Array(norm),
        uv: new Float32Array(uv), col: new Float32Array(col), idx: new Uint16Array(idx)
      };
    }

    // Extract closed perimeter ring matching exact grid edge vertices (zero seam gaps)
    var ring = [];
    for (var p1 = 0; p1 <= nx; p1++) {
      var x1 = ts[p1] * halfLen, z1 = deckHalfW(ts[p1]);
      ring.push({ x: x1, y: deckY(x1, z1), z: z1 });
    }
    for (var p2 = nx - 1; p2 >= 0; p2--) {
      var x2 = ts[p2] * halfLen, z2 = -deckHalfW(ts[p2]);
      ring.push({ x: x2, y: deckY(x2, z2), z: z2 });
    }

    // 5-band laminated 7-ply edge: grip overhang + maple + crisp hot-magenta core + maple + bottom lacquer
    var rPos = [], rNorm = [], rUv = [], rCol = [], rIdx = [];
    var bands = [
      { y0:  0.50, y1:  0.38, col: [0.12, 0.15, 0.20] },
      { y0:  0.38, y1:  0.13, col: [0.85, 0.75, 0.60] },
      { y0:  0.13, y1: -0.13, col: [0.92, 0.12, 0.68] },
      { y0: -0.13, y1: -0.38, col: [0.76, 0.66, 0.52] },
      { y0: -0.38, y1: -0.50, col: [0.56, 0.12, 0.42] }
    ];
    var vBase = 0;
    for (var bIdx = 0; bIdx < bands.length; bIdx++) {
      var band = bands[bIdx];
      for (var k = 0; k < ring.length; k++) {
        var a = ring[k];
        var b = ring[(k + 1) % ring.length];
        var dx = b.x - a.x, dz = b.z - a.z;
        var outX = dz, outZ = -dx;
        var nl = Math.hypot(outX, outZ) || 1;
        outX /= nl; outZ /= nl;
        // Flip outward if pointing inward
        if (outX * (a.x + b.x) + outZ * (a.z + b.z) < 0) { outX = -outX; outZ = -outZ; }
        rPos.push(
          a.x, a.y + thick * band.y0, a.z,
          b.x, b.y + thick * band.y0, b.z,
          b.x, b.y + thick * band.y1, b.z,
          a.x, a.y + thick * band.y1, a.z
        );
        for (var q = 0; q < 4; q++) {
          rNorm.push(outX, 0, outZ);
          rUv.push(0.5, 0.5);
          rCol.push(band.col[0], band.col[1], band.col[2]);
        }
        rIdx.push(vBase, vBase + 1, vBase + 2, vBase, vBase + 2, vBase + 3);
        vBase += 4;
      }
    }
    return {
      top: buildCap(true),
      bottom: buildCap(false),
      rim: {
        pos: new Float32Array(rPos), norm: new Float32Array(rNorm),
        uv: new Float32Array(rUv), col: new Float32Array(rCol), idx: new Uint16Array(rIdx)
      }
    };
  }

  // Hard-edged lathe-profiled street urethane wheel with recessed bearing shield, chrome race, hex nut & top AO
  function buildWheelLathe(segs) {
    // Each segment: [z0, r0, z1, r1, colorRGB] -> separate vertices per segment for crisp industrial bevels
    var U_TREAD = [0.76, 0.14, 0.62]; // Deep sculpted Editions berry-magenta urethane tread
    var U_SIDE  = [0.84, 0.22, 0.70]; // Satin conical urethane sidewall
    var U_IN    = [0.54, 0.08, 0.44]; // Recessed urethane inner lip
    var B_SHLD  = [0.11, 0.14, 0.20]; // Dark anodized obsidian-steel bearing dust shield
    var B_RACE  = [0.84, 0.89, 0.95]; // Machined chrome bearing inner race
    var B_NUT   = [0.68, 0.75, 0.83]; // Steel hex axle locknut

    var segments = [
      // Back face (negative Z)
      [-0.044, 0.000, -0.044, 0.015, B_NUT],
      [-0.044, 0.015, -0.040, 0.017, B_RACE],
      [-0.040, 0.017, -0.040, 0.033, B_SHLD],
      [-0.040, 0.033, -0.048, 0.043, U_IN],
      [-0.048, 0.043, -0.048, 0.066, U_SIDE],
      [-0.048, 0.066, -0.038, 0.080, U_TREAD],
      // Main crowned contact tread
      [-0.038, 0.080,  0.000, 0.082, U_TREAD],
      [ 0.000, 0.082,  0.038, 0.080, U_TREAD],
      // Front face (positive Z — faces viewer)
      [ 0.038, 0.080,  0.048, 0.066, U_TREAD],
      [ 0.048, 0.066,  0.048, 0.043, U_SIDE],
      [ 0.048, 0.043,  0.040, 0.033, U_IN],
      [ 0.040, 0.033,  0.040, 0.017, B_SHLD],
      [ 0.040, 0.017,  0.046, 0.015, B_RACE],
      [ 0.046, 0.015,  0.046, 0.000, B_NUT]
    ];

    var pos = [], norm = [], uv = [], col = [], idx = [];
    var vBase = 0;
    for (var si = 0; si < segments.length; si++) {
      var seg = segments[si];
      var z0 = seg[0], r0 = seg[1], z1 = seg[2], r1 = seg[3], c = seg[4];
      var dz = z1 - z0, dr = r1 - r0;
      // Outward radial-axial normal for segment
      var nr = dz, nz = -dr;
      var nl = Math.hypot(nr, nz) || 1;
      nr /= nl; nz /= nl;

      for (var s = 0; s <= segs; s++) {
        var a = (s / segs) * Math.PI * 2;
        var cx = Math.cos(a), cy = Math.sin(a);
        // Subtle physical ambient occlusion shadow on upper hemisphere tucked under the deck
        var ao0 = 1.0 - clamp((cy * r0) / 0.082, 0.0, 1.0) * 0.34;
        var ao1 = 1.0 - clamp((cy * r1) / 0.082, 0.0, 1.0) * 0.34;
        pos.push(cx * r0, cy * r0, z0);
        norm.push(cx * nr, cy * nr, nz);
        uv.push(s / segs, 0);
        col.push(c[0] * ao0, c[1] * ao0, c[2] * ao0);

        pos.push(cx * r1, cy * r1, z1);
        norm.push(cx * nr, cy * nr, nz);
        uv.push(s / segs, 1);
        col.push(c[0] * ao1, c[1] * ao1, c[2] * ao1);
      }
      for (var s2 = 0; s2 < segs; s2++) {
        var a1 = vBase + s2 * 2;
        var b1 = a1 + 1;
        var c1 = a1 + 2;
        var d1 = a1 + 3;
        idx.push(a1, b1, c1, c1, b1, d1);
      }
      vBase += (segs + 1) * 2;
    }
    return {
      pos: new Float32Array(pos), norm: new Float32Array(norm),
      uv: new Float32Array(uv), col: new Float32Array(col), idx: new Uint16Array(idx)
    };
  }

  // Cylinder along X axis (for laptop hinge barrel)
  function buildCylinderX(radius, length, segs, color) {
    var pos = [], norm = [], uv = [], col = [], idx = [];
    var hl = length * 0.5;
    for (var i = 0; i <= segs; i++) {
      var a = (i / segs) * Math.PI * 2;
      var cy = Math.cos(a), cz = Math.sin(a);
      pos.push(-hl, cy * radius, cz * radius);
      norm.push(0, cy, cz); uv.push(0, i / segs); col.push(color[0], color[1], color[2]);
      pos.push( hl, cy * radius, cz * radius);
      norm.push(0, cy, cz); uv.push(1, i / segs); col.push(color[0], color[1], color[2]);
    }
    for (var j = 0; j < segs; j++) {
      var b = j * 2;
      idx.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
    }
    return {
      pos: new Float32Array(pos), norm: new Float32Array(norm),
      uv: new Float32Array(uv), col: new Float32Array(col), idx: new Uint16Array(idx)
    };
  }

  // Cylinder along Z axis (for sculpted cast-aluminum skateboard truck hanger & steel axle)
  function buildCylinderZ(radius, length, segs, color) {
    var pos = [], norm = [], uv = [], col = [], idx = [];
    var hl = length * 0.5;
    for (var i = 0; i <= segs; i++) {
      var a = (i / segs) * Math.PI * 2;
      var cx = Math.cos(a), cy = Math.sin(a);
      pos.push(cx * radius, cy * radius, -hl);
      norm.push(cx, cy, 0); uv.push(0, i / segs); col.push(color[0], color[1], color[2]);
      pos.push(cx * radius, cy * radius,  hl);
      norm.push(cx, cy, 0); uv.push(1, i / segs); col.push(color[0], color[1], color[2]);
    }
    for (var j = 0; j < segs; j++) {
      var b = j * 2;
      idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
    }
    return {
      pos: new Float32Array(pos), norm: new Float32Array(norm),
      uv: new Float32Array(uv), col: new Float32Array(col), idx: new Uint16Array(idx)
    };
  }

  var MOSAIC_TILES = [
    [0.00, 0.00, 0.16, 0.22], [0.16, 0.00, 0.25, 0.21], [0.41, 0.00, 0.21, 0.16], [0.62, 0.00, 0.22, 0.13], [0.84, 0.00, 0.16, 0.13],
    [0.00, 0.22, 0.16, 0.16], [0.16, 0.21, 0.25, 0.16], [0.41, 0.16, 0.13, 0.22], [0.54, 0.16, 0.08, 0.22], [0.62, 0.13, 0.22, 0.24], [0.84, 0.13, 0.16, 0.15], [0.84, 0.28, 0.16, 0.09],
    [0.00, 0.38, 0.23, 0.25], [0.23, 0.37, 0.14, 0.26], [0.37, 0.38, 0.25, 0.25], [0.62, 0.37, 0.15, 0.26], [0.77, 0.37, 0.23, 0.24],
    [0.00, 0.63, 0.36, 0.37], [0.36, 0.63, 0.16, 0.37], [0.52, 0.63, 0.10, 0.37], [0.62, 0.63, 0.15, 0.14], [0.62, 0.77, 0.13, 0.23], [0.75, 0.77, 0.15, 0.23], [0.77, 0.61, 0.23, 0.16], [0.90, 0.77, 0.10, 0.23]
  ];

  /* =====================================================================
   * EXPORT 2 · MAIN 3D HERO STAGE (Skateboard + CNC Laptop + Girl + Mosaic)
   * ===================================================================== */
  function createOrbitWebGL(canvas) {
    var gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return null;

    var IMG_RATIO = 852 / 808;

    /* --- Program 1: Girl Articulated Mesh (Calm Resting Hand, Zero Idle Body Warp) --- */
    var girlVS = [
      "precision highp float;",
      "attribute vec3 aPos;",
      "attribute vec2 aUv;",
      "uniform float uTime;",
      "uniform float uProgress;",
      "uniform float uAspect;",
      "uniform float uImgRatio;",
      "uniform vec2 uOffset;",
      "uniform float uScale;",
      "uniform float uTilt;",
      "varying vec2 vUv;",
      "float sm(float e0, float e1, float x) { float t = clamp((x - e0)/(e1 - e0), 0.0, 1.0); return t*t*(3.0 - 2.0*t); }",
      "void main() {",
      "  vUv = aUv;",
      "  vec2 p = aPos.xy;",
      "  // 1. V3.3 Head & Neck Rigid Protection Zone (ALWAYS zero distortion)",
      "  float headDist = length((aUv - vec2(0.54, 0.16)) * vec2(2.6, 3.1));",
      "  float headLock = sm(0.42, 0.72, headDist);",
      "  // 2. Subtle cosmic breeze ONLY on far outer robe hems & loose hair tips;",
      "  //    hand, arms, torso, backpack, head & legs stay 100% calm and undeformed at p=0",
      "  float outerHem = sm(0.50, 0.68, aUv.y) * sm(0.28, 0.44, abs(aUv.x - 0.50));",
      "  float hairTip  = (1.0 - sm(0.06, 0.22, aUv.y)) * (1.0 - sm(0.32, 0.46, aUv.x)) * headLock;",
      "  vec2 disp = vec2(0.0);",
      "  disp.x += sin(uTime * 1.8 + aUv.y * 5.2) * 0.009 * outerHem;",
      "  disp.y += cos(uTime * 1.4 + aUv.x * 4.6) * 0.007 * outerHem;",
      "  disp.x += sin(uTime * 2.2 + aUv.y * 7.0) * 0.006 * hairTip;",
      "  // 3. 6-Phase Skateboard Ollie / Kickflip Biomechanics (active only when scrolling uProgress > 0.03)",
      "  float trickActive = sm(0.03, 0.09, uProgress) * (1.0 - sm(0.56, 0.66, uProgress));",
      "  float crouch  = sm(0.04, 0.11, uProgress) * (1.0 - sm(0.11, 0.19, uProgress));",
      "  float pop     = sm(0.11, 0.18, uProgress) * (1.0 - sm(0.20, 0.29, uProgress));",
      "  float flick   = sm(0.18, 0.28, uProgress) * (1.0 - sm(0.34, 0.44, uProgress));",
      "  float tuck    = sm(0.24, 0.36, uProgress) * (1.0 - sm(0.46, 0.56, uProgress));",
      "  float lowerBody = sm(0.50, 0.72, aUv.y) * headLock;",
      "  float frontFoot = sm(0.66, 0.84, aUv.y) * sm(0.48, 0.68, aUv.x) * headLock;",
      "  float backFoot  = sm(0.68, 0.86, aUv.y) * (1.0 - sm(0.40, 0.56, aUv.x)) * headLock;",
      "  float arms      = sm(0.28, 0.48, aUv.y) * (1.0 - sm(0.52, 0.64, aUv.y)) * sm(0.22, 0.38, abs(aUv.x - 0.52)) * headLock;",
      "  disp.y -= crouch * 0.035 * lowerBody * trickActive;",
      "  disp.y -= pop * 0.042 * backFoot * trickActive;",
      "  disp.x += flick * 0.045 * frontFoot * trickActive;",
      "  disp.y += flick * 0.055 * frontFoot * trickActive;",
      "  disp.y += tuck * 0.075 * lowerBody * trickActive;",
      "  disp.y += (flick + tuck) * 0.032 * arms * trickActive;",
      "  p += disp;",
      "  float ct = cos(uTilt), st = sin(uTilt);",
      "  p = vec2(p.x * ct - p.y * st, p.x * st + p.y * ct);",
      "  p.x *= (uScale * uImgRatio / uAspect);",
      "  p.y *= uScale;",
      "  p += uOffset;",
      "  gl_Position = vec4(p, 0.0, 1.0);",
      "}"
    ].join("\n");

    var girlFS = [
      "precision highp float;",
      "uniform sampler2D uTex;",
      "uniform float uAlpha;",
      "varying vec2 vUv;",
      "void main() {",
      "  vec4 c = texture2D(uTex, vUv);",
      "  if (c.a < 0.02) discard;",
      "  gl_FragColor = vec4(c.rgb, c.a * uAlpha);",
      "}"
    ].join("\n");

    /* --- Program 2: Blinn-Phong + Fresnel Metallic Studio Shader for 3D Hardware --- */
    var meshVS = [
      "precision highp float;",
      "attribute vec3 aPos;",
      "attribute vec3 aNorm;",
      "attribute vec2 aUv;",
      "attribute vec3 aCol;",
      "uniform mat4 uMvp;",
      "uniform mat4 uModel;",
      "varying vec3 vNorm;",
      "varying vec3 vWorldPos;",
      "varying vec2 vUv;",
      "varying vec3 vCol;",
      "void main() {",
      "  vUv = aUv;",
      "  vCol = aCol;",
      "  vec4 wp = uModel * vec4(aPos, 1.0);",
      "  vWorldPos = wp.xyz;",
      "  vNorm = normalize(mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNorm);",
      "  gl_Position = uMvp * vec4(aPos, 1.0);",
      "}"
    ].join("\n");

    var meshFS = [
      "precision highp float;",
      "uniform sampler2D uTex;",
      "uniform float uUseTex;",
      "uniform float uAlpha;",
      "uniform float uEmissive;",
      "uniform float uSpecStrength;",
      "uniform float uShininess;",
      "uniform float uAmbientPulse;",
      "varying vec3 vNorm;",
      "varying vec3 vWorldPos;",
      "varying vec2 vUv;",
      "varying vec3 vCol;",
      "void main() {",
      "  vec3 base = mix(vCol, texture2D(uTex, vUv).rgb, uUseTex);",
      "  vec3 N = normalize(vNorm);",
      "  vec3 V = normalize(-vWorldPos);",
      "  // Sculptural northern key + cosmic sky hemisphere + crisp specular & Fresnel rim",
      "  vec3 L1 = normalize(vec3(-0.36, 0.84, 0.52));",
      "  vec3 L2 = normalize(vec3(0.66, -0.28, 0.64));",
      "  float d1 = max(dot(N, L1), 0.0);",
      "  float d2 = max(dot(N, L2), 0.0);",
      "  float hemi = 0.5 + 0.5 * N.y;",
      "  vec3 H1 = normalize(L1 + V);",
      "  vec3 H2 = normalize(L2 + V);",
      "  float spec1 = pow(max(dot(N, H1), 0.0), max(4.0, uShininess)) * uSpecStrength;",
      "  float spec2 = pow(max(dot(N, H2), 0.0), max(4.0, uShininess * 0.7)) * uSpecStrength * 0.35;",
      "  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0) * uSpecStrength * 0.52;",
      "  vec3 lit = base * (0.24 + hemi * 0.16 + d1 * 0.74 + d2 * 0.18)",
      "           + vec3(0.92, 0.96, 1.0) * spec1",
      "           + vec3(0.62, 0.84, 0.98) * spec2",
      "           + vec3(0.45, 0.80, 0.95) * fresnel;",
      "  // Serene subtle keybed backlight breath under her resting hand",
      "  if (uAmbientPulse > 0.001 && N.y > 0.5) {",
      "    float kMask = smoothstep(0.08, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 0.92, vUv.x))",
      "                * smoothstep(0.08, 0.16, vUv.y) * (1.0 - smoothstep(0.56, 0.64, vUv.y));",
      "    lit += vec3(0.65, 0.25, 0.85) * kMask * uAmbientPulse * 0.16;",
      "  }",
      "  vec3 finalCol = mix(lit, base, uEmissive);",
      "  gl_FragColor = vec4(finalCol, uAlpha);",
      "}"
    ].join("\n");

    /* --- Program 3: Mosaic Shatter (Per-pixel fragment-shader crisp 1.8px magenta border) --- */
    var mosaicVS = [
      "precision highp float;",
      "attribute vec2 aLocal;",
      "uniform vec4 uRect;",
      "uniform vec2 uShift;",
      "uniform float uRot;",
      "uniform float uScale;",
      "uniform vec2 uViewport;",
      "varying vec2 vLocal;",
      "varying vec2 vImgUv;",
      "varying vec2 vTilePx;",
      "void main() {",
      "  vLocal = aLocal;",
      "  vec2 center = uRect.xy + uRect.zw * 0.5;",
      "  vec2 rel = (aLocal - 0.5) * uRect.zw * uScale;",
      "  vec2 relPx = rel * uViewport;",
      "  float cr = cos(uRot), sr = sin(uRot);",
      "  vec2 rotPx = vec2(relPx.x * cr - relPx.y * sr, relPx.x * sr + relPx.y * cr);",
      "  vec2 posUv = center + rotPx / uViewport + uShift;",
      "  vImgUv = uRect.xy + aLocal * uRect.zw;",
      "  vTilePx = uRect.zw * uScale * uViewport;",
      "  vec2 ndc = vec2(posUv.x * 2.0 - 1.0, 1.0 - posUv.y * 2.0);",
      "  gl_Position = vec4(ndc, 0.0, 1.0);",
      "}"
    ].join("\n");

    var mosaicFS = [
      "precision highp float;",
      "uniform sampler2D uTex;",
      "uniform float uChroma;",
      "uniform float uBorderAlpha;",
      "uniform float uOpacity;",
      "varying vec2 vLocal;",
      "varying vec2 vImgUv;",
      "varying vec2 vTilePx;",
      "void main() {",
      "  vec2 pxFromEdge = min(vLocal, 1.0 - vLocal) * vTilePx;",
      "  float edgeDist = min(pxFromEdge.x, pxFromEdge.y);",
      "  float sharpRim = (1.0 - smoothstep(1.3, 2.3, edgeDist)) * uBorderAlpha;",
      "  float glowRim  = (1.0 - smoothstep(2.0, 10.0, edgeDist)) * uBorderAlpha * 0.35;",
      "  float r = texture2D(uTex, clamp(vImgUv + vec2(uChroma, 0.0), 0.0, 1.0)).r;",
      "  float g = texture2D(uTex, clamp(vImgUv, 0.0, 1.0)).g;",
      "  float b = texture2D(uTex, clamp(vImgUv - vec2(uChroma, 0.0), 0.0, 1.0)).b;",
      "  vec3 col = vec3(r, g, b);",
      "  vec3 mag = vec3(0.98, 0.12, 0.84);",
      "  col = mix(col, mag, clamp(sharpRim + glowRim, 0.0, 1.0));",
      "  gl_FragColor = vec4(col, uOpacity);",
      "}"
    ].join("\n");

    var progGirl   = createProgram(gl, girlVS, girlFS);
    var progMesh   = createProgram(gl, meshVS, meshFS);
    var progMosaic = createProgram(gl, mosaicVS, mosaicFS);

    function uploadMesh(data) {
      var o = { count: data.idx.length };
      o.pos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, o.pos); gl.bufferData(gl.ARRAY_BUFFER, data.pos, gl.STATIC_DRAW);
      o.uv  = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, o.uv);  gl.bufferData(gl.ARRAY_BUFFER, data.uv,  gl.STATIC_DRAW);
      if (data.norm) { o.norm = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, o.norm); gl.bufferData(gl.ARRAY_BUFFER, data.norm, gl.STATIC_DRAW); }
      if (data.col)  { o.col  = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, o.col);  gl.bufferData(gl.ARRAY_BUFFER, data.col,  gl.STATIC_DRAW); }
      o.idx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.idx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.idx, gl.STATIC_DRAW);
      return o;
    }

    var girlMesh = uploadMesh(buildGirlGrid(40, 40));

    // Refined 3D Skateboard components
    var deckParts = buildSkateboardDeck();
    var deckTop = uploadMesh(deckParts.top);
    var deckBot = uploadMesh(deckParts.bottom);
    var deckRim = uploadMesh(deckParts.rim);
    var truckBaseplate = uploadMesh(buildBox(0.22, 0.022, 0.18, {
      front:[0.72,0.78,0.86], back:[0.66,0.72,0.80], top:[0.80,0.86,0.92],
      bottom:[0.60,0.66,0.74], side:[0.68,0.74,0.82]
    }));
    var truckKingpin = uploadMesh(buildBox(0.064, 0.072, 0.064, {
      front:[0.88,0.16,0.62], back:[0.82,0.12,0.58], top:[0.92,0.20,0.66],
      bottom:[0.72,0.10,0.50], side:[0.84,0.14,0.60]
    }));
    var truckHanger = uploadMesh(buildCylinderZ(0.030, 0.42, 16, [0.80, 0.86, 0.93]));
    var truckAxle   = uploadMesh(buildCylinderZ(0.014, 0.54, 14, [0.88, 0.92, 0.97]));
    var wheelMesh   = uploadMesh(buildWheelLathe(32));

    // Refined CNC Unibody 3D Laptop components
    var laptopBase = uploadMesh(buildBox(1.14, 0.040, 0.78, {
      front:[0.70,0.78,0.88], back:[0.60,0.68,0.78], top:[0.78,0.85,0.94],
      bottom:[0.54,0.63,0.74], side:[0.68,0.76,0.86]
    }));
    var laptopBevelBottom = uploadMesh(buildBox(1.08, 0.014, 0.72, {
      front:[0.52,0.60,0.70], back:[0.48,0.56,0.66], top:[0.56,0.64,0.74],
      bottom:[0.44,0.52,0.62], side:[0.50,0.58,0.68]
    }));
    var laptopHinge = uploadMesh(buildCylinderX(0.022, 0.84, 16, [0.16, 0.21, 0.28]));
    var laptopPort  = uploadMesh(buildBox(0.010, 0.013, 0.048, {
      front:[0.08,0.11,0.16], back:[0.08,0.11,0.16], top:[0.08,0.11,0.16],
      bottom:[0.08,0.11,0.16], side:[0.08,0.11,0.16]
    }));
    var laptopLid = uploadMesh(buildBox(1.14, 0.74, 0.028, {
      front:[0.08,0.11,0.15], back:[0.78,0.86,0.95], top:[0.72,0.80,0.90],
      bottom:[0.62,0.70,0.80], side:[0.70,0.78,0.88]
    }));
    var laptopScreen = uploadMesh(buildBox(1.07, 0.67, 0.008, {
      front:[1,1,1], back:[0.08,0.10,0.14], top:[0.08,0.10,0.14],
      bottom:[0.08,0.10,0.14], side:[0.08,0.10,0.14]
    }));

    var quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);

    var texGirl = makePlaceholderTex(gl, 0, 0, 0, 0);
    var texMona = makePlaceholderTex(gl, 24, 42, 52, 255);
    var texGrip = createGripTexture(gl);
    var texBaroque = createBaroqueDeckTexture(gl);
    var texKeys = createKeyboardDeckTexture(gl);
    var texLid  = createLaptopLidTexture(gl);
    var girlReady = false;

    function loadImg(src, cb) {
      var img = new Image();
      img.onload = function () { cb(img); };
      img.src = src;
    }

    loadImg("assets/media/orbit-girl.png", function (img) {
      texGirl = createTexture(gl, img, false);
      girlReady = true;
    });

    var act1Imgs = {};
    var act1Count = 0;
    ["act1-valley.jpg", "act1-loggia.png", "act1-mona.png", "act1-fg.png"].forEach(function (name) {
      loadImg("assets/media/" + name, function (img) {
        act1Imgs[name] = img;
        act1Count += 1;
        if (act1Count === 4) {
          var cc = document.createElement("canvas");
          cc.width = 1376; cc.height = 768;
          var ctx = cc.getContext("2d");
          ctx.drawImage(act1Imgs["act1-valley.jpg"], 0, 0, 1376, 768);
          ctx.drawImage(act1Imgs["act1-loggia.png"], 0, 0, 1376, 768);
          ctx.drawImage(act1Imgs["act1-mona.png"], 0, 0, 1376, 768);
          ctx.drawImage(act1Imgs["act1-fg.png"], 0, 0, 1376, 768);
          texMona = createTexture(gl, cc, false);
        }
      });
    });

    function draw3DMesh(mesh, mvp, model, tex, useTex, alpha, emissive, specStr, shiny, ambPulse) {
      gl.useProgram(progMesh);
      var aPos = gl.getAttribLocation(progMesh, "aPos");
      var aNorm = gl.getAttribLocation(progMesh, "aNorm");
      var aUv = gl.getAttribLocation(progMesh, "aUv");
      var aCol = gl.getAttribLocation(progMesh, "aCol");

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.norm);
      gl.enableVertexAttribArray(aNorm);
      gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uv);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.col);
      gl.enableVertexAttribArray(aCol);
      gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

      gl.uniformMatrix4fv(gl.getUniformLocation(progMesh, "uMvp"), false, mvp);
      gl.uniformMatrix4fv(gl.getUniformLocation(progMesh, "uModel"), false, model);
      gl.uniform1f(gl.getUniformLocation(progMesh, "uUseTex"), useTex);
      gl.uniform1f(gl.getUniformLocation(progMesh, "uAlpha"), alpha);
      gl.uniform1f(gl.getUniformLocation(progMesh, "uEmissive"), emissive || 0.0);
      gl.uniform1f(gl.getUniformLocation(progMesh, "uSpecStrength"), specStr != null ? specStr : 0.35);
      gl.uniform1f(gl.getUniformLocation(progMesh, "uShininess"), shiny != null ? shiny : 28.0);
      gl.uniform1f(gl.getUniformLocation(progMesh, "uAmbientPulse"), ambPulse || 0.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex || texGrip);
      gl.uniform1i(gl.getUniformLocation(progMesh, "uTex"), 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

      gl.disableVertexAttribArray(aPos);
      gl.disableVertexAttribArray(aNorm);
      gl.disableVertexAttribArray(aUv);
      gl.disableVertexAttribArray(aCol);
    }

    var state = { progress: 0, mx: 0, my: 0, width: 1, height: 1, dpr: 1 };

    function syncSize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(rect.width * dpr));
      var h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }
      state.width = w; state.height = h; state.dpr = dpr;
    }

    if (window.ResizeObserver) new ResizeObserver(syncSize).observe(canvas);
    window.addEventListener("resize", syncSize, { passive: true });
    syncSize();

    function drawGirlPass(timeSec, p, aspect, act0Alpha, floatY, parX, parY) {
      if (!girlReady || act0Alpha <= 0.01) return;
      gl.disable(gl.DEPTH_TEST);
      gl.useProgram(progGirl);
      var gPos = gl.getAttribLocation(progGirl, "aPos");
      var gUv  = gl.getAttribLocation(progGirl, "aUv");
      gl.bindBuffer(gl.ARRAY_BUFFER, girlMesh.pos);
      gl.enableVertexAttribArray(gPos);
      gl.vertexAttribPointer(gPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, girlMesh.uv);
      gl.enableVertexAttribArray(gUv);
      gl.vertexAttribPointer(gUv, 2, gl.FLOAT, false, 0, 0);

      var leapLift = Math.sin(smoothstep(0.06, 0.56, p) * Math.PI) * 0.085;
      var exitDrift = smoothstep(0.48, 0.72, p);
      var girlScale = 0.65 * (1.0 - exitDrift * 0.12);
      var girlOffsetX = 0.0 + parX - exitDrift * 0.14;
      var girlOffsetY = 0.07 + floatY + leapLift + parY;
      var girlTilt = Math.sin(smoothstep(0.08, 0.54, p) * Math.PI) * 0.055;

      gl.uniform1f(gl.getUniformLocation(progGirl, "uTime"), timeSec);
      gl.uniform1f(gl.getUniformLocation(progGirl, "uProgress"), p);
      gl.uniform1f(gl.getUniformLocation(progGirl, "uAspect"), aspect);
      gl.uniform1f(gl.getUniformLocation(progGirl, "uImgRatio"), IMG_RATIO);
      gl.uniform2f(gl.getUniformLocation(progGirl, "uOffset"), girlOffsetX, girlOffsetY);
      gl.uniform1f(gl.getUniformLocation(progGirl, "uScale"), girlScale);
      gl.uniform1f(gl.getUniformLocation(progGirl, "uTilt"), girlTilt);
      gl.uniform1f(gl.getUniformLocation(progGirl, "uAlpha"), act0Alpha);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texGirl);
      gl.uniform1i(gl.getUniformLocation(progGirl, "uTex"), 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, girlMesh.idx);
      gl.drawElements(gl.TRIANGLES, girlMesh.count, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(gPos);
      gl.disableVertexAttribArray(gUv);
    }

    function drawLaptopPass(timeSec, p, aspect, lapAlpha, floatY, parX, parY) {
      if (lapAlpha <= 0.01) return;
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      var projL = mat4Perspective(38 * Math.PI / 180, aspect, 0.1, 40.0);

      var throwP = smoothstep(0.32, 0.62, p);
      var restingActive = 1.0 - smoothstep(0.28, 0.36, p);
      var keyBreath = (0.5 + 0.5 * Math.sin(timeSec * 1.6)) * restingActive;

      // Calm, steady laptop seated directly under her resting left hand (zero jitter!)
      // Screen strictly faces LEFT & AWAY toward her face (-118°), keyboard pitched 25° toward viewer
      var leapLiftWorld = Math.sin(smoothstep(0.06, 0.56, p) * Math.PI) * 0.085 * 1.2568 * restingActive;
      var lapX = lerp(0.68, 0.0, throwP) + parX * 1.26;
      var lapY = lerp(0.165, -0.02, throwP) + floatY * 1.2568 + leapLiftWorld + Math.sin(throwP * Math.PI) * 0.16 + parY * 1.26;
      var lapZ = lerp(-3.65, -1.65, throwP);

      var lapRotY = lerp(-2.06, 0.0, throwP) + state.mx * 0.08 * (1.0 - throwP);
      var lapRotX = lerp(0.44, 0.04, throwP) + Math.sin(throwP * Math.PI) * 0.22;
      var lapRotZ = lerp(-0.05, 0.0, throwP);
      var lapScale = lerp(0.56, 0.90, throwP);

      var mLap = mat4Translate(lapX, lapY, lapZ);
      mLap = mat4Mul(mLap, mat4RotZ(lapRotZ));
      mLap = mat4Mul(mLap, mat4RotX(lapRotX));
      mLap = mat4Mul(mLap, mat4RotY(lapRotY));
      mLap = mat4Mul(mLap, mat4Scale(lapScale, lapScale, lapScale));

      // Main CNC aluminum unibody keyboard deck (top surface at exact local y = 0)
      var mBase = mat4Mul(mLap, mat4Translate(0, -0.020, 0));
      draw3DMesh(laptopBase, mat4Mul(projL, mBase), mBase, texKeys, 0.94, lapAlpha, 0.08, 0.48, 36.0, keyBreath);

      // Tapered chamfered underside step
      var mUnder = mat4Mul(mLap, mat4Translate(0, -0.044, 0));
      draw3DMesh(laptopBevelBottom, mat4Mul(projL, mUnder), mUnder, null, 0.0, lapAlpha, 0.02, 0.35, 24.0, 0);

      // Precision cylindrical hinge clutch barrel
      var mHinge = mat4Mul(mLap, mat4Translate(0, 0.008, -0.378));
      draw3DMesh(laptopHinge, mat4Mul(projL, mHinge), mHinge, null, 0.0, lapAlpha, 0.0, 0.55, 42.0, 0);

      // Two subtle recessed USB-C ports along side wall
      var mPort1 = mat4Mul(mLap, mat4Translate(0.571, -0.020, -0.18));
      var mPort2 = mat4Mul(mLap, mat4Translate(0.571, -0.020, -0.09));
      draw3DMesh(laptopPort, mat4Mul(projL, mPort1), mPort1, null, 0.0, lapAlpha, 0.0, 0.1, 8.0, 0);
      draw3DMesh(laptopPort, mat4Mul(projL, mPort2), mPort2, null, 0.0, lapAlpha, 0.0, 0.1, 8.0, 0);

      // Hinged brushed-aluminum display lid
      var hingeOpen = lerp(-0.24, -0.04, throwP);
      var mLidRoot = mat4Mul(mLap, mat4Translate(0, 0.005, -0.38));
      mLidRoot = mat4Mul(mLidRoot, mat4RotX(hingeOpen));
      var mLid = mat4Mul(mLidRoot, mat4Translate(0, 0.37, 0));
      draw3DMesh(laptopLid, mat4Mul(projL, mLid), mLid, texLid, 0.90, lapAlpha, 0.08, 0.56, 44.0, 0);

      // High-contrast display screen (faces girl at p=0, faces viewer after Stage II flip)
      var mScr = mat4Mul(mLidRoot, mat4Translate(0, 0.37, 0.019));
      draw3DMesh(laptopScreen, mat4Mul(projL, mScr), mScr, texMona, 1.0, lapAlpha, 0.88, 0.25, 48.0, 0);
    }

    function render(timeSec) {
      syncSize();
      var w = state.width, h = state.height;
      var aspect = w / h;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      var p = clamp(state.progress, 0, 1);
      var floatY = Math.sin(timeSec * 1.45) * 0.022 * (1.0 - smoothstep(0.55, 0.72, p));
      var parX = state.mx * 0.025;
      var parY = -state.my * 0.018;

      var act0Alpha = 1.0 - smoothstep(0.60, 0.74, p);
      var lapAlpha  = 1.0 - smoothstep(0.60, 0.70, p);

      /* ---------- PASS 1: HIGH-CRAFT 3D SKATEBOARD ---------- */
      if (act0Alpha > 0.01) {
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        var proj = mat4Perspective(38 * Math.PI / 180, aspect, 0.1, 40.0);
        var trickP = smoothstep(0.08, 0.56, p);
        var flipAngle = trickP * Math.PI * 2.0;
        var popPitch = Math.sin(trickP * Math.PI) * 0.28;
        var dropY = -Math.sin(trickP * Math.PI) * 0.24;

        var boardX = 0.22 + parX * 1.326;
        var boardY = -0.69 + floatY * 1.326 + dropY + parY * 1.326;
        var boardZ = -3.85;

        var mBoard = mat4Translate(boardX, boardY, boardZ);
        mBoard = mat4Mul(mBoard, mat4RotZ(-0.14 + Math.sin(trickP * Math.PI) * 0.14));
        mBoard = mat4Mul(mBoard, mat4RotY(0.18 - trickP * 0.45 + state.mx * 0.12));
        mBoard = mat4Mul(mBoard, mat4RotX(0.46 + flipAngle + popPitch));
        mBoard = mat4Mul(mBoard, mat4Scale(0.66, 0.66, 0.66));

        var mvpBoard = mat4Mul(proj, mBoard);
        draw3DMesh(deckTop, mvpBoard, mBoard, texGrip, 1.0, act0Alpha, 0.06, 0.22, 18.0, 0);
        draw3DMesh(deckBot, mvpBoard, mBoard, texBaroque, 1.0, act0Alpha, 0.14, 0.50, 38.0, 0);
        draw3DMesh(deckRim, mvpBoard, mBoard, null, 0.0, act0Alpha, 0.10, 0.36, 24.0, 0);

        // Two multi-part CNC aluminum trucks + sculpted beveled urethane wheels w/ bearing hubs
        var truckXs = [-0.47, 0.47];
        for (var ti = 0; ti < 2; ti++) {
          var tx = truckXs[ti];
          var mBasePl = mat4Mul(mBoard, mat4Translate(tx, -0.026, 0));
          draw3DMesh(truckBaseplate, mat4Mul(proj, mBasePl), mBasePl, null, 0.0, act0Alpha, 0.02, 0.70, 52.0, 0);
          var mKing = mat4Mul(mBoard, mat4Translate(tx, -0.064, 0));
          draw3DMesh(truckKingpin, mat4Mul(proj, mKing), mKing, null, 0.0, act0Alpha, 0.06, 0.44, 28.0, 0);
          var mHanger = mat4Mul(mBoard, mat4Translate(tx, -0.098, 0));
          draw3DMesh(truckHanger, mat4Mul(proj, mHanger), mHanger, null, 0.0, act0Alpha, 0.03, 0.82, 58.0, 0);
          var mAxle = mat4Mul(mBoard, mat4Translate(tx, -0.104, 0));
          draw3DMesh(truckAxle, mat4Mul(proj, mAxle), mAxle, null, 0.0, act0Alpha, 0.04, 0.90, 68.0, 0);

          var wzs = [-0.22, 0.22];
          for (var wi = 0; wi < 2; wi++) {
            var mWh = mat4Mul(mBoard, mat4Translate(tx, -0.104, wzs[wi]));
            draw3DMesh(wheelMesh, mat4Mul(proj, mWh), mWh, null, 0.0, act0Alpha, 0.04, 0.62, 42.0, 0);
          }
        }
      }

      /* ---------- PASS 2 & 3: SMART DEPTH HANDOFF (Resting Hand -> Laptop Throw) ---------- */
      if (p < 0.36) {
        drawLaptopPass(timeSec, p, aspect, lapAlpha, floatY, parX, parY);
        drawGirlPass(timeSec, p, aspect, act0Alpha, floatY, parX, parY);
      } else {
        drawGirlPass(timeSec, p, aspect, act0Alpha, floatY, parX, parY);
        drawLaptopPass(timeSec, p, aspect, lapAlpha, floatY, parX, parY);
      }

      /* ---------- PASS 4: IRREGULAR DA VINCI MOSAIC SHATTER INTO ACT I ---------- */
      var shatterIn = smoothstep(0.56, 0.68, p);
      var shatterOut = smoothstep(0.86, 0.98, p);
      if (shatterIn > 0.005) {
        gl.disable(gl.DEPTH_TEST);
        gl.useProgram(progMosaic);
        var mLocal = gl.getAttribLocation(progMosaic, "aLocal");
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.enableVertexAttribArray(mLocal);
        gl.vertexAttribPointer(mLocal, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texMona);
        gl.uniform1i(gl.getUniformLocation(progMosaic, "uTex"), 0);
        gl.uniform2f(gl.getUniformLocation(progMosaic, "uViewport"), w, h);

        var peak = Math.sin(clamp((p - 0.58) / 0.34, 0, 1) * Math.PI);
        var borderAlpha = (1.0 - shatterOut) * smoothstep(0.56, 0.65, p);
        var chroma = peak * 0.016;

        for (var idx = 0; idx < MOSAIC_TILES.length; idx++) {
          var t = MOSAIC_TILES[idx];
          var seed = Math.sin(idx * 91.7 + 1.3);
          var seed2 = Math.cos(idx * 47.3 + 2.1);
          var cx = t[0] + t[2] * 0.5 - 0.5;
          var cy = t[1] + t[3] * 0.5 - 0.5;
          var spread = peak * 0.065;
          var sx = cx * spread + seed * peak * 0.022;
          var sy = cy * spread + seed2 * peak * 0.018;
          var rot = seed * peak * 0.055;
          var sc = lerp(0.92, 1.0, shatterOut) - peak * 0.05;
          var tileAlpha = clamp(shatterIn * 1.15, 0, 1);

          gl.uniform4f(gl.getUniformLocation(progMosaic, "uRect"), t[0], t[1], t[2], t[3]);
          gl.uniform2f(gl.getUniformLocation(progMosaic, "uShift"), sx, sy);
          gl.uniform1f(gl.getUniformLocation(progMosaic, "uRot"), rot);
          gl.uniform1f(gl.getUniformLocation(progMosaic, "uScale"), sc);
          gl.uniform1f(gl.getUniformLocation(progMosaic, "uChroma"), chroma);
          gl.uniform1f(gl.getUniformLocation(progMosaic, "uBorderAlpha"), borderAlpha);
          gl.uniform1f(gl.getUniformLocation(progMosaic, "uOpacity"), tileAlpha);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        gl.disableVertexAttribArray(mLocal);
      }
    }

    return {
      setProgress: function (v) { state.progress = clamp(v, 0, 1); },
      setPointer: function (x, y) { state.mx = x; state.my = y; },
      render: render,
    };
  }

  window.createOrbitWebGL = createOrbitWebGL;
})();
