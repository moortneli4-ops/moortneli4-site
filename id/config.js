
(function () {
  const host = location.hostname;

  if (host === "127.0.0.1" || host === "localhost") {
    window.REGISTRY_API_BASE = "";
    return;
  }

  window.REGISTRY_API_BASE = "https://moortneli4-id-api.netlify.app";
})();
