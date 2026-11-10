import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const gh = require("../../../id/github-registry.js");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

function envFromWorker(env) {
  return {
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    GITHUB_REPO: env.GITHUB_REPO,
    GITHUB_REGISTRY_BRANCH: env.GITHUB_REGISTRY_BRANCH,
    GITHUB_REGISTRY_PATH: env.GITHUB_REGISTRY_PATH,
  };
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (!env.GITHUB_TOKEN) {
      return jsonResponse(503, { error: "Registry API 未配置密钥。" });
    }
    const url = new URL(request.url);
    const workerEnv = envFromWorker(env);

    if (request.method === "GET" && url.pathname === "/api/ids") {
      try {
        const registry = await gh.fetchRegistry(workerEnv);
        return jsonResponse(200, registry);
      } catch (error) {
        return jsonResponse(500, { error: String(error.message || error) });
      }
    }

    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" });
    }

    let op;
    try {
      const body = await readJson(request);
      if (url.pathname === "/api/ids") {
        op = { type: "save", entry: body.entry || body, overwrite: !!body.overwrite };
      } else if (url.pathname === "/api/ids/import") {
        op = { type: "import", entries: body.entries || [], overwriteIds: body.overwriteIds || [] };
      } else if (url.pathname === "/api/ids/reserves") {
        op = { type: "reserves", reserves: body.reserves };
      } else if (url.pathname === "/api/ids/replace") {
        op = { type: "replace", registry: body.registry || body };
      } else {
        return jsonResponse(404, { error: "Not found" });
      }
    } catch {
      return jsonResponse(400, { error: "Invalid JSON" });
    }

    try {
      const { result, registry } = await gh.applyRegistryOp(workerEnv, op);
      return jsonResponse(result.status, { ...result.body, registry: result.changed ? registry : undefined });
    } catch (error) {
      return jsonResponse(500, { error: String(error.message || error) });
    }
  },
};
