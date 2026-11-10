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
const TEXT_FIELDS = ["tag", "status", "title", "charter", "chart", "convert", "note"];
const COMPARE_FIELDS = ["status", "title", "charter", "chart", "convert", "note"];
let registryCache = null;
let registryIndex = new Map();
let saveChain = Promise.resolve();

function loadRegistry() {
  if (!registryCache) {
    registryCache = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    reindexRegistry();
  }
  return registryCache;
}

function reindexRegistry() {
  registryIndex = new Map();
  registryCache.entries.forEach((row, index) => registryIndex.set(row.id, index));
}

function persistRegistry() {
  const snapshot = JSON.stringify(registryCache);
  saveChain = saveChain.then(() => fs.promises.writeFile(REGISTRY_PATH, snapshot));
  return saveChain;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeEntry(raw) {
  const id = Number(raw && raw.id);
  if (!Number.isInteger(id) || id <= 0 || id > 999999) return null;
  const entry = { id };
  for (const key of TEXT_FIELDS) entry[key] = cleanText(raw[key]);
  return entry;
}

function publicEntry(row) {
  const entry = { id: row.id };
  for (const key of TEXT_FIELDS) {
    if (row[key]) entry[key] = row[key];
  }
  return entry;
}

function isBlankSlot(row) {
  if (!row) return true;
  const status = row.status || "";
  const emptyRest = ["title", "charter", "chart", "convert", "note"].every((key) => !row[key]);
  return emptyRest && (status === "" || status === "空置");
}

function hasConflict(existing, incoming) {
  if (isBlankSlot(existing)) return false;
  for (const key of COMPARE_FIELDS) {
    const next = incoming[key] || "";
    if (!next) continue;
    const prev = existing[key] || "";
    if (!prev || prev === "空置") continue;
    if (prev !== next) return true;
  }
  return false;
}

function manualConflict(existing, incoming) {
  if (isBlankSlot(existing)) return false;
  for (const key of COMPARE_FIELDS) {
    const prev = existing[key] || "";
    const next = incoming[key] || "";
    if (prev === next) continue;
    if (!prev || prev === "空置") continue;
    return true;
  }
  return false;
}

function mergeEntry(existing, incoming) {
  const row = existing ? { ...existing, id: existing.id } : { id: incoming.id };
  for (const key of TEXT_FIELDS) {
    if (incoming[key]) row[key] = incoming[key];
  }
  return publicEntry(row);
}

function replaceEntry(existing, incoming) {
  const compact = { id: incoming.id };
  for (const key of TEXT_FIELDS) {
    const value = key === "tag" && !incoming.tag && existing ? existing.tag || "" : incoming[key];
    if (value) compact[key] = value;
  }
  return compact;
}

function putEntry(row) {
  const index = registryIndex.get(row.id);
  if (index == null) {
    const entries = registryCache.entries;
    let lo = 0;
    let hi = entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].id < row.id) lo = mid + 1;
      else hi = mid;
    }
    entries.splice(lo, 0, row);
    reindexRegistry();
    return;
  }
  registryCache.entries[index] = row;
}

async function handleIdSave(req, res) {
  const body = await readJsonBody(req);
  loadRegistry();
  const incoming = normalizeEntry(body.entry || body);
  if (!incoming) {
    sendJson(res, 400, { error: "ID 不能空着" });
    return;
  }
  const index = registryIndex.get(incoming.id);
  const existing = index == null ? null : registryCache.entries[index];
  if (existing && manualConflict(existing, incoming) && !body.overwrite) {
    sendJson(res, 409, {
      conflict: { existing: publicEntry(existing), incoming: publicEntry(incoming) },
    });
    return;
  }
  const saved = replaceEntry(existing, incoming);
  putEntry(saved);
  registryCache.updated = new Date().toISOString();
  await persistRegistry();
  sendJson(res, 200, { entry: saved });
}

