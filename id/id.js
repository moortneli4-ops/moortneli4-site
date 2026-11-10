const TEXT_KEYS = ["status", "title", "charter", "chart", "convert", "note"];

const q = document.getElementById("q");
const boot = document.getElementById("boot");
const app = document.getElementById("app");
const statsEl = document.getElementById("stats");
const zonesEl = document.getElementById("zones");
const rowsEl = document.getElementById("rows");
const viewLabel = document.getElementById("view-label");
const tableEmpty = document.getElementById("table-empty");
const form = document.getElementById("entry");
const formMsg = document.getElementById("form-msg");
const saveConflict = document.getElementById("save-conflict");
const importMsg = document.getElementById("import-msg");
const importList = document.getElementById("import-list");
const importGo = document.getElementById("import-go");
const conflictsEl = document.getElementById("conflicts");
const folderInput = document.getElementById("folder");

const ZONE_COLORS = ["#f5c518", "#f3a598", "#8fd4a8", "#9eb6ff", "#f0b4c8", "#d7c4ff", "#ffd27a", "#7ec8d4", "#e7b0f0", "#c6e07a", "#f6c6a0", "#a8e0d4", "#f7a8c4", "#c8d4f8", "#e6d48a", "#b7e3c4", "#f6d0e4", "#d4c2a8"];
let registry = null;
let byId = new Map();
let screen = "list";
let zoneLock = null;
let zoneBlocksCache = [];
let mode = "used";
let statusFilter = "";
let showEmpty = false;
let showOfficial = false;
let spans = [];
let spanLabel = "";
let pendingImport = [];
let folderClashes = [];
let shownClashes = [];
let pendingManual = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function tone(status) {
  const text = status || "";
  if (!text || text === "空置") return "empty";
  if (text === "官谱") return "off";
  if (text.includes("WE")) return "we";
  if (text.includes("黑")) return "black";
  if (text.includes("红")) return "red";
  if (text.includes("紫")) return "purple";
  return "custom";
}

function indexEntries() {
  byId = new Map(registry.entries.map((row) => [row.id, row]));
}

function counts() {
  const tally = { used: 0, custom: 0, official: 0, we: 0, empty: 0 };
  for (const row of registry.entries) {
    const status = row.status || "";
    if (!status || status === "空置") tally.empty += 1;
    else tally.used += 1;
    if (status.startsWith("自制")) tally.custom += 1;
    if (status === "官谱") tally.official += 1;
    if (status === "WE" || status === "自制WE") tally.we += 1;
  }
  return tally;
}

function ruleLine() {
  const rules = new Map((registry.rules || []).map((rule) => [rule.name, rule.value]));
  const official = rules.get("官谱起点") && rules.get("官谱终点")
    ? `官谱 ${rules.get("官谱起点")}–${rules.get("官谱终点")}`
    : "";
  const we = rules.get("we起点") && rules.get("we终点")
    ? `WE ${rules.get("we起点")}–${rules.get("we终点")}`
    : "";
  return [official, we].filter(Boolean).join(" · ");
}

function renderStats() {
  const tally = counts();
  const chips = [
    ["used", "", "已占用", tally.used],
    ["status", "自制", "自制", tally.custom],
    ["status", "官谱", "官谱", tally.official],
    ["status", "WE", "WE", tally.we],
  ];
  statsEl.innerHTML = chips.map(([nextMode, filter, label, count]) => {
    const on = mode === nextMode && statusFilter === filter && !q.value.trim() && mode !== "spans" && mode !== "range";
    return `<button type="button" class="${on ? "is-on" : ""}" data-mode="${nextMode}" data-filter="${filter}">${label}<b>${count}</b></button>`;
  }).join("") + `<span class="rule">${esc(ruleLine())}</span>`;
}

function zonePalette(blocks) {
  const palette = new Map();
  for (const block of blocks) {
    if (!palette.has(block.charter)) palette.set(block.charter, ZONE_COLORS[palette.size % ZONE_COLORS.length]);
  }
  return palette;
}

function collectBlocks() {
  const blocks = [];
  for (const item of registry.reserves || []) {
    for (const [start, end] of parseRanges(item.range)) {
      blocks.push({ charter: item.charter, note: item.note || "", start, end });
    }
  }
  blocks.sort((a, b) => a.start - b.start || a.end - b.end || a.charter.localeCompare(b.charter, "zh"));
  return blocks;
}

function reservesFromBlocks(blocks) {
  const groups = new Map();
  const ordered = [...blocks].sort((a, b) => a.start - b.start || a.end - b.end);
  for (const block of ordered) {
    const key = `${block.charter}\n${block.note || ""}`;
    if (!groups.has(key)) groups.set(key, { charter: block.charter, note: block.note || "", spans: [], start: block.start });
    groups.get(key).spans.push([block.start, block.end]);
  }
  return [...groups.values()]
    .sort((a, b) => a.start - b.start)
    .map((group) => {
      const item = {
        charter: group.charter,
        range: group.spans.map(([start, end]) => (start === end ? String(start) : `${start}~${end}`)).join("；"),
      };
      if (group.note) item.note = group.note;
      return item;
    });
}

