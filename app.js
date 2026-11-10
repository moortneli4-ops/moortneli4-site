const LEGACY = location.protocol === "file:" ? "../moortneli4-site" : "/legacy";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menus = [
  { id: "welcome", label: "欢迎光临", character: "欢迎光临", card: 1 },
  { id: "chart-hub", label: "自制谱工具集成站", character: "自制谱面", card: 2 },
  { id: "tool-sites", label: "其他工具网站收集", character: "神秘小工具", card: 3 },
  { id: "chat", label: "与睦头尬聊", character: "与睦头尬聊", card: 1 },
  { id: "about", label: "关于我", character: "私密内容", card: 2 },
];

const playlist = [
  { title: "大耳朵睦睦", cover: `${LEGACY}/歌单/大耳朵睦睦.jpg`, audio: `${LEGACY}/歌单/大耳朵睦睦.wav` },
  { title: "噶", cover: `${LEGACY}/歌单/噶.jpg`, audio: `${LEGACY}/歌单/噶.wav` },
  { title: "哆啦A梦", cover: `${LEGACY}/歌单/哆啦A梦.jpg`, audio: `${LEGACY}/歌单/哆啦A梦.wav` },
  { title: "地狱", cover: `${LEGACY}/歌单/地狱.jpg`, audio: `${LEGACY}/歌单/地狱.wav` },
  { title: "天上掉下个若叶睦", cover: `${LEGACY}/歌单/天上掉下个若叶睦.jpg`, audio: `${LEGACY}/歌单/天上掉下个若叶睦.wav` },
];

const chartPack = `${LEGACY}/自制谱面/[OPT]莫Collection2026.11.9.zip`;

const webTools = [
  { title: "樱花动漫", href: "https://www.yinghua3.com/" },
  { title: "Word 转 PDF", href: "https://www.pdfkz.com/word-to-pdf" },
  { title: "Music.xml 创建", href: "https://margrithm.girlsband.party/music-xml" },
  { title: "UMIGURI 自制谱 ID 登记", href: "/id/" },
  { title: "cueFile 创建", href: "https://margrithm.girlsband.party/acb-create" },
  { title: "即梦 AI", href: "https://jimeng.jianying.com/ai-tool/home" },
  { title: "B站视频解析", href: "https://snapany.com/zh/bilibili" },
  { title: "SJTU Canvas", href: "https://oc.sjtu.edu.cn/login/canvas" },
  { title: "Kimi", href: "https://www.kimi.com/" },
  { title: "学习工程", href: "https://www.ignoredone.space/index.php/learningproject/" },
  { title: "豆包", href: "https://www.doubao.com/chat/" },
  { title: "TapNow", href: "https://app.tapnow.ai/home" },
  { title: "献丑", href: "https://xianchou.com/" },
  { title: "Happy Horses", href: "https://happyhorses.io/" },
  { title: "ComfyUI 笔记", href: "https://my.feishu.cn/wiki/W4GcwkuGQiuBuTkW85EcI94tnYd" },
  { title: "软件资源库", href: "https://my.feishu.cn/base/IkgobGhHXajzL0sYQH8c6kIVn3f?table=tblpYYXSSac3AXe7&view=vewcgeUt3L" },
  { title: "哔哩哔哩", href: "https://www.bilibili.com/" },
  { title: "飞书消息", href: "https://ecnzc43qeip9.feishu.cn/next/messenger" },
  { title: "LLM Gateway", href: "http://www.llmgateway.cn/dashboard" },
  { title: "Milora API", href: "https://api.milorapart.top/ai-models" },
  { title: "图片转矢量", href: "https://phototool.cn/img2vector/" },
  { title: "XMRth", href: "https://xmrth.lol/user" },
  { title: "Rhythm Archive", href: "https://rhythmarchive.github.io/" },
];

const $ = (id) => document.getElementById(id);
const menuList = $("menu-list");
const cardTitle = $("card-title");
const cardBody = $("card-body");
const sceneCard = $("scene-card");
const characterSprite = $("character-sprite");
const characterStage = $("character-stage");
const turntable = $("turntable");
const vinylCover = $("vinyl-cover");
const bgAudio = $("bg-audio");
const playBtn = $("play-btn");
const ttControls = $("tt-controls");
const cucumberLayer = $("cucumber-layer");
const currencyCountEl = $("currency-count");
const searchInput = $("stage-search");

let currentIndex = 0;
let targetIndex = 0;
let itemEls = [];
let songIndex = 0;
let playing = false;
let cucumberCount = Number(localStorage.getItem("cuke") || 0);
let chatLog = [];
let chatAbort = null;
let query = "";

