const DIFFS = [
  ["any", "不限"],
  ["bas", "BASIC"],
  ["adv", "ADVANCED"],
  ["exp", "EXPERT"],
  ["mas", "MASTER"],
  ["ult", "ULTIMA"],
  ["we", "WE"],
];
const DIFF_KEYS = ["bas", "adv", "exp", "mas", "ult"];
const GENRE_ORDER = ["POPS & ANIME", "niconico", "東方Project", "VARIETY", "イロドリミドリ", "ゲキマイ", "ORIGINAL", "WORLD'S END"];
const KANJI_ORDER = ["狂", "蔵", "撃", "舞", "招", "歌", "弾", "光", "割", "両", "布", "分", "嘘", "終", "翔", "跳", "敷", "改", "戻", "速", "時", "止", "避", "！", "？", "半", "覚", "謎"];
const NOTE_LABEL = [
  ["tap", "Tap"],
  ["hold", "Hold"],
  ["slide", "Slide"],
  ["air", "Air"],
  ["flick", "Flick"],
];

const state = {
  genre: new Set(),
  diff: new Set(),
  level: new Set(),
  attr: new Set(),
  removed: false,
  q: "",
  bpmMin: null,
  bpmMax: null,
};
const openIds = new Set();
let songs = [];
let limit = 100;

const boot = document.getElementById("boot");
const app = document.getElementById("app");
const errorBox = document.getElementById("error");
const q = document.getElementById("q");
const bpmMinEl = document.getElementById("bpm-min");
const bpmMaxEl = document.getElementById("bpm-max");
const bpmAny = document.getElementById("bpm-any");
const list = document.getElementById("list");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clear");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function isWe(song) {
  return String(song.kind || "").startsWith("we");
}

function isRemoved(song) {
  return String(song.kind || "").includes("removed");
}

function parseWe(raw) {
  const text = String(raw || "").replace(/^_+/, "");
  const match = text.match(/^(.*?)(\d+)$/);
  if (!match) return { kanji: text, star: "", label: text };
  return { kanji: match[1], star: match[2], label: text };
}

function levelValue(text) {
  const match = String(text).match(/(\d+)(\+)?/);
  if (!match) return 0;
  return Number(match[1]) + (match[2] ? 0.5 : 0);
}

function byOrder(list, order) {
  return [...list].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "ja");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function genreOptions() {
  const set = new Set(songs.map((song) => song.genre).filter(Boolean));
  return byOrder(set, GENRE_ORDER);
}

function standardDiffs() {
  return [...state.diff].filter((key) => key !== "we");
}

function levelOptions() {
  const onlyWe = state.diff.size === 1 && state.diff.has("we");
  if (onlyWe) {
    const stars = new Set();
    songs.forEach((song) => {
      if (!isWe(song)) return;
      const { star } = parseWe(song.weLevel);
      if (star) stars.add(star);
    });
    return [...stars].sort((a, b) => Number(a) - Number(b));
  }
  const picked = standardDiffs();
  const keys = picked.length ? picked : DIFF_KEYS;
  const set = new Set();
  songs.forEach((song) => {
    if (isWe(song) || !song.levels) return;
    keys.forEach((key) => {
      if (song.levels[key]) set.add(song.levels[key]);
    });
  });
  return [...set].sort((a, b) => levelValue(a) - levelValue(b) || a.localeCompare(b));
}

function attrOptions() {
  const set = new Set();
  songs.forEach((song) => {
    if (!isWe(song)) return;
    const { kanji } = parseWe(song.weLevel);
    if (kanji) set.add(kanji);
  });
  return byOrder(set, KANJI_ORDER);
}

function keepChoices() {
  const levels = new Set(levelOptions());
  [...state.level].forEach((level) => {
    if (!levels.has(level)) state.level.delete(level);
  });
  if (!state.diff.has("we")) state.attr.clear();
  else {
    const attrs = new Set(attrOptions());
    [...state.attr].forEach((attr) => {
      if (!attrs.has(attr)) state.attr.delete(attr);
    });
  }
}