function overlapText(blocks, selfIndex) {
  const self = blocks[selfIndex];
  if (!self) return "";
  for (let index = 0; index < blocks.length; index += 1) {
    if (index === selfIndex) continue;
    const other = blocks[index];
    if (self.start <= other.end && other.start <= self.end) {
      return `编辑失败：和 ${other.charter} ${other.start}–${other.end} 撞了`;
    }
  }
  for (const run of officialBlocks("官谱")) {
    if (self.start <= run.end && run.start <= self.end) {
      const label = run.start === run.end ? String(run.start) : `${run.start}–${run.end}`;
      return `编辑失败：和 官谱 ${label} 撞了`;
    }
  }
  return "";
}

function gapHint(prev, next, occupied = []) {
  const coveredBefore = (point) => occupied
    .filter((block) => block.start < point)
    .reduce((max, block) => Math.max(max, block.end), 0);
  if (prev && next) {
    const start = coveredBefore(next.start) + 1;
    const end = next.start - 1;
    return start > end ? "这两段已经贴上了" : `空号 ${start}–${end}`;
  }
  if (!prev && next) {
    const start = coveredBefore(next.start) + 1;
    const end = next.start - 1;
    return start > end ? "前面已经贴到 1" : `空号 ${start}–${end}`;
  }
  if (prev && !next) {
    const end = occupied.reduce((max, block) => Math.max(max, block.end), prev.end);
    return `空号 ${end + 1} 往后`;
  }
  return "还没有分区，从这里加第一段";
}

function zoneFields(root) {
  const charter = root.querySelector("[name=charter]").value.trim();
  const startText = root.querySelector("[name=start]").value.trim();
  const endText = root.querySelector("[name=end]").value.trim();
  const note = root.querySelector("[name=note]").value.trim();
  if (!charter) return { error: "编辑失败：要写谱师" };
  if (!/^\d+$/.test(startText) || !/^\d+$/.test(endText)) return { error: "编辑失败：范围要是数字" };
  let start = Number(startText);
  let end = Number(endText);
  if (start > end) [start, end] = [end, start];
  if (start <= 0) return { error: "编辑失败：范围要是数字" };
  return { charter, start, end, note };
}

function zoneForm(block) {
  return `<form class="zone-form">
    <input name="charter" value="${esc(block.charter)}" aria-label="谱师">
    <input name="start" value="${block.start}" inputmode="numeric" aria-label="起点">
    <input name="end" value="${block.end}" inputmode="numeric" aria-label="终点">
    <input name="note" value="${esc(block.note || "")}" placeholder="备注，可空" aria-label="备注">
    <button type="submit">保存</button>
    <button type="button" data-act="cancel">取消</button>
    <p class="zone-fail"></p>
  </form>`;
}

function addForm(after) {
  return `<form class="gap-form" data-after="${after}">
    <input name="charter" placeholder="谱师" aria-label="谱师">
    <input name="start" inputmode="numeric" placeholder="起点" aria-label="起点">
    <input name="end" inputmode="numeric" placeholder="终点" aria-label="终点">
    <input name="note" placeholder="备注，可空" aria-label="备注">
    <button type="submit">放上</button>
    <button type="button" data-act="cancel">取消</button>
    <p class="zone-fail"></p>
  </form>`;
}

function gapHtml(after, prev, next, occupied) {
  const hint = gapHint(prev, next, occupied);
  const stuck = hint.includes("贴");
  const open = zoneLock === `add:${after}`;
  const visible = open || (!prev && !next);
  let body = `<span>${esc(hint)}</span>`;
  if (!stuck) body += open ? addForm(after) : `<button type="button" data-act="add" data-after="${after}">在这里新增</button>`;
  return `<div class="gap${visible ? " is-open" : ""}">${`<div class="gap-card">${body}</div>`}</div>`;
}

function zoneHtml(block, index, palette) {
  const color = palette.get(block.charter);
  if (zoneLock === `edit:${index}`) {
    return `<article class="zone is-editing" style="--zone:${color}">${zoneForm(block)}</article>`;
  }
  return `<article class="zone" style="--zone:${color}">
    <div class="zone-main">
      <strong>${esc(block.charter)}</strong>
      <span class="zone-range">${block.start}–${block.end}</span>
      <span>${block.end - block.start + 1} 个号</span>
      ${block.note ? `<span class="zone-note">${esc(block.note)}</span>` : ""}
    </div>
    <div class="zone-tools">
      <button type="button" data-act="edit" data-i="${index}">编辑</button>
      <button type="button" data-act="delete" data-i="${index}">删除</button>
    </div>
  </article>`;
}

function officialBlocks(kind) {
  const blocks = [];
  let start = 0;
  let end = 0;
  let count = 0;
  const flush = () => {
    if (!count) return;
    blocks.push({
      charter: kind,
      start,
      end,
      official: true,
      note: `${count} 首`,
    });
    count = 0;
  };
  for (const row of registry.entries) {
    if (blockKind(row) !== kind) {
      flush();
      continue;
    }
    if (count && row.id === end + 1) {
      end = row.id;
      count += 1;
    } else {
      flush();
      start = end = row.id;
      count = 1;
    }
  }
  flush();
  return blocks;
}

