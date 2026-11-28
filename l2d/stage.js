import { Application, extensions } from "pixi.js";
import { Live2DModel, Live2DPlugin, configureCubismSDK } from "../assets/l2d/vendor/cubism.es.js";

const MODEL_URL = new URL("../assets/l2d/mutsumi/若叶睦人工加工1.model3.json", import.meta.url).href;
const PAINTS = {
  paper: 0xf3e6c8,
  moss: 0xd7ead4,
  night: 0x1b2430,
};

const AFTER_PHYSICS = new Set(["ParamBodyAngleX", "ParamBodyAngleY", "Param3", "Param4", "ParamBreath"]);

const CLIPS = [
  { id: "idle", name: "待机" },
  {
    id: "head",
    name: "晃头",
    duration: 1.2,
    loopMode: "wrap",
    tracks: {
      ParamAngleX: { kind: "wave", amp: 28, period: 0.4 },
      ParamEyeBallX: { kind: "wave", amp: 1, period: 0.4 },
    },
  },
  {
    id: "flail",
    name: "身体乱晃",
    duration: 1.68,
    loopMode: "wrap",
    tracks: {
      ParamBodyAngleX: { kind: "wave", amp: 10, period: 0.42 },
      ParamBodyAngleY: { kind: "wave", amp: 10, period: 0.56 },
      Param3: { kind: "wave", amp: 1, period: 0.28 },
    },
  },
  {
    id: "jump",
    name: "剧烈跳动",
    duration: 0.48,
    loopMode: "wrap",
    tracks: {
      Param4: { kind: "keys", keys: [[0, 0], [0.08, 1], [0.2, -0.85], [0.32, 0.7], [0.48, 0]] },
    },
  },
];

const $ = (id) => document.getElementById(id);
const stage = $("stage");
const note = $("stage-note");
const now = $("now");
const cues = $("cues");
const room = $("room");
const loopInput = $("loop");
const speedInput = $("speed");
const speedOut = $("speed-out");
const mouseInput = $("mouse");
const strengthInput = $("strength");
const strengthOut = $("strength-out");
const breathInput = $("breath");
const physicsInput = $("physics");
const retry = $("retry");

const saved = readSettings();
loopInput.checked = !!saved.loop;
speedInput.value = String(saved.speed ?? 1);
mouseInput.checked = saved.mouse !== false;
strengthInput.value = String(saved.strength ?? 0.8);
breathInput.checked = saved.breath !== false;
physicsInput.checked = saved.physics !== false;
syncOutputs();

let app = null;
let model = null;
let internal = null;
let breathRef = null;
let ids = null;
let defaults = null;
let clip = null;
let elapsed = 0;
let release = 0;
let look = { x: 0, y: 0 };
let paint = saved.paint || "paper";

buildCues();
markCue("idle");
paintStage(paint);
bind();

boot().catch((error) => fail(error));

function buildCues() {
  for (const item of CLIPS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cue";
    button.dataset.clip = item.id;
    button.textContent = item.name;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => play(item.id));
    cues.appendChild(button);
  }
}

function bind() {
  for (const input of [loopInput, speedInput, mouseInput, strengthInput, breathInput, physicsInput]) {
    input.addEventListener("input", () => {
      syncOutputs();
      applyToggles();
      storeSettings();
    });
  }
  $("stop").addEventListener("click", () => play("idle"));
  $("fold").addEventListener("click", () => {
    const folded = room.classList.toggle("is-folded");
    const fold = $("fold");
    fold.textContent = folded ? "展开" : "收起";
    fold.setAttribute("aria-expanded", String(!folded));
    requestAnimationFrame(() => fit());
  });
  for (const button of document.querySelectorAll("[data-paint]")) {
    button.addEventListener("click", () => {
      paint = button.dataset.paint;
      paintStage(paint);
      storeSettings();
    });
  }
  stage.addEventListener("pointermove", (event) => {
    if (!mouseInput.checked) return;
    const rect = stage.getBoundingClientRect();
    look.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    look.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  });
  stage.addEventListener("pointerleave", () => {
    look.x = 0;
    look.y = 0;
  });
  stage.addEventListener("pointerdown", (event) => {
    if (event.target !== stage && event.target !== app?.canvas) return;
    if (!clip) play("jump");
  });
  retry.addEventListener("click", () => location.reload());
  window.addEventListener("resize", fit);
}