const headerCuke = $("header-cuke");
const headerCukeImg = headerCuke.querySelector("img");
const HEADER_CUKES = [1, 2, 3, 4, 5].map((n) => `/collect/assets/cuke-${n}.svg?v=2`);
const RARE_CUKES = [
  "/legacy/人物素材/透明背景_1.png",
  "/legacy/人物素材/透明背景_2.png",
  "/legacy/人物素材/黑色背景已去除_透明.png",
  "/legacy/人物素材/下载.png",
];
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

function rollHeaderCuke() {
  if (Math.random() < 0.05) {
    let pick = rareCuke;
    while (pick === rareCuke) pick = RARE_CUKES[Math.floor(Math.random() * RARE_CUKES.length)];
    rareCuke = pick;
    headerCukeImg.src = pick;
    headerCuke.classList.add("is-rare");
    return;
  }
  let next = cukeIndex;
  while (next === cukeIndex) next = Math.floor(Math.random() * HEADER_CUKES.length);
  cukeIndex = next;
  rareCuke = "";
  headerCukeImg.src = HEADER_CUKES[cukeIndex];
  headerCuke.classList.remove("is-rare");
}

function boomHeaderCuke() {
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

function playHeaderCuke() {
  cukeBusy = true;
  rollHeaderCuke();
  boomHeaderCuke();
  headerCuke.classList.remove("is-pop");
  void headerCuke.offsetWidth;
  headerCuke.classList.add("is-pop");
}

headerCuke.addEventListener("click", () => {
  if (reduceMotion) {
    rollHeaderCuke();
    return;
  }
  if (cukeBusy) {
    cukeQueued += 1;
    return;
  }
  playHeaderCuke();
});
headerCukeImg.addEventListener("animationend", (event) => {
  if (event.animationName !== "cuke-pop") return;
  cukeBusy = false;
  if (cukeQueued > 0) {
    cukeQueued -= 1;
    playHeaderCuke();
    return;
  }
  headerCuke.classList.remove("is-pop");
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function norm(s) {
  return String(s).toLowerCase();
}

function hit(text) {
  const q = query.trim();
  if (!q) return true;
  return norm(text).includes(norm(q));
}

function renderMenus() {
  menuList.innerHTML = "";
  itemEls = menus.map((menu, i) => {
    const li = document.createElement("li");
    li.className = "menu-item";
    li.style.setProperty("--i", String(i));
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-label";
    btn.textContent = menu.label;
    btn.addEventListener("click", () => selectMenu(i));
    li.appendChild(btn);
    menuList.appendChild(li);
    return li;
  });
}

function selectMenu(i) {
  targetIndex = i;
  currentIndex = i;
  showScene(i, { slap: true });
}

function layoutMenus() {
  itemEls.forEach((el, i) => {
    const qMiss = query.trim() && !hit(menus[i].label);
    el.classList.toggle("is-active", i === targetIndex);
    el.classList.toggle("is-dim", qMiss);
    el.style.opacity = qMiss ? "0.4" : "1";
  });
}

function tick() {
  if (currentIndex !== targetIndex) {
    currentIndex = targetIndex;
    showScene(currentIndex, { slap: true });
  }
}

function slapCard() {
  if (reduceMotion) return;
  sceneCard.classList.remove("slap");
  void sceneCard.offsetWidth;
  sceneCard.classList.add("slap");
}

function listMarkup(items, className, download) {
  const visible = items.filter((item) => hit(item.title) || hit(item.href));
  if (!visible.length) {
    return `<p class="state-note">没有「${escapeHtml(query.trim())}」。</p>`;
  }
  const rows = visible.map((t, i) => {
    const extra = download ? " download" : ` target="_blank" rel="noopener noreferrer"`;
    return `<li style="--i:${i}"><a href="${escapeHtml(download ? encodeURI(t.href) : t.href)}"${extra}>${escapeHtml(t.title)}</a></li>`;
  }).join("");
  return `<ul class="${className}">${rows}</ul>`;
}

function showScene(index, opts = {}) {
  const menu = menus[index];
  const changed = sceneCard.dataset.index !== String(index);
  sceneCard.dataset.index = String(index);
  if (setCharacter.stem !== menu.character) setCharacter(menu.character);
  layoutMenus();
  cardTitle.textContent = menu.id === "welcome" ? "莫特奈利斯\n个人网站" : menu.label;
  if (menu.id === "welcome") {
    const welcomeHit = !query.trim() || hit("欢迎光临") || hit("莫特奈利斯") || hit("个人网站") || hit("黄瓜");
    cardBody.innerHTML = welcomeHit ? `
      <div class="welcome-poster">
        <span class="tape" aria-hidden="true"></span>
        <p>莫特奈利斯个人网站，用于归档个人资源，也用来容纳一些古怪但有趣的灵感实验。</p>
      </div>
      <div class="toy-row">
        <button type="button" id="slap-cuke" class="slap-cuke">
          <img src="./assets/drawn/cuke-a.svg" alt="">
          <span>拍黄瓜 <b id="slap-count">0</b></span>
          <em id="slap-note">拍了不算分。</em>
        </button>
        <button type="button" id="slip-draw" class="slip">
          <span class="slip-kicker">抽一张</span>
          <span id="slip-text">纸条还叠着。</span>
        </button>
      </div>
      <button type="button" id="reload-btn">显示不对就刷新</button>
    ` : `<p class="state-note">没有「${escapeHtml(query.trim())}」。</p>`;
    bindWelcomeToys();
    $("reload-btn")?.addEventListener("click", () => location.reload());
  } else if (menu.id === "chart-hub") {
    cardBody.innerHTML = `
      <div class="pair">
        <a class="pair-btn" href="/collect/">
          <img src="/collect/assets/cuke-3.svg?v=2" alt="">
          <span>打开中二自制<br>工具收集站</span>
        </a>
        <a class="pair-btn pack" href="${escapeHtml(encodeURI(chartPack))}" download>
          <b>ZIP</b>
          <span>个人谱包</span>
        </a>
      </div>
    `;
  } else if (menu.id === "tool-sites") {
    cardBody.innerHTML = `
      ${listMarkup(webTools, "web-list", false)}
    `;
  } else if (menu.id === "chat") {
    cardBody.innerHTML = `
      <div class="chat-panel">
        <div id="chat-thread" class="chat-thread"></div>
        <p id="chat-status" class="state-note" hidden></p>
        <form id="chat-form" class="chat-form">
          <input id="chat-input" type="text" placeholder="跟睦头说一句" autocomplete="off">
          <button id="chat-send" type="submit">发送</button>
          <button id="chat-cancel" type="button" hidden>停下</button>
        </form>
      </div>
    `;
    mountChat();
  } else if (menu.id === "about") {
    const aboutHit = !query.trim() || hit("关于我") || hit("上海交通大学") || hit("bilibili") || hit("1029664784");
    cardBody.innerHTML = aboutHit ? `
      <div class="about-sheet">
        <p>来自上海交通大学设计学院。</p>
        <p>关注我 → <a href="https://space.bilibili.com/500049877" target="_blank" rel="noopener noreferrer">莫特奈利斯</a></p>
        <p>个人群：1029664784</p>
      </div>
    ` : `<p class="state-note">没有「${escapeHtml(query.trim())}」。</p>`;
  }
  if (opts.slap && changed) slapCard();
}

function setCharacter(stem) {
  const srcs = [1, 2].map((frame) => `${LEGACY}/人物素材/${stem}${frame}.png`);
  srcs.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });
  let frame = 0;
  characterSprite.src = srcs[0];
  if (setCharacter.timer) clearInterval(setCharacter.timer);
  setCharacter.timer = setInterval(() => {
    frame = 1 - frame;
    characterSprite.src = srcs[frame];
  }, 520);
  setCharacter.stem = stem;
}

function mountChat() {
  const thread = $("chat-thread");
  const form = $("chat-form");
  const input = $("chat-input");
  const status = $("chat-status");
  const cancel = $("chat-cancel");
  const send = $("chat-send");
  const render = () => {
    thread.innerHTML = chatLog.map((m) =>
      `<p class="chat-bubble ${m.role}">${escapeHtml(m.text)}</p>`
    ).join("") || `<p class="chat-bubble empty">先打个招呼吧。</p>`;
    thread.scrollTop = thread.scrollHeight;
  };
  const setStatus = (text) => {
    status.hidden = !text;
    status.textContent = text || "";
    cancel.hidden = !chatAbort;
    send.disabled = Boolean(chatAbort);
  };
  render();
  cancel.addEventListener("click", () => {
    chatAbort?.abort();
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || chatAbort) return;
    input.value = "";
    chatLog.push({ role: "user", text });
    render();
    chatAbort = new AbortController();
    setStatus("睦头在想。可以按停下。");
    try {
      const endpoint = location.protocol === "file:" ? "http://127.0.0.1:8788/api/chat" : "/api/chat";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: chatAbort.signal,
        body: JSON.stringify({
          messages: [
            { role: "system", content: "你是莫提斯，月之森高二学生，浅绿色长发。说话直接简洁，用纯文本。" },
            ...chatLog.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `接口返回 ${res.status}`);
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) throw new Error(data?.error || "回了空话");
      chatLog.push({ role: "assistant", text: reply });
      setStatus("");
    } catch (err) {
      if (err.name === "AbortError") {
        setStatus("已停下。这句话还在上面，可以改一句再发。");
      } else {
        chatLog.push({ role: "assistant", text: "这句没送出去。" });
        setStatus(`${err.message || "后端没开"}。再发一次就重试。`);
      }
    } finally {
      chatAbort = null;
      if (status.textContent.startsWith("睦头在想")) setStatus("");
      cancel.hidden = true;
      send.disabled = false;
      render();
    }
  });
}

function syncSong() {
  const track = playlist[songIndex];
  vinylCover.src = track.cover;
  bgAudio.src = track.audio;
  if (playing) void bgAudio.play().catch(() => {});
}

let slapCount = 0;
const slips = [
  "今天的黄瓜比昨天圆。",
  "幕布后面只有另一块幕布。",
  "睦头决定先发呆三十秒。",
  "这张纸条没有下文。",
  "左边那张唱片自己在转。",
  "有人把灯换了颜色，歌还是那首。",
  "拍到第八下会响，但没有奖。",
  "搜索框里可以什么都不搜。",
];
let slipCursor = 0;

function bindWelcomeToys() {
  const slap = $("slap-cuke");
  const count = $("slap-count");
  const note = $("slap-note");
  if (count) count.textContent = String(slapCount);
  slap?.addEventListener("click", () => {
    slapCount += 1;
    count.textContent = String(slapCount);
    slap.classList.remove("is-hit");
    void slap.offsetWidth;
    slap.classList.add("is-hit");
    note.textContent = slapCount === 8 ? "八下了。响过了，还是没有奖。" : "拍了不算分。";
  });
  const slip = $("slip-draw");
  slip?.addEventListener("click", () => {
    $("slip-text").textContent = slips[slipCursor % slips.length];
    slipCursor += 1;
    slip.classList.remove("is-flip");
    void slip.offsetWidth;
    slip.classList.add("is-flip");
  });
}

function popCurrency() {
  currencyCountEl.classList.remove("pop");
  void currencyCountEl.offsetWidth;
  currencyCountEl.classList.add("pop");
}

function spawnCucumber() {
  if (document.hidden) return;
  const node = document.createElement("img");
  node.className = "fly-cuke";
  const cukes = ["./assets/drawn/cuke-a.svg", "./assets/drawn/cuke-b.svg", "./assets/drawn/cuke-c.svg", "./assets/drawn/cuke-d.svg", "./assets/drawn/cuke-e.svg"];
  node.src = cukes[Math.floor(Math.random() * cukes.length)];
  const y0 = innerHeight * (0.18 + Math.random() * 0.55);
  const bow = (Math.random() * 120 - 60);
  const duration = 9 + Math.random() * 7;
  const tilt = (Math.random() * 16 - 8).toFixed(1);
  node.style.offsetPath = `path('M -180 ${y0.toFixed(0)} Q ${(innerWidth * 0.48).toFixed(0)} ${(y0 + bow).toFixed(0)} ${innerWidth + 200} ${y0.toFixed(0)}')`;
  node.style.offsetRotate = `${tilt}deg`;
  node.style.offsetDistance = "0%";
  node.style.transition = reduceMotion ? "none" : `offset-distance ${duration}s linear`;
  cucumberLayer.appendChild(node);
  requestAnimationFrame(() => { node.style.offsetDistance = "100%"; });
  node.addEventListener("click", () => {
    if (node.classList.contains("caught")) return;
    node.classList.add("caught");
    const from = node.getBoundingClientRect();
    const rect = $("currency").getBoundingClientRect();
    node.style.offsetPath = "none";
    node.style.position = "fixed";
    node.style.left = `${from.left}px`;
    node.style.top = `${from.top}px`;
    node.style.transition = reduceMotion
      ? "none"
      : "left .48s cubic-bezier(0.2, 0.8, 0.2, 1), top .48s cubic-bezier(0.34, 1.4, 0.64, 1), transform .48s, opacity .48s";
    requestAnimationFrame(() => {
      node.style.left = `${rect.left + 12}px`;
      node.style.top = `${rect.top + 8}px`;
      node.style.transform = "scale(0.2) rotate(-12deg)";
      node.style.opacity = "0";
    });
    cucumberCount += 1;
    localStorage.setItem("cuke", String(cucumberCount));
    currencyCountEl.textContent = String(cucumberCount);
    popCurrency();
    setTimeout(() => node.remove(), 520);
  });
  setTimeout(() => { if (!node.classList.contains("caught")) node.remove(); }, duration * 1000 + 400);
}

function openStage(event) {
  const splash = $("title-splash");
  if (!splash || splash.classList.contains("gone")) return;
  splash.style.setProperty("--x", `${event.clientX}px`);
  splash.style.setProperty("--y", `${event.clientY}px`);
  splash.classList.add("gone");
  if (reduceMotion) {
    splash.remove();
  } else {
    let r = 0;
    const max = Math.hypot(innerWidth, innerHeight) * 1.2;
    const step = () => {
      r += max / 14;
      splash.style.setProperty("--r", `${r}px`);
      if (r < max) requestAnimationFrame(step);
      else splash.remove();
    };
    step();
  }
  $("curtain").classList.add("open");
  document.body.classList.add("awake");
  playing = true;
  turntable.classList.add("playing");
  turntable.classList.remove("paused");
  playBtn.textContent = "暂停";
  syncSong();
}

$("title-splash").addEventListener("click", openStage);
$("title-splash").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openStage({ clientX: innerWidth / 2, clientY: innerHeight / 2 });
  }
});