function officialZoneHtml(block) {
  const label = block.start === block.end ? String(block.start) : `${block.start}–${block.end}`;
  const color = block.charter === "WE" ? "#d7ecff" : "#efe4cc";
  return `<article class="zone official" style="--zone:${color}">
    <div class="zone-main">
      <strong>${esc(block.charter)}</strong>
      <span class="zone-range">${label}</span>
      <span>${esc(block.note)}</span>
    </div>
  </article>`;
}

function renderZones() {
  zoneBlocksCache = collectBlocks();
  const palette = zonePalette(zoneBlocksCache);
  const display = [
    ...zoneBlocksCache.map((block, index) => ({ ...block, index })),
    ...officialBlocks("WE"),
  ].sort((a, b) => a.start - b.start || a.end - b.end);
  if (!display.length) {
    zonesEl.innerHTML = gapHtml(-1, null, null);
    return;
  }
  const parts = [];
  let lastReserve = -1;
  parts.push(gapHtml(-1, null, display[0], display));
  display.forEach((block, index) => {
    parts.push(block.official ? officialZoneHtml(block) : zoneHtml(block, block.index, palette));
    if (!block.official) lastReserve = block.index;
    parts.push(gapHtml(lastReserve, block, display[index + 1] || null, display));
  });
  zonesEl.innerHTML = parts.join("");
}

const REGISTRY_RAW = "https://raw.githubusercontent.com/moortneli4-ops/moortneli4-site/registry/id-registry.json";
const DISPATCH_URL = "https://api.github.com/repos/moortneli4-ops/moortneli4-site/actions/workflows/registry-save.yml/dispatches";

async function postJson(url, payload) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    error.offline = true;
    throw error;
  }
  const type = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!type.includes("json")) {
    const error = new Error("offline");
    error.offline = true;
    throw error;
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    const error = new Error("offline");
    error.offline = true;
    throw error;
  }
  return { response, body };
}

function splitOp(op) {
  if (op.type !== "import") return [op];
  const overwriteIds = op.overwriteIds || [];
  const batches = [];
  let batch = [];
  for (const entry of op.entries || []) {
    const candidate = { type: "import", entries: batch.concat([entry]), overwriteIds };
    if (batch.length && JSON.stringify(candidate).length > 12000) {
      batches.push({ type: "import", entries: batch, overwriteIds });
      batch = [entry];
    } else {
      batch.push(entry);
    }
  }
  if (batch.length || !batches.length) batches.push({ type: "import", entries: batch, overwriteIds });
  return batches;
}

async function dispatchOp(op) {
  const token = window.REGISTRY_DISPATCH_TOKEN || "";
  if (!token) throw new Error("先点右上角保存线上密钥。");
  const response = await fetch(DISPATCH_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: "main", inputs: { op: JSON.stringify(op) } }),
  });
  if (response.status === 204) return;
  if (response.status === 401 || response.status === 403) throw new Error("密钥不对或权限不够。");
  throw new Error("没保存上。");
}

async function commitRemote(op) {
  const clone = structuredClone(registry);
  const result = RegistryCore.apply(clone, op);
  if (result.status >= 400) return { response: { ok: false, status: result.status }, body: result.body };
  if (result.changed) {
    const parts = splitOp(op);
    for (const part of parts) {
      if (JSON.stringify(part).length > 60000) throw new Error("没保存上。");
      await dispatchOp(part);
    }
    registry = clone;
    indexEntries();
  }
  return { response: { ok: true, status: 200 }, body: result.body, queued: result.changed };
}

async function saveZoneBlocks(blocks, fail) {
  const reserves = reservesFromBlocks(blocks);
  let response;
  let body;
  let queued = false;
  try {
    const local = await postJson("/api/ids/reserves", { reserves });
    response = local.response;
    body = local.body;
  } catch (error) {
    if (!error.offline) {
      if (fail) fail.textContent = "编辑失败";
      return;
    }
    try {
      const remote = await commitRemote({ type: "reserves", reserves });
      response = remote.response;
      body = remote.body;
      queued = !!remote.queued;
    } catch (remoteError) {
      if (fail) fail.textContent = remoteError.message || "没保存上。";
      return;
    }
  }
  if (!response.ok) {
    if (fail) fail.textContent = body.error || "编辑失败";
    return;
  }
  if (!queued) registry.reserves = body.reserves;
  zoneLock = null;
  renderZones();
}

function applyScreen() {
  document.getElementById("page-list").hidden = screen !== "list";
  document.getElementById("page-import").hidden = screen !== "import";
  document.getElementById("page-zones").hidden = screen !== "zones";
  document.querySelectorAll(".pages button").forEach((button) => {
    button.classList.toggle("is-on", button.dataset.page === screen);
  });
}

function inSpans(id) {
  return spans.some(([start, end]) => id >= start && id <= end);
}

function matchesQuery(row, query) {
  const blob = [row.id, row.tag, row.status, row.title, row.charter, row.chart, row.convert, row.note]
    .join(" ")
    .toLowerCase();
  return blob.includes(query);
}

