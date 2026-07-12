const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT_DIR = __dirname;
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);

loadDotEnv(path.join(ROOT_DIR, ".env"));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      sendJson(res, 400, { error: "Bad request" });
      return;
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

    if (reqUrl.pathname === "/api/chat" && req.method === "OPTIONS") {
      writeCorsHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "POST" && reqUrl.pathname === "/api/chat") {
      await handleChatProxy(req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      await handleStatic(reqUrl.pathname, res, req.method === "HEAD");
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: "Internal server error", detail: String(error && error.message ? error.message : error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  const lines = text.split(/\r?\n/);
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function handleChatProxy(req, res) {
  if (!DEEPSEEK_API_KEY) {
    sendJson(res, 500, { error: "Missing DEEPSEEK_API_KEY in .env" }, true);
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" }, true);
    return;
  }

  const messages = Array.isArray(body && body.messages) ? body.messages : [];
  if (messages.length === 0) {
    sendJson(res, 400, { error: "messages is required" }, true);
    return;
  }

  const upstreamResponse = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.9,
      messages,
    }),
  });

  const text = await upstreamResponse.text();
  if (!upstreamResponse.ok) {
    sendJson(res, upstreamResponse.status, {
      error: "DeepSeek request failed",
      detail: text.slice(0, 1000),
    }, true);
    return;
  }

  writeCorsHeaders(res);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(text);
}

async function handleStatic(pathname, res, isHead) {
  const decodedPath = decodeURIComponent(pathname);
  let target = decodedPath === "/" ? "/prototype-left-menu.html" : decodedPath;
  if (target.endsWith("/")) {
    target += "prototype-left-menu.html";
  }

  const safePath = path.normalize(target).replace(/^(\.\.(\/|\\|$))+/, "");
  const absPath = path.join(ROOT_DIR, safePath);
  const relative = path.relative(ROOT_DIR, absPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const ext = path.extname(absPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  if (isHead) {
    res.end();
    return;
  }
  fs.createReadStream(absPath).pipe(res);
}

function sendJson(res, status, payload, withCors = false) {
  if (withCors) {
    writeCorsHeaders(res);
  }
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function writeCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}
