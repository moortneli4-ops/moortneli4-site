const menus = [
  { label: "欢迎光临", titleImage: "./标题字体/欢迎光临.png" },
  { label: "自制谱面", titleImage: "./标题字体/自制谱面.png" },
  { label: "神秘小工具", titleImage: "./标题字体/神秘小工具.png" },
  { label: "与睦头尬聊", titleImage: "./标题字体/与睦头尬聊.png" },
  { label: "私密内容", titleImage: "./标题字体/私密内容.png" },
  { label: "关于我", titleImage: "./标题字体/关于我.png" },
];

const menuList = document.getElementById("menu-list");
const activeName = document.getElementById("active-name");
const activeDesc = document.getElementById("active-desc");
const sceneCard = document.getElementById("scene-card");
const cardWobble = document.getElementById("card-wobble");
const cardBase = document.getElementById("card-base");
const cardOuter = document.getElementById("card-outer");
const cardFlash = document.getElementById("card-flash");
const cardHotspot = document.getElementById("card-hotspot");
const cardTextScroll = document.getElementById("card-text-scroll");
const cucumberLayer = document.getElementById("cucumber-layer");
const cucumberFxLayer = document.getElementById("cucumber-fx-layer");
const unlockCucumberLayer = document.getElementById("unlock-cucumber-layer");
const unlockWhiteout = document.getElementById("unlock-whiteout");
const characterStage = document.getElementById("character-stage");
const characterSprite = document.getElementById("character-sprite");
const stageRoot = document.getElementById("stage-root");
const bigCucumberDecor = document.getElementById("big-cucumber-decor");
const searchBarDecor = document.getElementById("search-bar-decor");
const cucumberCurrencyWidget = document.getElementById("cucumber-currency-widget");
const cucumberCurrencyCountEl = document.getElementById("cucumber-currency-count");
const cucumberAddBtn = document.getElementById("cucumber-add-btn");
const turntablePair = document.getElementById("turntable-pair");
const turntableHitLayer = document.getElementById("turntable-hit-layer");
const coverZone = document.getElementById("cover-zone");
const coverHotspot = document.getElementById("cover-hotspot");
const playPauseBtn = document.getElementById("play-pause-btn");
const nextTrackBtn = document.getElementById("next-track-btn");
const turntableControls = document.getElementById("turntable-controls");
const vinylDisc = document.getElementById("vinyl-disc");
const vinylCoverRotor = document.getElementById("vinyl-cover-rotor");
const vinylCover = document.getElementById("vinyl-cover");
const bgAudio = document.getElementById("bg-audio");
const tonearm = document.getElementById("tonearm");
const stageCurtainLayer = document.getElementById("stage-curtain-layer");
const stageCurtainClosed = document.getElementById("stage-curtain-closed");
const stageCurtainSeqCanvas = document.getElementById("stage-curtain-seq-canvas");
const stageCurtainSeqFrame = document.getElementById("stage-curtain-seq-frame");
const stageCurtainOpen = document.getElementById("stage-curtain-open");
const rechargeModal = document.getElementById("recharge-modal");
const rechargePanel = document.getElementById("recharge-panel");
const rechargeCloseHit = document.getElementById("recharge-close-hit");
const rechargeInsufficient = document.getElementById("recharge-insufficient");
const titleSplash = document.getElementById("title-splash");
const titleSplashLines = document.getElementById("title-splash-lines");
const titleSplashParticles = document.getElementById("title-splash-particles");
const titleSplashLogo = document.getElementById("title-splash-logo");
const titleSplashFragments = document.getElementById("title-splash-fragments");
const menuDescriptions = [
  "莫特奈利斯个人网站，用于归档个人资源，也用来容纳一些古怪但有趣的灵感实验。",
  "展示谱面合集、分类筛选与下载入口。",
  "放置轻量实用功能与快捷交互。",
  "进入对话窗口，与睦头进行问答交流。\n\n这里是长文本测试段落：\n你可以把这部分理解成角色设定、使用说明、注意事项、常见问题与答案的混合展示区域。为了验证“文本区滚轮优先”的交互，我们刻意放一段很长的内容，让你在卡片中间的文本长条区域滚动时，不会触发左侧菜单滚动。\n\n继续补充测试内容：\n1) 当鼠标停留在文本区时，滚轮只影响这段文字的上下滚动。\n2) 当文字滚动到顶部或底部时，滚轮事件也不会冒泡给左侧菜单。\n3) 文本展示不会越过卡片可见高度，始终在中央长条区域内显示。\n\n再来一段占位文本用于拉长内容高度：\n莫特奈利斯个人站点将包含作品、工具、私密内容与对话入口。后续你可以把这里替换成真正的帮助文档、角色介绍、项目日志、版本公告，或者 FAQ 列表。\n\n长文本测试结束。",
  "展示需要受控访问的私密信息区。",
  "个人介绍、项目经历和联系方式。",
];
const scoreTableRows = [
  ["ID", "歌曲名", "新定数6/7"],
  ["9588", "SUPERNOVA", "WE"],
  ["9589", "影色舞 (Silhouette Dance)", "14.7"],
  ["9600", "Divide et impera!", "15.2"],
  ["9603", "DESTRUCTION 3,2,1", "15.2"],
  ["9604", "Re：Re", "15.1"],
  ["9605", "Arghena", "15.3"],
  ["9606", "HELL! or HELL?", "15.2"],
  ["9617", "LABYRINTHOX", "15.3"],
  ["9636", "Wolves Standing Towards Enemies", "15"],
  ["9641", "多次元宇宙融合論", "15.5"],
  ["9876", "SUPERNOVA", "15.5"],
  ["9971", "GIGANTO MACHINA", "15.5"],
];
const scorePackDownloadHref = "./自制谱面/[OPT]莫collection2026.6.7.zip";
const secretToolsDownloads = [
  { title: "录课脚本", href: "./神秘小工具/录课脚本.zip" },
  { title: "答题脚本", href: "./神秘小工具/答题脚本.zip" },
  { title: "音符宽高变换编辑器1.1", href: "./神秘小工具/音符宽高变换编辑器1.1.zip" },
];

let currentIndex = 0;
let targetIndex = 0;
let rafId = null;
const itemSpacing = 144;
const vinylRadius = 480; // 唱片半径（960/2）
const MENU_RADIUS_BASE = 450; // 默认文字轨迹半径
const MENU_TITLE_HEIGHT_BASE = 98; // 默认标题图高度
const MENU_ANGLE_STEP_BASE = 0.48; // 相邻菜单角度步进（弧度）
const maxMenuAngle = 1.34; // 可见弧段角度上限（更远才消失）
const CARD_TEXT_BASE_WIDTH = 558; // 卡牌正文设计宽度（用于文字随载体缩放）
const items = [];
let selectedIndex = 0;
let sceneToken = 0;
let sceneAnimation = null;
const wobbleTimers = [];
let cardWobbleTimer = null;
let cardInteractionLocked = false;
let cardHoverActive = false;
let wobbleAngle = 0;
let wobbleScale = 1;
let baseCardScale = 0.9;
let titleAndCardLeftShiftPx = 0;
let menuCenterTrackRafId = null;
let lastTrackedMenuCenterX = null;
const LOCKED_CHAT_LABEL = "与睦头尬聊";
let chatUnlocked = false;
let visibleMenuIndices = [];
let unlockCucumberEl = null;
let unlockCucumberAnimating = false;
let rechargeModalOpen = false;
let rechargeHintTimer = null;
let titleSplashLineTimer = null;
let titleSplashParticlesRaf = null;
let titleSplashCrashing = false;
let titleSplashParticlesData = [];

const playlist = [
  {
    cover: "./歌单/大耳朵睦睦.jpg",
    audio: "./歌单/大耳朵睦睦.wav",
  },
  {
    cover: "./歌单/噶.jpg",
    audio: "./歌单/噶.wav",
  },
  {
    cover: "./歌单/哆啦A梦.jpg",
    audio: "./歌单/哆啦A梦.wav",
  },
  {
    cover: "./歌单/地狱.jpg",
    audio: "./歌单/地狱.wav",
  },
  {
    cover: "./歌单/天上掉下个若叶睦.jpg",
    audio: "./歌单/天上掉下个若叶睦.wav",
  },
];
const AUDIO_TARGET_VOLUME = 0.8;
let isPlaying = false;
let isTrackTransitioning = false;
let currentSongIndex = 0; // 首次默认大耳朵睦睦
let audioFadeTimer = null;
let firstClickAutoplayArmed = true;
let justAutoStartedAt = 0;
let turntableHoverDepth = 0;
let turntableHoverLeaveTimer = null;
let cucumberCurrencyCount = 0;
const bigCucumberTuning = {
  xPercent: -203.7,
  yPercent: -107,
  scale: 3,
};
let bigCucumberHoverOffsetPx = 0;
let bigCucumberKickOffsetPx = 0;
let bigCucumberShakeDeg = 0;
let bigCucumberShakeOffsetX = 0;
let bigCucumberShakeOffsetY = 0;
let bigCucumberPostKickSwayX = 0;
let bigCucumberSequenceRunning = false;
let bigCucumberSequenceConsumed = false;
let bigCucumberPostKickSwayStarted = false;
let bigCucumberPostKickTimer = null;
let searchBarDismissed = false;
let topWidgetsWobbleSide = Math.random() > 0.5 ? 1 : -1;
let topWidgetsWobbleTimer = null;
let stageIntroCompleted = false;
let stageOpeningTriggered = false;
const STAGE_SEQUENCE_FRAME_COUNT = 25;
let stageSequencePlaybackTimer = null;
const stageSequenceFramePaths = Array.from(
  { length: STAGE_SEQUENCE_FRAME_COUNT },
  (_, i) => `./stage_open_white_alpha_frames/frame_${String(i).padStart(4, "0")}.png`
);
let stageSequencePreloadPromise = null;
let stageSequenceFramesReady = false;
let stageSequenceFrameImages = [];
let stageCurtainSeqCanvasCtx = null;
const turntableControlsTuning = {
  x: 112,
  y: -110,
};
const characterTuning = {
  x: 1386,
  y: 566,
  scale: 0.86,
};
const characterLayoutBase = {
  width: 1920,
  height: 1080,
  x: 1386,
  y: 566,
  scale: 0.86,
};

function getStageSize() {
  if (window.__LAYOUT_LAB__?.enabled) {
    return {
      width: Math.max(1, Number(window.__LAYOUT_LAB__.stageWidth) || 1024),
      height: Math.max(1, Number(window.__LAYOUT_LAB__.stageHeight) || 768),
    };
  }
  if (document.documentElement.classList.contains("force-landscape")) {
    return {
      width: Math.max(1, window.innerHeight),
      height: Math.max(1, window.innerWidth),
    };
  }
  return {
    width: Math.max(1, window.innerWidth),
    height: Math.max(1, window.innerHeight),
  };
}

function viewportToStagePoint(clientX, clientY) {
  if (!document.documentElement.classList.contains("force-landscape")) {
    return { x: clientX, y: clientY };
  }
  const stage = getStageSize();
  const cx = window.innerWidth * 0.5;
  const cy = window.innerHeight * 0.5;
  const dx = clientX - cx;
  const dy = clientY - cy;
  // 舞台被 rotate(90deg)，屏幕坐标逆变换回舞台坐标
  return {
    x: stage.width * 0.5 + dy,
    y: stage.height * 0.5 - dx,
  };
}

function syncViewportMode() {
  const lab = window.__LAYOUT_LAB__;
  if (lab?.enabled) {
    const preset = lab.preset === "phone" ? "phone" : "ipad";
    document.documentElement.classList.add("layout-lab-mode");
    document.documentElement.classList.toggle("phone-stage", preset === "phone");
    document.documentElement.classList.toggle("tablet-stage", preset === "ipad");
    document.documentElement.classList.remove("force-landscape");
    if (!lab.lockAutoCharacter) {
      syncCharacterLayout();
    }
    syncRechargeUiScale();
    return;
  }

  document.documentElement.classList.remove("layout-lab-mode");
  applyResponsiveLayoutProfile(false);
}

let layoutProfilesCache = null;
let activeLayoutPreset = null;
let layoutProfilesLoadPromise = null;

function detectLayoutPreset() {
  if (window.__LAYOUT_LAB__?.enabled) {
    return window.__LAYOUT_LAB__.preset === "phone" ? "phone" : "ipad";
  }
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  if (shortSide <= 540) return "phone";
  if (shortSide <= 900) return "ipad";
  return "desktop";
}

function loadLayoutProfiles() {
  if (layoutProfilesCache) return Promise.resolve(layoutProfilesCache);
  if (layoutProfilesLoadPromise) return layoutProfilesLoadPromise;
  layoutProfilesLoadPromise = fetch("./layout-profiles.json", { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      layoutProfilesCache = data;
      return data;
    })
    .catch(() => {
      layoutProfilesCache = null;
      return null;
    });
  return layoutProfilesLoadPromise;
}

