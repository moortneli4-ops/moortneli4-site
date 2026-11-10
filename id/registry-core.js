(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RegistryCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const TEXT_FIELDS = ["tag", "status", "title", "charter", "chart", "convert", "note"];
  const COMPARE_FIELDS = ["status", "title", "charter", "chart", "convert", "note"];

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

  function findEntry(entries, id) {
    let lo = 0;
    let hi = entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].id < id) lo = mid + 1;
      else hi = mid;
    }
    if (entries[lo] && entries[lo].id === id) return lo;
    return -1;
  }

  function putEntry(registry, row) {
    const entries = registry.entries;
    let lo = 0;
    let hi = entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].id < row.id) lo = mid + 1;
      else hi = mid;
    }
    if (entries[lo] && entries[lo].id === row.id) entries[lo] = row;
    else entries.splice(lo, 0, row);
  }

  function touch(registry) {
    registry.updated = new Date().toISOString();
  }

  function applySave(registry, op) {
    const incoming = normalizeEntry(op.entry || op);
    if (!incoming) return { status: 400, body: { error: "ID 不能空着" }, changed: false };
    const index = findEntry(registry.entries, incoming.id);
    const existing = index < 0 ? null : registry.entries[index];
    if (existing && manualConflict(existing, incoming) && !op.overwrite) {
      return {
        status: 409,
        changed: false,
        body: { conflict: { existing: publicEntry(existing), incoming: publicEntry(incoming) } },
      };
    }
    const saved = replaceEntry(existing, incoming);
    putEntry(registry, saved);
    touch(registry);
    return { status: 200, changed: true, body: { entry: saved } };
  }

  function applyImport(registry, op) {
    const overwrite = new Set((op.overwriteIds || []).map(Number));
    const conflicts = [];
    let applied = 0;
    let same = 0;
    for (const raw of op.entries || []) {
      const incoming = normalizeEntry(raw);
      if (!incoming) continue;
      const index = findEntry(registry.entries, incoming.id);
      const existing = index < 0 ? null : registry.entries[index];
      if (raw.cueOnly && existing && !isBlankSlot(existing)) {
        same += 1;
        continue;
      }
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
      putEntry(registry, merged);
      applied += 1;
    }
    if (applied) touch(registry);
    return { status: 200, changed: applied > 0, body: { applied, same, conflicts } };
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

  function applyReserves(registry, op) {
    if (!Array.isArray(op.reserves)) return { status: 400, body: { error: "编辑失败" }, changed: false };
    const blocks = [];
    for (const item of op.reserves) {
      const charter = cleanText(item && item.charter);
      if (!charter) return { status: 409, body: { error: "编辑失败：要写谱师" }, changed: false };
      const spans = parseReserveSpans(item.range);
      if (!spans.length) return { status: 409, body: { error: "编辑失败：范围要是数字" }, changed: false };
      for (const [start, end] of spans) {
        if (start <= 0 || end > 999999) return { status: 409, body: { error: "编辑失败：范围要是数字" }, changed: false };
        blocks.push({ charter, start, end, note: cleanText(item.note) });
      }
    }
    blocks.sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 1; i < blocks.length; i += 1) {
      if (blocks[i].start <= blocks[i - 1].end) {
        const other = blocks[i - 1];
        return { status: 409, body: { error: `编辑失败：和 ${other.charter} ${other.start}–${other.end} 撞了` }, changed: false };
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
    registry.reserves = reserves;
    touch(registry);
    return { status: 200, changed: true, body: { reserves } };
  }

  function applyReplace(registry, op) {
    const incoming = op.registry;
    if (!incoming || !Array.isArray(incoming.entries)) {
      return { status: 400, body: { error: "备份格式不对" }, changed: false };
    }
    registry.entries = incoming.entries.map((row) => normalizeEntry(row)).filter(Boolean);
    registry.entries.sort((a, b) => a.id - b.id);
    registry.reserves = Array.isArray(incoming.reserves) ? incoming.reserves : [];
    if (Array.isArray(incoming.rules)) registry.rules = incoming.rules;
    touch(registry);
    return { status: 200, changed: true, body: { replaced: true, entries: registry.entries.length } };
  }

  function apply(registry, op) {
    if (!op || op.type === "save") return applySave(registry, op || {});
    if (op.type === "import") return applyImport(registry, op);
    if (op.type === "reserves") return applyReserves(registry, op);
    if (op.type === "replace") return applyReplace(registry, op);
    return { status: 400, body: { error: "没写上" }, changed: false };
  }

  return { apply };
});
