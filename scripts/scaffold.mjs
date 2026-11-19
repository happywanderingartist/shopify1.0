#!/usr/bin/env node
/**
 * scaffold.mjs — 从 Skill 内置 starter 复制出一份可改的新页面工程。
 *
 *   node scripts/scaffold.mjs --out D:/path/to/my-page
 *   node scripts/scaffold.mjs --out D:/path/to/my-page --title "我的页面" --force
 *
 * 默认拒绝写入非空目录；--force 才覆盖。 never delete unrelated files.
 */
import { cp, readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STARTER = path.resolve(HERE, "..", "assets", "starter");

function parse(argv) {
  const out = { target: null, title: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out" && argv[i + 1]) out.target = path.resolve(argv[++i]);
    else if (a === "--title" && argv[i + 1]) out.title = argv[++i];
    else if (a === "--force") out.force = true;
    else if (a === "--help" || a === "-h") {
      console.log("usage: node scaffold.mjs --out <dir> [--title <text>] [--force]");
      process.exit(0);
    } else throw new Error(`unknown argument: ${a}`);
  }
  if (!out.target) throw new Error("--out <dir> is required");
  return out;
}

async function dirHasFiles(dir) {
  try { return (await readdir(dir)).length > 0; } catch { return false; }
}

const { target, title, force } = parse(process.argv.slice(2));
if (await dirHasFiles(target) && !force) {
  console.error(`REFUSED: ${target} is not empty. Use --force to overwrite.`);
  process.exit(2);
}
await mkdir(target, { recursive: true });
await cp(STARTER, target, { recursive: true, force: true });

if (title) {
  const file = path.join(target, "index.html");
  const html = await readFile(file, "utf8");
  if (!/<title>[\s\S]*?<\/title>/.test(html)) throw new Error("no <title> in index.html");
  await writeFile(file, html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`), "utf8");
}

// starter 内的预览图不属于页面资源，避免被复制到新工程
for (const junk of ["preview.png", "preview-body.png"]) {
  await rm(path.join(target, junk), { force: true });
}

console.log(`SCAFFOLD OK → ${target}`);
console.log("next: cd <dir> && node serve.mjs   (http://127.0.0.1:4188/)");
console.log("edit: index.html SLOT blocks, css/tokens.css --c-* / --motion-*");