function resetDesktopLayoutDefaults() {
  Object.assign(bigCucumberTuning, { xPercent: -203.7, yPercent: -107, scale: 3 });
  Object.assign(turntableControlsTuning, { x: 112, y: -110 });
  Object.assign(tonearmState, { x: 120, scale: 0.48, angle: 5 });
  Object.assign(layoutLabExtras.turntable, { left: -540, topPercent: 50, scale: 1 });
  Object.assign(layoutLabExtras.centerPanel, { leftPercent: 54, topPercent: 51.5, widthPx: 0 });
  Object.assign(layoutLabExtras.leftPanel, { left: 68, widthPx: 0 });
  Object.assign(layoutLabExtras.currencyWidget, { right: 6, top: 0, scale: 0.75 });
  Object.assign(layoutLabExtras.searchBar, { xPercent: -33.333, scale: 1 });
  Object.assign(layoutLabExtras.menuArc, {
    radius: MENU_RADIUS_BASE,
    titleScale: 1,
    angleStep: MENU_ANGLE_STEP_BASE,
  });

  applyBigCucumberTransform();
  applyTurntableControlsTuning();
  applyTurntableLayoutTuning(false);
  applyCenterPanelLayoutTuning();
  applyLeftPanelLayoutTuning();
  applyCurrencyWidgetLayoutTuning();
  applySearchBarLayoutTuning();
  applyMenuArcLayoutTuning();
  // 桌面人物/唱臂 y 交给自动布局
  window.__LAYOUT_PROFILE_ACTIVE__ = false;
  syncCharacterLayout();
  tonearmState.y = Math.round(getStageSize().height * 0.82);
  renderTonearm();
}

function applyResponsiveLayoutProfile(force) {
  if (window.__LAYOUT_LAB__?.enabled) return;

  const preset = detectLayoutPreset();
  const isPortrait = window.innerHeight > window.innerWidth;
  document.documentElement.classList.toggle("phone-stage", preset === "phone");
  document.documentElement.classList.toggle("tablet-stage", preset === "ipad");
  document.documentElement.classList.toggle(
    "force-landscape",
    preset === "phone" && isPortrait
  );

  if (!force && preset === activeLayoutPreset) {
    syncRechargeUiScale();
    return;
  }

  // 配置尚未加载时先只切 class，等 fetch 完成后再套参数
  if (!layoutProfilesCache && preset !== "desktop") {
    activeLayoutPreset = null;
    syncCharacterLayout();
    syncRechargeUiScale();
    return;
  }

  activeLayoutPreset = preset;

  const params = layoutProfilesCache?.presets?.[preset]?.params;
  if (preset === "desktop" || !params) {
    resetDesktopLayoutDefaults();
  } else {
    window.__LAYOUT_PROFILE_ACTIVE__ = true;
    applyLayoutLabParams(params);
    applyMenuArcLayoutTuning();
    applyTurntableLayoutTuning(false);
    applyCardContentScale();
  }
  syncRechargeUiScale();
  syncTitleAndCardLeftShift();
  syncTopDecorHeight();
}

function syncCharacterLayout() {
  if (window.__LAYOUT_LAB__?.lockAutoCharacter || window.__LAYOUT_PROFILE_ACTIVE__) {
    applyCharacterTransform();
    return;
  }
  const { width: w, height: h } = getStageSize();
  const base = characterLayoutBase;
  const fit = Math.min(w / base.width, h / base.height);
  let xRatio = base.x / base.width;
  let yRatio = base.y / base.height;
  let scale = base.scale * fit;

  if (document.documentElement.classList.contains("tablet-stage")) {
    // iPad：人物略向左下收一点，避免贴边/压卡
    xRatio = 0.705;
    yRatio = 0.545;
    scale *= 0.9;
    characterTuning.x = w * xRatio;
    characterTuning.y = h * yRatio;
    characterTuning.scale = scale;
  } else if (document.documentElement.classList.contains("phone-stage")) {
    xRatio = 0.78;
    yRatio = 0.58;
    scale = Math.max(0.26, Math.min(0.55, scale * 1.05));
    characterTuning.x = w * xRatio;
    characterTuning.y = h * yRatio;
    characterTuning.scale = scale;
  } else {
    // 桌面：先按基准定位，再右移约 2/3 身位、下移约 1/8 身位，最后放大到 3/2
    scale = Math.max(0.45, Math.min(base.scale, scale));
    let x = w * xRatio;
    let y = h * yRatio;
    const spriteCssWidth = 760;
    const spriteAspectH = 1728 / 2304;
    const bodyW = spriteCssWidth * scale;
    const bodyH = spriteCssWidth * spriteAspectH * scale;
    x += bodyW * (2 / 3);
    y += bodyH * (1 / 8);
    scale *= 1.5;
    characterTuning.x = x;
    characterTuning.y = y;
    characterTuning.scale = scale;
  }
  applyCharacterTransform();
}
const characterPairStemOverrides = {
  与睦头尬聊: ["与睦头尬聊", "睦头尬聊", "尬聊"],
};
const characterPairRegistry = Object.fromEntries(
  menus.map(({ label }) => {
    const stems = characterPairStemOverrides[label] || [label];
    const stemPaths = stems.map((stem) => [`./人物素材/${stem}1.png`, `./人物素材/${stem}2.png`]);
    return [
      label,
      {
        pair: stemPaths[0],
        candidates: stemPaths,
        resolved: false,
        resolving: false,
      },
    ];
  })
);
const characterImageExistsCache = new Map();
let characterActiveMenuLabel = "";
let characterPendingMenuLabel = "";
let characterCurrentFrameIndex = 0;
let characterTickTimer = null;
let isCharacterScreaming = false;
let activeCardLabel = menus[0]?.label || "";
const characterScreamImageSrc = "./人物素材/尖叫.png";
const characterScreamAudio = new Audio("./人物素材/尖叫.wav");
characterScreamAudio.preload = "auto";
const clickSfx = new Audio("./音效素材/点击.wav");
const cardSfx = new Audio("./音效素材/卡牌.wav");
const switchDiscSfx = new Audio("./音效素材/换碟.wav");
const pipeSfx = new Audio("./音效素材/钢管.wav");
const holySfx = new Audio("./音效素材/神圣.wav");
[clickSfx, cardSfx, switchDiscSfx, pipeSfx, holySfx].forEach((audio) => {
  audio.preload = "auto";
});
const activeSfxInstances = [];
const chatMessages = [];
const chatApiEndpoint = window.location.protocol === "file:"
  ? "http://127.0.0.1:8787/api/chat"
  : "/api/chat";
const chatSystemPrompt = [
  "你是莫提斯，是月之森女子学园的高二学生，有一头浅绿色长发。",
  "你身体里有两个灵魂：主人格是能说会道、元气满满、任性且偶尔无理取闹；安静人格只会极其偶尔出现。",
  "你说话直接、简洁，不拐弯抹角，不需要描述动作，不强调身份标签。",
  "你需要在聊天中自然体现人格状态，但始终用纯文本对话。",
  "你知道当前网页是个人站：有左侧导航菜单，可提供作者信息、资源下载入口、工具入口、私密内容验证等功能。",
  "回答时优先结合站内功能与用户问题，保持简洁清楚。",
].join("\n");

function playSfx(audioTemplate, volume = 1) {
  if (!audioTemplate) return;
  try {
    const instance = audioTemplate.cloneNode(true);
    instance.volume = volume;
    activeSfxInstances.push(instance);
    instance.addEventListener("ended", () => {
      const idx = activeSfxInstances.indexOf(instance);
      if (idx >= 0) activeSfxInstances.splice(idx, 1);
    });
    instance.addEventListener("error", () => {
      const idx = activeSfxInstances.indexOf(instance);
      if (idx >= 0) activeSfxInstances.splice(idx, 1);
    });
    void instance.play();
  } catch {
    try {
      audioTemplate.currentTime = 0;
      audioTemplate.volume = volume;
      void audioTemplate.play();
    } catch {
      // ignore autoplay or decode failures
    }
  }
}
const tonearmState = {
  x: 120,
  y: 0,
  scale: 0.48,
  angle: 5,
};
const floatingCucumbers = [];
let cucumberRafId = null;
let cucumberSpawnTimer = null;

function buildMenuCardThemes() {
  const allThemes = [1, 2, 3];
  const randomThemes = menus.map(
    () => allThemes[Math.floor(Math.random() * allThemes.length)]
  );
  // 避免极端情况：5 个菜单全抽到同一个主题
  if (new Set(randomThemes).size === 1) {
    const replaceIndex = Math.floor(Math.random() * randomThemes.length);
    randomThemes[replaceIndex] = (randomThemes[replaceIndex] % 3) + 1;
  }
  return randomThemes;
}

const menuCardThemes = buildMenuCardThemes();

