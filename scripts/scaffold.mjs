#!/usr/bin/env node
/**
 * scaffold.mjs — 从 Skill 内置 starter 复制出一份可改的新页面工程。
 *
 *   node scripts/scaffold.mjs --out D:/path/to/my-page
 *   node scripts/scaffold.mjs --out D:/path/to/my-page --title "我的页面" --template portfolio --force
 *
 * 参数：
 *   --out <dir>                    目标输出目录（必填）
 *   --title <text>                 注入首页 <title>
 *   --template editorial|portfolio 选择首页范式（默认 editorial；portfolio 将 3D 舞台范式提为 index.html）
 *   --force                        允许写入非空目录（绝不删除无关文件）
 */
import { cp, readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STARTER = path.resolve(HERE, "..", "assets", "starter");

function parse(argv) {
  const out = { target: null, title: null, template: "editorial", force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out" && argv[i + 1]) out.target = path.resolve(argv[++i]);
    else if (a === "--title" && argv[i + 1]) out.title = argv[++i];
    else if (a === "--template" && argv[i + 1]) out.template = argv[++i];
    else if (a === "--force") out.force = true;
    else if (a === "--help" || a === "-h") {
      console.log("usage: node scaffold.mjs --out <dir> [--title <text>] [--template editorial|portfolio] [--force]");
      process.exit(0);
    } else throw new Error(`unknown argument: ${a}`);
  }
  if (!out.target) throw new Error("--out <dir> is required");
  if (out.template !== "editorial" && out.template !== "portfolio") {
    throw new Error(`--template must be "editorial" or "portfolio" (got "${out.template}")`);
  }
  return out;
}

async function dirHasFiles(dir) {
  try { return (await readdir(dir)).length > 0; } catch { return false; }
}

const { target, title, template, force } = parse(process.argv.slice(2));
if (await dirHasFiles(target) && !force) {
  console.error(`REFUSED: ${target} is not empty. Use --force to overwrite.`);
  process.exit(2);
}
await mkdir(target, { recursive: true });
await cp(STARTER, target, { recursive: true, force: true });

if (template === "portfolio") {
  const portPath = path.join(target, "portfolio.html");
  const idxPath = path.join(target, "index.html");
  const portHtml = await readFile(portPath, "utf8");
  await writeFile(idxPath, portHtml, "utf8");
  await rm(portPath, { force: true });
}

if (title) {
  const file = path.join(target, "index.html");
  const html = await readFile(file, "utf8");
  if (!/<title>[\s\S]*?<\/title>/.test(html)) throw new Error("no <title> in index.html");
  await writeFile(file, html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`), "utf8");
}

// 清理预览图与任何临时 _qa_* 质检图，避免带入新工程
for (const entry of await readdir(target)) {
  if (entry === "preview.png" || entry === "preview-body.png" || /^_qa_/i.test(entry)) {
    await rm(path.join(target, entry), { force: true });
  }
}

console.log(`SCAFFOLD OK (${template}) → ${target}`);
console.log("next:   cd <dir> && node serve.mjs   (http://127.0.0.1:4188/)");
console.log("verify: node scripts/verify.mjs <dir>   (六重零依赖硬拦截)");
console.log("edit:   index.html SLOT blocks, css/tokens.css (--c-* 禁改 --c-page-bg 与 13.9% 侧栏), js/ambient-director.js");
