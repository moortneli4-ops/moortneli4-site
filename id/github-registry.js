"use strict";

const DEFAULT_REPO = "moortneli4-ops/moortneli4-site";
const DEFAULT_BRANCH = "registry";
const DEFAULT_PATH = "id-registry.json";

function resolveConfig(env) {
  const token = env && env.GITHUB_TOKEN;
  if (!token) return null;
  return {
    token,
    repo: (env.GITHUB_REPO || DEFAULT_REPO).trim(),
    branch: (env.GITHUB_REGISTRY_BRANCH || DEFAULT_BRANCH).trim(),
    path: (env.GITHUB_REGISTRY_PATH || DEFAULT_PATH).trim(),
  };
}

async function ghFetch(cfg, url, init) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${cfg.token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(init && init.headers ? init.headers : {}),
  };
  return fetch(url, { ...init, headers });
}

async function loadRegistry(cfg) {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${encodeURIComponent(cfg.path)}?ref=${encodeURIComponent(cfg.branch)}`;
  const response = await ghFetch(cfg, url);
  if (response.status === 404) {
    return { registry: { entries: [], reserves: [], rules: [], updated: new Date().toISOString() }, sha: null };
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`registry read ${response.status}: ${text.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = Buffer.from(data.content, "base64").toString("utf8").replace(/^\uFEFF/, "");
  return { registry: JSON.parse(text), sha: data.sha };
}

async function saveRegistry(cfg, registry, sha) {
  const content = Buffer.from(JSON.stringify(registry), "utf8").toString("base64");
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${encodeURIComponent(cfg.path)}`;
  const body = {
    message: "Update the ID registry",
    content,
    branch: cfg.branch,
    ...(sha ? { sha } : {}),
  };
  const response = await ghFetch(cfg, url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 409) {
    const err = new Error("registry conflict");
    err.code = "CONFLICT";
    throw err;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`registry write ${response.status}: ${text.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.content.sha;
}

function applyOpWithCore(core, registry, op) {
  return core.apply(registry, op);
}

async function applyRegistryOp(env, op) {
  const cfg = resolveConfig(env);
  if (!cfg) throw new Error("GITHUB_TOKEN not set");
  const core = require("./registry-core");
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { registry, sha } = await loadRegistry(cfg);
    const result = applyOpWithCore(core, registry, op);
    if (!result.changed) return { result, registry };
    try {
      await saveRegistry(cfg, registry, sha);
      return { result, registry };
    } catch (error) {
      lastError = error;
      if (error.code !== "CONFLICT") throw error;
    }
  }
  throw lastError || new Error("registry conflict");
}

async function fetchRegistry(env) {
  const cfg = resolveConfig(env);
  if (!cfg) throw new Error("GITHUB_TOKEN not set");
  const { registry } = await loadRegistry(cfg);
  return registry;
}

async function replaceRegistry(env, registry) {
  const cfg = resolveConfig(env);
  if (!cfg) throw new Error("GITHUB_TOKEN not set");
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { sha } = await loadRegistry(cfg);
    try {
      await saveRegistry(cfg, registry, sha);
      return;
    } catch (error) {
      lastError = error;
      if (error.code !== "CONFLICT") throw error;
    }
  }
  throw lastError || new Error("registry conflict");
}

module.exports = {
  resolveConfig,
  loadRegistry,
  saveRegistry,
  applyRegistryOp,
  fetchRegistry,
  replaceRegistry,
};