function applyCardThemeForMenu(menuIndex) {
  const theme = menuCardThemes[menuIndex] || 1;
  sceneCard.classList.remove("ready");
  const baseSrc = `./卡片/卡${theme}.png`;
  const outerSrc = `./卡片/卡${theme}外.png`;
  cardFlash.src = baseSrc;

  let loadedCount = 0;
  const onAssetSettled = () => {
    loadedCount += 1;
    if (loadedCount >= 2) {
      sceneCard.classList.add("ready");
    }
  };

  cardBase.onload = onAssetSettled;
  cardOuter.onload = onAssetSettled;
  cardBase.onerror = onAssetSettled;
  cardOuter.onerror = onAssetSettled;

  cardBase.src = baseSrc;
  cardOuter.src = outerSrc;
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildScoreListText(rows) {
  return rows
    .map((row) => row.map((cell) => String(cell)).join("  |  "))
    .join("\n");
}

function renderChatThread() {
  const thread = document.getElementById("chat-thread");
  if (!thread) return;
  thread.innerHTML = chatMessages
    .map(
      (message) =>
        `<div class="chat-bubble ${message.role === "user" ? "user" : "bot"}">${escapeHtml(message.text)}</div>`
    )
    .join("");
  thread.scrollTop = thread.scrollHeight;
}

async function requestChatReplyFromDeepseek() {
  const messages = [
    { role: "system", content: chatSystemPrompt },
    ...chatMessages.map((message) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.text,
    })),
  ];
  const response = await fetch(chatApiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });
  if (!response.ok) {
    throw new Error(`DeepSeek ${response.status}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text.trim() : "🥒";
}

function mountChatPanel() {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  if (!form || !input) return;
  renderChatThread();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    chatMessages.push({ role: "user", text });
    input.value = "";
    chatMessages.push({ role: "bot", text: "..." });
    renderChatThread();
    form.querySelector(".chat-send-btn")?.setAttribute("disabled", "disabled");
    try {
      const reply = await requestChatReplyFromDeepseek();
      chatMessages[chatMessages.length - 1] = { role: "bot", text: reply };
    } catch {
      chatMessages[chatMessages.length - 1] = { role: "bot", text: "🥒" };
    } finally {
      form.querySelector(".chat-send-btn")?.removeAttribute("disabled");
      renderChatThread();
      input.focus();
    }
  });
}

function renderCardTextContent(index) {
  const label = menus[index]?.label || "";
  activeCardLabel = label;
  sceneCard.classList.remove("private-locked");
  if (cardTextScroll) {
    cardTextScroll.classList.remove("welcome-layout");
  }
  if (cardHotspot) {
    cardHotspot.classList.toggle("is-pass-through", label === "私密内容" || label === "关于我" || label === LOCKED_CHAT_LABEL);
  }
  if (label === "欢迎光临") {
    if (cardTextScroll) {
      cardTextScroll.classList.add("welcome-layout");
    }
    activeName.textContent = "莫特奈利斯\n个人网站";
    activeDesc.innerHTML = `
      <p class="welcome-desc-text">${escapeHtml(menuDescriptions[index] || "")}</p>
      <div class="welcome-refresh-wrap">
        <button type="button" id="welcome-refresh-btn" class="welcome-refresh-btn">刷新</button>
        <p class="welcome-refresh-tip">显示问题请点我</p>
      </div>
    `;
    const refreshBtn = document.getElementById("welcome-refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        playSfx(clickSfx);
        window.location.reload();
      });
      refreshBtn.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
    }
    return;
  }
  if (label === "自制谱面") {
    const downloadHref = encodeURI(scorePackDownloadHref);
    activeName.innerHTML =
      `<a class="active-name-link" href="${escapeHtml(downloadHref)}" download>点击下载谱包</a>`;
    const listText = buildScoreListText(scoreTableRows);
    activeDesc.innerHTML = `<pre class="score-list-text">${escapeHtml(listText)}</pre>`;
    return;
  }
  if (label === "神秘小工具") {
    activeName.textContent = "神秘小工具";
    const listHtml = secretToolsDownloads
      .map((item) => {
        const href = encodeURI(item.href);
        return `<a class="tool-download-link" href="${escapeHtml(href)}" download>${escapeHtml(item.title)}</a>`;
      })
      .join("");
    activeDesc.innerHTML = `<div class="tools-download-list">${listHtml}</div>`;
    return;
  }
  if (label === "私密内容") {
    activeName.textContent = "私密内容";
    sceneCard.classList.add("private-locked");
    activeDesc.innerHTML = `
      <div id="private-lock-panel" class="private-lock-panel">
        <img class="private-lock-image" src="./锁.png" alt="锁定">
        <form id="private-unlock-form" class="private-unlock-form" autocomplete="off">
          <input id="private-password-input" class="private-password-input" type="password" placeholder="请输入密码" aria-label="输入密码">
          <button class="private-unlock-btn" type="submit">解锁</button>
        </form>
        <p id="private-unlock-hint" class="private-unlock-hint"></p>
      </div>
    `;
    const unlockForm = document.getElementById("private-unlock-form");
    const passwordInput = document.getElementById("private-password-input");
    const unlockHint = document.getElementById("private-unlock-hint");
    if (unlockForm && passwordInput && unlockHint) {
      const lockPanel = document.getElementById("private-lock-panel");
      if (lockPanel) {
        lockPanel.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
        });
      }
      unlockForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const passcode = passwordInput.value.trim();
        if (passcode === "020406") {
          sceneCard.classList.remove("private-locked");
          activeDesc.innerHTML = `<p class="private-content-message">你来得太早了！</p>`;
          return;
        }
        unlockHint.textContent = "密码错误";
      });
      passwordInput.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
    }
    return;
  }
  if (label === "关于我") {
    activeName.textContent = "关于我";
    activeDesc.innerHTML = `
      <p class="about-line">来自 上海交通大学设计学院</p>
      <p class="about-line">关注我→<a class="about-link" href="https://space.bilibili.com/500049877?spm_id_from=333.1007.0.0" rel="noopener noreferrer">莫特奈利斯</a></p>
      <p class="about-line">个人群：1029664784</p>
    `;
    return;
  }
  if (label === LOCKED_CHAT_LABEL) {
    activeName.textContent = "与睦头尬聊";
    activeDesc.innerHTML = `
      <div class="chat-panel">
        <div id="chat-thread" class="chat-thread"></div>
        <form id="chat-form" class="chat-form" autocomplete="off">
          <input id="chat-input" class="chat-input" type="text" placeholder="输入内容...">
          <button class="chat-send-btn" type="submit">发送</button>
        </form>
      </div>
    `;
    mountChatPanel();
    return;
  }
  activeName.textContent = menus[index].label;
  activeDesc.textContent = menuDescriptions[index];
}

function getMenuCircleCenterX() {
  const vinylDisc = document.querySelector(".vinyl-disc");
  const leftPanel = document.querySelector(".left-panel");
  if (!vinylDisc || !leftPanel) return -120;

  const vinylRect = vinylDisc.getBoundingClientRect();
  const panelRect = leftPanel.getBoundingClientRect();
  const itemLeft = items.length > 0
    ? parseFloat(window.getComputedStyle(items[0]).left || "0")
    : 0;

  // 把唱片圆心换算到 menu-item 的局部 translate 坐标系
  return (vinylRect.left + vinylRect.width / 2) - (panelRect.left + itemLeft) - 200;
}

function rebuildVisibleMenuIndices() {
  visibleMenuIndices = menus
    .map((_, index) => index)
    .filter((index) => chatUnlocked || menus[index].label !== LOCKED_CHAT_LABEL);
}

function getFullMenuIndexByVisible(visibleIndex) {
  if (visibleMenuIndices.length === 0) return 0;
  const clamped = Math.max(0, Math.min(visibleMenuIndices.length - 1, visibleIndex));
  return visibleMenuIndices[clamped];
}

function renderMenus() {
  menuList.innerHTML = "";
  items.length = 0;
  wobbleTimers.forEach((timerId) => window.clearTimeout(timerId));
  wobbleTimers.length = 0;
  visibleMenuIndices.forEach((fullMenuIndex, visibleIndex) => {
    const name = menus[fullMenuIndex];
    const li = document.createElement("li");
    li.className = "menu-item";
    const img = document.createElement("img");
    img.className = "menu-title-image";
    img.src = name.titleImage;
    img.alt = name.label;
    img.draggable = false;

    const fallback = document.createElement("span");
    fallback.className = "menu-title-fallback";
    fallback.textContent = name.label;

    img.addEventListener("error", () => {
      img.style.display = "none";
      fallback.style.display = "inline";
    });
    img.addEventListener("load", () => {
      fallback.style.display = "none";
    });

    li.appendChild(img);
    li.appendChild(fallback);
    startTitleWobble(img, visibleIndex);
    li.dataset.index = String(visibleIndex);
    li.addEventListener("click", (event) => {
      if (suppressMenuItemClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      playSfx(clickSfx);
      setTarget(visibleIndex);
    });
    menuList.appendChild(li);
    items.push(li);
  });
  applyMenuArcLayoutTuning();
  renderPositions();
}

function startTitleWobble(imgEl, slotIndex) {
  let side = Math.random() > 0.5 ? 1 : -1;

  function tick() {
    side *= -1; // 左右左右来回
    const angle = (2 + Math.random() * 2) * side; // 2-4 度
    const size = 0.95 + Math.random() * 0.1; // 95%-105%
    imgEl.style.transform = `rotate(${angle}deg) scale(${size})`;

    const delay = 400 + Math.random() * 200; // 0.4-0.6 秒
    const timerId = window.setTimeout(tick, delay);
    wobbleTimers[slotIndex] = timerId;
  }

  tick();
}

function startCardWobble() {
  if (!cardWobble) return;
  if (cardWobbleTimer !== null) {
    window.clearTimeout(cardWobbleTimer);
    cardWobbleTimer = null;
  }

  let side = Math.random() > 0.5 ? 1 : -1;
  function tick() {
    if (cardInteractionLocked) return;
    side *= -1;
    wobbleAngle = (2 + Math.random() * 2) * side; // 2-4 度
    wobbleScale = 0.95 + Math.random() * 0.1; // 95%-105%
    applyCardTransform();
    const delay = 400 + Math.random() * 200; // 0.4-0.6 秒
    cardWobbleTimer = window.setTimeout(tick, delay);
  }

  tick();
}

function applyCardTransform() {
  const finalScale = baseCardScale * wobbleScale;
  cardWobble.style.transform = `translateX(16.6667%) translateX(${-titleAndCardLeftShiftPx}px) rotate(${wobbleAngle}deg) scale(${finalScale})`;
}

function setTarget(nextIndex) {
  const maxIndex = Math.max(0, visibleMenuIndices.length - 1);
  const clamped = Math.max(0, Math.min(maxIndex, nextIndex));
  if (clamped === targetIndex) return;
  targetIndex = clamped;
  startAnimation();
}

function setBaseCardScale(nextScale) {
  baseCardScale = nextScale;
  applyCardTransform();
}

function renderPositions() {
  const centerX = getMenuCircleCenterX();
  const arc = layoutLabExtras.menuArc;
  const trackRadius = arc?.radius ?? MENU_RADIUS_BASE;
  const angleStep = arc?.angleStep ?? MENU_ANGLE_STEP_BASE;
  let activeVisualIndex = Math.round(currentIndex);
  activeVisualIndex = Math.max(0, Math.min(visibleMenuIndices.length - 1, activeVisualIndex));
  if (activeVisualIndex !== selectedIndex) {
    const direction = activeVisualIndex > selectedIndex ? 1 : -1;
    selectedIndex = activeVisualIndex;
    switchScene(getFullMenuIndexByVisible(selectedIndex), direction);
    setCharacterMenuLabel(menus[getFullMenuIndexByVisible(selectedIndex)]?.label || "");
  }

  items.forEach((item, index) => {
    const offset = index - currentIndex;
    const rawTheta = offset * angleStep;
    const theta = Math.max(-maxMenuAngle, Math.min(maxMenuAngle, rawTheta));
    const x = centerX + trackRadius * Math.cos(theta) - titleAndCardLeftShiftPx;
    const y = trackRadius * Math.sin(theta);
    const normalized = Math.min(1.25, Math.abs(rawTheta / maxMenuAngle));
    const absNorm = normalized;
    const centerBoost = Math.exp(-Math.pow(y / 82, 2)); // 收窄高亮带，中心放大更集中
    const scale = 0.78 + centerBoost * 0.92; // 选中时临时放大更明显
    const outsideArc = Math.abs(rawTheta) > maxMenuAngle;
    const opacity = outsideArc ? 0 : 1 - Math.min(1, Math.pow(absNorm, 1.28) * 1.05);

    item.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    item.style.opacity = String(opacity);
    item.classList.toggle("active", index === activeVisualIndex);
  });
}

function refreshVisibleMenusAndSelection(preferredLabel) {
  const fallbackFullIndex = getFullMenuIndexByVisible(Math.round(currentIndex));
  const currentLabel = preferredLabel || menus[fallbackFullIndex]?.label || menus[0]?.label || "";
  rebuildVisibleMenuIndices();
  renderMenus();
  let nextVisibleIndex = visibleMenuIndices.findIndex((fullIndex) => menus[fullIndex].label === currentLabel);
  if (nextVisibleIndex < 0) nextVisibleIndex = 0;
  currentIndex = nextVisibleIndex;
  targetIndex = nextVisibleIndex;
  selectedIndex = nextVisibleIndex;
  renderPositions();
  const nextFullIndex = getFullMenuIndexByVisible(nextVisibleIndex);
  renderCardTextContent(nextFullIndex);
  applyCardThemeForMenu(nextFullIndex);
  setCharacterMenuLabel(menus[nextFullIndex]?.label || "");
}

function syncTitleAndCardLeftShift() {
  if (!sceneCard) return;
  const cardWidth = sceneCard.offsetWidth || sceneCard.getBoundingClientRect().width;
  if (cardWidth <= 0) return;
  titleAndCardLeftShiftPx = cardWidth / 6;
  applyCardTransform();
  renderPositions();
  applyCardContentScale();
}

function trackMenuCenterByRaf() {
  const currentCenterX = getMenuCircleCenterX();
  if (lastTrackedMenuCenterX === null || Math.abs(currentCenterX - lastTrackedMenuCenterX) > 0.1) {
    lastTrackedMenuCenterX = currentCenterX;
    renderPositions();
  }
  menuCenterTrackRafId = window.requestAnimationFrame(trackMenuCenterByRaf);
}

function switchScene(index, direction) {
  const token = ++sceneToken;
  if (sceneAnimation) {
    sceneAnimation.cancel();
    sceneAnimation = null;
  }

  sceneAnimation = sceneCard.animate(
    [
      { opacity: 1 },
      { opacity: 0 }
    ],
    {
      duration: 95,
      easing: "ease-out",
      fill: "forwards"
    }
  );

  window.setTimeout(() => {
    if (token !== sceneToken) return;

    renderCardTextContent(index);
    cardTextScroll.scrollTop = 0;
    applyCardThemeForMenu(index);

    if (sceneAnimation) {
      sceneAnimation.cancel();
      sceneAnimation = null;
    }

    // 三段关键帧模拟更大半径圆弧入场：右下(或左下) -> 侧上 -> 中心
    sceneAnimation = sceneCard.animate(
      [
        {
          opacity: 0,
          transform: `translate(${direction * 360}px, 220px) scale(0.9)`
        },
        {
          opacity: 0.68,
          transform: `translate(${direction * 180}px, -110px) scale(0.97)`
        },
        {
          opacity: 1,
          transform: "translate(0px, 0px) scale(1)"
        }
      ],
      {
        duration: 460,
        easing: "cubic-bezier(0.2, 0.78, 0.2, 1)",
        fill: "forwards"
      }
    );
  }, 110);
}

function pickDifferentTheme(currentTheme) {
  const candidates = [1, 2, 3].filter((x) => x !== currentTheme);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function runCardHotspotSequence() {
  if (cardInteractionLocked) return;
  playSfx(cardSfx);
  cardInteractionLocked = true;
  if (cardWobbleTimer !== null) {
    window.clearTimeout(cardWobbleTimer);
    cardWobbleTimer = null;
  }

  // 保持当前角度与当前大小，不再抖动
  applyCardTransform();

  const selectedFullIndex = getFullMenuIndexByVisible(selectedIndex);
  const currentTheme = menuCardThemes[selectedFullIndex] || 1;
  const nextTheme = pickDifferentTheme(currentTheme);

  const flashIn = cardFlash.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 2000, easing: "linear", fill: "forwards" }
  );

  window.setTimeout(() => {
    menuCardThemes[selectedFullIndex] = nextTheme;
    applyCardThemeForMenu(selectedFullIndex);

    flashIn.cancel();
    cardFlash.style.opacity = "1";
    cardFlash.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 2000, easing: "linear", fill: "forwards" }
    );
  }, 2000);

  window.setTimeout(() => {
    cardInteractionLocked = false;
    cardFlash.style.opacity = "0";
    setBaseCardScale(cardHoverActive ? 1 : 0.9);
    startCardWobble();
  }, 4000);
}

function setTurntableState(playing) {
  isPlaying = playing;
  turntablePair.classList.toggle("paused", !playing);
  playPauseBtn.textContent = playing ? "暂停" : "播放";
  tonearmState.angle = playing ? -5 : 5;
  renderTonearm();
}

function fadeAudioTo(targetVolume, durationMs = 400) {
  if (!bgAudio) return Promise.resolve();
  if (audioFadeTimer) {
    window.clearInterval(audioFadeTimer);
    audioFadeTimer = null;
  }

  const steps = 20;
  const interval = Math.max(16, Math.floor(durationMs / steps));
  const startVolume = bgAudio.volume;
  const delta = (targetVolume - startVolume) / steps;
  let currentStep = 0;

  return new Promise((resolve) => {
    audioFadeTimer = window.setInterval(() => {
      currentStep += 1;
      bgAudio.volume = Math.max(0, Math.min(1, bgAudio.volume + delta));
      if (currentStep >= steps) {
        window.clearInterval(audioFadeTimer);
        audioFadeTimer = null;
        bgAudio.volume = targetVolume;
        resolve();
      }
    }, interval);
  });
}

async function playWithFadeIn() {
  if (!bgAudio) return;
  bgAudio.volume = 0;
  try {
    await bgAudio.play();
  } catch {
    return;
  }
  await fadeAudioTo(AUDIO_TARGET_VOLUME, 520);
}

async function pauseWithFadeOut() {
  if (!bgAudio) return;
  await fadeAudioTo(0, 420);
  bgAudio.pause();
}

function applySongByIndex(index) {
  const safeIndex = ((index % playlist.length) + playlist.length) % playlist.length;
  currentSongIndex = safeIndex;
  vinylCover.src = playlist[safeIndex].cover;
  bgAudio.src = playlist[safeIndex].audio;
  bgAudio.loop = false;
}

function pickDifferentSongIndex(currentIndexArg) {
  if (playlist.length <= 1) return currentIndexArg;
  const pool = playlist.map((_, i) => i).filter((i) => i !== currentIndexArg);
  return pool[Math.floor(Math.random() * pool.length)];
}

async function switchToNextSong() {
  if (isTrackTransitioning) return;
  playSfx(switchDiscSfx);
  isTrackTransitioning = true;
  setTurntableHover(false);

  await fadeAudioTo(0, 420);
  bgAudio.pause();

  // 换碟动画必须乘上当前布局缩放，否则手机/iPad 会瞬间回到原始大尺寸
  const layoutScale = Number(layoutLabExtras?.turntable?.scale) || 1;
  const outKeyframes = [
    { transform: `translate(0px, -50%) scale(${layoutScale})`, opacity: 1 },
    { transform: `translate(-220px, -50%) scale(${layoutScale * 0.96})`, opacity: 0 }
  ];
  const inKeyframes = [
    { transform: `translate(0px, -50%) scale(${layoutScale * 0.5})`, opacity: 0 },
    { transform: `translate(0px, -50%) scale(${layoutScale})`, opacity: 1 }
  ];

  const outAnim = turntablePair.animate(
    outKeyframes,
    { duration: 520, easing: "cubic-bezier(0.22, 0.7, 0.22, 1)", fill: "forwards" }
  );
  const outHitAnim = turntableHitLayer
    ? turntableHitLayer.animate(
      outKeyframes,
      { duration: 520, easing: "cubic-bezier(0.22, 0.7, 0.22, 1)", fill: "forwards" }
    )
    : null;
  await Promise.all([
    outAnim.finished.catch(() => {}),
    outHitAnim ? outHitAnim.finished.catch(() => {}) : Promise.resolve(),
  ]);
  outAnim.cancel();
  if (outHitAnim) outHitAnim.cancel();

  const nextIndex = pickDifferentSongIndex(currentSongIndex);
  applySongByIndex(nextIndex);

  const inAnim = turntablePair.animate(
    inKeyframes,
    { duration: 560, easing: "cubic-bezier(0.2, 0.78, 0.2, 1)", fill: "forwards" }
  );
  const inHitAnim = turntableHitLayer
    ? turntableHitLayer.animate(
      inKeyframes,
      { duration: 560, easing: "cubic-bezier(0.2, 0.78, 0.2, 1)", fill: "forwards" }
    )
    : null;
  await Promise.all([
    inAnim.finished.catch(() => {}),
    inHitAnim ? inHitAnim.finished.catch(() => {}) : Promise.resolve(),
  ]);
  inAnim.cancel();
  if (inHitAnim) inHitAnim.cancel();
  turntablePair.style.opacity = "";
  if (turntableHitLayer) {
    turntableHitLayer.style.opacity = "";
  }
  // 恢复布局缩放，不要清空 transform（否则会原形毕露）
  applyTurntableLayoutTuning();

  setTurntableState(true);
  await playWithFadeIn();
  setTurntableHover(turntableHoverDepth > 0 || coverZone.matches(":hover"));
  isTrackTransitioning = false;
}

function setTurntableHover(active) {
  turntablePair.classList.toggle("hovered", active);
  if (turntableHitLayer) {
    turntableHitLayer.classList.toggle("hovered", active);
  }
  turntableControls.classList.toggle("visible", active);
  // 桌面默认布局交给 CSS .hovered；有缩放/位移配置时才用 JS 保 scale
  if (!isTurntableCssHoverManaged()) {
    applyTurntableLayoutTuning(active);
  }
}

function enterTurntableHoverZone() {
  if (turntableHoverLeaveTimer) {
    window.clearTimeout(turntableHoverLeaveTimer);
    turntableHoverLeaveTimer = null;
  }
  turntableHoverDepth += 1;
  setTurntableHover(true);
}

function leaveTurntableHoverZone() {
  turntableHoverDepth = Math.max(0, turntableHoverDepth - 1);
  if (turntableHoverDepth === 0) {
    scheduleTurntableHoverRelease();
  }
}

function scheduleTurntableHoverRelease() {
  if (turntableHoverLeaveTimer) {
    window.clearTimeout(turntableHoverLeaveTimer);
    turntableHoverLeaveTimer = null;
  }
  turntableHoverLeaveTimer = window.setTimeout(() => {
    if (turntableHoverDepth > 0) {
      turntableHoverLeaveTimer = null;
      return;
    }
    setTurntableHover(false);
    turntableHoverLeaveTimer = null;
  }, 60);
}

function initRandomSong() {
  if (!vinylCover || !bgAudio) return;
  applySongByIndex(currentSongIndex);
  bgAudio.volume = 0;
  setTurntableState(false);
}

function renderTonearm() {
  if (!tonearm) return;
  tonearm.style.left = `${tonearmState.x}px`;
  tonearm.style.top = `${tonearmState.y}px`;
  tonearm.style.transform = `translate(-50%, -50%) scale(${tonearmState.scale}) rotate(${tonearmState.angle}deg)`;
}

function syncTonearmViewportPosition() {
  if (window.__LAYOUT_LAB__?.lockAutoTonearm || window.__LAYOUT_PROFILE_ACTIVE__) {
    renderTonearm();
    return;
  }
  tonearmState.y = Math.round(getStageSize().height * 0.82);
  renderTonearm();
}

function makeCucumberState({ x, y, yBase, size, speed, wobbleAmp, wobbleFreq, phase }) {
  return {
    node: null,
    x,
    y,
    yBase,
    speed,
    wobbleAmp,
    wobbleFreq,
    phase,
    size,
    status: "flying",
    captureStartedAt: 0,
    captureDuration: 0,
    captureFromX: 0,
    captureFromY: 0,
    captureToX: 0,
    captureToY: 0,
    captureDelayUntil: 0,
  };
}

function spawnFloatingCucumber() {
  if (!cucumberLayer) return;
  const img = document.createElement("img");
  img.className = "float-cucumber";
  img.src = "./黄瓜收集/黄瓜.png";
  img.alt = "";
  img.draggable = false;
  cucumberLayer.appendChild(img);

  const size = (42 + Math.random() * 34) * 1.25;
  const yBase = getStageSize().height * (0.12 + Math.random() * 0.72);
  const state = makeCucumberState({
    x: -size - 120 - Math.random() * 180,
    y: yBase,
    yBase,
    speed: 70 + Math.random() * 45,
    wobbleAmp: 8 + Math.random() * 14,
    wobbleFreq: 0.7 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    size,
  });
  state.node = img;
  img.style.width = `${size}px`;
  floatingCucumbers.push(state);
}

function scheduleCucumberSpawn() {
  const delay = 600 + Math.random() * 900;
  cucumberSpawnTimer = window.setTimeout(() => {
    spawnFloatingCucumber();
    scheduleCucumberSpawn();
  }, delay);
}

function animateCucumbers(timeMs) {
  const t = timeMs / 1000;
  for (let i = floatingCucumbers.length - 1; i >= 0; i -= 1) {
    const c = floatingCucumbers[i];
    if (c.status === "flying") {
      c.x += c.speed / 60;
      c.y = c.yBase + Math.sin(t * c.wobbleFreq * Math.PI * 2 + c.phase) * c.wobbleAmp;
      c.node.style.transform = `translate(${c.x}px, ${c.y}px) scale(1)`;
      if (c.x > getStageSize().width + 160) {
        c.node.remove();
        floatingCucumbers.splice(i, 1);
      }
      continue;
    }

    if (c.status === "waitingCapture") {
      c.node.style.transform = `translate(${c.x}px, ${c.y}px) scale(1.2)`;
      if (timeMs >= c.captureDelayUntil) {
        startCaptureCucumber(c, timeMs);
      }
      continue;
    }

    if (c.status === "capturing") {
      const progress = Math.min(1, (timeMs - c.captureStartedAt) / c.captureDuration);
      const eased = progress * progress * progress; // 缓动加速（ease-in）
      c.x = c.captureFromX + (c.captureToX - c.captureFromX) * eased;
      c.y = c.captureFromY + (c.captureToY - c.captureFromY) * eased;

      let scale = 1;
      if (progress < 0.22) {
        scale = 1 + (progress / 0.22) * 0.2; // 先放大到 120%
      } else {
        scale = 1.2 - ((progress - 0.22) / 0.78) * 0.2; // 再逐渐回到 100%
      }
      c.node.style.transform = `translate(${c.x}px, ${c.y}px) scale(${scale})`;

      if (progress >= 1) {
        c.node.remove();
        floatingCucumbers.splice(i, 1);
        cucumberCurrencyCount += 1;
        renderCucumberCurrencyCount();
      }
    }
  }
  cucumberRafId = window.requestAnimationFrame(animateCucumbers);
}

function initFloatingCucumbers() {
  if (!cucumberLayer) return;
  spawnFloatingCucumber();
  spawnFloatingCucumber();
  scheduleCucumberSpawn();
  cucumberRafId = window.requestAnimationFrame(animateCucumbers);
}

function spawnBurstCucumberAt(originX, originY, delayMs) {
  const targetLayer = cucumberFxLayer || cucumberLayer;
  if (!targetLayer) return;
  const img = document.createElement("img");
  img.className = "float-cucumber";
  img.src = "./黄瓜收集/黄瓜.png";
  img.alt = "";
  img.draggable = false;
  img.style.zIndex = "2";
  targetLayer.appendChild(img);

  const size = (40 + Math.random() * 20) * 1.25;
  const jitterX = (Math.random() - 0.5) * 28;
  const jitterY = (Math.random() - 0.5) * 20;
  const x = originX - size * 0.5 + jitterX;
  const y = originY - size * 0.5 + jitterY;
  const state = makeCucumberState({
    x,
    y,
    yBase: y,
    size,
    speed: 0,
    wobbleAmp: 0,
    wobbleFreq: 0,
    phase: 0,
  });
  state.node = img;
  state.status = "waitingCapture";
  state.captureDelayUntil = performance.now() + delayMs;
  img.style.width = `${size}px`;
  floatingCucumbers.push(state);
}

function spawnCucumberBurstToCurrency(originX, originY, count = 5) {
  for (let i = 0; i < count; i += 1) {
    spawnBurstCucumberAt(originX, originY, i * 90);
  }
}

function unlockChatMenuAndSwitch() {
  if (chatUnlocked) return;
  chatUnlocked = true;
  refreshVisibleMenusAndSelection(LOCKED_CHAT_LABEL);
}

function removeUnlockCucumber() {
  if (unlockCucumberEl) {
    unlockCucumberEl.remove();
    unlockCucumberEl = null;
  }
  unlockCucumberAnimating = false;
}

function triggerChatUnlockWhiteout() {
  if (!unlockWhiteout) {
    unlockChatMenuAndSwitch();
    removeUnlockCucumber();
    return;
  }
  unlockWhiteout.classList.add("active");
  window.setTimeout(() => {
    unlockChatMenuAndSwitch();
    removeUnlockCucumber();
    window.setTimeout(() => {
      unlockWhiteout.classList.remove("active");
    }, 160);
  }, 460);
}

function animateUnlockCucumberToCenter() {
  if (!unlockCucumberEl || unlockCucumberAnimating) return;
  playSfx(holySfx);
  unlockCucumberAnimating = true;
  unlockCucumberEl.classList.add("animating");
  const imgEl = unlockCucumberEl.querySelector("img");
  const startRect = unlockCucumberEl.getBoundingClientRect();
  const startX = startRect.left + startRect.width * 0.5;
  const startY = startRect.top + startRect.height * 0.5;
  const stage = getStageSize();
  const targetX = stage.width * 0.5;
  const targetY = stage.height * 0.5;
  const durationMs = 4000;
  const startedAt = performance.now();
  const frame = (now) => {
    if (!unlockCucumberEl) return;
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const x = startX + (targetX - startX) * eased;
    const y = startY + (targetY - startY) * eased;
    const scale = 1 + progress; // 2x -> 4x
    unlockCucumberEl.style.left = `${x}px`;
    unlockCucumberEl.style.top = `${y}px`;
    unlockCucumberEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
    if (imgEl instanceof HTMLImageElement) {
      const whiten = Math.round(progress * 100);
      imgEl.style.filter =
        `brightness(${1.4 + progress * 1.8}) saturate(${1.35 - progress * 1.35}) grayscale(${progress}) drop-shadow(0 0 ${24 + progress * 56}px rgba(255,255,255,0.96))`;
      imgEl.style.opacity = `${1 - progress * 0.12}`;
      imgEl.style.setProperty("--unlock-whiten", `${whiten}%`);
    }
    if (progress < 1) {
      window.requestAnimationFrame(frame);
    } else {
      triggerChatUnlockWhiteout();
    }
  };
  window.requestAnimationFrame(frame);
}

function spawnUnlockCucumberAt(originX, originY) {
  if (!unlockCucumberLayer || chatUnlocked || unlockCucumberEl) return;
  const node = document.createElement("div");
  node.className = "unlock-cucumber";
  node.style.left = `${originX}px`;
  node.style.top = `${originY}px`;

  const img = document.createElement("img");
  img.src = "./黄瓜收集/黄瓜.png";
  img.alt = "";
  img.draggable = false;

  const rays = document.createElement("div");
  rays.className = "unlock-rays";

  node.appendChild(img);
  node.appendChild(rays);
  node.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    animateUnlockCucumberToCenter();
  });
  unlockCucumberLayer.appendChild(node);
  unlockCucumberEl = node;
}

function renderCucumberCurrencyCount() {
  if (!cucumberCurrencyCountEl) return;
  cucumberCurrencyCountEl.textContent = String(cucumberCurrencyCount);
}

function showRechargeInsufficient() {
  if (!rechargeInsufficient) return;
  if (rechargeHintTimer !== null) {
    window.clearTimeout(rechargeHintTimer);
    rechargeHintTimer = null;
  }
  rechargeInsufficient.classList.add("visible");
  rechargeHintTimer = window.setTimeout(() => {
    rechargeInsufficient.classList.remove("visible");
    rechargeHintTimer = null;
  }, 1300);
}

function closeRechargeModal() {
  if (!rechargeModal) return;
  rechargeModalOpen = false;
  rechargeModal.classList.remove("active");
  rechargeModal.setAttribute("aria-hidden", "true");
  if (rechargeInsufficient) {
    rechargeInsufficient.classList.remove("visible");
  }
  if (rechargeHintTimer !== null) {
    window.clearTimeout(rechargeHintTimer);
    rechargeHintTimer = null;
  }
}

function spawnTitleSplashLine() {
  if (!titleSplashLines || !titleSplash || titleSplashCrashing) return;
  const line = document.createElement("span");
  line.className = "title-splash-line";
  const left = 8 + Math.random() * 84;
  const rotate = -8 + Math.random() * 16;
  line.style.left = `${left}%`;
  line.style.top = "-25vh";
  line.style.transform = `rotate(${rotate}deg)`;
  titleSplashLines.appendChild(line);
  window.setTimeout(() => {
    line.remove();
  }, 1200);
}

function scheduleTitleSplashLines() {
  if (!titleSplash || titleSplashCrashing) return;
  spawnTitleSplashLine();
  const delay = 280 + Math.random() * 760;
  titleSplashLineTimer = window.setTimeout(scheduleTitleSplashLines, delay);
}

function initTitleSplashParticles() {
  if (!(titleSplashParticles instanceof HTMLCanvasElement)) return;
  const canvas = titleSplashParticles;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resize = () => {
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const stage = getStageSize();
    canvas.width = Math.floor(stage.width * ratio);
    canvas.height = Math.floor(stage.height * ratio);
    canvas.style.width = `${stage.width}px`;
    canvas.style.height = `${stage.height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();

  titleSplashParticlesData = Array.from({ length: 90 }, () => {
    const stage = getStageSize();
    return {
      x: Math.random() * stage.width,
      y: Math.random() * stage.height,
      r: 0.8 + Math.random() * 2,
      vx: -0.22 + Math.random() * 0.44,
      vy: -0.18 + Math.random() * 0.36,
      a: 0.18 + Math.random() * 0.52,
    };
  });

  const draw = () => {
    if (titleSplashCrashing || !titleSplash || titleSplash.classList.contains("hidden")) {
      return;
    }
    const stage = getStageSize();
    ctx.clearRect(0, 0, stage.width, stage.height);
    for (const p of titleSplashParticlesData) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = stage.width + 20;
      if (p.x > stage.width + 20) p.x = -20;
      if (p.y < -20) p.y = stage.height + 20;
      if (p.y > stage.height + 20) p.y = -20;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 158, 107, ${p.a})`;
      ctx.fill();
    }
    titleSplashParticlesRaf = window.requestAnimationFrame(draw);
  };
  if (titleSplashParticlesRaf !== null) {
    window.cancelAnimationFrame(titleSplashParticlesRaf);
  }
  titleSplashParticlesRaf = window.requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
}

function explodeTitleSplashBackground() {
  if (!titleSplashFragments || !titleSplash) return;
  titleSplashFragments.innerHTML = "";
  const cols = 5;
  const rows = 3;
  const stage = getStageSize();
  const shardW = Math.ceil(stage.width / cols);
  const shardH = Math.ceil(stage.height / rows);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const shard = document.createElement("div");
      shard.className = "title-splash-fragment";
      const x = col * shardW;
      const y = row * shardH;
      shard.style.left = `${x}px`;
      shard.style.top = `${y}px`;
      shard.style.width = `${shardW + 1}px`;
      shard.style.height = `${shardH + 1}px`;
      shard.style.clipPath = `polygon(${8 + Math.random() * 18}% ${6 + Math.random() * 14}%, ${82 + Math.random() * 14}% ${2 + Math.random() * 20}%, ${92 + Math.random() * 6}% ${78 + Math.random() * 20}%, ${3 + Math.random() * 14}% ${84 + Math.random() * 14}%)`;
      titleSplashFragments.appendChild(shard);
      const dx = (Math.random() - 0.5) * 280;
      const dy = 520 + Math.random() * 360;
      const rot = (Math.random() - 0.5) * 150;
      shard.animate(
        [
          { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
        ],
        { duration: 300 + Math.random() * 180, easing: "cubic-bezier(0.24, 0.78, 0.24, 1)", fill: "forwards" }
      );
    }
  }
}

function spawnTitleSplashLogoCucumbers() {
  if (!titleSplashLogo) return;
  const rect = titleSplashLogo.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const target = getCucumberCurrencyMergePoint();
  const count = 7;
  for (let i = 0; i < count; i += 1) {
    const node = document.createElement("div");
    node.className = "title-splash-cucumber";
    node.innerHTML = `<img src="./黄瓜收集/黄瓜.png" alt="">`;
    const theta = (Math.PI * 2 * i) / count;
    const radius = Math.min(rect.width, rect.height) * 0.34;
    const sx = cx + Math.cos(theta) * radius;
    const sy = cy + Math.sin(theta) * radius;
    node.style.left = `${sx}px`;
    node.style.top = `${sy}px`;
    document.body.appendChild(node);
    const startedAt = performance.now();
    const durationMs = 980 + Math.random() * 260;
    const anim = (now) => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const x = sx + (target.x - sx) * eased;
      const y = sy + (target.y - sy) * eased;
      const scale = 1.2 - eased * 0.7;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${(1 - eased) * 18}deg)`;
      node.style.opacity = `${1 - t * 0.2}`;
      if (t < 1) {
        window.requestAnimationFrame(anim);
      } else {
        node.remove();
        cucumberCurrencyCount += 1;
        renderCucumberCurrencyCount();
      }
    };
    window.requestAnimationFrame(anim);
  }
}