function isVacant(row) {
  return !row.status || row.status === "空置";
}

function visibleRows() {
  const query = q.value.trim().toLowerCase();
  let rows;
  if (query) rows = registry.entries.filter((row) => matchesQuery(row, query));
  else if (mode === "range") {
    const from = Number(document.getElementById("from").value);
    const to = Number(document.getElementById("to").value);
    rows = registry.entries.filter((row) => row.id >= from && row.id <= to);
  } else if (mode === "spans") rows = registry.entries.filter((row) => inSpans(row.id));
  else if (mode === "status") {
    if (statusFilter === "自制") rows = registry.entries.filter((row) => (row.status || "").startsWith("自制"));
    else if (statusFilter === "WE") rows = registry.entries.filter((row) => row.status === "WE" || row.status === "自制WE");
    else rows = registry.entries.filter((row) => row.status === statusFilter);
  } else rows = registry.entries;
  if (!showEmpty) rows = rows.filter((row) => !isVacant(row));
  if (!showOfficial && statusFilter !== "官谱") rows = rows.filter((row) => row.status !== "官谱");
  return rows;
}

function viewText(total) {
  const query = q.value.trim();
  if (query) return `搜「${query}」${total} 条`;
  if (mode === "range") return `${document.getElementById("from").value}–${document.getElementById("to").value}，${total} 条`;
  if (mode === "spans") return `${spanLabel} 这段，${total} 条`;
  if (mode === "status") return `${statusFilter}，${total} 条`;
  if (showEmpty && showOfficial) return `含空置和官谱，${total} 条`;
  if (showEmpty) return `含空置，不含官谱，${total} 条`;
  if (showOfficial) return `已占用，${total} 条`;
  return `已占用，不含官谱，${total} 条`;
}

function blockKind(row) {
  if (row.status === "官谱") return "官谱";
  if (row.status === "WE" && !row.title && !row.charter) return "WE";
  if (isVacant(row)) return "空置";
  return "";
}

function collapseBlocks(rows) {
  const out = [];
  let run = null;
  const flush = () => {
    if (!run) return;
    out.push(run);
    run = null;
  };
  for (const row of rows) {
    const kind = blockKind(row);
    if (kind && run && run.kind === kind && row.id === run.end + 1) {
      run.end = row.id;
      run.count += 1;
      continue;
    }
    flush();
    if (kind) run = { block: true, kind, start: row.id, end: row.id, count: 1 };
    else out.push(row);
  }
  flush();
  return out;
}

function renderTable() {
  const songs = visibleRows();
  const list = collapseBlocks(songs);
  rowsEl.innerHTML = list.map((row) => {
    if (row.block) {
      const label = row.start === row.end ? String(row.start) : `${row.start}–${row.end}`;
      const pill = row.kind === "空置" ? "empty" : row.kind === "WE" ? "we" : "off";
      const extra = row.kind === "空置" ? " vacant" : row.kind === "WE" ? " we" : "";
      return `<tr class="block${extra}">
        <td class="num">${label}</td>
        <td><span class="pill ${pill}">${row.kind}</span></td>
        <td></td><td></td><td></td><td></td>
        <td>${row.count} ${row.kind === "空置" ? "个" : "首"}</td>
      </tr>`;
    }
    return `<tr data-id="${row.id}">
      <td class="num">${row.id}</td>
      <td><span class="pill ${tone(row.status)}">${esc(row.status || "空置")}</span></td>
      <td>${esc(row.title || "")}</td>
      <td>${esc(row.charter || "")}</td>
      <td>${esc(row.chart || "")}</td>
      <td>${esc(row.convert || "")}</td>
      <td>${esc(row.note || "")}</td>
    </tr>`;
  }).join("");
  tableEmpty.hidden = list.length > 0;
  viewLabel.textContent = viewText(songs.length);
  const tally = counts();
  document.getElementById("show-empty-label").textContent = `显示空置 ${tally.empty}`;
  document.getElementById("show-official-label").textContent = `显示官谱 ${tally.official}`;
}

function render() {
  renderStats();
  applyScreen();
  if (screen === "list") renderTable();
  if (screen === "zones" && zoneLock == null) renderZones();
}

function setField(id, value) {
  document.getElementById(id).value = value || "";
}

function ensureOption(select, value) {
  if (!value) return;
  if ([...select.options].some((option) => option.value === value)) return;
  select.add(new Option(value, value));
}

function fillForm(row) {
  setField("f-id", row ? row.id : "");
  ensureOption(document.getElementById("f-status"), row && row.status);
  ensureOption(document.getElementById("f-chart"), row && row.chart);
  ensureOption(document.getElementById("f-convert"), row && row.convert);
  setField("f-status", row ? row.status || "" : "");
  setField("f-title", row ? row.title : "");
  setField("f-charter", row ? row.charter : "");
  setField("f-chart", row ? row.chart : "");
  setField("f-convert", row ? row.convert : "");
  setField("f-note", row ? row.note : "");
  formMsg.textContent = row ? `正在改 ${row.id}` : "";
  saveConflict.hidden = true;
  pendingManual = null;
}

