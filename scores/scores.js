const groupsEl = document.getElementById("groups");
const packList = document.getElementById("pack-list");
const packEmpty = document.getElementById("pack-empty");
const packCount = document.getElementById("pack-count");
const packAllBtn = document.getElementById("pack-all");
const downloadBtn = document.getElementById("download");
const packMsg = document.getElementById("pack-msg");
const drawer = document.getElementById("drawer");
const shade = document.getElementById("shade");

const STORE = "moortneli4-score-pack";
let charts = [];
let sort = "time";
const picked = new Set(JSON.parse(sessionStorage.getItem(STORE) || "[]"));

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function levelText(level) {
  return Number.isInteger(level) ? String(level) : level.toFixed(1);
}

function levelBucket(level) {
  if (level >= 18) return "18+";
  if (level >= 15.5) return "15+";
  if (level >= 15) return "15";
  if (level >= 14.5) return "14+";
  return "其他";
}

function halfYear(date) {
  if (!date) return "日期未标";
  const [year, month] = date.split("-").map(Number);
  return `${year} ${month >= 7 ? "下半年" : "上半年"}`;
}

function savePick() {
  sessionStorage.setItem(STORE, JSON.stringify([...picked]));
}

function playable(chart) {
  return chart.files && chart.files.length > 0;
}

function groupsFor(mode) {
  const map = new Map();
  const put = (name, chart) => {
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(chart);
  };
  if (mode === "time") {
    for (const chart of charts) put(halfYear(chart.released), chart);
    const names = [...map.keys()].sort((a, b) => {
      if (a === "日期未标") return 1;
      if (b === "日期未标") return -1;
      return b.localeCompare(a, "zh");
    });
    return names.map((name) => ({
      name,
      items: map.get(name).sort((a, b) => (b.released || "").localeCompare(a.released || "")),
    }));
  }
  if (mode === "level") {
    const order = ["18+", "15+", "15", "14+", "其他"];
    for (const chart of charts) put(levelBucket(chart.level), chart);
    return order.filter((name) => map.has(name)).map((name) => ({
      name,
      items: map.get(name).sort((a, b) => b.level - a.level),
    }));
  }
  if (mode === "diff") {
    const order = ["ULTIMA", "MASTER"];
    for (const chart of charts) put(chart.diff, chart);
    return order.filter((name) => map.has(name)).map((name) => ({
      name,
      items: map.get(name).sort((a, b) => b.level - a.level),
    }));
  }
  for (const chart of charts) put(chart.level >= 18 ? "18+" : "常规", chart);
  return ["18+", "常规"].filter((name) => map.has(name)).map((name) => ({
    name,
    items: map.get(name).sort((a, b) => b.level - a.level),
  }));
}

function allPacked(list) {
  const ready = list.filter(playable);
  return ready.length > 0 && ready.every((chart) => picked.has(chart.id));
}

