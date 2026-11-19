#!/usr/bin/env node
/**
 * serve.mjs — 模板本地预览服务器（零依赖）
 *   node serve.mjs           → http://127.0.0.1:4188/
 *   PORT=5000 node serve.mjs → 换端口
 *
 * 为什么需要它：file:// 直开时 Chromium 会因 CORS 拒绝加载本地 woff2，
 * 三族字体一旦回退到系统字体，视觉效果就不成立了。
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4188);
const HOST = process.env.HOST || "127.0.0.1";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end("Not found"); return; }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(PORT, HOST, () => {
  console.log(`template preview  →  http://${HOST}:${PORT}/`);
  console.log(`root              →  ${ROOT}`);
});