function readForm() {
  return {
    id: Number(document.getElementById("f-id").value),
    status: document.getElementById("f-status").value.trim(),
    title: document.getElementById("f-title").value.trim(),
    charter: document.getElementById("f-charter").value.trim(),
    chart: document.getElementById("f-chart").value.trim(),
    convert: document.getElementById("f-convert").value.trim(),
    note: document.getElementById("f-note").value.trim(),
  };
}

function detail(row) {
  return [
    ["曲名", row.title],
    ["谱师", row.charter],
    ["占用", row.status],
    ["作谱", row.chart],
    ["转谱", row.convert],
    ["说明", row.note],
  ].filter(([, value]) => value).map(([label, value]) => `${label} ${esc(value)}`).join("<br>");
}

async function saveEntry(entry, overwrite) {
  let response;
  let body;
  let queued = false;
  try {
    const local = await postJson("/api/ids", { entry, overwrite });
    response = local.response;
    body = local.body;
  } catch (error) {
    if (!error.offline) {
      formMsg.textContent = "没写上";
      return;
    }
    try {
      const remote = await commitRemote({ type: "save", entry, overwrite: !!overwrite });
      response = remote.response;
      body = remote.body;
      queued = !!remote.queued;
    } catch (remoteError) {
      formMsg.textContent = remoteError.message || "没保存上。";
      return;
    }
  }
  if (response.status === 409) {
    pendingManual = entry;
    saveConflict.hidden = false;
    saveConflict.innerHTML = `<header>这个 ID 已经有人写过</header>
      <div class="vs"><div><b>原来</b><p>${detail(body.conflict.existing)}</p></div><div><b>你刚填的</b><p>${detail(body.conflict.incoming)}</p></div></div>
      <div class="row-actions"><button type="button" id="overwrite-save">仍然写入</button></div>`;
    document.getElementById("overwrite-save").addEventListener("click", () => saveEntry(pendingManual, true));
    formMsg.textContent = "先看一眼两边，再决定要不要盖掉。";
    return;
  }
  if (!response.ok) {
    formMsg.textContent = body.error || "没写上";
    return;
  }
  const index = registry.entries.findIndex((row) => row.id === body.entry.id);
  if (index >= 0) registry.entries[index] = body.entry;
  else {
    registry.entries.push(body.entry);
    registry.entries.sort((a, b) => a.id - b.id);
  }
  indexEntries();
  saveConflict.hidden = true;
  pendingManual = null;
  formMsg.textContent = queued
    ? `已提交 ${body.entry.id}，大约一分钟后写进仓库。马上刷新可能还是旧的。`
    : `已写入 ${body.entry.id}`;
  render();
}

function formatLevel(level, decimal) {
  const whole = Number(level);
  const fraction = Number(decimal);
  if (!Number.isFinite(whole)) return "";
  if (!Number.isFinite(fraction) || fraction <= 0) return String(whole);
  const tenth = fraction >= 10 ? Math.round(fraction / 10) : fraction;
  return `${whole}.${tenth}`;
}

function childText(parent, selector) {
  return parent.querySelector(selector)?.textContent?.trim() || "";
}

function parseMusicXml(xml, file) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return null;
  const id = Number(childText(doc, "MusicData > name > id"));
  if (!Number.isInteger(id) || id <= 0) return null;
  const title = childText(doc, "MusicData > name > str");
  const artist = childText(doc, "MusicData > artistName > str");
  const charts = [...doc.querySelectorAll("fumens > MusicFumenData")]
    .map((node) => ({
      typeId: Number(childText(node, "type > id")),
      diff: childText(node, "type > str"),
      enabled: childText(node, "enable") === "true",
      level: formatLevel(childText(node, "level"), childText(node, "levelDecimal")),
      designer: childText(node, "notesDesigner"),
      file: childText(node, "file > path"),
    }))
    .filter((chart) => chart.enabled);
  charts.sort((a, b) => b.typeId - a.typeId);
  const chart = charts[0];
  const designer = charts.map((item) => item.designer).find(Boolean) || "";
  const status = chart ? { 2: "自制红", 3: "自制紫", 4: "自制黑", 5: "自制WE" }[chart.typeId] || "" : "";
  const levelBit = chart && chart.level ? `${chart.level} ${chart.diff || ""}`.trim() : "";
  return {
    id,
    title,
    charter: designer,
    status,
    chart: "已完成",
    convert: "已完成",
    note: [levelBit, artist].filter(Boolean).join(" / "),
    file,
    origin: "xml",
    chartFiles: charts.map((item) => item.file).filter(Boolean),
  };
}

function parseCueXml(xml, file) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return null;
  const id = Number(childText(doc, "name > id") || childText(doc, "id"));
  if (!Number.isInteger(id) || id <= 0) return null;
  return { id, note: "仅有 CueFile", file, cueOnly: true };
}

function fieldsDiffer(left, right) {
  return ["status", "title", "charter", "note"].some((key) => left[key] && right[key] && left[key] !== right[key]);
}

