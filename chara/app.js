const CANVAS = {
  lg: { w: 1024, h: 1300, name: "大立绘" },
  md: { w: 420, h: 295, name: "横幅" },
  sm: { w: 86, h: 86, name: "小头像" },
};

const $ = (id) => document.getElementById(id);
const canvas = $("canvas");
const ctx = canvas.getContext("2d");
const frame = $("frame");
const stack = $("stack");
const well = $("well");

let page = "lg";
let booting = true;
let busy = false;
let shared = null;
const own = { lg: null, md: null, sm: null };
const useOwn = { lg: false, md: false, sm: false };
const placeShared = {
  lg: { scale: 1, x: 0, y: 0 },
  md: { scale: 1, x: 0, y: 0 },
  sm: { scale: 1, x: 0, y: 0 },
};
const placeOwn = {
  lg: { scale: 1, x: 0, y: 0 },
  md: { scale: 1, x: 0, y: 0 },
  sm: { scale: 1, x: 0, y: 0 },
};
let background = null;
let bgEnabled = false;
let editLayer = "char";
const placeBg = { scale: 1, x: 0, y: 0 };
let drag = null;
let toastTimer = 0;
let persistTimer = 0;

const maskImg = new Image();
maskImg.src = "mask.png";

function fit(meta, spec) {
  return { scale: spec.w / meta.w, x: 0, y: 0 };
}

function usingOwn(key) {
  return useOwn[key] && !!own[key];
}

function sourceOf(key) {
  return usingOwn(key) ? own[key] : shared;
}

function charPlace(key) {
  return usingOwn(key) ? placeOwn[key] : placeShared[key];
}

function editingBg() {
  return page === "md" && bgEnabled && editLayer === "bg" && !!background;
}

function ready() {
  return ["lg", "md", "sm"].every((key) => sourceOf(key));
}

function toast(text) {
  const node = $("toast");
  node.textContent = text;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

function persist() {
  if (booting) return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const data = {
      page,
      useOwn,
      bgEnabled,
      editLayer,
      vignette: $("vignetteCheck").checked,
      placeShared,
      placeOwn,
      placeBg: { ...placeBg },
      sharedName: shared && shared.name,
      sharedSize: shared && [shared.w, shared.h],
      ownName: {
        lg: own.lg && own.lg.name,
        md: own.md && own.md.name,
        sm: own.sm && own.sm.name,
      },
      character: $("character").value,
      variant: $("variant").value,
      variation: $("variation").value,
      credit: $("credit").value,
    };
    sessionStorage.setItem("umiguri-crop", JSON.stringify(data));
  }, 120);
}

function validPlace(place) {
  return place && Number.isFinite(place.scale) && place.scale > 0 && Number.isFinite(place.x) && Number.isFinite(place.y);
}

function restore() {
  let data;
  try {
    data = JSON.parse(sessionStorage.getItem("umiguri-crop") || "null");
  } catch (err) {
    return;
  }
  if (!data) return;
  if (data.sharedName && shared && data.sharedName === shared.name && Array.isArray(data.sharedSize)
      && data.sharedSize[0] === shared.w && data.sharedSize[1] === shared.h && data.placeShared) {
    for (const key of ["lg", "md", "sm"]) {
      if (validPlace(data.placeShared[key])) placeShared[key] = data.placeShared[key];
    }
  }
  for (const key of ["lg", "md", "sm"]) {
    if (data.ownName && own[key] && data.ownName[key] === own[key].name && data.placeOwn && validPlace(data.placeOwn[key])) {
      placeOwn[key] = data.placeOwn[key];
    }
    if (data.useOwn && typeof data.useOwn[key] === "boolean") useOwn[key] = data.useOwn[key] && !!own[key];
  }
  if (data.bgEnabled && background) bgEnabled = true;
  if (validPlace(data.placeBg)) {
    placeBg.scale = data.placeBg.scale;
    placeBg.x = data.placeBg.x;
    placeBg.y = data.placeBg.y;
  }
  if (data.editLayer === "bg" || data.editLayer === "char") editLayer = data.editLayer;
  if (data.page && CANVAS[data.page]) page = data.page;
  if (typeof data.vignette === "boolean") $("vignetteCheck").checked = data.vignette;
  if (typeof data.character === "string") $("character").value = data.character;
  if (typeof data.variant === "string") $("variant").value = data.variant;
  if (typeof data.variation === "string") $("variation").value = data.variation;
  if (typeof data.credit === "string") $("credit").value = data.credit;
}

function suggestNames(filename) {
  const stem = filename.replace(/\.[^.]+$/, "").replace(/[<>:"/\\|?*]/g, "_").trim();
  if (!stem) return;
  const character = $("character");
  const variant = $("variant");
  if (!character.value.trim()) character.value = stem;
  if (!variant.value.trim()) variant.value = stem;
}

function readFileImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, w: img.naturalWidth, h: img.naturalHeight, name: file.name, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("这张图打不开"));
    };
    img.src = url;
  });
}

