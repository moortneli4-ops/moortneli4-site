document.getElementById("year").textContent = String(new Date().getFullYear());

const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
const contentPanels = Array.from(document.querySelectorAll(".content-panel"));
const searchInput = document.getElementById("link-search");
const searchStatus = document.getElementById("search-status");
const linkItems = Array.from(document.querySelectorAll("#link-grid li"));
const expandButtons = Array.from(document.querySelectorAll(".expand-btn"));

let activeTab = "all";

function applyTabFilter(tab) {
  activeTab = tab;
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  contentPanels.forEach((panel) => {
    const group = panel.dataset.tabGroup;
    const visible = tab === "all" || tab === group;
    panel.classList.toggle("is-hidden", !visible);
  });
}

function updateSearchStatus(visibleCount) {
  searchStatus.textContent = `显示 ${visibleCount} / ${linkItems.length} 条链接`;
}

function applyLinkSearch() {
  const keyword = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  linkItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const keywords = (item.dataset.keywords || "").toLowerCase();
    const matched = !keyword || text.includes(keyword) || keywords.includes(keyword);
    item.classList.toggle("is-hidden", !matched);
    if (matched) visibleCount += 1;
  });

  updateSearchStatus(visibleCount);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => applyTabFilter(button.dataset.tab));
});

searchInput.addEventListener("input", applyLinkSearch);

expandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detail = document.getElementById(button.getAttribute("aria-controls"));
    const expanded = button.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;

    button.setAttribute("aria-expanded", String(nextExpanded));
    button.textContent = nextExpanded ? "收起" : "展开";
    detail.hidden = !nextExpanded;
  });
});

applyTabFilter("all");
applyLinkSearch();