function combineWithXml(xml, other) {
  const row = {
    ...xml,
    chart: "已完成",
    convert: "已完成",
    file: [other.file, xml.file].filter(Boolean).join(" + "),
  };
  if (!row.charter && other.charter) row.charter = other.charter;
  if (!row.title && other.title) row.title = other.title;
  if (!row.status && other.status) row.status = other.status;
  if (!row.note && other.note) row.note = other.note;
  delete row.origin;
  delete row.chartFiles;
  return row;
}

function mergeLocal(left, right) {
  const row = { ...left };
  if (right.cueOnly) {
    delete row.cueOnly;
    return row;
  }
  for (const key of ["status", "title", "charter", "chart", "convert", "note", "file"]) {
    if (right[key]) row[key] = right[key];
  }
  delete row.cueOnly;
  return row;
}

function foldRecords(records) {
  const map = new Map();
  const local = [];
  const blocked = new Set();
  for (const record of records) {
    if (!record || !record.id || blocked.has(record.id)) continue;
    const prev = map.get(record.id);
    if (!prev) {
      map.set(record.id, record);
      continue;
    }
    const musicSide = prev.cueOnly && !record.cueOnly ? record : prev;
    const otherSide = musicSide === record ? prev : record;
    if (!musicSide.cueOnly && !otherSide.cueOnly) {
      const xml = musicSide.origin === "xml" ? musicSide : otherSide.origin === "xml" ? otherSide : null;
      if (xml) {
        const other = xml === musicSide ? otherSide : musicSide;
        map.set(record.id, combineWithXml(xml, other));
        continue;
      }
      if (fieldsDiffer(musicSide, otherSide)) {
        local.push({
          id: record.id,
          local: true,
          file: `${prev.file} 和 ${record.file}`,
          existing: prev,
          incoming: record,
        });
        map.delete(record.id);
        blocked.add(record.id);
        continue;
      }
    }
    map.set(record.id, mergeLocal(musicSide, otherSide));
  }
  for (const entry of map.values()) {
    delete entry.origin;
    delete entry.chartFiles;
    delete entry.cueOnly;
  }
  return { entries: [...map.values()], local };
}

function siblingChart(xmlRel, chartFile) {
  const rel = String(xmlRel || "").replace(/\\/g, "/");
  const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/") + 1) : "";
  return (dir + String(chartFile || "").replace(/\\/g, "/")).toLowerCase();
}

function findChartFile(charts, xmlRel, chartFile) {
  const wanted = siblingChart(xmlRel, chartFile);
  if (charts.has(wanted)) return charts.get(wanted);
  const base = String(chartFile || "").replace(/\\/g, "/").split("/").pop().toLowerCase();
  const dir = wanted.slice(0, wanted.length - base.length);
  for (const [path, file] of charts) {
    if (path.startsWith(dir) && path.endsWith(base)) return file;
  }
  return null;
}

async function readCreator(file) {
  const head = await file.slice(0, 4096).text();
  const match = head.match(/CREATOR\t([^\r\n\t]*)/);
  const name = match ? match[1].trim() : "";
  if (!name || name.includes("\uFFFD")) return "";
  return name;
}

async function fillCharters(records, charts) {
  for (const record of records) {
    if (!record || record.origin !== "xml" || record.charter || !record.chartFiles) continue;
    for (const chartFile of record.chartFiles) {
      const file = findChartFile(charts, record.file, chartFile);
      if (!file) continue;
      const name = await readCreator(file);
      if (!name) continue;
      record.charter = name;
      break;
    }
  }
}

async function readFolder(files) {
  const list = [...files];
  const charts = new Map();
  for (const file of list) {
    const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
    if (rel.toLowerCase().endsWith(".c2s")) charts.set(rel.toLowerCase(), file);
  }
  const picked = list.filter((file) => {
    const name = (file.webkitRelativePath || file.name).toLowerCase();
    return name.endsWith(".mgxc") || name.endsWith("music.xml") || name.endsWith("cuefile.xml");
  }).slice(0, 2000);
  importMsg.textContent = picked.length
    ? `找到 ${picked.length} 个能读的文件，正在读...`
    : "这个文件夹里没有 mgxc、Music.xml 或 CueFile。";
  const records = [];
  for (const file of picked) {
    const rel = file.webkitRelativePath || file.name;
    const lower = rel.toLowerCase();
    try {
      if (lower.endsWith(".mgxc")) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        records.push(parseMgxcBytes(bytes, rel));
      } else if (lower.endsWith("music.xml")) {
        records.push(parseMusicXml(await file.text(), rel));
      } else {
        records.push(parseCueXml(await file.text(), rel));
      }
    } catch (error) {
      records.push(null);
    }
  }
  await fillCharters(records, charts);
  const folded = foldRecords(records.filter(Boolean));
  pendingImport = folded.entries.sort((a, b) => a.id - b.id);
  folderClashes = folded.local;
  importMsg.textContent = pendingImport.length
    ? `读到 ${pendingImport.length} 条。先看列表，不需要的删掉，再确认导入。`
    : "没有能写入的条目。";
  shownClashes = folderClashes.slice();
  renderPreview();
  renderClashes();
}