function releaseImage(meta) {
  if (meta && meta.url) URL.revokeObjectURL(meta.url);
}

function adoptImage(kind, meta) {
  if (kind === "shared") {
    releaseImage(shared);
    shared = meta;
    for (const key of ["lg", "md", "sm"]) placeShared[key] = fit(meta, CANVAS[key]);
    suggestNames(meta.name);
  } else if (kind === "background") {
    releaseImage(background);
    background = meta;
    placeBg.scale = CANVAS.md.w / meta.w;
    placeBg.x = 0;
    placeBg.y = 0;
  } else {
    const key = kind.slice(4);
    releaseImage(own[key]);
    own[key] = meta;
    placeOwn[key] = fit(meta, CANVAS[key]);
  }
  syncChrome();
  draw();
  persist();
}

const picker = document.createElement("input");
picker.type = "file";
picker.accept = "image/*";

function pick(kind) {
  if (busy) return Promise.resolve(false);
  return new Promise((resolve) => {
    const cleanup = () => {
      picker.removeEventListener("change", onChange);
      picker.removeEventListener("cancel", onCancel);
    };
    const onCancel = () => {
      cleanup();
      resolve(false);
    };
    const onChange = async () => {
      cleanup();
      const file = picker.files && picker.files[0];
      picker.value = "";
      if (!file) {
        resolve(false);
        return;
      }
      busy = true;
      try {
        adoptImage(kind, await readFileImage(file));
        resolve(true);
      } catch (err) {
        toast(err.message || "这张图打不开");
        resolve(false);
      } finally {
        busy = false;
      }
    };
    picker.addEventListener("change", onChange);
    picker.addEventListener("cancel", onCancel);
    picker.click();
  });
}

async function upload(kind, file) {
  try {
    adoptImage(kind, await readFileImage(file));
  } catch (err) {
    toast(err.message || "这张图打不开");
  }
}

function syncChrome() {
  $("pageTitle").textContent = CANVAS[page].name;
  $("pageSize").textContent = CANVAS[page].w + "×" + CANVAS[page].h;
  document.querySelectorAll(".tab").forEach((tab) => {
    const key = tab.dataset.page;
    tab.setAttribute("aria-selected", key === page ? "true" : "false");
    tab.querySelector(".dot").hidden = !usingOwn(key);
  });
  const src = sourceOf(page);
  $("fileName").textContent = shared ? "共用立绘：" + shared.name : "还没导入立绘";
  $("ownCheck").checked = usingOwn(page);
  $("ownReplace").hidden = !usingOwn(page);
  $("ownState").textContent = usingOwn(page)
    ? "这一张用的是 " + own[page].name
    : "";
  $("empty").hidden = !!src;
  $("vignetteRow").hidden = page !== "lg";
  $("bgBox").hidden = page !== "md";
  const bgOn = bgEnabled && !!background;
  $("bgCheck").checked = bgEnabled;
  $("bgSeg").hidden = !bgOn;
  $("bgReplace").hidden = !bgOn;
  $("bgState").textContent = bgOn ? "背景：" + background.name : "";
  $("editChar").setAttribute("aria-pressed", editLayer !== "bg" ? "true" : "false");
  $("editBg").setAttribute("aria-pressed", editLayer === "bg" ? "true" : "false");
  frame.classList.toggle("is-own", usingOwn(page) && !editingBg());
  frame.classList.toggle("is-bg", editingBg());
  $("exportBtn").disabled = !ready();
  updateHint();
}

function updateHint() {}

function layoutFrame() {
  const spec = CANVAS[page];
  const style = getComputedStyle(well);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const maxW = Math.max(0, well.clientWidth - padX - 8);
  const maxH = Math.max(0, well.clientHeight - padY - 8);
  if (maxW < 80 || maxH < 80) return;
  const scale = Math.min(maxW / spec.w, maxH / spec.h);
  const frameW = Math.max(80, Math.floor(spec.w * scale));
  const frameH = Math.max(80, Math.floor(spec.h * scale));
  frame.style.width = frameW + "px";
  frame.style.height = frameH + "px";
  stack.style.width = frameW + "px";
  stack.style.height = frameH + "px";
  draw();
}

function draw() {
  const spec = CANVAS[page];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(frame.clientWidth * dpr));
  const height = Math.max(1, Math.round(frame.clientHeight * dpr));
  if (!width || !height || !frame.clientWidth) return;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const display = frame.clientWidth / spec.w;
  ctx.setTransform(dpr * display, 0, 0, dpr * display, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, spec.w, spec.h);
  if (page === "md" && bgEnabled && background) drawLayer(background, placeBg);
  const src = sourceOf(page);
  if (src) drawLayer(src, charPlace(page));
  if (page === "lg" && src && $("vignetteCheck").checked && maskImg.complete && maskImg.naturalWidth) {
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskImg, 0, 0, spec.w, spec.h);
    ctx.globalCompositeOperation = "source-over";
  }
  updateHint();
}