function flyFrom(el, delay = 0) {
  const img = el && el.querySelector("img");
  if (!img) return;
  const from = el.getBoundingClientRect();
  const tab = document.getElementById("drawer-tab").getBoundingClientRect();
  const ghost = document.createElement("img");
  ghost.className = "fly-jacket";
  ghost.src = img.src;
  ghost.alt = "";
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  ghost.style.transitionDelay = `${delay}ms`;
  document.body.appendChild(ghost);
  const dx = tab.left + tab.width / 2 - from.left - 46;
  const dy = tab.top + tab.height / 2 - from.top - 46;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.18)`;
    ghost.style.opacity = "0.15";
  }));
  window.setTimeout(() => ghost.remove(), 620 + delay);
}

function flyNew(list) {
  list.filter((chart) => playable(chart) && !picked.has(chart.id)).forEach((chart, index) => {
    flyFrom(groupsEl.querySelector(`[data-id="${chart.id}"]`), index * 45);
  });
}

function toggleMany(list, on) {
  if (on) flyNew(list);
  for (const chart of list) {
    if (!playable(chart)) continue;
    if (on) picked.add(chart.id);
    else picked.delete(chart.id);
  }
  savePick();
  render();
}

function renderPack() {
  const chosen = charts.filter((chart) => picked.has(chart.id));
  packCount.textContent = String(chosen.length);
  packEmpty.hidden = chosen.length > 0;
  packList.innerHTML = chosen.map((chart) => `<li class="${esc(chart.diff)}">
    <span>${esc(chart.title)} · ${esc(chart.diff)} ${levelText(chart.level)}</span>
    <button type="button" data-drop="${chart.id}">移出</button>
  </li>`).join("");
  downloadBtn.disabled = chosen.length === 0 || downloadBtn.dataset.busy === "1";
  packAllBtn.textContent = allPacked(charts) ? "全部移出" : "全部打包";
  packAllBtn.classList.toggle("is-on", allPacked(charts));
}

function render() {
  const groups = groupsFor(sort);
  groupsEl.innerHTML = groups.map((group) => `<section class="group">
    <div class="group-head">
      <h2>${esc(group.name)} · ${group.items.length}</h2>
      <button type="button" data-group="${esc(group.name)}">${allPacked(group.items) ? "移出整类" : "整类打包"}</button>
    </div>
    <div class="grid">${group.items.map((chart) => {
      const inn = picked.has(chart.id);
      const jacket = chart.jacket
        ? `<img src="${esc(chart.jacket)}" alt="">`
        : `<span class="jacket-fallback">无图</span>`;
      const bits = [chart.artist, chart.id, chart.released, chart.note].filter(Boolean);
      return `<button type="button" class="card ${esc(chart.diff)}${inn ? " is-in" : ""}" data-id="${chart.id}" ${playable(chart) ? "" : "disabled"}>
        ${jacket}
        <span>
          <h3>${esc(chart.title)}</h3>
          <p class="level">${esc(chart.diff)} ${levelText(chart.level)}</p>
          <p class="meta">${esc(bits.join(" · "))}</p>
          <p class="flag">${playable(chart) ? (inn ? "已在打包列表" : "未加入打包") : "文件还没放进来"}</p>
        </span>
      </button>`;
    }).join("")}</div>
  </section>`).join("");
  renderPack();
}

document.getElementById("sort").addEventListener("change", (event) => {
  sort = event.target.value;
  render();
});

groupsEl.addEventListener("click", (event) => {
  const groupBtn = event.target.closest("[data-group]");
  if (groupBtn) {
    const group = groupsFor(sort).find((item) => item.name === groupBtn.dataset.group);
    if (group) toggleMany(group.items, !allPacked(group.items));
    return;
  }
  const card = event.target.closest("[data-id]");
  if (!card || card.disabled) return;
  const id = Number(card.dataset.id);
  if (picked.has(id)) picked.delete(id);
  else {
    flyFrom(card);
    picked.add(id);
  }
  savePick();
  render();
});

packAllBtn.addEventListener("click", () => toggleMany(charts, !allPacked(charts)));

packList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-drop]");
  if (!button) return;
  picked.delete(Number(button.dataset.drop));
  savePick();
  render();
});

function setDrawer(open) {
  drawer.classList.toggle("is-open", open);
  shade.classList.toggle("is-on", open);
}

document.getElementById("drawer-tab").addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
shade.addEventListener("click", () => setDrawer(false));

downloadBtn.addEventListener("click", async () => {
  const chosen = charts.filter((chart) => picked.has(chart.id) && playable(chart));
  if (!chosen.length || typeof JSZip === "undefined") {
    packMsg.textContent = "打包工具没载入。";
    return;
  }
  downloadBtn.dataset.busy = "1";
  downloadBtn.disabled = true;
  packMsg.textContent = "正在打包…";
  try {
    const pack = await fetch("./pack.json?v=2").then((response) => {
      if (!response.ok) throw new Error("pack.json");
      return response.json();
    });
    const zip = new JSZip();
    const root = zip.folder(pack.name);
    let done = 0;
    for (const chart of chosen) {
      for (const rel of chart.files) {
        const response = await fetch(`./files/${chart.id}/${encodeURI(rel)}`);
        if (!response.ok) throw new Error(rel);
        root.file(rel, await response.arrayBuffer());
      }
      done += 1;
      packMsg.textContent = `正在打包 ${done}/${chosen.length}`;
    }
    const shared = pack.releaseTag.slice();
    if (chosen.some((chart) => chart.id === pack.wallSong)) shared.push(...pack.wall);
    for (const rel of shared) {
      const response = await fetch(`./pack/${encodeURI(rel)}`);
      if (!response.ok) throw new Error(rel);
      root.file(rel, await response.arrayBuffer());
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${pack.name}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    packMsg.textContent = `已打包 ${chosen.length} 首。把里面的 ${pack.name} 文件夹放进 bin\\option。`;
  } catch (error) {
    packMsg.textContent = `没打成：${error.message || error}`;
  }
  downloadBtn.dataset.busy = "";
  renderPack();
});

fetch("./charts.json")
  .then((response) => response.json())
  .then((data) => {
    charts = data;
    for (const id of [...picked]) {
      if (!charts.some((chart) => chart.id === id && playable(chart))) picked.delete(id);
    }
    render();
  })
  .catch(() => {
    groupsEl.textContent = "谱面列表没打开。";
  });
