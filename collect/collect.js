const MARK = "./assets/logo.ico";

const PENGUIN_FILE = "企鹅工具箱 v2.3.3.exe";
const CUKES = ["./assets/cuke-1.svg?v=2", "./assets/cuke-2.svg?v=2", "./assets/cuke-3.svg?v=2", "./assets/cuke-4.svg?v=2", "./assets/cuke-5.svg?v=2"];
const RARE_CUKES = [
  "/legacy/人物素材/透明背景_1.png",
  "/legacy/人物素材/透明背景_2.png",
  "/legacy/人物素材/黑色背景已去除_透明.png",
  "/legacy/人物素材/下载.png",
];
const RARE_CHANCE = 0.05;
const DOLLS = ["欢迎光临", "与睦头尬聊", "私密内容"];

const tools = [
  {
    id: "official-preview",
    name: "官谱谱面预览",
    cat: "官谱相关",
    blurb: "看中二全部官谱的谱面预览，按曲风和难度翻。",
    host: "sdvx.in",
    href: "https://sdvx.in/chunithm.php",
    icon: "./assets/sdvx.png",
    state: "可打开",
  },
  {
    id: "song-lookup",
    name: "官谱便捷查询",
    cat: "官谱相关",
    blurb: "按曲风、难度、等级和 BPM 范围一起筛，搜索框查歌名。",
    host: "songs.tools.moortneli4.top",
    href: "/songs/",
    icon: MARK,
    state: "可打开",
  },
  {
    id: "chart-id",
    name: "自制谱 ID 登记",
    cat: "自制相关",
    blurb: "给自制谱登记编号，查占用、按范围翻，也能从谱面文件整夹导入。",
    host: "id.tools.moortneli4.top",
    href: "/id/",
    icon: MARK,
    state: "可打开",
  },
  {
    id: "pgko",
    name: "自制谱文件库",
    cat: "自制相关",
    blurb: "收录自制谱的原始文件，可以浏览、下载和分享。",
    host: "pgko.dev",
    href: "https://pgko.dev/",
    icon: "./assets/pgko.png",
    state: "可打开",
  },
  {
    id: "penguin-tools",
    name: "企鹅工具站",
    cat: "工具类",
    blurb: "转谱相关工具。",
    host: "企鹅工具箱 v2.3.3",
    href: `./files/${encodeURIComponent(PENGUIN_FILE)}`,
    download: PENGUIN_FILE,
    icon: "./assets/penguin.svg",
    state: "可下载",
  },
  {
    id: "chara",
    name: "自定义角色裁切",
    cat: "工具类",
    blurb: "把一张立绘裁成大立绘、横幅和小头像，导出后放进角色文件夹。",
    host: "chara.tools.moortneli4.top",
    href: "/chara/",
    icon: MARK,
    state: "可打开",
  },
  {
    id: "margrete",
    name: "玛格丽特插件",
    cat: "工具类",
    blurb: "Margrete 插件和旁边用的小工具。",
    host: "Margrete",
    view: "plugins",
    icon: MARK,
    state: "可打开",
  },
];

