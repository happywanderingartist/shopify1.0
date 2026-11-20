#!/usr/bin/env node
/**
 * verify.mjs — 对生成的新页面做静态验收（零依赖，不启浏览器 · V3.3 七条硬拦截）。
 *
 *   node scripts/verify.mjs ./assets/starter [--port 4195]
 *
 * 检查：
 *   0. 首页 200、所有根 HTML 引用的本地资源全部 200、四族字体存在
 *   1. 硬拦截 1（C-09）：css/tokens.css 必须声明 --c-page-bg: #dcded1
 *   2. 硬拦截 2（C-10）：css/tokens.css 的 --sidebar-w 必须为 13.9%（严禁 20%）
 *   3. 硬拦截 3（C-15 / C-01）：含 data-stage3d 的 HTML 内禁止 .hero__img 与 .stage3d__tone
 *   4. 硬拦截 4（V3.1 透明层真 Alpha & 临时质检图清零）：
 *      禁止残留 _qa_* 临时图；所有透明图层/拆件 PNG 必须是真 PNG 且带 Alpha 通道（colorType 6 或 4）
 *   5. 硬拦截 5（V3.1 全媒介零外联、零 <video>、自定义 JS 零语法错）：
 *      HTML 禁止 <video>；HTML/CSS/JS 全部零 http(s) 外联；js/*.js 全部通过 Node vm 语法编译
 *   6. 硬拦截 6（V3.1 [data-stage3d] 多层结构与零点击自演）：
 *      含 data-stage3d 的舞台必须含 data-autoplay 且至少具备 3 个 .stage3d__layer 图层
 *   7. 硬拦截 7（V3.3 默认全程静音：禁合成耳鸣背景音与废弃声音开关）：
 *      HTML/JS 禁止残留 data-sound-toggle / EditionsSoundEngine；禁止用 AudioContext + createOscillator 合成背景音
 */
import { createServer } from "node:http";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

function parse(argv) {
  const o = { dir: null, port: 4195 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--port" && argv[i + 1]) o.port = Number(argv[++i]);
    else if (!argv[i].startsWith("--") && !o.dir) o.dir = path.resolve(argv[i]);
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!o.dir) throw new Error("page directory is required");
  return o;
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TRANSPARENT_PNG_RE = /(?:cutout|subject|prop|arch|fg|mid|hand|cypress|base|console|figure)/i;
const OPAQUE_BG_PNG_RE = /^(?:bg-|.*-bg\.png$)/i;

async function walkFiles(dir, skipDirs = new Set(["node_modules", "vendor", ".git"])) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (skipDirs.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkFiles(full, skipDirs)));
    } else if (e.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

const { dir, port } = parse(process.argv.slice(2));
const ROOT = dir;
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".mp4": "video/mp4", ".webm": "video/webm",
};

const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = path.resolve(ROOT, p === "/" ? "index.html" : p.replace(/^\/+/, ""));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": body.length });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(port, "127.0.0.1", r));

const base = `http://127.0.0.1:${port}`;
const get = async (u) => { try { const r = await fetch(base + u); return { status: r.status, type: r.headers.get("content-type") || "" }; } catch (e) { return { status: 0, type: String(e) }; } };

const issues = [];
const home = await get("/");
if (home.status !== 200) issues.push(`GET / → ${home.status}`);

const entries = await readdir(ROOT);
const htmlFiles = entries.filter((f) => f.endsWith(".html")).sort();
if (!htmlFiles.includes("index.html")) issues.push("missing index.html in target directory");

const refs = new Set();
const stageTransparentPngRefs = new Set();
let totalExternal = 0;