async function handleIdImport(req, res) {
  const body = await readJsonBody(req);
  loadRegistry();
  const overwrite = new Set((body.overwriteIds || []).map(Number));
  const conflicts = [];
  let applied = 0;
  let same = 0;
  for (const raw of body.entries || []) {
    const incoming = normalizeEntry(raw);
    if (!incoming) continue;
    if (raw.cueOnly) {
      const known = registryIndex.get(incoming.id);
      const existingKnown = known == null ? null : registryCache.entries[known];
      if (existingKnown && !isBlankSlot(existingKnown)) {
        same += 1;
        continue;
      }
    }
    const index = registryIndex.get(incoming.id);
    const existing = index == null ? null : registryCache.entries[index];
    if (existing && hasConflict(existing, incoming) && !overwrite.has(incoming.id)) {
      conflicts.push({
        id: incoming.id,
        file: cleanText(raw.file),
        existing: publicEntry(existing),
        incoming: publicEntry(incoming),
      });
      continue;
    }
    const merged = mergeEntry(existing, incoming);
    const before = existing ? JSON.stringify(publicEntry(existing)) : "";
    if (before && before === JSON.stringify(merged)) {
      same += 1;
      continue;
    }
    putEntry(merged);
    applied += 1;
  }
  if (applied) {
    registryCache.updated = new Date().toISOString();
    await persistRegistry();
  }
  sendJson(res, 200, { applied, same, conflicts });
}

function parseReserveSpans(text) {
  const spans = [];
  for (const part of String(text || "").split(/[、；，,]/)) {
    const range = part.match(/(\d+)\s*[-~～]\s*(\d+)/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      spans.push([Math.min(start, end), Math.max(start, end)]);
      continue;
    }
    const single = part.match(/(\d+)/);
    if (single) spans.push([Number(single[1]), Number(single[1])]);
  }
  return spans;
}

async function handleReserveSave(req, res) {
  const body = await readJsonBody(req);
  loadRegistry();
  if (!Array.isArray(body.reserves)) {
    sendJson(res, 400, { error: "编辑失败" });
    return;
  }
  const blocks = [];
  for (const item of body.reserves) {
    const charter = cleanText(item && item.charter);
    if (!charter) {
      sendJson(res, 409, { error: "编辑失败：要写谱师" });
      return;
    }
    const spans = parseReserveSpans(item.range);
    if (!spans.length) {
      sendJson(res, 409, { error: "编辑失败：范围要是数字" });
      return;
    }
    for (const [start, end] of spans) {
      if (start <= 0 || end > 999999) {
        sendJson(res, 409, { error: "编辑失败：范围要是数字" });
        return;
      }
      blocks.push({ charter, start, end, note: cleanText(item.note) });
    }
  }
  blocks.sort((a, b) => a.start - b.start || a.end - b.end);
  for (let i = 1; i < blocks.length; i += 1) {
    if (blocks[i].start <= blocks[i - 1].end) {
      const other = blocks[i - 1];
      sendJson(res, 409, { error: `编辑失败：和 ${other.charter} ${other.start}–${other.end} 撞了` });
      return;
    }
  }
  const grouped = new Map();
  for (const block of blocks) {
    const key = `${block.charter}\n${block.note}`;
    if (!grouped.has(key)) grouped.set(key, { charter: block.charter, note: block.note, spans: [], start: block.start });
    grouped.get(key).spans.push(block);
  }
  const reserves = [...grouped.values()]
    .sort((a, b) => a.start - b.start)
    .map((group) => {
      const item = {
        charter: group.charter,
        range: group.spans.map((span) => (span.start === span.end ? String(span.start) : `${span.start}~${span.end}`)).join("；"),
      };
      if (group.note) item.note = group.note;
      return item;
    });
  registryCache.reserves = reserves;
  registryCache.updated = new Date().toISOString();
  await persistRegistry();
  sendJson(res, 200, { reserves });
}