const plugins = [
  { name: "AirCrush矢量绘图", file: "AirCrush矢量绘图.zip", bytes: 256755, note: "SVG 导入、手绘，生成 AIRCRUSH 音符。dll 和 ini 在同一个包里。" },
  { name: "音符宽高变换编辑器", file: "音符宽高变换编辑器.zip", bytes: 118608, note: "改音符宽度和空气高度。dll 和 ini 在同一个包里。" },
  { name: "BPM 线性插值", file: "magreteBPM线性插值.py", bytes: 706, note: "按起止时间和 BPM 变化，打出中间的 BPM 行。" },
  { name: "AI写谱", file: "AI写谱.zip", bytes: 3532942, note: "AI 写谱的压缩包。" },
  { name: "谱面一键倍速", file: "谱面一键倍速.7z", bytes: 206126, note: "把谱面一键改成倍速。" },
  { name: "曲线 bezier", file: "curve_bezier.lua", bytes: 5767, note: "贝塞尔曲线脚本。" },
  { name: "曲线插值", file: "curve_interpolated.lua", bytes: 3280, note: "插值曲线脚本。" },
  { name: "曲线弯折", file: "curve_modified.lua", bytes: 3428, note: "可调弯折的曲线脚本。" },
  { name: "火箭", file: "rocket.lua", bytes: 3330, note: "整流罩、箭体和尾翼的火箭脚本。" },
  { name: "OBS 极致压缩高帧", file: "obs - 极致压缩高帧配置文件.zip", bytes: 1958, note: "OBS 的高帧压缩配置。" },
  { name: "MixMeister BPM Analyzer", file: "MixMeister BPM Analyzer v1.0.exe", bytes: 880374, note: "用来听歌测 BPM。" },
];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function sizeText(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const q = document.getElementById("q");
const shelf = document.getElementById("shelf");
const pluginPage = document.getElementById("plugins");
const pluginList = document.getElementById("plugin-list");
let cat = "全部";

function renderPlugins() {
  pluginList.innerHTML = plugins.map((item) => {
    const href = `./files/${encodeURIComponent(item.file)}`;
    return `<article class="plugin">
      <h3>${item.name}</h3>
      <a href="${href}" download="${item.file.replace(/"/g, "")}">下载</a>
      <p>${item.note}</p>
      <p class="meta">${sizeText(item.bytes)}</p>
    </article>`;
  }).join("");
}

function showPlugins(on) {
  shelf.hidden = on;
  document.querySelector(".cats").hidden = on;
  document.querySelector(".lead").hidden = on;
  pluginPage.hidden = !on;
  const next = on ? "#plugins" : location.pathname + location.search;
  if ((on && location.hash !== "#plugins") || (!on && location.hash === "#plugins")) {
    history.replaceState(null, "", next);
  }
}

function render() {
  const query = q.value.trim().toLowerCase();
  const list = tools.filter((tool) => {
    const inCat = cat === "全部" || tool.cat === cat;
    const blob = `${tool.name} ${tool.blurb} ${tool.host} ${tool.cat}`.toLowerCase();
    return inCat && (!query || blob.includes(query));
  });
  empty.hidden = list.length > 0;
  grid.innerHTML = list.map((tool, index) => {
    const external = /^https?:/i.test(tool.href || "");
    const action = tool.view
      ? `<button type="button" class="open" data-view="${tool.view}">打开</button>`
      : tool.href
        ? `<a class="open" href="${esc(tool.href)}"${tool.download ? ` download="${esc(tool.download)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${tool.download ? "下载" : "打开"}</a>`
        : `<span class="open is-wait">子域名还没挂</span>`;
    return `<article class="card" style="--i:${index}">
      <div class="card-id">
        <img src="${esc(tool.icon)}" alt="">
        <div>
          <p class="kicker">${tool.cat}<span>${tool.state}</span></p>
          <h2>${tool.name}</h2>
        </div>
      </div>
      <p>${tool.blurb}</p>
      <p class="host">${tool.host}</p>
      ${action}
    </article>`;
  }).join("");
}

document.querySelectorAll(".cats button").forEach((btn) => {
  btn.addEventListener("click", () => {
    cat = btn.dataset.cat;
    document.querySelectorAll(".cats button").forEach((el) => el.classList.toggle("is-on", el === btn));
    render();
  });
});
q.addEventListener("input", render);

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  if (button.dataset.view === "plugins") showPlugins(true);
});

document.getElementById("plugins-back").addEventListener("click", () => showPlugins(false));

const headerCuke = document.getElementById("header-cuke");
const headerCukeImg = headerCuke.querySelector("img");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const BOOM_BITS = [
  ["-36px", "-30px", "28deg", "var(--sun)", "50%"],
  ["34px", "-24px", "-18deg", "var(--tomato)", "50%"],
  ["-30px", "16px", "12deg", "var(--moss)", "2px"],
  ["28px", "22px", "48deg", "var(--navy)", "2px"],
  ["0px", "-42px", "8deg", "var(--sun)", "50%"],
  ["42px", "0px", "-32deg", "var(--tomato)", "50%"],
  ["-44px", "-4px", "20deg", "var(--cream)", "2px"],
  ["6px", "34px", "64deg", "var(--navy)", "50%"],
];
let cukeIndex = 0;
let rareCuke = "";
let cukeBusy = false;
let cukeQueued = 0;