playBtn.addEventListener("click", () => {
  playing = !playing;
  turntable.classList.toggle("paused", !playing);
  turntable.classList.toggle("playing", playing);
  playBtn.textContent = playing ? "暂停" : "播放";
  if (playing) void bgAudio.play().catch(() => {});
  else bgAudio.pause();
});
$("next-btn").addEventListener("click", () => {
  songIndex = (songIndex + 1) % playlist.length;
  vinylCover.classList.remove("swap");
  void vinylCover.offsetWidth;
  vinylCover.classList.add("swap");
  syncSong();
});
bgAudio.addEventListener("ended", () => {
  songIndex = (songIndex + 1) % playlist.length;
  syncSong();
});

const begFaces = ["(´｡• ᵕ •｡`)", "(っ´▽`)っ", "(｡•́‿•̀｡)", "(づ￣ ³￣)づ", "(*´▽`*)", "(♡˙︶˙♡)", "(｡♥‿♥｡)", "(〃ω〃)", "(´･ω･`)", "(◕‿◕)"];
let begCount = Number(localStorage.getItem("cuke-beg") || 0);

function openBeg() {
  $("beg-face").textContent = begFaces[Math.floor(Math.random() * begFaces.length)];
  $("beg-modal").hidden = false;
}

function closeBeg() {
  $("beg-modal").hidden = true;
}