async function boot() {
  if (!window.Live2DCubismCore) throw new Error("播放器没准备好");
  configureCubismSDK?.({ memorySizeMB: 128 });
  extensions.add(Live2DPlugin);
  app = new Application();
  await app.init({
    resizeTo: stage,
    background: PAINTS[paint] ?? PAINTS.paper,
    preference: "webgl",
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });
  stage.appendChild(app.canvas);
  const loaded = await Live2DModel.from(MODEL_URL, { autoInteract: false, anchorMode: "drawable" });
  model = loaded;
  model.eventMode = "none";
  app.stage.addChild(model);
  internal = model.internalModel;
  breathRef = internal.breath;
  rememberParameters();
  hookPhysics();
  applyToggles();
  fit();
  new ResizeObserver(() => fit()).observe(stage);
  stage.classList.add("is-ready");
  setNow("待机");
  setBusy(false);
}

function rememberParameters() {
  const core = internal.coreModel;
  ids = {};
  defaults = {};
  const names = new Set(CLIPS.flatMap((item) => Object.keys(item.tracks || {})));
  const count = core.getParameterCount();
  for (let index = 0; index < count; index += 1) {
    const text = core.getParameterId(index).getString().s;
    if (!names.has(text)) continue;
    ids[text] = index;
    defaults[text] = core.getParameterDefaultValue(index);
  }
}

function hookPhysics() {
  const physics = internal.physics;
  if (!physics) {
    let last = performance.now();
    internal.on("beforeModelUpdate", () => {
      const now = performance.now();
      advance(Math.min(0.05, (now - last) / 1000));
      last = now;
      applyClip(internal.coreModel, "before");
      applyClip(internal.coreModel, "after");
    });
    return;
  }
  const evaluate = physics.evaluate.bind(physics);
  physics.evaluate = (core, dt) => {
    advance(dt);
    applyClip(core, "before");
    if (physicsInput.checked) evaluate(core, dt);
    applyClip(core, "after");
  };
}

function follow() {
  if (!internal) return;
  const strength = mouseInput.checked ? Number(strengthInput.value) : 0;
  const x = clamp(look.x * strength, -1, 1);
  const y = clamp(-look.y * strength, -1, 1);
  internal.focusController.focus(x, y, false);
}

function advance(dt) {
  follow();
  if (!clip) return;
  const step = Math.min(0.05, Math.max(0, dt)) * Number(speedInput.value || 1);
  if (release > 0) {
    release = Math.max(0, release - step / 0.35);
    if (release === 0) finish();
    return;
  }
  elapsed += step;
  if (clip.loopMode === "hold") {
    if (elapsed >= clip.duration) {
      elapsed = clip.duration;
      if (!loopInput.checked) beginRelease();
    }
    return;
  }
  if (loopInput.checked) {
    elapsed %= clip.duration || 1;
    return;
  }
  if (elapsed >= clip.duration) finish();
}

function applyClip(core, phase = "before") {
  if (!clip) return;
  const weight = release > 0 ? release : 1;
  const time = Math.min(elapsed, clip.duration);
  for (const [name, track] of Object.entries(clip.tracks)) {
    const after = AFTER_PHYSICS.has(name);
    if (phase === "before" && after) continue;
    if (phase === "after" && !after) continue;
    const index = ids[name];
    if (index == null) continue;
    const value = sample(track, time, defaults[name] || 0);
    core.setParameterValueByIndex(index, value, weight);
  }
}

