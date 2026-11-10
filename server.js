const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT_DIR = __dirname;
const LEGACY_DIR = path.resolve(__dirname, "..", "moortneli4-site");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8788);

loadDotEnv(path.join(ROOT_DIR, ".env"));
loadDotEnv(path.join(LEGACY_DIR, ".env"));

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
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".zip": "application/zip",
  ".7z": "application/x-7z-compressed",
  ".exe": "application/vnd.microsoft.portable-executable",
  ".lua": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
    if (reqUrl.pathname === "/api/chat" && req.method === "OPTIONS") {
      writeCors(res);
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === "POST" && reqUrl.pathname === "/api/chat") {
      await handleChat(req, res);
      return;
    }
    if (req.method === "GET" && reqUrl.pathname === "/api/ids") {
      sendJson(res, 200, loadRegistry());
      return;
    }
    if (req.method === "POST" && reqUrl.pathname === "/api/ids") {
      await handleIdSave(req, res);
      return;
    }
    if (req.method === "POST" && reqUrl.pathname === "/api/ids/import") {
      await handleIdImport(req, res);
      return;
    }
    if (req.method === "POST" && reqUrl.pathname === "/api/ids/reserves") {
      await handleReserveSave(req, res);
      return;
    }
    if (req.method === "GET" || req.method === "HEAD") {
      await handleStatic(reqUrl.pathname, res, req.method === "HEAD");
      return;
    }
    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: String(error && error.message ? error.message : error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`v2 site: http://${HOST}:${PORT}`);
});

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const lineRaw of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function handleChat(req, res) {
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
  const upstream = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, temperature: 0.9, messages }),
  });
  const text = await upstream.text();
  writeCors(res);
  res.writeHead(upstream.ok ? 200 : upstream.status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(text);
}

async function handleStatic(pathname, res, isHead) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/" || decoded.endsWith("/")) {
    const indexPath = decoded === "/"
      ? path.join(ROOT_DIR, "index.html")
      : path.join(ROOT_DIR, decoded, "index.html");
    return sendFile(indexPath, res, isHead);
  }
  if (decoded.startsWith("/legacy/")) {
    const rel = decoded.slice("/legacy/".length);
    return sendFile(path.join(LEGACY_DIR, rel), res, isHead, LEGACY_DIR);
  }
  return sendFile(path.join(ROOT_DIR, decoded), res, isHead, ROOT_DIR);
}

function sendFile(absPath, res, isHead, root = ROOT_DIR) {
  const normalized = path.normalize(absPath);
  const relative = path.relative(root, normalized);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }
  if (fs.existsSync(normalized) && fs.statSync(normalized).isDirectory()) {
    return sendFile(path.join(normalized, "index.html"), res, isHead, root);
  }
  if (!fs.existsSync(normalized)) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  const ext = path.extname(normalized).toLowerCase();
  const headers = { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" };
  if (normalized.includes(`${path.sep}collect${path.sep}files${path.sep}`)) {
    headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(normalized))}`;
  }
  res.writeHead(200, headers);
  if (isHead) {
    res.end();
    return;
  }
  fs.createReadStream(normalized).pipe(res);
}

function sendJson(res, status, payload, withCors = false) {
  if (withCors) writeCors(res);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function writeCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    req.on("data", (c) => {
      size += c.length;
      if (size > 8 * 1024 * 1024) {
        settled = true;
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (settled) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", (e) => {
      if (!settled) reject(e);
    });
  });
}

const REGISTRY_PATH = path.join(ROOT_DIR, "data", "id-registry.json");
const registryCore = require("./id/registry-core");
let registryCache = null;
let saveChain = Promise.resolve();

function loadRegistry() {
  if (!registryCache) {
    registryCache = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  }
  return registryCache;
}

function persistRegistry() {
  const snapshot = JSON.stringify(registryCache);
  saveChain = saveChain.then(() => fs.promises.writeFile(REGISTRY_PATH, snapshot));
  return saveChain;
}

async function handleIdSave(req, res) {
  const body = await readJsonBody(req);
  loadRegistry();
  const result = registryCore.apply(registryCache, { type: "save", entry: body.entry || body, overwrite: !!body.overwrite });
  if (result.changed) await persistRegistry();
  sendJson(res, result.status, result.body);
}

async function handleIdImport(req, res) {
  const body = await readJsonBody(req);
  loadRegistry();
  const result = registryCore.apply(registryCache, { type: "import", entries: body.entries || [], overwriteIds: body.overwriteIds || [] });
  if (result.changed) await persistRegistry();
  sendJson(res, result.status, result.body);
}

async function handleReserveSave(req, res) {
  const body = await readJsonBody(req);
  loadRegistry();
  const result = registryCore.apply(registryCache, { type: "reserves", reserves: body.reserves });
  if (result.changed) await persistRegistry();
  sendJson(res, result.status, result.body);
}
