const REGISTRY_TOKEN_KEY = "moortneli4-registry-token";

function readStoredToken() {
  try {
    return localStorage.getItem(REGISTRY_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

window.REGISTRY_DISPATCH_TOKEN = readStoredToken();

window.saveRegistryDispatchToken = (token) => {
  const trimmed = String(token || "").trim();
  try {
    if (trimmed) localStorage.setItem(REGISTRY_TOKEN_KEY, trimmed);
    else localStorage.removeItem(REGISTRY_TOKEN_KEY);
  } catch {}
  window.REGISTRY_DISPATCH_TOKEN = trimmed;
};
