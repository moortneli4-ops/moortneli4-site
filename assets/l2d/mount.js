import { Application, extensions } from "pixi.js";
import { Live2DModel, Live2DPlugin, configureCubismSDK } from "./vendor/cubism.es.js";

const MODEL_URL = new URL("./mutsumi/若叶睦人工加工1.model3.json", import.meta.url).href;

let generation = 0;
let booted = false;
let app = null;
let model = null;
let host = null;
let observer = null;

function fit() {
  if (!app || !model) return;
  const bounds = model.getLocalBounds();
  const width = bounds.width || model.width || 1;
  const height = bounds.height || model.height || 1;
  const scale = Math.min((app.screen.width * 0.94) / width, (app.screen.height * 0.94) / height);
  model.scale.set(scale);
  model.anchor?.set?.(0.5, 0.52);
  model.x = app.screen.width / 2;
  model.y = app.screen.height * 0.52;
}

function onMove(event) {
  if (!model || !host) return;
  const rect = host.getBoundingClientRect();
  model.focus?.(event.clientX - rect.left, event.clientY - rect.top);
}

function onResize() {
  app?.resize?.();
  fit();
}

function rememberError(el, error) {
  const text = String(error && (error.stack || error.message) || error);
  window.__l2dError = text;
  if (el && el.isConnected) el.dataset.error = text;
}

async function mount(el) {
  if (!el || !el.isConnected) el = document.querySelector("#scene-l2d");
  if (!el || !el.isConnected || !window.Live2DCubismCore) return;
  const ticket = ++generation;
  if (host === el && app && model) {
    onResize();
    return;
  }
  try {
    await unmount(false);
    if (ticket !== generation || !el.isConnected) return;
    host = el;
    el.replaceChildren();
    delete el.dataset.error;
    if (!booted) {
      configureCubismSDK?.({ memorySizeMB: 128 });
      extensions.add(Live2DPlugin);
      booted = true;
    }
    const next = new Application();
    await next.init({
      resizeTo: el,
      backgroundAlpha: 0,
      preference: "webgl",
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });
    if (ticket !== generation || !el.isConnected) {
      next.destroy(true, { children: true });
      return;
    }
    app = next;
    el.appendChild(app.canvas);
    const loaded = await Live2DModel.from(MODEL_URL);
    if (ticket !== generation || !el.isConnected) {
      loaded.destroy({ children: true });
      return;
    }
    model = loaded;
    model.eventMode = "static";
    model.autoInteract = true;
    app.stage.addChild(model);
    fit();
    el.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);
    observer = new ResizeObserver(() => onResize());
    observer.observe(el);
  } catch (error) {
    if (ticket === generation) rememberError(el, error);
  }
}

async function unmount(cancelPending = true) {
  if (cancelPending) generation += 1;
  observer?.disconnect();
  observer = null;
  if (host) host.removeEventListener("pointermove", onMove);
  window.removeEventListener("resize", onResize);
  host = null;
  if (model) {
    try { model.destroy({ children: true }); } catch { /* already gone */ }
    model = null;
  }
  if (app) {
    try { app.destroy(true, { children: true }); } catch { /* already gone */ }
    app = null;
  }
}

window.mountWelcomeLive2D = mount;
window.unmountWelcomeLive2D = unmount;
const waiting = document.querySelector("#scene-l2d");
if (waiting) void mount(waiting);
window.dispatchEvent(new Event("welcome-l2d-ready"));