function fileLabel(path) {
  const text = String(path || "");
  const parts = text.split(/[\\/]/);
  return parts[parts.length - 1] || text;
}

function renderPreview() {
  importGo.disabled = pendingImport.length === 0;
  importGo.textContent = pendingImport.length ? `确认导入这 ${pendingImport.length} 条` : "确认导入";
  if (!pendingImport.length) {
    importList.innerHTML = "";
    return;
  }
  importList.innerHTML = `<table>
    <thead><tr><th>ID</th><th>曲名</th><th>谱师</th><th>占用</th><th>作谱</th><th>转谱</th><th>说明</th><th>文件</th><th></th></tr></thead>
    <tbody>${pendingImport.map((row, index) => `<tr>
      <td class="num">${row.id}</td>
      <td>${esc(row.title || "")}</td>
      <td>${esc(row.charter || "")}</td>
      <td>${esc(row.status || "")}</td>
      <td>${esc(row.chart || "")}</td>
      <td>${esc(row.convert || "")}</td>
      <td>${esc(row.note || "")}</td>
      <td>${esc(fileLabel(row.file))}</td>
      <td><button type="button" class="drop" data-drop="${index}">删掉</button></td>
    </tr>`).join("")}</tbody>
  </table>`;
}

function renderClashes() {
  conflictsEl.innerHTML = shownClashes.map((clash, index) => `<article class="clash">
    <header>${clash.id} · ${esc(clash.file || "")}</header>
    <div class="vs">
      <div><b>${clash.local ? "前一份" : "已经登记"}</b><p>${detail(clash.existing)}</p></div>
      <div><b>${clash.local ? "后一份" : "这份文件"}</b><p>${detail(clash.incoming)}</p></div>
    </div>
    <div class="row-actions">
      ${clash.local ? `<button type="button" data-take="existing" data-i="${index}">用前一份</button>` : ""}
      <button type="button" data-take="incoming" data-i="${index}">${clash.local ? "用后一份" : "用这份覆盖"}</button>
      <button type="button" data-take="drop" data-i="${index}">先留着</button>
    </div>
  </article>`).join("");
}

async function postImport(entries, overwriteIds) {
  try {
    const local = await postJson("/api/ids/import", { entries, overwriteIds });
    if (!local.response.ok) throw new Error(local.body.error || "导入失败");
    return local.body;
  } catch (error) {
    if (!error.offline && !(error instanceof TypeError)) throw error;
    const remote = await commitRemote({ type: "import", entries, overwriteIds });
    if (!remote.response.ok) throw new Error(remote.body.error || "导入失败");
    return { ...remote.body, queued: !!remote.queued };
  }
}

async function reload() {
  let payload = null;
  try {
    const response = await fetch("/api/ids", { cache: "no-store" });
    const type = response.headers.get("content-type") || "";
    if (response.ok && type.includes("json")) payload = await response.json();
  } catch {}
  if (!payload) {
    try {
      const response = await fetch(`${REGISTRY_RAW}?t=${Date.now()}`, { cache: "no-store" });
      if (response.ok) payload = await response.json();
    } catch {}
  }
  if (!payload) {
    const response = await fetch("/data/id-registry.json", { cache: "no-store" });
    if (!response.ok) throw new Error("没打开。");
    payload = await response.json();
  }
  registry = payload;
  indexEntries();
  render();
}

async function runImport() {
  importGo.disabled = true;
  importMsg.textContent = "正在写入...";
  try {
    const overwriteIds = pendingImport.map((row) => row.id);
    const result = await postImport(pendingImport, overwriteIds);
    if (result.queued) render();
    else await reload();
    shownClashes = folderClashes.concat(result.conflicts || []);
    folderClashes = [];
    pendingImport = [];
    importMsg.textContent = `新写入 ${result.applied} 条，本来就一样的 ${result.same} 条，对不上 ${shownClashes.length} 条。${result.queued ? "大约一分钟后写进仓库，马上刷新可能还是旧的。" : ""}`;
    renderPreview();
    renderClashes();
  } catch (error) {
    importMsg.textContent = error.message;
    importGo.disabled = pendingImport.length === 0;
  }
}

async function takeClash(index, side) {
  const clash = shownClashes[index];
  if (!clash) return;
  if (side === "drop") {
    shownClashes.splice(index, 1);
    renderClashes();
    return;
  }
  const chosen = side === "existing" ? clash.existing : clash.incoming;
  const result = await postImport([{ ...chosen, file: clash.file }], [clash.id]);
  if (!result.queued) await reload();
  else render();
  const leftover = result.conflicts || [];
  shownClashes.splice(index, 1, ...leftover);
  importMsg.textContent = leftover.length ? "这份还是没盖上。" : `已按你的选择写入 ${clash.id}${result.queued ? "，大约一分钟后写进仓库。" : ""}`;
  renderClashes();
}

