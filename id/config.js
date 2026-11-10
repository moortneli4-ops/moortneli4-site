(function () {
  const host = location.hostname;
  if (host === "127.0.0.1" || host === "localhost") {
    window.REGISTRY_API_BASE = "";
    return;
  }
  // 部署 workers/registry-api 后改成你的 Worker 地址或自定义域。
  window.REGISTRY_API_BASE = "https://moortneli4-registry.moortneli4.workers.dev";
})();