for (const name of htmlFiles) {
  const html = await readFile(path.join(ROOT, name), "utf8");
  const cleanHtml = stripHtmlComments(html);

  for (const m of cleanHtml.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    const v = m[1].trim();
    if (v.startsWith("http") || v.startsWith("//") || v.startsWith("data:") || v.startsWith("#") || v.startsWith("mailto:")) continue;
    refs.add("/" + v.replace(/^\.?\//, "").split("#")[0]);
  }

  /* 硬拦截 5a：HTML 零外联（含内联 style url()）+ 零 <video> */
  const external = [
    ...[...cleanHtml.matchAll(/(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+/gi)].map((m) => m[0]),
    ...[...cleanHtml.matchAll(/url\(\s*["']?\s*(https?:)?\/\/[^)"']+/gi)].map((m) => m[0]),
  ];
  totalExternal += external.length;
  if (external.length) issues.push(`${name}: external refs → ${external.slice(0, 5).join(" | ")}`);
  if (/<video\b/i.test(cleanHtml)) {
    issues.push(`${name}: 出现 <video> 标签（违反铁律：禁止使用视频，须用纯前端分层与动画）`);
  }
  /* 硬拦截 7a（V3.3）：HTML 禁止残留已废弃的声音开关 */
  if (/\bdata-sound-toggle\b/i.test(cleanHtml)) {
    issues.push(`${name}: 出现已废弃的 data-sound-toggle（违反 V3.3 默认全程静音铁律，请移除声音开关）`);
  }

  /* 硬拦截 3 & 6：逐个校验页面内所有 [data-stage3d] 舞台 */
  const stageTagRe = /<[a-z0-9-]+\b[^>]*\bdata-stage3d\b[^>]*>/gi;
  const stageTags = [...cleanHtml.matchAll(stageTagRe)];
  for (let si = 0; si < stageTags.length; si++) {
    const tagMatch = stageTags[si];
    const label = stageTags.length > 1 ? `${name} (stage #${si + 1})` : name;
    if (!/\bdata-autoplay\b/i.test(tagMatch[0])) {
      issues.push(`${label}: [data-stage3d] 缺少 data-autoplay（违反 V3.1 零点击自动演出铁律）`);
    }

    const startIdx = tagMatch.index;
    const nextIdx = si + 1 < stageTags.length ? stageTags[si + 1].index : cleanHtml.length;
    const slice = cleanHtml.slice(startIdx, nextIdx);
    const stageWindow = slice.split(/<div\s+class="hero__inner"/i)[0] || slice;

    if (/class\s*=\s*["'][^"']*\bhero__img\b[^"']*["']/i.test(stageWindow)) {
      issues.push(`${label}: [data-stage3d] 内出现 .hero__img（违反 C-15，须改为 .stage3d__img）`);
    }
    if (/class\s*=\s*["'][^"']*\bstage3d__tone\b[^"']*["']/i.test(stageWindow)) {
      issues.push(`${label}: [data-stage3d] 内残留 .stage3d__tone 暖棕遮罩（违反 C-01，须删除）`);
    }

    /* 硬拦截 6b：舞台内必须有 >= 3 个 .stage3d__layer 图层 */
    const layerMatches = [...stageWindow.matchAll(/class\s*=\s*["']([^"']*\bstage3d__layer\b[^"']*)["']/gi)];
    if (layerMatches.length < 3) {
      issues.push(`${label}: [data-stage3d] 仅检出 ${layerMatches.length} 个 .stage3d__layer（至少需要 3 层，禁止单图伪装 3D 舞台）`);
    }

    /* 收集非 --bg 图层内引用的 PNG 路径，供硬拦截 4 校核真 Alpha */
    const layerBlocks = stageWindow.split(/(?=<div\b[^>]*class\s*=\s*["'][^"']*\bstage3d__layer\b)/i);
    for (const blk of layerBlocks) {
      const clsMatch = blk.match(/^<div\b[^>]*class\s*=\s*["']([^"']*)["']/i);
      if (!clsMatch) continue;
      if (/\bstage3d__layer--bg\b/.test(clsMatch[1])) continue;
      for (const imgM of blk.matchAll(/\bsrc\s*=\s*["']([^"']+\.png)["']/gi)) {
        const rel = imgM[1].trim().replace(/^\.?\//, "");
        if (!rel.startsWith("http") && !rel.startsWith("//")) {
          stageTransparentPngRefs.add(path.resolve(ROOT, rel));
        }
      }
    }
  }
}

for (const u of [...refs].sort()) {
  const r = await get(u);
  if (r.status !== 200) issues.push(`resource ${u} → ${r.status}`);
}

for (const f of ["fonts/NeueMontreal-Bold.woff2", "fonts/HWCigars-Regular.woff2", "fonts/ImperialScript-Regular.woff2", "fonts/Inter-Variable.woff2"]) {
  const r = await get("/" + f);
  if (r.status !== 200) issues.push(`font ${f} → ${r.status}`);
}

/* 硬拦截 1 & 2（C-09 / C-10）：校核 css/tokens.css 的主底色令牌与 13.9% 侧栏宽度 */
const tokensPath = path.join(ROOT, "css", "tokens.css");
try {
  const tokensCss = await readFile(tokensPath, "utf8");
  if (!/--c-page-bg\s*:\s*#dcded1\b/i.test(tokensCss)) {
    issues.push("css/tokens.css: 缺失页面主底色令牌 --c-page-bg: #dcded1（违反 C-09）");
  }
  const sbMatch = tokensCss.match(/--sidebar-w\s*:\s*([^;]+);/);
  if (!sbMatch || sbMatch[1].trim() !== "13.9%") {
    issues.push(`css/tokens.css: 侧栏宽度非 13.9%（当前：${sbMatch ? sbMatch[1].trim() : "未定义"}，违反 C-10）`);
  }
} catch {
  issues.push("missing css/tokens.css");
}

/* 硬拦截 4（V3.1）：全目录禁止残留 _qa_* 临时图 + 透明图层 PNG 必须具备真 Alpha 通道（colorType 6 或 4） */
const allFiles = await walkFiles(ROOT);
const checkedPngs = new Set();
let alphaCheckedCount = 0;

for (const full of allFiles) {
  const rel = path.relative(ROOT, full);
  const baseName = path.basename(full);

  if (/^_qa_/i.test(baseName)) {
    issues.push(`${rel}: 残留临时质检图（违反 V3.1 交付前清理铁律，请删除）`);
  }

  if (baseName.toLowerCase().endsWith(".png")) {
    const mustHaveAlpha =
      stageTransparentPngRefs.has(full) ||
      (TRANSPARENT_PNG_RE.test(baseName) && !OPAQUE_BG_PNG_RE.test(baseName));
    if (mustHaveAlpha && !checkedPngs.has(full)) {
      checkedPngs.add(full);
      alphaCheckedCount += 1;
      const buf = await readFile(full);
      if (buf.length < 26 || !buf.subarray(0, 8).equals(PNG_SIG)) {
        issues.push(`${rel}: 并非合法 PNG 文件（疑似 JPEG 伪装成 PNG，违反 V3.1 真透明层铁律）`);
      } else {
        const colorType = buf[25];
        if (colorType !== 6 && colorType !== 4) {
          issues.push(`${rel}: 透明图层缺少 Alpha 通道（PNG colorType=${colorType}，须为 6=RGBA 或 4=Grayscale+Alpha）`);
        }
      }
    }
  }
}

/* 硬拦截 5b & 5c（V3.1）：CSS / 自定义 JS 零外联 + 自定义 JS 零语法错误 */
let jsCheckedCount = 0;
for (const sub of ["css", "js"]) {
  const subDir = path.join(ROOT, sub);
  const subFiles = await walkFiles(subDir);
  for (const full of subFiles) {
    const ext = path.extname(full).toLowerCase();
    const rel = path.relative(ROOT, full);
    if (sub === "css" && ext === ".css") {
      const code = stripComments(await readFile(full, "utf8"));
      const extUrls = [...code.matchAll(/url\(\s*["']?\s*(https?:)?\/\/[^)"']+/gi)].map((m) => m[0]);
      totalExternal += extUrls.length;
      if (extUrls.length) issues.push(`${rel}: CSS 存在外联资源 → ${extUrls.slice(0, 3).join(" | ")}`);
    }
    if (sub === "js" && (ext === ".js" || ext === ".mjs")) {
      const raw = await readFile(full, "utf8");
      const code = stripComments(raw);
      const extUrls = [...code.matchAll(/["'`]\s*https?:\/\/[^"'`\s]+/gi)].map((m) => m[0]);
      totalExternal += extUrls.length;
      if (extUrls.length) issues.push(`${rel}: JS 存在外联 URL → ${extUrls.slice(0, 3).join(" | ")}`);

      if (ext === ".js") {
        /* 硬拦截 7b（V3.3）：自定义 JS 禁止残留废弃声场引擎或 Web Audio 振荡器合成背景音 */
        if (/\bdata-sound-toggle\b|\bEditionsSoundEngine\b/.test(code)) {
          issues.push(`${rel}: 残留已废弃的合成声场引擎或声音开关引用（违反 V3.3 默认全程静音铁律）`);
        }
        if (/(?:AudioContext|webkitAudioContext)/.test(code) && /\bcreateOscillator\s*\(/.test(code)) {
          issues.push(`${rel}: 检出 Web Audio 振荡器合成背景音（违反 V3.3 默认全程静音铁律：纯振荡器底噪如耳鸣，已禁止）`);
        }

        jsCheckedCount += 1;
        try {
          new vm.Script(raw, { filename: rel });
        } catch (err) {
          issues.push(`${rel}: JS 语法错误 → ${err.message}`);
        }
      }
    }
  }
}

server.close();
console.log(
  `checked html: ${htmlFiles.length}  refs: ${refs.size}  fonts: 4  alpha-pngs: ${alphaCheckedCount}  js: ${jsCheckedCount}  external: ${totalExternal}  style-guards: 7`
);
if (issues.length) { console.log("VERIFY FAIL\n- " + issues.join("\n- ")); process.exit(1); }
console.log("VERIFY PASS — 首页 200、本地资源全 200、零外联、字体齐备、七条硬拦截全通过");