function triggerTitleSplashCrash() {
  if (!titleSplash || titleSplashCrashing) return;
  triggerTitleSplashReveal(window.innerWidth * 0.5, window.innerHeight * 0.5);
}

function triggerTitleSplashReveal(clientX, clientY) {
  if (!titleSplash || titleSplashCrashing) return;
  titleSplashCrashing = true;
  if (titleSplashLineTimer !== null) {
    window.clearTimeout(titleSplashLineTimer);
    titleSplashLineTimer = null;
  }
  if (titleSplashParticlesRaf !== null) {
    window.cancelAnimationFrame(titleSplashParticlesRaf);
    titleSplashParticlesRaf = null;
  }
  if (titleSplashLines) {
    titleSplashLines.innerHTML = "";
  }
  spawnTitleSplashLogoCucumbers();
  triggerFirstUserAudioStart();
  triggerStageOpenPlayback();
  const stagePoint = viewportToStagePoint(clientX, clientY);
  const stage = getStageSize();
  titleSplash.classList.add("revealing");
  titleSplash.style.setProperty("--reveal-x", `${stagePoint.x}px`);
  titleSplash.style.setProperty("--reveal-y", `${stagePoint.y}px`);
  titleSplash.style.setProperty("--reveal-r", "0px");

  const maxRadius =
    Math.hypot(
      Math.max(stagePoint.x, stage.width - stagePoint.x),
      Math.max(stagePoint.y, stage.height - stagePoint.y)
    ) + 80;
  const durationMs = 360;
  const startedAt = performance.now();
  const step = (now) => {
    if (!titleSplash) return;
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = 1 - Math.pow(1 - progress, 4);
    const radius = maxRadius * eased;
    titleSplash.style.setProperty("--reveal-r", `${radius}px`);
    if (progress < 1) {
      window.requestAnimationFrame(step);
      return;
    }
    titleSplash.classList.add("hidden");
    titleSplash.setAttribute("aria-hidden", "true");
    titleSplash.style.display = "none";
  };
  window.requestAnimationFrame(step);
}