function rollCuke() {
  if (Math.random() < RARE_CHANCE) {
    let pick = rareCuke;
    while (pick === rareCuke) pick = RARE_CUKES[Math.floor(Math.random() * RARE_CUKES.length)];
    rareCuke = pick;
    headerCukeImg.src = pick;
    headerCuke.classList.add("is-rare");
    return;
  }
  let next = cukeIndex;
  while (next === cukeIndex) next = Math.floor(Math.random() * CUKES.length);
  cukeIndex = next;
  rareCuke = "";
  headerCukeImg.src = CUKES[cukeIndex];
  headerCuke.classList.remove("is-rare");
}

function boom() {
  headerCuke.querySelector(".cuke-boom")?.remove();
  const burst = document.createElement("span");
  burst.className = "cuke-boom";
  burst.setAttribute("aria-hidden", "true");
  burst.innerHTML = BOOM_BITS.map(([x, y, turn, color, radius]) => (
    `<i style="--x:${x};--y:${y};--turn:${turn};--fill:${color};--radius:${radius}"></i>`
  )).join("");
  headerCuke.appendChild(burst);
  window.setTimeout(() => burst.remove(), 700);
}

function playCuke() {
  cukeBusy = true;
  rollCuke();
  boom();
  headerCuke.classList.remove("is-pop");
  void headerCuke.offsetWidth;
  headerCuke.classList.add("is-pop");
}

headerCuke.addEventListener("click", () => {
  if (reduceMotion) {
    rollCuke();
    return;
  }
  if (cukeBusy) {
    cukeQueued += 1;
    return;
  }
  playCuke();
});
headerCukeImg.addEventListener("animationend", (event) => {
  if (event.animationName !== "cuke-pop") return;
  cukeBusy = false;
  if (cukeQueued > 0) {
    cukeQueued -= 1;
    playCuke();
    return;
  }
  headerCuke.classList.remove("is-pop");
});

const shade = document.getElementById("shade");
const author = document.getElementById("author");
const door = document.getElementById("door-cuke");
const dollImg = door.querySelector("img");
let doll = Math.floor(Math.random() * DOLLS.length);
let dollFrame = 0;

function showDoll() {
  dollImg.src = `/legacy/人物素材/${DOLLS[doll]}${dollFrame + 1}.png`;
}
showDoll();
if (!reduceMotion) {
  window.setInterval(() => {
    dollFrame = 1 - dollFrame;
    showDoll();
  }, 520);
  window.setInterval(() => {
    let next = doll;
    while (next === doll) next = Math.floor(Math.random() * DOLLS.length);
    doll = next;
    dollFrame = 0;
    showDoll();
  }, 6400);
}
const pageBits = [document.querySelector(".top"), document.querySelector(".layout"), door];
let authorOpen = false;
let authorTimer = 0;

function setPageQuiet(on) {
  pageBits.forEach((el) => { el.inert = on; });
}

function openAuthor() {
  window.clearTimeout(authorTimer);
  shade.hidden = false;
  author.hidden = false;
  authorOpen = true;
  setPageQuiet(true);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (authorOpen) document.body.classList.add("author-open");
    });
  });
  document.getElementById("author-close").focus();
}

function closeAuthor() {
  if (!authorOpen) return;
  authorOpen = false;
  document.body.classList.remove("author-open");
  setPageQuiet(false);
  const hide = () => {
    if (authorOpen) return;
    shade.hidden = true;
    author.hidden = true;
  };
  author.addEventListener("transitionend", hide, { once: true });
  authorTimer = window.setTimeout(hide, 450);
  door.focus();
}

door.addEventListener("click", openAuthor);
document.getElementById("author-close").addEventListener("click", closeAuthor);
shade.addEventListener("click", closeAuthor);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAuthor();
});

renderPlugins();
render();
if (location.hash === "#plugins") showPlugins(true);