function play(id) {
  if (!internal && id !== "idle") return;
  const next = CLIPS.find((item) => item.id === id);
  if (!next || next.id === "idle") {
    if (clip) beginRelease();
    else finish();
    return;
  }
  clip = next;
  elapsed = 0;
  release = 0;
  markCue(next.id);
  setNow(loopInput.checked ? `${next.name} · 循环` : next.name);
}

function beginRelease() {
  if (!clip) return finish();
  release = 1;
}

function finish() {
  clip = null;
  elapsed = 0;
  release = 0;
  markCue("idle");
  setNow("待机");
}

function sample(track, time, fallback) {
  if (track.kind === "wave") {
    const period = track.period || 1;
    return fallback + track.amp * Math.sin((time / period) * Math.PI * 2);
  }
  const keys = track.keys;
  const at = (value) => (value == null ? fallback : value);
  if (time <= keys[0][0]) return at(keys[0][1]);
  for (let i = 1; i < keys.length; i += 1) {
    if (time > keys[i][0]) continue;
    const [t0, v0] = keys[i - 1];
    const [t1, v1] = keys[i];
    const u = (time - t0) / (t1 - t0 || 1);
    const s = u * u * (3 - 2 * u);
    return at(v0) + (at(v1) - at(v0)) * s;
  }
  return at(keys[keys.length - 1][1]);
}

function applyToggles() {
  if (!internal) return;
  internal.breath = breathInput.checked ? breathRef : null;
  if (clip) setNow(loopInput.checked ? `${clip.name} · 循环` : clip.name);
}

function fit() {
  if (!app || !model) return;
  app.resize?.();
  const bounds = model.getLocalBounds();
  const width = bounds.width || model.width || 1;
  const height = bounds.height || model.height || 1;
  const scale = Math.min((app.screen.width * 0.84) / width, (app.screen.height * 0.86) / height);
  model.scale.set(scale);
  model.anchor?.set?.(0.5, 0.5);
  model.x = app.screen.width / 2;
  model.y = app.screen.height / 2 + 12;
}

function paintStage(name) {
  const color = PAINTS[name] ?? PAINTS.paper;
  stage.style.background = `#${color.toString(16).padStart(6, "0")}`;
  if (app?.renderer?.background) app.renderer.background.color = color;
  for (const button of document.querySelectorAll("[data-paint]")) {
    const on = button.dataset.paint === name;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  }
}

function markCue(id) {
  for (const button of cues.children) {
    const on = button.dataset.clip === id;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  }
}

function setNow(text) {
  now.textContent = text;
}

function setBusy(busy) {
  for (const button of cues.children) button.disabled = busy;
  for (const input of [loopInput, speedInput, mouseInput, strengthInput, breathInput, physicsInput, $("stop")]) {
    input.disabled = busy;
  }
}

function fail(error) {
  console.error(error);
  note.textContent = "没加载起来";
  retry.hidden = false;
  setNow("加载失败");
  setBusy(true);
}

function syncOutputs() {
  speedOut.textContent = Number(speedInput.value).toFixed(1);
  strengthOut.textContent = Number(strengthInput.value).toFixed(1);
  speedInput.setAttribute("aria-valuenow", speedInput.value);
  strengthInput.setAttribute("aria-valuenow", strengthInput.value);
}

function storeSettings() {
  const data = {
    loop: loopInput.checked,
    speed: Number(speedInput.value),
    mouse: mouseInput.checked,
    strength: Number(strengthInput.value),
    breath: breathInput.checked,
    physics: physicsInput.checked,
    paint,
  };
  try { sessionStorage.setItem("l2d-view", JSON.stringify(data)); } catch { /* private mode */ }
}

function readSettings() {
  try { return JSON.parse(sessionStorage.getItem("l2d-view") || "{}"); } catch { return {}; }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

setBusy(true);