function initTitleSplash() {
  if (!titleSplash) return;
  titleSplash.addEventListener("click", (event) => {
    playSfx(clickSfx);
    triggerTitleSplashReveal(event.clientX, event.clientY);
  });
  scheduleTitleSplashLines();
  initTitleSplashParticles();
}

function openRechargeModal() {
  if (!rechargeModal) return;
  syncRechargeUiScale();
  rechargeModalOpen = true;
  rechargeModal.classList.add("active");
  rechargeModal.setAttribute("aria-hidden", "false");
  if (rechargeInsufficient) {
    rechargeInsufficient.classList.remove("visible");
  }
}

function syncTopDecorHeight() {
  if (!cucumberCurrencyWidget || !bigCucumberDecor || !searchBarDecor) return;
  const widgetHeight = Math.round(cucumberCurrencyWidget.getBoundingClientRect().height);
  if (widgetHeight > 0) {
    document.documentElement.style.setProperty("--top-ui-height", `${widgetHeight}px`);
  }
  const bigRect = bigCucumberDecor.getBoundingClientRect();
  if (bigRect.width > 0 && bigRect.height > 0) {
    document.documentElement.style.setProperty("--big-cucumber-width", `${bigRect.width}px`);
    document.documentElement.style.setProperty("--big-cucumber-height", `${bigRect.height}px`);
  }
}

function applyBigCucumberTransform() {
  if (!bigCucumberDecor) return;
  bigCucumberDecor.style.transform =
    `translate(${bigCucumberTuning.xPercent}%, ${bigCucumberTuning.yPercent}%) ` +
    `translate(${bigCucumberHoverOffsetPx + bigCucumberKickOffsetPx + bigCucumberShakeOffsetX + bigCucumberPostKickSwayX}px, ${bigCucumberShakeOffsetY}px) ` +
    `rotate(${bigCucumberShakeDeg}deg) scale(${bigCucumberTuning.scale})`;
}

function applyCharacterTransform() {
  if (!characterStage) return;
  characterStage.style.left = `${characterTuning.x}px`;
  characterStage.style.top = `${characterTuning.y}px`;
  characterStage.style.transform = `translate(-50%, -50%) scale(${characterTuning.scale})`;
}

function setCharacterMenuLabel(nextLabel) {
  characterPendingMenuLabel = nextLabel || "";
  resolveCharacterPairAsync(characterPendingMenuLabel);
}

function canLoadImage(src) {
  if (!src) return Promise.resolve(false);
  if (characterImageExistsCache.has(src)) {
    return Promise.resolve(characterImageExistsCache.get(src));
  }
  return new Promise((resolve) => {
    const testImage = new Image();
    testImage.onload = () => {
      characterImageExistsCache.set(src, true);
      resolve(true);
    };
    testImage.onerror = () => {
      characterImageExistsCache.set(src, false);
      resolve(false);
    };
    testImage.src = src;
  });
}

async function resolveCharacterPairAsync(label) {
  const entry = characterPairRegistry[label];
  if (!entry || entry.resolved || entry.resolving) return;
  entry.resolving = true;
  for (const candidatePair of entry.candidates) {
    const [img1, img2] = candidatePair;
    const [ok1, ok2] = await Promise.all([canLoadImage(img1), canLoadImage(img2)]);
    if (ok1 && ok2) {
      entry.pair = candidatePair;
      entry.resolved = true;
      entry.resolving = false;
      if (characterActiveMenuLabel === label && characterSprite && characterStage) {
        characterSprite.src = entry.pair[characterCurrentFrameIndex];
        characterStage.style.opacity = "1";
      }
      return;
    }
  }
  entry.resolved = true;
  entry.resolving = false;
}

