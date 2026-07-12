(() => {
  const lab = window.__LAYOUT_LAB__;
  if (!lab?.enabled) return;

  const STORAGE_PREFIX = "moortneli4-layout-lab:";
  const OBJECTS = [
    {
      id: "menuArc",
      label: "1 菜单弧轨(半径+标题同步)",
      axes: ["radius", "titleScale", "angleStep"],
      steps: { radius: 10, titleScale: 0.04, angleStep: 0.015 },
      getEl: () => document.querySelector(".menu-list"),
    },
    {
      id: "character",
      label: "2 人物",
      axes: ["x", "y", "scale"],
      steps: { x: 4, y: 4, scale: 0.02 },
      getEl: () => document.getElementById("character-stage"),
    },
    {
      id: "bigCucumber",
      label: "3 大黄瓜",
      axes: ["xPercent", "yPercent", "scale"],
      steps: { xPercent: 1, yPercent: 1, scale: 0.05 },
      getEl: () => document.getElementById("big-cucumber-decor"),
    },
    {
      id: "tonearm",
      label: "4 唱臂",
      axes: ["x", "y", "scale", "angle"],
      steps: { x: 4, y: 4, scale: 0.02, angle: 1 },
      getEl: () => document.getElementById("tonearm"),
    },
    {
      id: "turntable",
      label: "5 唱片",
      axes: ["left", "topPercent", "scale"],
      steps: { left: 6, topPercent: 0.4, scale: 0.02 },
      getEl: () => document.getElementById("turntable-pair"),
    },
    {
      id: "turntableControls",
      label: "6 播放按钮",
      axes: ["x", "y"],
      steps: { x: 4, y: 4 },
      getEl: () => document.getElementById("turntable-controls"),
    },
    {
      id: "centerPanel",
      label: "7 中间卡牌",
      axes: ["leftPercent", "topPercent", "widthPx"],
      steps: { leftPercent: 0.3, topPercent: 0.3, widthPx: 8 },
      getEl: () => document.querySelector(".center-panel"),
    },
    {
      id: "leftPanel",
      label: "8 左侧菜单区",
      axes: ["left", "widthPx"],
      steps: { left: 4, widthPx: 8 },
      getEl: () => document.querySelector(".left-panel"),
    },
    {
      id: "currencyWidget",
      label: "9 黄瓜货币",
      axes: ["right", "top", "scale"],
      steps: { right: 2, top: 2, scale: 0.02 },
      getEl: () => document.getElementById("cucumber-currency-widget"),
    },
    {
      id: "searchBar",
      label: "0 搜索框",
      axes: ["xPercent", "scale"],
      steps: { xPercent: 1, scale: 0.02 },
      getEl: () => document.getElementById("search-bar-decor"),
    },
  ];

  let selectedId = OBJECTS[0].id;
  let statusTimer = null;

  function storageKey(preset) {
    return `${STORAGE_PREFIX}${preset}`;
  }

  function waitForApi(timeoutMs = 8000) {
    const started = performance.now();
    return new Promise((resolve, reject) => {
      const tick = () => {
        if (window.LayoutLabAPI) {
          resolve(window.LayoutLabAPI);
          return;
        }
        if (performance.now() - started > timeoutMs) {
          reject(new Error("LayoutLabAPI 未就绪"));
          return;
        }
        window.requestAnimationFrame(tick);
      };
      tick();
    });
  }

  function getObjectDef(id) {
    return OBJECTS.find((item) => item.id === id) || OBJECTS[0];
  }

  function getParamBag(params, id) {
    if (!params[id]) params[id] = {};
    return params[id];
  }

  function setStatus(text) {
    const el = document.getElementById("lab-status");
    if (!el) return;
    el.textContent = text;
    if (statusTimer) window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      if (el.textContent === text) el.textContent = "";
    }, 2200);
  }

  function highlightSelected() {
    document.querySelectorAll(".lab-selected-outline").forEach((node) => {
      node.classList.remove("lab-selected-outline");
    });
    const def = getObjectDef(selectedId);
    const el = def.getEl?.();
    if (el) el.classList.add("lab-selected-outline");
  }

  function renderValues(api) {
    const params = api.getParams();
    const bag = params[selectedId] || {};
    const def = getObjectDef(selectedId);
    const lines = def.axes.map((axis) => {
      const value = bag[axis];
      const shown = typeof value === "number" ? Number(value.toFixed(4)) : value;
      return `${axis}: ${shown}`;
    });
    const valuesEl = document.getElementById("lab-values");
    if (valuesEl) valuesEl.textContent = lines.join("\n");
    const select = document.getElementById("lab-object-select");
    if (select && select.value !== selectedId) select.value = selectedId;
    highlightSelected();
  }

  function persistCurrent(api) {
    const preset = lab.preset || "ipad";
    const payload = {
      preset,
      stage: {
        width: lab.stageWidth,
        height: lab.stageHeight,
      },
      params: api.getParams(),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey(preset), JSON.stringify(payload));
    } catch {
      // ignore quota
    }
    return payload;
  }

  function loadSaved(api) {
    const preset = lab.preset || "ipad";
    try {
      const raw = localStorage.getItem(storageKey(preset));
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data?.params) {
        api.applyParams(data.params);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  function seedWidthIfNeeded(bag, el) {
    if ((bag.widthPx || 0) > 0) return;
    const measured = el?.offsetWidth || 0;
    if (measured > 0) bag.widthPx = measured;
  }

  function nudge(api, dx, dy, dScale, dAngle) {
    const params = api.getParams();
    const def = getObjectDef(selectedId);
    const bag = getParamBag(params, selectedId);
    const fine = window.__labFineStep ? 0.25 : 1;
    const shift = window.__labCoarseStep ? 3 : 1;
    const mul = fine * shift;
    // 调试台不夹紧：允许缩到极小、移出画布；真实可视区用虚线框参考

    const mapMove = {
      menuArc: () => {
        // Q/E：半径与标题图同步缩放；W/S：只拧半径（标题跟着 radius/450）；A/D：扇区步进
        if (dScale) {
          const factor = 1 + dScale * 0.05 * mul;
          bag.radius = (bag.radius || 450) * factor;
          bag.titleScale = (bag.titleScale || 1) * factor;
        }
        if (dy) {
          bag.radius = (bag.radius || 450) - dy * def.steps.radius * mul;
          bag.titleScale = bag.radius / 450;
        }
        if (dx) {
          bag.angleStep = (bag.angleStep || 0.48) + dx * def.steps.angleStep * mul;
        }
      },
      character: () => {
        bag.x = (bag.x || 0) + dx * def.steps.x * mul;
        bag.y = (bag.y || 0) + dy * def.steps.y * mul;
        if (dScale) bag.scale = (bag.scale || 1) + dScale * def.steps.scale * mul;
      },
      bigCucumber: () => {
        bag.xPercent = (bag.xPercent || 0) + dx * def.steps.xPercent * mul;
        bag.yPercent = (bag.yPercent || 0) + dy * def.steps.yPercent * mul;
        if (dScale) bag.scale = (bag.scale || 1) + dScale * def.steps.scale * mul;
      },
      tonearm: () => {
        bag.x = (bag.x || 0) + dx * def.steps.x * mul;
        bag.y = (bag.y || 0) + dy * def.steps.y * mul;
        if (dScale) bag.scale = (bag.scale || 1) + dScale * def.steps.scale * mul;
        if (dAngle) bag.angle = (bag.angle || 0) + dAngle * def.steps.angle * mul;
      },
      turntable: () => {
        bag.left = (bag.left || 0) + dx * def.steps.left * mul;
        bag.topPercent = (bag.topPercent || 50) + dy * def.steps.topPercent * mul;
        if (dScale) bag.scale = (bag.scale || 1) + dScale * def.steps.scale * mul;
      },
      turntableControls: () => {
        bag.x = (bag.x || 0) + dx * def.steps.x * mul;
        bag.y = (bag.y || 0) + dy * def.steps.y * mul;
      },
      centerPanel: () => {
        bag.leftPercent = (bag.leftPercent || 0) + dx * def.steps.leftPercent * mul;
        bag.topPercent = (bag.topPercent || 0) + dy * def.steps.topPercent * mul;
        if (dScale) {
          seedWidthIfNeeded(bag, def.getEl?.());
          bag.widthPx = Math.round((bag.widthPx || 0) + dScale * def.steps.widthPx * mul);
        }
      },
      leftPanel: () => {
        bag.left = (bag.left || 0) + dx * def.steps.left * mul;
        if (dScale) {
          seedWidthIfNeeded(bag, def.getEl?.());
          bag.widthPx = Math.round((bag.widthPx || 0) + dScale * def.steps.widthPx * mul);
        }
      },
      currencyWidget: () => {
        bag.right = (bag.right || 0) - dx * def.steps.right * mul;
        bag.top = (bag.top || 0) + dy * def.steps.top * mul;
        if (dScale) bag.scale = (bag.scale || 1) + dScale * def.steps.scale * mul;
      },
      searchBar: () => {
        bag.xPercent = (bag.xPercent || 0) + dx * def.steps.xPercent * mul;
        if (dScale) bag.scale = (bag.scale || 1) + dScale * def.steps.scale * mul;
      },
    };

    (mapMove[selectedId] || mapMove.character)();
    api.applyParams({ [selectedId]: bag });
    persistCurrent(api);
    renderValues(api);
  }

  function buildExportPayload(api) {
    const current = persistCurrent(api);
    const presets = {};
    for (const preset of ["ipad", "phone"]) {
      try {
        const raw = localStorage.getItem(storageKey(preset));
        if (raw) {
          const data = JSON.parse(raw);
          presets[preset] = {
            stage: data.stage,
            params: data.params,
            updatedAt: data.updatedAt,
          };
        }
      } catch {
        // ignore
      }
    }
    presets[lab.preset || "ipad"] = {
      stage: current.stage,
      params: current.params,
      updatedAt: current.updatedAt,
    };
    return {
      version: 1,
      site: "moortneli4-site",
      note: "由 layout-lab 导出。可放到 layout-profiles.json，主站按设备套用。",
      exportedAt: new Date().toISOString(),
      presets,
    };
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function mountPanel(api) {
    const panel = document.createElement("aside");
    panel.className = "lab-panel";
    panel.id = "layout-lab-panel";
    panel.innerHTML = `
      <h1>布局调参台 · ${lab.preset === "phone" ? "手机横屏" : "iPad"}</h1>
      <p class="lab-hint">画布锁定 ${lab.stageWidth}×${lab.stageHeight}px。选「1 菜单弧轨」用 QE 同步缩半径+标题图，WS 拧半径，AD 调扇区间距。卡牌文字会随卡牌变窄自动缩小。WASD/QE；Shift 粗调，Alt 细调；数字键 1-9/0 切换物件。</p>
      <div>
        <label for="lab-object-select">当前物件</label>
        <select id="lab-object-select">
          ${OBJECTS.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </div>
      <div class="lab-keys">
        <div><code>W</code>/<code>S</code> 上下</div>
        <div><code>A</code>/<code>D</code> 左右</div>
        <div><code>Q</code>/<code>E</code> 缩小/放大</div>
        <div><code>[</code>/<code>]</code> 旋转(唱臂)</div>
      </div>
      <pre class="lab-values" id="lab-values"></pre>
      <div class="lab-row">
        <button type="button" id="lab-save-btn">保存本比例</button>
        <button type="button" id="lab-reload-btn" class="secondary">读档</button>
      </div>
      <button type="button" id="lab-export-btn">一次性导出全部参数 (JSON)</button>
      <button type="button" id="lab-copy-btn" class="secondary">复制导出内容</button>
      <p class="lab-hint">导出时会合并 localStorage 里 iPad + 手机 两套参数（都调过才会齐）。</p>
      <div class="lab-status" id="lab-status"></div>
    `;

    const shell = document.querySelector(".lab-shell");
    if (shell) shell.appendChild(panel);
    else document.body.appendChild(panel);

    document.getElementById("lab-object-select")?.addEventListener("change", (event) => {
      selectedId = event.target.value;
      renderValues(api);
    });

    document.getElementById("lab-save-btn")?.addEventListener("click", () => {
      persistCurrent(api);
      setStatus("已保存到本机 localStorage");
    });

    document.getElementById("lab-reload-btn")?.addEventListener("click", () => {
      if (loadSaved(api)) {
        renderValues(api);
        setStatus("已读取本比例存档");
      } else {
        setStatus("没有找到本比例存档");
      }
    });

    document.getElementById("lab-export-btn")?.addEventListener("click", () => {
      const payload = buildExportPayload(api);
      downloadJson(`layout-profiles-${Date.now()}.json`, payload);
      setStatus("已下载 JSON（含已保存的全部比例）");
    });

    document.getElementById("lab-copy-btn")?.addEventListener("click", async () => {
      const payload = buildExportPayload(api);
      const ok = await copyText(JSON.stringify(payload, null, 2));
      setStatus(ok ? "已复制到剪贴板" : "复制失败，请用导出下载");
    });
  }

  function bindKeys(api) {
    window.addEventListener("keydown", (event) => {
      const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      window.__labFineStep = event.altKey;
      window.__labCoarseStep = event.shiftKey;

      if (event.key >= "0" && event.key <= "9") {
        const idx = event.key === "0" ? 9 : Number(event.key) - 1;
        if (OBJECTS[idx]) {
          selectedId = OBJECTS[idx].id;
          renderValues(api);
          event.preventDefault();
        }
        return;
      }

      const key = event.key.toLowerCase();
      let handled = true;
      if (key === "w") nudge(api, 0, -1, 0, 0);
      else if (key === "s") nudge(api, 0, 1, 0, 0);
      else if (key === "a") nudge(api, -1, 0, 0, 0);
      else if (key === "d") nudge(api, 1, 0, 0, 0);
      else if (key === "q") nudge(api, 0, 0, -1, 0);
      else if (key === "e") nudge(api, 0, 0, 1, 0);
      else if (key === "[") nudge(api, 0, 0, 0, -1);
      else if (key === "]") nudge(api, 0, 0, 0, 1);
      else handled = false;

      if (handled) event.preventDefault();
    });
  }

  function wrapStage() {
    const stageRoot = document.getElementById("stage-root");
    if (!stageRoot) return;

    const shell = document.createElement("div");
    shell.className = "lab-shell";

    const wrap = document.createElement("div");
    wrap.className = "lab-stage-wrap";

    const frame = document.createElement("div");
    frame.className = "lab-stage-frame";
    frame.style.setProperty("--lab-stage-w", `${lab.stageWidth}px`);
    frame.style.setProperty("--lab-stage-h", `${lab.stageHeight}px`);
    frame.style.width = `${lab.stageWidth}px`;
    frame.style.height = `${lab.stageHeight}px`;

    const label = document.createElement("div");
    label.className = "lab-stage-label";
    label.textContent = `${lab.preset === "phone" ? "iPhone Landscape" : "iPad Landscape"} · ${lab.stageWidth}×${lab.stageHeight}px（锁定）`;

    // 调试页不需要幕布：若残留节点则移除
    document.getElementById("stage-curtain-layer")?.remove();

    const bgVideo = stageRoot.querySelector(".bg-video");
    const stageOverlay = stageRoot.querySelector(".stage-overlay");
    if (bgVideo instanceof HTMLVideoElement) {
      bgVideo.style.objectFit = "fill";
      bgVideo.setAttribute("playsinline", "");
      bgVideo.muted = true;
      bgVideo.play?.().catch(() => {});
    }
    if (stageOverlay instanceof HTMLElement) {
      stageOverlay.style.objectFit = "fill";
    }

    document.body.insertBefore(shell, stageRoot);
    shell.appendChild(wrap);
    wrap.appendChild(frame);
    frame.appendChild(label);
    frame.appendChild(stageRoot);
  }

  async function boot() {
    wrapStage();
    const api = await waitForApi();
    mountPanel(api);
    const restored = loadSaved(api);
    if (!restored) {
      persistCurrent(api);
    }
    // 旧存档没有 menuArc 时，手机给一个更小的默认弧轨
    const params = api.getParams();
    if (!params.menuArc) {
      const radius = lab.preset === "phone" ? 220 : 450;
      api.applyParams({
        menuArc: {
          radius,
          titleScale: radius / 450,
          angleStep: 0.48,
        },
      });
      persistCurrent(api);
    }
    // 卡牌/菜单若 widthPx=0，先量一次真实宽度，避免 QE 无感
    let touched = false;
    const latest = api.getParams();
    const centerEl = document.querySelector(".center-panel");
    const leftEl = document.querySelector(".left-panel");
    if (centerEl && !(latest.centerPanel?.widthPx)) {
      latest.centerPanel = latest.centerPanel || {};
      latest.centerPanel.widthPx = centerEl.offsetWidth || 480;
      touched = true;
    }
    if (leftEl && (!(latest.leftPanel?.widthPx) || latest.leftPanel.widthPx < 40)) {
      latest.leftPanel = latest.leftPanel || {};
      latest.leftPanel.widthPx = Math.max(leftEl.offsetWidth || 220, 220);
      touched = true;
    }
    if (touched) {
      api.applyParams(latest);
      persistCurrent(api);
    }
    renderValues(api);
    bindKeys(api);
    setStatus(restored ? "已载入上次调参" : "从当前布局开始调参");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.setTimeout(boot, 0);
    });
  } else {
    window.setTimeout(boot, 0);
  }
})();
