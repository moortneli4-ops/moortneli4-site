"use strict";

const gh = require("../id/github-registry");

const MAX_BODY_BYTES = 512 * 1024;
const WINDOW_MS = 60 * 1000;
const WRITE_LIMIT = 8;
const buckets = new Map();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};

function send(res, status, payload) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) res.setHeader(key, value);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(payload);
}

function getClientKey(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || String(req.headers["x-real-ip"] || "unknown");
}

function checkRateLimit(req) {
  const now = Date.now();
  const key = getClientKey(req);
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start >= WINDOW_MS) {
    bucket = { start: now, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  // Opportunistic cleanup keeps warm serverless instances bounded.
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) if (now - v.start >= WINDOW_MS) buckets.delete(k);
  }
  return bucket.count <= WRITE_LIMIT;
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_BODY_BYTES) {
      const error = new Error("请求内容过大");
      error.status = 413;
      throw error;
    }
    return req.body ? JSON.parse(req.body) : {};
  }
  return {};
}

function cleanEntry(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const entry = { id: raw.id };
  for (const key of ["tag", "status", "title", "charter", "chart", "convert", "note"]) {
    if (raw[key] !== undefined) entry[key] = String(raw[key]).slice(0, key === "note" ? 2000 : 300);
  }
  if (raw.file !== undefined) entry.file = String(raw.file).slice(0, 300);
  if (raw.cueOnly !== undefined) entry.cueOnly = !!raw.cueOnly;
  return entry;
}

async function handle(req, res, action) {
  if (req.method === "OPTIONS") {
    for (const [key, value] of Object.entries(CORS_HEADERS)) res.setHeader(key, value);
    return res.status(204).end();
  }

  if (action === "read" && req.method === "GET") {
    try {
      const registry = await gh.fetchRegistry(process.env);
      return send(res, 200, registry);
    } catch (error) {
      console.error("Registry read failed:", error);
      return send(res, 503, { error: "登记数据暂时无法读取，请稍后重试。" });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", action === "read" ? "GET, POST, OPTIONS" : "POST, OPTIONS");
    return send(res, 405, { error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) return send(res, 503, { error: "登记 API 尚未配置 GitHub 密钥。" });

  if (!checkRateLimit(req)) {
    res.setHeader("Retry-After", "60");
    return send(res, 429, { error: "操作过于频繁，请一分钟后再试。" });
  }

  let body;
  try {
    const declaredLength = Number(req.headers["content-length"] || 0);
    if (declaredLength > MAX_BODY_BYTES) return send(res, 413, { error: "请求内容过大。" });
    body = readBody(req);
  } catch (error) {
    return send(res, error.status || 400, { error: error.status === 413 ? error.message : "请求内容不是有效 JSON。" });
  }

  let op;
  if (action === "save") {
    op = { type: "save", entry: cleanEntry(body.entry || body), overwrite: !!body.overwrite };
    if (!op.entry) return send(res, 400, { error: "登记内容格式不正确。" });
  } else if (action === "import") {
    if (!Array.isArray(body.entries) || body.entries.length > 500) {
      return send(res, 400, { error: "批量导入格式不正确（单次最多 500 条）。" });
    }
    op = {
      type: "import",
      entries: body.entries.map(cleanEntry).filter(Boolean),
      overwriteIds: Array.isArray(body.overwriteIds) ? body.overwriteIds.slice(0, 500) : [],
    };
  } else if (action === "reserves") {
    if (!Array.isArray(body.reserves) || body.reserves.length > 200) {
      return send(res, 400, { error: "预留数据格式不正确。" });
    }
    op = {
      type: "reserves",
      reserves: body.reserves.map((item) => ({
        charter: String(item && item.charter || "").slice(0, 120),
        range: String(item && item.range || "").slice(0, 2000),
        note: String(item && item.note || "").slice(0, 500),
      })),
    };
  } else {
    return send(res, 404, { error: "Not found" });
  }

  try {
    const { result, registry } = await gh.applyRegistryOp(process.env, op);
    return send(res, result.status, {
      ...result.body,
      ...(result.changed ? { registry } : {}),
    });
  } catch (error) {
    console.error("Registry write failed:", error);
    if (error && error.code === "CONFLICT") {
      return send(res, 409, { error: "多人同时修改导致冲突，请刷新后重试。" });
    }
    return send(res, 503, { error: "登记暂时保存失败，请稍后重试。" });
  }
}

module.exports = { handle };