function drawLayer(meta, layer) {
  const dw = meta.w * layer.scale;
  const dh = meta.h * layer.scale;
  if (dw < 0.5 || dh < 0.5) return;
  ctx.drawImage(meta.img, layer.x, layer.y, dw, dh);
}

function logicalPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const spec = CANVAS[page];
  return {
    x: (event.clientX - rect.left) / rect.width * spec.w,
    y: (event.clientY - rect.top) / rect.height * spec.h,
  };
}

function activeLayer() {
  if (editingBg()) return placeBg;
  if (!sourceOf(page)) return null;
  return charPlace(page);
}

function setPage(next) {
  if (!CANVAS[next]) return;
  page = next;
  if (page !== "md") editLayer = "char";
  syncChrome();
  layoutFrame();
  persist();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setPage(tab.dataset.page));
});

$("importBtn").addEventListener("click", () => pick("shared"));

$("ownCheck").addEventListener("change", async () => {
  const on = $("ownCheck").checked;
  if (on) {
    if (!own[page]) {
      const ok = await pick("own-" + page);
      if (!ok) {
        $("ownCheck").checked = false;
        return;
      }
    }
    useOwn[page] = true;
  } else {
    useOwn[page] = false;
  }
  syncChrome();
  draw();
  persist();
});

$("ownReplace").addEventListener("click", () => pick("own-" + page));

$("vignetteCheck").addEventListener("change", () => {
  draw();
  persist();
});

$("bgCheck").addEventListener("change", async () => {
  if ($("bgCheck").checked) {
    if (!background) {
      const ok = await pick("background");
      if (!ok) {
        $("bgCheck").checked = false;
        bgEnabled = false;
        syncChrome();
        return;
      }
    }
    bgEnabled = true;
    editLayer = "bg";
  } else {
    bgEnabled = false;
    editLayer = "char";
  }
  syncChrome();
  draw();
  persist();
});

$("editChar").addEventListener("click", () => {
  editLayer = "char";
  syncChrome();
  persist();
});

$("editBg").addEventListener("click", async () => {
  if (!background) {
    const ok = await pick("background");
    if (!ok) return;
    bgEnabled = true;
    $("bgCheck").checked = true;
  }
  editLayer = "bg";
  syncChrome();
  draw();
  persist();
});

$("bgReplace").addEventListener("click", () => pick("background"));

$("resetBtn").addEventListener("click", () => {
  if (editingBg()) {
    if (!background) return;
    placeBg.scale = CANVAS.md.w / background.w;
    placeBg.x = 0;
    placeBg.y = 0;
  } else {
    const src = sourceOf(page);
    if (!src) return;
    const place = charPlace(page);
    const next = fit(src, CANVAS[page]);
    place.scale = next.scale;
    place.x = next.x;
    place.y = next.y;
  }
  draw();
  persist();
});

["character", "variant", "variation", "credit"].forEach((id) => {
  $(id).addEventListener("input", persist);
});

function safePart(name) {
  const cleaned = String(name).trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/[. ]+$/g, "");
  if (!cleaned || cleaned === "." || cleaned === ".." || cleaned.length > 80) {
    throw new Error("文件夹名字不能为空，也不能带 \\ / : * ? \" < > |");
  }
  return cleaned;
}

function paintLayer(g, meta, layer) {
  const dw = meta.w * layer.scale;
  const dh = meta.h * layer.scale;
  if (dw < 0.5 || dh < 0.5) return;
  g.drawImage(meta.img, layer.x, layer.y, dw, dh);
}

function renderPage(key) {
  const spec = CANVAS[key];
  const out = document.createElement("canvas");
  out.width = spec.w;
  out.height = spec.h;
  const g = out.getContext("2d");
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.clearRect(0, 0, spec.w, spec.h);
  if (key === "md" && bgEnabled && background) paintLayer(g, background, placeBg);
  const src = sourceOf(key);
  if (src) paintLayer(g, src, charPlace(key));
  if (key === "lg" && src && $("vignetteCheck").checked && maskImg.complete && maskImg.naturalWidth) {
    g.globalCompositeOperation = "destination-in";
    g.drawImage(maskImg, 0, 0, spec.w, spec.h);
    g.globalCompositeOperation = "source-over";
  }
  return out;
}

function canvasPng(node) {
  return new Promise((resolve, reject) => {
    node.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("导出失败"))), "image/png");
  });
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (~crc) >>> 0;
}

function bytesOf(values) {
  return Uint8Array.from(values);
}