function getCharacterPair(label) {
  const entry = characterPairRegistry[label];
  if (!entry) return null;
  return entry.pair;
}

function tickCharacterPair() {
  if (isCharacterScreaming) {
    const delayWhileScreaming = 400 + Math.random() * 200;
    characterTickTimer = window.setTimeout(tickCharacterPair, delayWhileScreaming);
    return;
  }
  const switchedMenu = characterPendingMenuLabel !== characterActiveMenuLabel;
  if (switchedMenu) {
    characterActiveMenuLabel = characterPendingMenuLabel;
    const pair = getCharacterPair(characterActiveMenuLabel);
    if (!pair || !characterSprite || !characterStage) {
      if (characterStage) characterStage.style.opacity = "0";
    } else {
      characterCurrentFrameIndex = Math.random() < 0.5 ? 0 : 1;
      characterSprite.src = pair[characterCurrentFrameIndex];
      characterStage.style.opacity = "1";
    }
  } else {
    const pair = getCharacterPair(characterActiveMenuLabel);
    if (pair && characterSprite && characterStage) {
      characterCurrentFrameIndex = characterCurrentFrameIndex === 0 ? 1 : 0;
      characterSprite.src = pair[characterCurrentFrameIndex];
      characterStage.style.opacity = "1";
    }
  }

  const delay = 400 + Math.random() * 200;
  characterTickTimer = window.setTimeout(tickCharacterPair, delay);
}

function startTopWidgetsRotateWobble() {
  if (window.__LAYOUT_LAB__?.enabled) return;
  if (topWidgetsWobbleTimer !== null) {
    window.clearTimeout(topWidgetsWobbleTimer);
    topWidgetsWobbleTimer = null;
  }
  const tick = () => {
    topWidgetsWobbleSide *= -1;
    const angle = (2 + Math.random() * 2) * topWidgetsWobbleSide; // 2-4 度
    if (cucumberCurrencyWidget) {
      cucumberCurrencyWidget.style.transform = `translateX(-23.333%) scale(0.75) rotate(${angle}deg)`;
    }
    if (searchBarDecor && !searchBarDismissed) {
      searchBarDecor.style.transform = `translateX(-33.333%) rotate(${angle}deg)`;
    }
    const delay = 400 + Math.random() * 200; // 0.4~0.6 秒
    topWidgetsWobbleTimer = window.setTimeout(tick, delay);
  };
  tick();
}

function startBigCucumberPostKickSway() {
  if (bigCucumberPostKickSwayStarted) return;
  bigCucumberPostKickSwayStarted = true;
  let side = Math.random() > 0.5 ? 1 : -1;
  const tick = () => {
    side *= -1;
    const offset = (8 + Math.random() * 8) * side; // 仅左右平移
    bigCucumberPostKickSwayX = offset;
    applyBigCucumberTransform();
    const delay = 400 + Math.random() * 200; // 与标题/卡牌同款随机时刻
    bigCucumberPostKickTimer = window.setTimeout(tick, delay);
  };
  tick();
}

function applyTurntableControlsTuning() {
  if (!turntableControls) return;
  turntableControls.style.transform =
    `translateX(-50%) translate(${turntableControlsTuning.x}px, ${turntableControlsTuning.y}px)`;
}

const layoutLabExtras = {
  turntable: { left: -540, topPercent: 50, scale: 1 },
  centerPanel: { leftPercent: 54, topPercent: 51.5, widthPx: 0 },
  leftPanel: { left: 68, widthPx: 0 },
  currencyWidget: { right: 6, top: 0, scale: 0.75 },
  searchBar: { xPercent: -33.333, scale: 1 },
  menuArc: {
    radius: MENU_RADIUS_BASE,
    titleScale: 1,
    angleStep: MENU_ANGLE_STEP_BASE,
  },
};

function syncMenuArcTitleScale() {
  const arc = layoutLabExtras.menuArc;
  // 半径与标题图始终联动：以默认半径 450 为 1.0
  arc.titleScale = arc.radius / MENU_RADIUS_BASE;
}

function applyMenuArcLayoutTuning() {
  const arc = layoutLabExtras.menuArc;
  if (!arc.titleScale || arc.titleScale <= 0) {
    syncMenuArcTitleScale();
  }
  const height = MENU_TITLE_HEIGHT_BASE * arc.titleScale;
  document.querySelectorAll(".menu-title-image").forEach((img) => {
    if (img instanceof HTMLElement) {
      img.style.height = `${height}px`;
    }
  });
  document.documentElement.style.setProperty("--menu-title-scale", String(arc.titleScale));
  renderPositions();
}

function applyCardContentScale() {
  const panel = document.querySelector(".center-panel");
  const card = sceneCard;
  let cardWidth = 0;
  if (card instanceof HTMLElement && card.offsetWidth > 0) {
    cardWidth = card.offsetWidth;
  } else if (panel instanceof HTMLElement && panel.offsetWidth > 0) {
    cardWidth = panel.offsetWidth * 0.855;
  } else if (layoutLabExtras.centerPanel.widthPx > 0) {
    cardWidth = layoutLabExtras.centerPanel.widthPx * 0.855;
  } else {
    cardWidth = CARD_TEXT_BASE_WIDTH;
  }
  const scale = Math.max(0.35, cardWidth / CARD_TEXT_BASE_WIDTH);
  document.documentElement.style.setProperty("--card-content-scale", String(scale));
  syncRechargeUiScale();
}

function syncRechargeUiScale() {
  const { height } = getStageSize();
  // 充值面板设计高度按 768（1024×768）；按舞台高度留边后整体缩放
  const RECHARGE_DESIGN_HEIGHT = 768;
  let scale = (height * 0.86) / RECHARGE_DESIGN_HEIGHT;
  const isCompact =
    document.documentElement.classList.contains("phone-stage") ||
    document.documentElement.classList.contains("tablet-stage") ||
    Boolean(window.__LAYOUT_LAB__?.enabled);
  if (isCompact) {
    scale = Math.min(0.92, Math.max(0.32, scale));
  } else {
    scale = Math.min(1, Math.max(0.55, scale));
  }
  document.documentElement.style.setProperty("--recharge-ui-scale", String(scale));
}

function isTurntableCssHoverManaged() {
  const t = layoutLabExtras?.turntable;
  if (!t) return true;
  // 电脑端默认唱片位：清内联样式，恢复 CSS 悬停右移 125px
  return (
    !window.__LAYOUT_LAB__?.enabled &&
    !window.__LAYOUT_PROFILE_ACTIVE__ &&
    Number(t.scale) === 1 &&
    Number(t.left) === -540 &&
    Number(t.topPercent) === 50
  );
}

function applyTurntableLayoutTuning(hovered) {
  const t = layoutLabExtras.turntable;
  if (isTurntableCssHoverManaged()) {
    if (turntablePair) {
      turntablePair.style.left = "";
      turntablePair.style.top = "";
      turntablePair.style.transform = "";
    }
    if (turntableHitLayer) {
      turntableHitLayer.style.left = "";
      turntableHitLayer.style.top = "";
      turntableHitLayer.style.transform = "";
    }
    return;
  }
  const isHovered =
    typeof hovered === "boolean"
      ? hovered
      : Boolean(turntablePair?.classList.contains("hovered"));
  const shiftX = isHovered ? 125 : 0;
  const transform = `translate(${shiftX}px, -50%) scale(${t.scale})`;
  if (turntablePair) {
    turntablePair.style.left = `${t.left}px`;
    turntablePair.style.top = `${t.topPercent}%`;
    turntablePair.style.transform = transform;
  }
  if (turntableHitLayer) {
    turntableHitLayer.style.left = `${t.left}px`;
    turntableHitLayer.style.top = `${t.topPercent}%`;
    turntableHitLayer.style.transform = transform;
  }
}

function applyCenterPanelLayoutTuning() {
  const panel = document.querySelector(".center-panel");
  if (!panel) return;
  const p = layoutLabExtras.centerPanel;
  panel.style.left = `${p.leftPercent}%`;
  panel.style.top = `${p.topPercent}%`;
  if (p.widthPx !== 0 && p.widthPx != null) {
    panel.style.width = `${p.widthPx}px`;
  } else {
    panel.style.width = "";
  }
  applyCardContentScale();
}

function applyLeftPanelLayoutTuning() {
  const panel = document.querySelector(".left-panel");
  if (!panel) return;
  const p = layoutLabExtras.leftPanel;
  panel.style.left = `${p.left}px`;
  if (p.widthPx !== 0 && p.widthPx != null) {
    panel.style.width = `${p.widthPx}px`;
  } else {
    panel.style.width = "";
  }
}

function applyCurrencyWidgetLayoutTuning() {
  if (!cucumberCurrencyWidget) return;
  const p = layoutLabExtras.currencyWidget;
  cucumberCurrencyWidget.style.right = `${p.right}px`;
  cucumberCurrencyWidget.style.top = `${p.top}px`;
  cucumberCurrencyWidget.style.transform = `translateX(-23.333%) scale(${p.scale})`;
}

function applySearchBarLayoutTuning() {
  if (!searchBarDecor || searchBarDismissed) return;
  const p = layoutLabExtras.searchBar;
  searchBarDecor.style.transform = `translateX(${p.xPercent}%) scale(${p.scale})`;
}

function collectLayoutLabParams() {
  return {
    character: {
      x: Number(characterTuning.x.toFixed(2)),
      y: Number(characterTuning.y.toFixed(2)),
      scale: Number(characterTuning.scale.toFixed(4)),
    },
    bigCucumber: {
      xPercent: Number(bigCucumberTuning.xPercent.toFixed(2)),
      yPercent: Number(bigCucumberTuning.yPercent.toFixed(2)),
      scale: Number(bigCucumberTuning.scale.toFixed(4)),
    },
    turntableControls: {
      x: Number(turntableControlsTuning.x.toFixed(2)),
      y: Number(turntableControlsTuning.y.toFixed(2)),
    },
    tonearm: {
      x: Number(tonearmState.x.toFixed(2)),
      y: Number(tonearmState.y.toFixed(2)),
      scale: Number(tonearmState.scale.toFixed(4)),
      angle: Number(tonearmState.angle.toFixed(2)),
    },
    turntable: { ...layoutLabExtras.turntable },
    centerPanel: { ...layoutLabExtras.centerPanel },
    leftPanel: { ...layoutLabExtras.leftPanel },
    currencyWidget: { ...layoutLabExtras.currencyWidget },
    searchBar: { ...layoutLabExtras.searchBar },
    menuArc: {
      radius: Number(layoutLabExtras.menuArc.radius.toFixed(2)),
      titleScale: Number(layoutLabExtras.menuArc.titleScale.toFixed(4)),
      angleStep: Number(layoutLabExtras.menuArc.angleStep.toFixed(4)),
    },
  };
}

function applyLayoutLabParams(params) {
  if (!params || typeof params !== "object") return;
  if (params.character) {
    Object.assign(characterTuning, params.character);
    applyCharacterTransform();
  }
  if (params.bigCucumber) {
    Object.assign(bigCucumberTuning, params.bigCucumber);
    applyBigCucumberTransform();
  }
  if (params.turntableControls) {
    Object.assign(turntableControlsTuning, params.turntableControls);
    applyTurntableControlsTuning();
  }
  if (params.tonearm) {
    Object.assign(tonearmState, params.tonearm);
    renderTonearm();
  }
  if (params.turntable) {
    Object.assign(layoutLabExtras.turntable, params.turntable);
    applyTurntableLayoutTuning();
  }
  if (params.centerPanel) {
    Object.assign(layoutLabExtras.centerPanel, params.centerPanel);
    applyCenterPanelLayoutTuning();
  }
  if (params.leftPanel) {
    Object.assign(layoutLabExtras.leftPanel, params.leftPanel);
    applyLeftPanelLayoutTuning();
  }
  if (params.currencyWidget) {
    Object.assign(layoutLabExtras.currencyWidget, params.currencyWidget);
    applyCurrencyWidgetLayoutTuning();
  }
  if (params.searchBar) {
    Object.assign(layoutLabExtras.searchBar, params.searchBar);
    applySearchBarLayoutTuning();
  }
  if (params.menuArc) {
    Object.assign(layoutLabExtras.menuArc, params.menuArc);
    if (params.menuArc.radius != null && params.menuArc.titleScale == null) {
      syncMenuArcTitleScale();
    }
    applyMenuArcLayoutTuning();
  }
}

function skipIntroForLayoutLab() {
  if (!window.__LAYOUT_LAB__?.enabled) return;
  if (titleSplash) {
    titleSplash.classList.add("hidden");
    titleSplash.setAttribute("aria-hidden", "true");
    titleSplash.style.display = "none";
    titleSplashCrashing = true;
  }
  stageIntroCompleted = true;
  stageOpeningTriggered = true;
  // 调试页已移除幕布节点；若仍存在则直接打开并禁用
  document.getElementById("stage-curtain-layer")?.remove();
  if (stageCurtainLayer) {
    stageCurtainLayer.classList.add("is-opened");
    stageCurtainLayer.classList.remove("is-revealing");
    stageCurtainLayer.style.pointerEvents = "none";
    stageCurtainLayer.style.display = "none";
  }
  if (characterStage) {
    characterStage.style.opacity = "1";
  }
}