$("currency-add").addEventListener("click", () => {
  if (begCount < 5) {
    begCount += 1;
    localStorage.setItem("cuke-beg", String(begCount));
    openBeg();
    return;
  }
  cucumberCount += 1;
  localStorage.setItem("cuke", String(cucumberCount));
  currencyCountEl.textContent = String(cucumberCount);
  popCurrency();
});
$("beg-close").addEventListener("click", closeBeg);
$("beg-modal").addEventListener("click", (e) => {
  if (e.target === $("beg-modal")) closeBeg();
});

$("search-wrap").addEventListener("submit", (e) => {
  e.preventDefault();
  const found = menus.findIndex((menu) => hit(menu.label));
  if (found >= 0) selectMenu(found);
});
searchInput.addEventListener("input", () => {
  query = searchInput.value;
  layoutMenus();
  const index = Number(sceneCard.dataset.index || 0);
  showScene(index);
});

window.addEventListener("wheel", (e) => {
  if (!e.target.closest(".side-nav")) return;
  e.preventDefault();
  if (e.deltaY > 0) targetIndex = Math.min(menus.length - 1, targetIndex + 1);
  else targetIndex = Math.max(0, targetIndex - 1);
  tick();
}, { passive: false });

window.addEventListener("keydown", (e) => {
  const typing = e.target.closest("input, textarea");
  if (typing) return;
  if (e.key === "ArrowDown") {
    targetIndex = Math.min(menus.length - 1, targetIndex + 1);
    tick();
  }
  if (e.key === "ArrowUp") {
    targetIndex = Math.max(0, targetIndex - 1);
    tick();
  }
  if (e.key === "Escape") closeBeg();
});

window.addEventListener("resize", layoutMenus);

currencyCountEl.textContent = String(cucumberCount);
renderMenus();
showScene(0);
syncSong();
turntable.classList.add("paused");
requestAnimationFrame(tick);
if (!reduceMotion) {
  setInterval(spawnCucumber, 2800);
  spawnCucumber();
}