document.querySelector(".find").addEventListener("submit", (event) => event.preventDefault());
q.addEventListener("input", () => {
  screen = "list";
  zoneLock = null;
  render();
});
statsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  screen = "list";
  zoneLock = null;
  mode = button.dataset.mode;
  statusFilter = button.dataset.filter || "";
  spans = [];
  spanLabel = "";
  q.value = "";
  render();
});
document.querySelector(".pages").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  screen = button.dataset.page;
  zoneLock = null;
  render();
});
document.getElementById("range-go").addEventListener("click", () => {
  const fromText = document.getElementById("from").value.trim();
  const toText = document.getElementById("to").value.trim();
  if (!/^\d+$/.test(fromText) || !/^\d+$/.test(toText)) {
    viewLabel.textContent = "起点和终点都要是数字。";
    return;
  }
  const from = Number(fromText);
  const to = Number(toText);
  if (from > to) {
    document.getElementById("from").value = String(to);
    document.getElementById("to").value = String(from);
  }
  mode = "range";
  statusFilter = "";
  spans = [];
  q.value = "";
  render();
});
document.getElementById("show-empty").addEventListener("change", (event) => {
  showEmpty = event.target.checked;
  renderTable();
});
document.getElementById("show-official").addEventListener("change", (event) => {
  showOfficial = event.target.checked;
  renderTable();
});
rowsEl.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-id]");
  if (!row) return;
  screen = "import";
  zoneLock = null;
  fillForm(byId.get(Number(row.dataset.id)));
  render();
  document.getElementById("entry").scrollIntoView({ block: "nearest" });
});
document.getElementById("f-id").addEventListener("invalid", (event) => {
  event.preventDefault();
  formMsg.textContent = "ID 不能空着。";
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = readForm();
  if (!Number.isInteger(entry.id) || entry.id <= 0) {
    formMsg.textContent = "ID 不能空着。";
    return;
  }
  saveEntry(entry, false);
});
document.getElementById("form-clear").addEventListener("click", () => fillForm(null));
folderInput.addEventListener("change", () => {
  if (folderInput.files.length) readFolder(folderInput.files);
});
importGo.addEventListener("click", runImport);
importList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-drop]");
  if (!button) return;
  pendingImport.splice(Number(button.dataset.drop), 1);
  importMsg.textContent = pendingImport.length
    ? `还剩 ${pendingImport.length} 条。确认后才写入。`
    : "列表空了，没有要写入的。";
  renderPreview();
});
conflictsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-take]");
  if (!button) return;
  takeClash(Number(button.dataset.i), button.dataset.take);
});
zonesEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || !button.dataset.act || button.dataset.act === "cancel") {
    if (button && button.dataset.act === "cancel") {
      zoneLock = null;
      renderZones();
    }
    return;
  }
  if (button.dataset.act === "edit") {
    zoneLock = `edit:${button.dataset.i}`;
    renderZones();
  } else if (button.dataset.act === "add") {
    zoneLock = `add:${button.dataset.after}`;
    renderZones();
  } else if (button.dataset.act === "delete") {
    const index = Number(button.dataset.i);
    saveZoneBlocks(zoneBlocksCache.filter((_, item) => item !== index), null);
  }
});
zonesEl.addEventListener("submit", (event) => {
  const zoneFormEl = event.target;
  if (!(zoneFormEl instanceof HTMLFormElement)) return;
  event.preventDefault();
  const read = zoneFields(zoneFormEl);
  const fail = zoneFormEl.querySelector(".zone-fail");
  if (read.error) {
    fail.textContent = read.error;
    return;
  }
  const next = zoneBlocksCache.map((block) => ({ ...block }));
  const block = { charter: read.charter, start: read.start, end: read.end, note: read.note };
  let selfIndex;
  if (zoneFormEl.classList.contains("gap-form")) {
    next.push(block);
    selfIndex = next.length - 1;
  } else {
    selfIndex = Number(String(zoneLock).slice("edit:".length));
    if (!Number.isInteger(selfIndex) || selfIndex < 0 || selfIndex >= next.length) return;
    next[selfIndex] = block;
  }
  const message = overlapText(next, selfIndex);
  if (message) {
    fail.textContent = message;
    return;
  }
  saveZoneBlocks(next, fail);
});

function mountTokenUi() {
  const host = location.hostname;
  const local = host === "127.0.0.1" || host === "localhost";
  if (local) return;
  const btn = document.getElementById("token-btn");
  const dialog = document.getElementById("token-dialog");
  const input = document.getElementById("token-input");
  const form = document.getElementById("token-form");
  if (!btn || !dialog || !input || !form) return;
  btn.hidden = false;
  btn.textContent = window.REGISTRY_DISPATCH_TOKEN ? "线上密钥已存" : "线上保存密钥";
  btn.addEventListener("click", () => {
    input.value = window.REGISTRY_DISPATCH_TOKEN || "";
    dialog.showModal();
  });
  document.getElementById("token-clear")?.addEventListener("click", () => {
    saveRegistryDispatchToken("");
    btn.textContent = "线上保存密钥";
    input.value = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRegistryDispatchToken(input.value);
    btn.textContent = window.REGISTRY_DISPATCH_TOKEN ? "线上密钥已存" : "线上保存密钥";
    dialog.close();
  });
}

reload().then(() => {
  boot.hidden = true;
  app.hidden = false;
  mountTokenUi();
}).catch(() => {
  boot.textContent = "没打开。";
});