window.LayoutLabAPI = {
  getParams: collectLayoutLabParams,
  applyParams: applyLayoutLabParams,
  getStageSize,
  getTuningRefs: () => ({
    characterTuning,
    bigCucumberTuning,
    turntableControlsTuning,
    tonearmState,
    layoutLabExtras,
  }),
  applyers: {
    character: applyCharacterTransform,
    bigCucumber: applyBigCucumberTransform,
    turntableControls: applyTurntableControlsTuning,
    tonearm: renderTonearm,
    turntable: applyTurntableLayoutTuning,
    centerPanel: applyCenterPanelLayoutTuning,
    leftPanel: applyLeftPanelLayoutTuning,
    currencyWidget: applyCurrencyWidgetLayoutTuning,
    searchBar: applySearchBarLayoutTuning,
    menuArc: applyMenuArcLayoutTuning,
  },
};

function setStageOpenProgress(nextProgress) {
  if (!stageCurtainLayer || !stageCurtainClosed || stageIntroCompleted) return;
  const progress = Math.max(0, Math.min(1, nextProgress));
  stageCurtainLayer.classList.remove("is-opened");
  stageCurtainLayer.classList.add("is-revealing");
  stageCurtainClosed.style.opacity = `${Math.max(0, 1 - progress * 1.15)}`;
  if (stageCurtainSeqCanvas) {
    stageCurtainSeqCanvas.style.opacity = "1";
  }
  if (stageCurtainSeqFrame) {
    stageCurtainSeqFrame.style.opacity = stageCurtainSeqCanvas ? "0" : "1";
  }
}

function ensureStageSequenceCanvasSize() {
  if (!(stageCurtainSeqCanvas instanceof HTMLCanvasElement)) return;
  const stage = getStageSize();
  const nextWidth = Math.max(1, Math.floor(stage.width));
  const nextHeight = Math.max(1, Math.floor(stage.height));
  if (stageCurtainSeqCanvas.width !== nextWidth || stageCurtainSeqCanvas.height !== nextHeight) {
    stageCurtainSeqCanvas.width = nextWidth;
    stageCurtainSeqCanvas.height = nextHeight;
  }
  stageCurtainSeqCanvas.style.width = `${stage.width}px`;
  stageCurtainSeqCanvas.style.height = `${stage.height}px`;
  if (!stageCurtainSeqCanvasCtx) {
    stageCurtainSeqCanvasCtx = stageCurtainSeqCanvas.getContext("2d", { alpha: true });
  }
}

function drawStageSequenceFrame(frameIndex) {
  const bounded = Math.max(0, Math.min(STAGE_SEQUENCE_FRAME_COUNT - 1, frameIndex));
  const frame = stageSequenceFrameImages[bounded];
  if (stageCurtainSeqCanvas && stageCurtainSeqCanvasCtx && frame) {
    ensureStageSequenceCanvasSize();
    const ctx = stageCurtainSeqCanvasCtx;
    const cw = stageCurtainSeqCanvas.width;
    const ch = stageCurtainSeqCanvas.height;
    const fw = frame.width || 1;
    const fh = frame.height || 1;
    const scale = Math.max(cw / fw, ch / fh);
    const dw = fw * scale;
    const dh = fh * scale;
    const dx = (cw - dw) * 0.5;
    const dy = (ch - dh) * 0.5;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(frame, dx, dy, dw, dh);
    return;
  }
  if (stageCurtainSeqFrame) {
    stageCurtainSeqFrame.src = stageSequenceFramePaths[bounded];
  }
}

function finalizeStageOpened() {
  if (!stageCurtainLayer || !stageCurtainClosed || !stageCurtainOpen) return;
  stageIntroCompleted = true;
  stageOpeningTriggered = false;
  if (stageSequencePlaybackTimer !== null) {
    window.cancelAnimationFrame(stageSequencePlaybackTimer);
    stageSequencePlaybackTimer = null;
  }
  stageCurtainLayer.classList.add("is-opened");
  stageCurtainLayer.classList.remove("is-revealing");
  stageCurtainClosed.style.opacity = "0";
  if (stageCurtainSeqCanvas) {
    stageCurtainSeqCanvas.style.opacity = "0";
  }
  if (stageCurtainSeqFrame) {
    stageCurtainSeqFrame.style.opacity = "0";
  }
  stageCurtainOpen.style.opacity = "1";
}

function preloadStageSequenceFrames() {
  if (stageSequenceFramesReady) return Promise.resolve();
  if (stageSequencePreloadPromise) return stageSequencePreloadPromise;
  stageSequencePreloadPromise = Promise.all(
    stageSequenceFramePaths.map(
      (src) =>
        new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          if (typeof img.decode === "function") {
            try {
              await img.decode();
            } catch {
              // ignore decode rejection and still use loaded frame
            }
          }
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = src;
      })
    )
  ).then((frames) => {
    stageSequenceFrameImages = frames;
    stageSequenceFramesReady = true;
  });
  return stageSequencePreloadPromise;
}

async function triggerStageOpenPlayback() {
  if (!stageCurtainLayer || !stageCurtainSeqFrame || stageIntroCompleted || stageOpeningTriggered) return;
  await preloadStageSequenceFrames();
  if (stageIntroCompleted || stageOpeningTriggered) return;
  stageOpeningTriggered = true;
  if (stageCurtainOpen) {
    stageCurtainOpen.style.opacity = "0";
  }
  if (stageCurtainClosed) {
    stageCurtainClosed.style.opacity = "1";
  }
  drawStageSequenceFrame(0);
  setStageOpenProgress(0);
  if (stageCurtainSeqFrame) {
    stageCurtainSeqFrame.style.opacity = stageCurtainSeqCanvas ? "0" : "1";
  }
  if (stageCurtainSeqCanvas) {
    stageCurtainSeqCanvas.style.opacity = "1";
  }

  const fps = 24;
  const durationMs = Math.round(((STAGE_SEQUENCE_FRAME_COUNT - 1) / fps) * 1000);
  let lastFrameIndex = -1;
  const startedAt = performance.now();
  if (stageSequencePlaybackTimer !== null) {
    window.cancelAnimationFrame(stageSequencePlaybackTimer);
    stageSequencePlaybackTimer = null;
  }

  const step = (now) => {
    if (stageIntroCompleted) return;
    const elapsed = now - startedAt;
    const progress = Math.max(0, Math.min(1, elapsed / durationMs));
    setStageOpenProgress(progress);
    const frameIndex = Math.min(
      STAGE_SEQUENCE_FRAME_COUNT - 1,
      Math.floor(progress * (STAGE_SEQUENCE_FRAME_COUNT - 1))
    );
    if (frameIndex !== lastFrameIndex) {
      drawStageSequenceFrame(frameIndex);
      lastFrameIndex = frameIndex;
    }
    if (progress >= 1) {
      finalizeStageOpened();
      return;
    }
    stageSequencePlaybackTimer = window.requestAnimationFrame(step);
  };
  stageSequencePlaybackTimer = window.requestAnimationFrame(step);
}

function triggerFirstUserAudioStart() {
  if (!firstClickAutoplayArmed || isTrackTransitioning || isPlaying) return;
  firstClickAutoplayArmed = false;
  justAutoStartedAt = Date.now();
  setTurntableState(true);
  playWithFadeIn();
}

function initStageCurtainIntro() {
  if (!stageCurtainLayer || !stageCurtainClosed || !stageCurtainOpen || (!stageCurtainSeqFrame && !stageCurtainSeqCanvas)) return;
  stageCurtainOpen.style.opacity = "0";
  if (stageCurtainSeqCanvas) {
    ensureStageSequenceCanvasSize();
    stageCurtainSeqCanvas.style.opacity = "0";
  }
  stageCurtainSeqFrame.style.opacity = stageCurtainSeqCanvas ? "0" : "1";
  drawStageSequenceFrame(0);
  stageCurtainClosed.style.opacity = "1";
  preloadStageSequenceFrames();

  stageCurtainLayer.addEventListener("pointerdown", (event) => {
    if (stageIntroCompleted || stageOpeningTriggered) return;
    event.preventDefault();
    event.stopPropagation();
    triggerFirstUserAudioStart();
    triggerStageOpenPlayback();
  });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateBigCucumberShake(durationMs) {
  return new Promise((resolve) => {
    const start = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const waveY = Math.sin(progress * Math.PI * 16);
      const waveX = Math.sin(progress * Math.PI * 22 + Math.PI / 3);
      const amp = Math.max(0.15, progress); // 振幅由小到大
      bigCucumberShakeDeg = waveY * 1.25 * amp;
      bigCucumberShakeOffsetY = waveY * 3 * amp;
      bigCucumberShakeOffsetX = waveX * 1.2 * amp;
      applyBigCucumberTransform();
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        bigCucumberShakeDeg = 0;
        bigCucumberShakeOffsetX = 0;
        bigCucumberShakeOffsetY = 0;
        applyBigCucumberTransform();
        resolve();
      }
    };
    window.requestAnimationFrame(frame);
  });
}

function animateBigCucumberKick(distancePx, durationMs, onStep) {
  return new Promise((resolve) => {
    const start = performance.now();
    const origin = bigCucumberKickOffsetPx;
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(progress);
      const moved = distancePx * eased;
      bigCucumberKickOffsetPx = origin + moved;
      if (onStep) onStep(moved);
      applyBigCucumberTransform();
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };
    window.requestAnimationFrame(frame);
  });
}

function animateSearchBarFlyOut() {
  if (!searchBarDecor || searchBarDismissed) return Promise.resolve();
  const rect = searchBarDecor.getBoundingClientRect();
  const distance = getStageSize().width - rect.left + rect.width + 80;
  const anim = searchBarDecor.animate(
    [
      { transform: "translateX(-33.333%) translateX(0px)", opacity: 1 },
      { transform: `translateX(-33.333%) translateX(${distance}px)`, opacity: 0 }
    ],
    { duration: 680, easing: "cubic-bezier(0.22, 0.78, 0.22, 1)", fill: "forwards" }
  );
  return anim.finished
    .catch(() => {})
    .then(() => {
      anim.cancel();
      searchBarDecor.style.opacity = "0";
      searchBarDecor.style.visibility = "hidden";
      searchBarDecor.style.pointerEvents = "none";
      searchBarDecor.style.transform = "translateX(-33.333%)";
      searchBarDismissed = true;
    });
}

function setBigCucumberHover(active) {
  bigCucumberHoverOffsetPx = active ? 18 : 0;
  applyBigCucumberTransform();
}

async function runBigCucumberKickSequence() {
  if (bigCucumberSequenceRunning || bigCucumberSequenceConsumed || !bigCucumberDecor) return;
  bigCucumberSequenceRunning = true;
  bigCucumberSequenceConsumed = true;
  await animateBigCucumberShake(1000);

  const bigRect = bigCucumberDecor.getBoundingClientRect();
  const searchRect = searchBarDecor && !searchBarDismissed
    ? searchBarDecor.getBoundingClientRect()
    : null;
  const currencyRect = cucumberCurrencyWidget
    ? cucumberCurrencyWidget.getBoundingClientRect()
    : null;
  const reduceBy = currencyRect ? currencyRect.width / 6 : 0;
  const kickDistance = Math.max(0, bigRect.width * (0.5 - 1 / 7) - reduceBy);
  const contactDistance = searchRect ? Math.max(0, searchRect.left - bigRect.right) : Infinity;
  let searchFlyStarted = false;
  let searchFlyPromise = Promise.resolve();
  const startSearchFly = () => {
    if (searchFlyStarted || !searchBarDecor || searchBarDismissed) return;
    searchFlyStarted = true;
    playSfx(pipeSfx);
    searchFlyPromise = animateSearchBarFlyOut();
  };
  await animateBigCucumberKick(kickDistance, 240, (moved) => {
    if (moved >= contactDistance) {
      startSearchFly();
    }
  });

  let burstX = bigRect.left + bigRect.width * 0.75;
  let burstY = bigRect.top + bigRect.height * 0.65;
  if (searchRect) {
    burstY = Math.max(20, searchRect.top + searchRect.height * 0.45);
    if (!searchFlyStarted) {
      startSearchFly();
    }
    await searchFlyPromise;
    // 特效起点对齐“搜索栏飞出屏幕”的右上出口
    burstX = getStageSize().width - 12;
  }

  spawnCucumberBurstToCurrency(burstX, burstY, 5);
  spawnUnlockCucumberAt(burstX, burstY);
  bigCucumberSequenceRunning = false;
  startBigCucumberPostKickSway();
  setBigCucumberHover(false);
  bigCucumberDecor.style.pointerEvents = "none";
  bigCucumberDecor.style.cursor = "default";
}

function getCucumberCurrencyMergePoint() {
  if (cucumberCurrencyWidget) {
    const rect = cucumberCurrencyWidget.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.16,
      y: rect.top + rect.height * 0.5,
    };
  }
  return {
    x: getStageSize().width - 220,
    y: 70,
  };
}

