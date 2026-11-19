#!/usr/bin/env node
/**
 * extract-tokens.mjs — 从一份构建后的 CSS 中提取可复用的设计令牌候选。
 *
 *   node scripts/extract-tokens.mjs path/to/tailwind-XXXX.css --out tokens.json
 *
 * 输出 JSON：theme 变量、spacing 刻度、断点、@font-face、clamp 字号、
 * 排印类规则（按 @media 归属）、语义色类。用于给新站点重建 design-spec。
 * 脚本只做机械提取，数值是否写入规范仍需人工核对源码上下文。
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function parse(argv) {
  const o = { input: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out" && argv[i + 1]) o.out = path.resolve(argv[++i]);
    else if (!a.startsWith("--") && !o.input) o.input = path.resolve(a);
    else if (a === "--help") { console.log("usage: node extract-tokens.mjs <css> [--out <json>]"); process.exit(0); }
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!o.input) throw new Error("css path is required");
  return o;
}

/** 扫描出所有 @media 块，带条件与正文，并记录结束位置 */
function mediaBlocks(src) {
  const out = [];
  let i = 0;
  while ((i = src.indexOf("@media", i)) >= 0) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    const cond = src.slice(i + 6, open).trim();
    let depth = 0, j = open, end = open;
    for (; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") { depth--; if (depth === 0) { end = j + 1; break; } }
    }
    out.push({ cond, body: src.slice(open + 1, end - 1), start: i, end });
    i = end;
  }
  return out;
}

/** 从一个 CSS 片段里抽简单规则 {selector: declarations[]} */
function rules(src, selectorTest) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const sel = m[1].trim();
    if (sel.length < 400 && (!selectorTest || selectorTest(sel))) {
      out.push({ selector: sel, declarations: m[2].trim() });
    }
  }
  return out;
}

function themeBlock(src) {
  // Tailwind v4 构建产物可能是 @theme{...} 或 @layer theme{:root,:host{...}}
  for (const key of ["@theme", "@layer theme"]) {
    const i = src.indexOf(key);
    if (i < 0) continue;
    const open = src.indexOf("{", i);
    if (open < 0) continue;
    let depth = 0;
    for (let j = open; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(open + 1, j); }
    }
  }
  return "";
}

const { input, out } = parse(process.argv.slice(2));
const css = await readFile(input, "utf8");
const medias = mediaBlocks(css);
const theme = themeBlock(css);

const themeVars = {};
for (const m of theme.matchAll(/(--[a-z][a-z0-9-]*)\s*:\s*([^;}]+)/g)) themeVars[m[1]] = m[2].trim();

const spacing = [...css.matchAll(/-{2}spacing[^:;}]{0,20}:[^;}]+/g)].map((m) => m[0].trim());

const breakpoints = [...new Set([...css.matchAll(/min-width\s*:\s*([\d.]+)(rem|px)/g)].map((m) => {
  const v = parseFloat(m[1]);
  return m[2] === "rem" ? `${v * 16}px (${m[1]}rem)` : `${v}px`;
}))].sort((a, b) => parseFloat(a) - parseFloat(b));

const fontFaces = [];
for (const m of css.matchAll(/@font-face\s*\{([^{}]*)\}/g)) {
  const b = m[1];
  const get = (k) => (b.match(new RegExp(`${k}\\s*:\\s*([^;]+)`)) || [])[1]?.trim() || "";
  fontFaces.push({ family: get("font-family"), src: get("src").slice(0, 300), weight: get("font-weight"), display: get("font-display") });
}

const keyframes = [...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map((m) => m[1]);

const typeRe = /^\.(headline-\d|narrative-\d|bodycopy-\d|drop-cap|max-w-container|grid-template(?:-with-gaps)?|grid-padding)$/;
const typography = [{ media: "BASE", rules: rules(css, (s) => typeRe.test(s.split(",")[0].trim())) }];
for (const b of medias) {
  const rs = rules(b.body, (s) => typeRe.test(s.split(",")[0].trim()));
  if (rs.length) typography.push({ media: b.cond, rules: rs });
}

const clamps = [];
for (const m of css.matchAll(/clamp\([^)]*\)/g)) {
  const before = css.slice(0, m.index);
  let media = "BASE";
  for (const b of medias) if (b.start < m.index && b.end > m.index) { media = b.cond; break; }
  clamps.push({ media, value: m[0], context: css.slice(Math.max(0, m.index - 90), m.index + m[0].length + 40).replace(/\s+/g, " ") });
}

const colorClasses = rules(css, (s) => /^\.(bg|text|border)-(light|dark|grey|black|white)/.test(s)).slice(0, 80);

const result = {
  source: input,
  bytes: css.length,
  themeVars,
  spacing,
  breakpoints,
  fontFaces,
  keyframes,
  typography,
  clamps: clamps.slice(0, 120),
  colorClasses,
};

const json = JSON.stringify(result, null, 2);
if (out) { await writeFile(out, json, "utf8"); console.log(`extract OK → ${out} (${json.length} bytes)`); }
else console.log(json);
