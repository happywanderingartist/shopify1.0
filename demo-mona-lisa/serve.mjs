#!/usr/bin/env node
/**
 * serve.mjs — 模板本地预览服务器（零依赖，支持 IPv4 + IPv6 双栈）
 *   node serve.mjs           → http://localhost:4188/
 *   PORT=3000 node serve.mjs → 监听 3000 端口（默认双栈，同时接受 127.0.0.1 与 ::1）
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4188);
const HOST = process.env.HOST || "";
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

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
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
    if (req.method === "HEAD") {
      res.end();
    } else {
      res.end(body);
    }
  } catch {
    res.writeHead(404).end("Not found");
  }
});

const onListen = () => {
  const displayHost = HOST && HOST !== "0.0.0.0" && HOST !== "::" ? HOST : "localhost";
  console.log(`Server running at http://${displayHost}:${PORT}/`);
  console.log(`root → ${ROOT}`);
};

if (HOST) {
  server.listen(PORT, HOST, onListen);
} else {
  server.listen(PORT, onListen);
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
  });
}