function startCaptureCucumber(cucumber, nowMs) {
  const target = getCucumberCurrencyMergePoint();
  cucumber.status = "capturing";
  cucumber.captureStartedAt = nowMs;
  cucumber.captureDuration = 700 + Math.random() * 160;
  cucumber.captureFromX = cucumber.x;
  cucumber.captureFromY = cucumber.y;
  cucumber.captureToX = target.x - cucumber.size * 0.5;
  cucumber.captureToY = target.y - cucumber.size * 0.5;
  cucumber.node.style.zIndex = "12";
}

function tryCaptureFloatingCucumber(clientX, clientY) {
  const nowMs = performance.now();
  for (let i = floatingCucumbers.length - 1; i >= 0; i -= 1) {
    const cucumber = floatingCucumbers[i];
    if (cucumber.status !== "flying") continue;
    const centerX = cucumber.x + cucumber.size * 0.5;
    const centerY = cucumber.y + cucumber.size * 0.5;
    const hitHalfW = cucumber.size * 0.5;
    const hitHalfH = cucumber.size * 0.38;
    if (
      clientX >= centerX - hitHalfW &&
      clientX <= centerX + hitHalfW &&
      clientY >= centerY - hitHalfH &&
      clientY <= centerY + hitHalfH
    ) {
      startCaptureCucumber(cucumber, nowMs);
      return true;
    }
  }
  return false;
}

function stepAnimation() {
  const delta = targetIndex - currentIndex;
  if (Math.abs(delta) < 0.0005) {
    currentIndex = targetIndex;
    renderPositions();
    rafId = null;
    return;
  }

  currentIndex += delta * 0.12;
  renderPositions();
  rafId = window.requestAnimationFrame(stepAnimation);
}

function startAnimation() {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(stepAnimation);
}

function move(step) {
  const base = Math.round(targetIndex);
  setTarget(base + step);
}

function onWheel(event) {
  if (rechargeModalOpen) {
    event.preventDefault();
    return;
  }
  if (event.target instanceof Element && event.target.closest("#card-text-scroll")) {
    return;
  }
  event.preventDefault();
  const delta = event.deltaY * 0.0025;
  const maxIndex = Math.max(0, visibleMenuIndices.length - 1);
  const next = Math.max(0, Math.min(maxIndex, targetIndex + delta));
  targetIndex = next;
  startAnimation();
}

let menuTouchDrag = null;
let suppressMenuItemClick = false;

function isTitleSplashBlockingTouch() {
  return Boolean(
    titleSplash &&
      !titleSplash.classList.contains("hidden") &&
      titleSplash.style.display !== "none"
  );
}

function shouldIgnoreMenuTouchTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "#card-text-scroll, #recharge-modal, #private-lock-panel, #chat-form, #chat-input, #character-stage, #cucumber-add-btn, #turntable-controls, #cover-hotspot, #big-cucumber-decor, #search-bar-decor, input, textarea, button, a, select, label"
    )
  );
}

function applyMenuDragDelta(pixelDeltaY) {
  // 手指上滑 = 往下滚菜单（与滚轮方向一致）
  const delta = (-pixelDeltaY) * 0.008;
  const maxIndex = Math.max(0, visibleMenuIndices.length - 1);
  const next = Math.max(0, Math.min(maxIndex, targetIndex + delta));
  targetIndex = next;
  startAnimation();
}

function onMenuTouchStart(event) {
  if (rechargeModalOpen || isTitleSplashBlockingTouch()) return;
  if (stageCurtainLayer && !stageIntroCompleted && !stageCurtainLayer.classList.contains("is-opened")) {
    return;
  }
  if (event.pointerType === "mouse") return;
  if (shouldIgnoreMenuTouchTarget(event.target)) return;
  if (typeof event.isPrimary === "boolean" && !event.isPrimary) return;

  menuTouchDrag = {
    pointerId: event.pointerId,
    lastY: event.clientY,
    moved: false,
  };
}

function onMenuTouchMove(event) {
  if (!menuTouchDrag || menuTouchDrag.pointerId !== event.pointerId) return;
  const dy = event.clientY - menuTouchDrag.lastY;
  if (Math.abs(dy) < 0.5) return;
  menuTouchDrag.lastY = event.clientY;
  menuTouchDrag.moved = true;
  event.preventDefault();
  applyMenuDragDelta(dy);
}

function onMenuTouchEnd(event) {
  if (!menuTouchDrag || menuTouchDrag.pointerId !== event.pointerId) return;
  if (menuTouchDrag.moved) {
    suppressMenuItemClick = true;
    window.setTimeout(() => {
      suppressMenuItemClick = false;
    }, 350);
  }
  menuTouchDrag = null;
}

function onKeydown(event) {
  if (rechargeModalOpen) {
    if (event.key === "Escape") {
      closeRechargeModal();
    }
    event.preventDefault();
    return;
  }
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    move(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    move(-1);
  }
}

window.addEventListener("wheel", onWheel, { passive: false });
window.addEventListener("keydown", onKeydown);
window.addEventListener("pointerdown", onMenuTouchStart, { passive: true });
window.addEventListener("pointermove", onMenuTouchMove, { passive: false });
window.addEventListener("pointerup", onMenuTouchEnd, { passive: true });
window.addEventListener("pointercancel", onMenuTouchEnd, { passive: true });
window.addEventListener("resize", syncViewportMode);
window.addEventListener("orientationchange", syncViewportMode);
window.addEventListener("resize", syncTonearmViewportPosition);
window.addEventListener("resize", syncTopDecorHeight);
window.addEventListener("resize", syncTitleAndCardLeftShift);
window.addEventListener("resize", ensureStageSequenceCanvasSize);

if (bigCucumberDecor) {
  bigCucumberDecor.addEventListener("mouseenter", () => setBigCucumberHover(true));
  bigCucumberDecor.addEventListener("mouseleave", () => setBigCucumberHover(false));
  bigCucumberDecor.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playSfx(clickSfx);
    runBigCucumberKickSequence();
  });
}

if (searchBarDecor) {
  searchBarDecor.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playSfx(clickSfx);
    runBigCucumberKickSequence();
  });
}

if (rechargeCloseHit) {
  rechargeCloseHit.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playSfx(clickSfx);
    closeRechargeModal();
  });
}

if (rechargePanel) {
  rechargePanel.addEventListener("click", (event) => {
    if (event.target === rechargeCloseHit) return;
    playSfx(clickSfx);
    showRechargeInsufficient();
  });
}

coverZone.addEventListener("mouseenter", enterTurntableHoverZone);
coverZone.addEventListener("mouseleave", leaveTurntableHoverZone);
coverHotspot.addEventListener("mouseenter", enterTurntableHoverZone);
coverHotspot.addEventListener("mouseleave", leaveTurntableHoverZone);
turntableControls.addEventListener("mouseenter", enterTurntableHoverZone);
turntableControls.addEventListener("mouseleave", leaveTurntableHoverZone);

playPauseBtn.addEventListener("click", async () => {
  playSfx(clickSfx);
  if (Date.now() - justAutoStartedAt < 250) return;
  if (isTrackTransitioning) return;
  if (isPlaying) {
    await pauseWithFadeOut();
    setTurntableState(false);
  } else {
    setTurntableState(true);
    await playWithFadeIn();
  }
});

nextTrackBtn.addEventListener("click", async () => {
  playSfx(clickSfx);
  await switchToNextSong();
});

bgAudio.addEventListener("ended", async () => {
  if (!isPlaying || isTrackTransitioning) return;
  await switchToNextSong();
});

cardHotspot.addEventListener("mouseenter", () => {
  cardHoverActive = true;
  if (!cardInteractionLocked) setBaseCardScale(1);
});

cardHotspot.addEventListener("mouseleave", () => {
  cardHoverActive = false;
  if (!cardInteractionLocked) setBaseCardScale(0.9);
});

cardHotspot.addEventListener("click", (event) => {
  const previousPointerEvents = cardHotspot.style.pointerEvents;
  cardHotspot.style.pointerEvents = "none";
  const underlying = document.elementFromPoint(event.clientX, event.clientY);
  cardHotspot.style.pointerEvents = previousPointerEvents;

  if (underlying instanceof HTMLElement) {
    if (underlying.closest("#private-lock-panel")) {
      const control = underlying.closest("input, button, textarea, select, label");
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
        control.focus();
      } else if (control instanceof HTMLElement) {
        control.click();
      }
      return;
    }
    const link = underlying.closest("#card-text-scroll a");
    if (link instanceof HTMLAnchorElement) {
      link.click();
      return;
    }
    const formControl = underlying.closest("#card-text-scroll input, #card-text-scroll button, #card-text-scroll textarea, #card-text-scroll select, #card-text-scroll label");
    if (formControl instanceof HTMLInputElement || formControl instanceof HTMLTextAreaElement) {
      formControl.focus();
      return;
    }
    if (formControl instanceof HTMLElement) {
      formControl.click();
      return;
    }
  }
  runCardHotspotSequence();
});

cardTextScroll.addEventListener(
  "wheel",
  (event) => {
    // 文本区滚轮优先：只滚文本，不触发左侧菜单滚动
    event.stopPropagation();
  },
  { passive: false }
);

if (cucumberAddBtn) {
  cucumberAddBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playSfx(clickSfx);
    openRechargeModal();
  });
}

window.addEventListener("pointerdown", (event) => {
  if (rechargeModalOpen) {
    event.preventDefault();
    return;
  }
  if (activeCardLabel === "私密内容" || activeCardLabel === "关于我") {
    return;
  }
  if (
    event.target instanceof HTMLElement &&
    event.target.closest(
      "#card-text-scroll, #card-text-scroll a, #card-text-scroll input, #card-text-scroll button, #card-text-scroll textarea, #card-text-scroll select, #card-text-scroll label"
    )
  ) {
    return;
  }
  if (tryCaptureFloatingCucumber(event.clientX, event.clientY)) {
    playSfx(clickSfx);
    event.preventDefault();
  }
});

activeDesc.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  const anchor = event.target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  playSfx(clickSfx);
  if (anchor.hasAttribute("download")) return;
  event.preventDefault();
  event.stopPropagation();
  window.open(anchor.href, "_blank", "noopener,noreferrer");
});

function resumeCharacterRandomTick() {
  if (characterTickTimer !== null) {
    window.clearTimeout(characterTickTimer);
    characterTickTimer = null;
  }
  const nextDelay = 400 + Math.random() * 200;
  characterTickTimer = window.setTimeout(tickCharacterPair, nextDelay);
}

async function triggerCharacterScream() {
  if (!characterSprite || !characterStage || isCharacterScreaming) return;
  if (characterStage.style.opacity === "0") return;
  isCharacterScreaming = true;
  if (characterTickTimer !== null) {
    window.clearTimeout(characterTickTimer);
    characterTickTimer = null;
  }
  characterSprite.src = characterScreamImageSrc;
  characterStage.style.opacity = "1";
  try {
    characterScreamAudio.pause();
    characterScreamAudio.currentTime = 0;
    await characterScreamAudio.play();
  } catch {
    isCharacterScreaming = false;
    resumeCharacterRandomTick();
  }
}

characterScreamAudio.addEventListener("ended", () => {
  isCharacterScreaming = false;
  resumeCharacterRandomTick();
});

characterScreamAudio.addEventListener("error", () => {
  isCharacterScreaming = false;
  resumeCharacterRandomTick();
});

if (characterStage) {
  characterStage.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    triggerCharacterScream();
  });
}

rebuildVisibleMenuIndices();
refreshVisibleMenusAndSelection(menus[0]?.label || "");
setBaseCardScale(0.9);
startCardWobble();
initRandomSong();
syncTonearmViewportPosition();
initFloatingCucumbers();
renderCucumberCurrencyCount();
syncTopDecorHeight();
applyBigCucumberTransform();
applyTurntableControlsTuning();
syncViewportMode();
if (window.__LAYOUT_LAB__?.enabled) {
  window.__LAYOUT_LAB__.lockAutoCharacter = true;
  window.__LAYOUT_LAB__.lockAutoTonearm = true;
  skipIntroForLayoutLab();
  // 初始化 tonearm y，避免仍为 0
  if (!tonearmState.y) {
    tonearmState.y = Math.round(getStageSize().height * 0.82);
  }
  renderTonearm();
  applyTurntableLayoutTuning();
  applyCenterPanelLayoutTuning();
  applyLeftPanelLayoutTuning();
  applyCurrencyWidgetLayoutTuning();
  applySearchBarLayoutTuning();
  applyMenuArcLayoutTuning();
  syncTitleAndCardLeftShift();
} else {
  loadLayoutProfiles().then(() => {
    applyResponsiveLayoutProfile(true);
    syncTitleAndCardLeftShift();
  });
}
if (characterTickTimer !== null) {
  window.clearTimeout(characterTickTimer);
  characterTickTimer = null;
}
tickCharacterPair();
startTopWidgetsRotateWobble();
initStageCurtainIntro();
initTitleSplash();
if (menuCenterTrackRafId !== null) {
  window.cancelAnimationFrame(menuCenterTrackRafId);
  menuCenterTrackRafId = null;
}
menuCenterTrackRafId = window.requestAnimationFrame(trackMenuCenterByRaf);

window.addEventListener(
  "pointerdown",
  () => {
    triggerFirstUserAudioStart();
  },
  { once: true }
);