function toggleChoice(set, value, allValue) {
  if (value === allValue) {
    set.clear();
    return;
  }
  if (set.has(value)) set.delete(value);
  else set.add(value);
}

function queryHit(song) {
  const query = state.q.trim().toLowerCase();
  if (!query) return true;
  const blob = `${song.title} ${song.titleHira} ${song.titleAbc}`.toLowerCase().replace(/\s+/g, "");
  return blob.includes(query.replace(/\s+/g, ""));
}

function readBound(input) {
  const text = input.value.trim();
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function bpmSpan() {
  const min = state.bpmMin;
  const max = state.bpmMax;
  if (min == null && max == null) return null;
  const lo = min == null ? -Infinity : min;
  const hi = max == null ? Infinity : max;
  return lo <= hi ? [lo, hi] : [hi, lo];
}

function bpmHit(song) {
  const span = bpmSpan();
  if (!span) return true;
  const bpm = Number(song.bpm);
  if (!Number.isFinite(bpm)) return false;
  return bpm >= span[0] && bpm <= span[1];
}

function syncBpmAny() {
  const on = state.bpmMin == null && state.bpmMax == null;
  bpmAny.classList.toggle("is-on", on);
  bpmAny.setAttribute("aria-pressed", on ? "true" : "false");
}

function levelChosen(level) {
  return !state.level.size || state.level.has(level);
}

function matches(song) {
  if (!song.title) return false;
  if (isRemoved(song) && !state.removed) return false;
  if (state.genre.size && !state.genre.has(song.genre)) return false;
  if (!queryHit(song) || !bpmHit(song)) return false;
  const weOn = state.diff.has("we");
  const standard = standardDiffs();
  if (!state.diff.size) {
    if (!state.level.size) return true;
    if (isWe(song)) return false;
    return Object.values(song.levels || {}).some((level) => state.level.has(level));
  }
  if (isWe(song)) {
    if (!weOn) return false;
    const parsed = parseWe(song.weLevel);
    if (state.attr.size && !state.attr.has(parsed.kanji)) return false;
    if (state.level.size && !state.level.has(parsed.star)) return false;
    return true;
  }
  if (!standard.length) return false;
  return standard.some((key) => {
    const level = song.levels?.[key] || "";
    return level && levelChosen(level);
  });
}

function visibleSongs() {
  return songs.filter(matches).sort((a, b) => a.title.localeCompare(b.title, "ja"));
}

function chip(label, on, attrs) {
  return `<button type="button" class="${on ? "is-on" : ""}" aria-pressed="${on}" ${attrs}>${esc(label)}</button>`;
}

function renderFilters() {
  const genres = document.getElementById("genres");
  genres.innerHTML = ["全部", ...genreOptions()].map((genre) => (
    chip(genre, genre === "全部" ? !state.genre.size : state.genre.has(genre), `data-genre="${esc(genre)}"`)
  )).join("");
  document.getElementById("diffs").innerHTML = DIFFS.map(([key, label]) => {
    const on = key === "any" ? !state.diff.size : state.diff.has(key);
    return `<button type="button" class="${key}${on ? " is-on" : ""}" aria-pressed="${on}" data-diff="${key}">${label}</button>`;
  }).join("");
  document.getElementById("levels").innerHTML = ["不限", ...levelOptions()].map((level) => (
    chip(level, level === "不限" ? !state.level.size : state.level.has(level), `data-level="${esc(level)}"`)
  )).join("");
  const attrs = document.getElementById("attrs");
  const showAttr = state.diff.has("we");
  document.getElementById("attr-line").hidden = !showAttr;
  attrs.innerHTML = showAttr
    ? ["全部", ...attrOptions()].map((attr) => (
      chip(attr, attr === "全部" ? !state.attr.size : state.attr.has(attr), `data-attr="${esc(attr)}"`)
    )).join("")
    : "";
}

function noteLine(notes) {
  if (!notes) return "";
  return NOTE_LABEL.filter(([key]) => notes[key]).map(([key, label]) => `${label} ${esc(notes[key])}`).join(" ");
}

function videoLinks(ids) {
  return ids.map((id, index) => {
    const label = ids.length > 1 ? `预览 ${index + 1}` : "预览";
    return `<a href="https://www.youtube.com/watch?v=${esc(id)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }).join("");
}

function detail(song) {
  const rows = [];
  if (isWe(song)) {
    const bits = [];
    if (song.designer) bits.push(`谱师 ${esc(song.designer)}`);
    const notes = noteLine(song.notes && song.notes.we);
    if (notes) bits.push(notes);
    const links = videoLinks(song.videos || []);
    rows.push(`<p>${bits.join(" ")} ${links || "这份还没有预览。"}</p>`);
  } else {
    DIFFS.slice(1, 6).forEach(([key, label]) => {
      const bits = [];
      if (song.designer && song.designer[key]) bits.push(`谱师 ${esc(song.designer[key])}`);
      const notes = noteLine(song.notes && song.notes[key]);
      if (notes) bits.push(notes);
      const links = videoLinks((song.videos && song.videos[key]) || []);
      if (!bits.length && !links) return;
      rows.push(`<p><b>${label}</b> ${bits.join(" ")} ${links}</p>`);
    });
    if (!rows.length) rows.push("<p>这份还没有谱师和预览。</p>");
  }
  return `<div class="more">${rows.join("")}</div>`;
}

function pills(song) {
  if (isWe(song)) {
    const parsed = parseWe(song.weLevel);
    const hit = state.diff.has("we")
      && (!state.attr.size || state.attr.has(parsed.kanji))
      && (!state.level.size || state.level.has(parsed.star));
    return `<button type="button" class="pill we${hit ? " is-hit" : ""}" data-pick="we" data-attr="${esc(parsed.kanji)}" data-level="${esc(parsed.star)}">WE ${esc(parsed.label || "—")}</button>`;
  }
  return DIFF_KEYS.map((key) => {
    const level = song.levels && song.levels[key];
    if (!level) return "";
    const label = DIFFS.find(([name]) => name === key)[1];
    const diffOn = state.diff.has(key);
    const levelOn = state.level.has(level);
    const hit = (diffOn && (!state.level.size || levelOn)) || (!state.diff.size && levelOn);
    return `<button type="button" class="pill ${key}${hit ? " is-hit" : ""}" data-pick="${key}" data-level="${esc(level)}">${label} ${esc(level)}</button>`;
  }).join("");
}

function songHtml(song) {
  const open = openIds.has(song.id + song.kind);
  const flags = [
    isRemoved(song) ? `<span class="gone">下架</span>` : "",
    song.kind === "we-course" ? `<span class="marktag">课题</span>` : "",
    song.kind === "we-uso" ? `<span class="marktag">嘘</span>` : "",
  ].join("");
  return `<article class="song">
    <div class="song-head">
      <div>
        <button type="button" class="title" data-open="${esc(song.id)}" data-kind="${esc(song.kind)}" aria-expanded="${open}">${esc(song.title)}</button>
        ${flags ? `<div class="flags">${flags}</div>` : ""}
      </div>
      <button type="button" class="genre" data-genre="${esc(song.genre)}">${esc(song.genre || "未分曲风")}</button>
      <button type="button" class="bpm${state.bpmMin != null && state.bpmMin === state.bpmMax && String(state.bpmMin) === String(song.bpm) ? " is-hit" : ""}" data-bpm="${esc(song.bpm)}">${esc(song.bpm || "—")}</button>
    </div>
    <p class="artist">${esc(song.artist)}</p>
    <div class="pills">${pills(song)}</div>
    ${open ? detail(song) : ""}
  </article>`;
}

function dirty() {
  return state.genre.size || state.diff.size || state.level.size || state.attr.size || state.removed || state.q.trim() || state.bpmMin != null || state.bpmMax != null;
}

function renderList() {
  const rows = visibleSongs();
  const slice = rows.slice(0, limit);
  const more = document.getElementById("more");
  count.textContent = rows.length > slice.length ? `${slice.length} / ${rows.length} 首` : `${rows.length} 首`;
  clearBtn.hidden = !dirty();
  empty.hidden = rows.length > 0;
  more.hidden = slice.length >= rows.length;
  more.textContent = `再看 ${Math.min(100, rows.length - slice.length)} 首`;
  list.innerHTML = slice.map(songHtml).join("");
}

function render() {
  limit = 100;
  keepChoices();
  renderFilters();
  syncBpmAny();
  renderList();
}

document.querySelector(".find").addEventListener("submit", (event) => event.preventDefault());
q.addEventListener("input", () => {
  state.q = q.value;
  limit = 100;
  renderList();
});
clearBtn.addEventListener("click", () => {
  state.genre.clear();
  state.diff.clear();
  state.level.clear();
  state.attr.clear();
  state.removed = false;
  state.q = "";
  state.bpmMin = null;
  state.bpmMax = null;
  q.value = "";
  bpmMinEl.value = "";
  bpmMaxEl.value = "";
  document.getElementById("removed").checked = false;
  render();
});
function applyBpmInputs() {
  state.bpmMin = readBound(bpmMinEl);
  state.bpmMax = readBound(bpmMaxEl);
  limit = 100;
  syncBpmAny();
  renderList();
}
bpmMinEl.addEventListener("input", applyBpmInputs);
bpmMaxEl.addEventListener("input", applyBpmInputs);
document.getElementById("removed").addEventListener("change", (event) => {
  state.removed = event.target.checked;
  limit = 100;
  renderList();
});
document.getElementById("more").addEventListener("click", () => {
  limit += 100;
  renderList();
});
document.getElementById("filters").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.genre) toggleChoice(state.genre, button.dataset.genre, "全部");
  if (button.dataset.diff) toggleChoice(state.diff, button.dataset.diff, "any");
  if (button.dataset.level) toggleChoice(state.level, button.dataset.level, "不限");
  if (button.dataset.attr) toggleChoice(state.attr, button.dataset.attr, "全部");
  if (button.dataset.bpmClear) {
    state.bpmMin = null;
    state.bpmMax = null;
    bpmMinEl.value = "";
    bpmMaxEl.value = "";
  }
  render();
});
list.addEventListener("click", (event) => {
  const bpm = event.target.closest("[data-bpm]");
  if (bpm) {
    const value = Number(bpm.dataset.bpm);
    if (Number.isFinite(value)) {
      if (state.bpmMin === value && state.bpmMax === value) {
        state.bpmMin = null;
        state.bpmMax = null;
        bpmMinEl.value = "";
        bpmMaxEl.value = "";
      } else {
        state.bpmMin = value;
        state.bpmMax = value;
        bpmMinEl.value = String(value);
        bpmMaxEl.value = String(value);
      }
      limit = 100;
      syncBpmAny();
      renderList();
    }
    return;
  }
  const genre = event.target.closest(".genre");
  if (genre && genre.dataset.genre) {
    toggleChoice(state.genre, genre.dataset.genre, "全部");
    render();
    return;
  }
  const pick = event.target.closest("[data-pick]");
  if (pick) {
    const diff = pick.dataset.pick;
    const level = pick.dataset.level || "";
    const attr = pick.dataset.attr || "";
    const selected = state.diff.has(diff) && (!level || state.level.has(level)) && (!attr || state.attr.has(attr));
    if (selected) {
      if (level) state.level.delete(level);
      if (attr) state.attr.delete(attr);
      if (!state.level.size) state.diff.delete(diff);
    } else {
      state.diff.add(diff);
      if (level) state.level.add(level);
      if (attr) state.attr.add(attr);
    }
    render();
    return;
  }
  const title = event.target.closest("[data-open]");
  if (!title) return;
  const key = title.dataset.open + title.dataset.kind;
  if (openIds.has(key)) openIds.delete(key);
  else openIds.add(key);
  renderList();
});

async function load() {
  boot.hidden = false;
  app.hidden = true;
  errorBox.hidden = true;
  try {
    const response = await fetch("./songs.json", { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    songs = Array.isArray(data.songs) ? data.songs : [];
    boot.hidden = true;
    app.hidden = false;
    render();
  } catch (error) {
    boot.hidden = true;
    app.hidden = true;
    errorBox.hidden = false;
  }
}

document.getElementById("retry").addEventListener("click", load);
load();