function u16(n) {
  return [n & 255, (n >> 8) & 255];
}

function u32(n) {
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
}

function zipBlob(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  entries.forEach((entry) => {
    const name = new TextEncoder().encode(entry.name);
    const crc = crc32(entry.data);
    const local = bytesOf([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(entry.data.length),
      ...u32(entry.data.length),
      ...u16(name.length),
      ...u16(0),
    ]);
    parts.push(local, name, entry.data);
    central.push(bytesOf([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(entry.data.length),
      ...u32(entry.data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
    ]), name);
    offset += local.length + name.length + entry.data.length;
  });
  const centralStart = offset;
  let centralSize = 0;
  central.forEach((part) => {
    centralSize += part.length;
  });
  parts.push(...central, bytesOf([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(entries.length),
    ...u16(entries.length),
    ...u32(centralSize),
    ...u32(centralStart),
    ...u16(0),
  ]));
  return new Blob(parts, { type: "application/zip" });
}

function metaBytes(variation, credit) {
  const clean = (text) => String(text).replace(/[\t\r\n]/g, " ");
  return new TextEncoder().encode(`DefSkill\t\r\nVariation\t${clean(variation)}\t${clean(credit)}\r\n`);
}

async function exportPackage() {
  const character = safePart($("character").value);
  const variant = safePart($("variant").value);
  const files = [];
  for (const key of ["lg", "md", "sm"]) {
    const blob = await canvasPng(renderPage(key));
    files.push({
      name: `${character}/${variant}/image_0_${key}.png`,
      data: new Uint8Array(await blob.arrayBuffer()),
    });
  }
  files.push({
    name: `${character}/${variant}/meta.txt`,
    data: metaBytes($("variation").value, $("credit").value),
  });
  const zip = zipBlob(files);
  const url = URL.createObjectURL(zip);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${character}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return `${character}.zip`;
}

$("exportBtn").addEventListener("click", async () => {
  if (!ready()) {
    toast("三张画布都要有图");
    return;
  }
  if (!$("character").value.trim() || !$("variant").value.trim()) {
    toast("先写角色文件夹和皮肤文件夹");
    return;
  }
  const button = $("exportBtn");
  button.disabled = true;
  button.textContent = "正在导出…";
  try {
    const saved = await exportPackage();
    $("savedLine").textContent = saved;
    toast("已保存。");
  } catch (err) {
    toast(err.message || "导出失败");
  } finally {
    button.textContent = "导出压缩包";
    syncChrome();
  }
});

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || !activeLayer()) return;
  canvas.setPointerCapture(event.pointerId);
  const point = logicalPoint(event);
  drag = { id: event.pointerId, x: point.x, y: point.y };
  document.body.classList.add("dragging");
});

canvas.addEventListener("pointermove", (event) => {
  if (!drag || drag.id !== event.pointerId) return;
  const layer = activeLayer();
  if (!layer) return;
  const point = logicalPoint(event);
  layer.x += point.x - drag.x;
  layer.y += point.y - drag.y;
  drag.x = point.x;
  drag.y = point.y;
  draw();
});

function endDrag(event) {
  if (!drag || (event && drag.id !== event.pointerId)) return;
  drag = null;
  document.body.classList.remove("dragging");
  persist();
}

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

canvas.addEventListener("wheel", (event) => {
  const layer = activeLayer();
  if (!layer) return;
  event.preventDefault();
  const point = logicalPoint(event);
  let delta = event.deltaY;
  if (event.deltaMode === 1) delta *= 16;
  else if (event.deltaMode === 2) delta *= 400;
  const next = Math.min(200, Math.max(0.01, layer.scale * Math.exp(-delta * 0.0015)));
  const srcX = (point.x - layer.x) / layer.scale;
  const srcY = (point.y - layer.y) / layer.scale;
  layer.scale = next;
  layer.x = point.x - srcX * next;
  layer.y = point.y - srcY * next;
  draw();
  persist();
}, { passive: false });

frame.addEventListener("dragover", (event) => {
  event.preventDefault();
  frame.classList.add("drop");
});

frame.addEventListener("dragleave", () => frame.classList.remove("drop"));

frame.addEventListener("drop", async (event) => {
  event.preventDefault();
  frame.classList.remove("drop");
  const file = event.dataTransfer.files && event.dataTransfer.files[0];
  if (!file) return;
  if (editingBg()) {
    await upload("background", file);
    bgEnabled = true;
  } else if (useOwn[page]) {
    await upload("own-" + page, file);
    useOwn[page] = true;
  } else {
    await upload("shared", file);
  }
  syncChrome();
  draw();
});

new ResizeObserver(() => layoutFrame()).observe(well);

function boot() {
  restore();
  booting = false;
  syncChrome();
  layoutFrame();
}

boot();
