# 登记站公用 API（Cloudflare Worker）

线上静态站没有 `/api/ids`，访客也不应各自填 GitHub 令牌。把带写权限的 `GITHUB_TOKEN` 只放在 Worker 里，浏览器统一调用这个 API，效果接近以前的共享登记：保存后立刻返回新表，其他人轮询刷新。

## 部署

1. 安装 [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 并登录。
2. 在本目录执行：

```bash
cd workers/registry-api
wrangler secret put GITHUB_TOKEN
```

令牌需对 `moortneli4-ops/moortneli4-site` 有写权限（可写 `registry` 分支）。

3. 发布：

```bash
wrangler deploy
```

4. 记下 Worker 地址（如 `https://moortneli4-registry.<子域>.workers.dev`），写入 `id/config.js` 的 `REGISTRY_API_BASE`。

5. （可选）在 Cloudflare 把自定义域绑到该 Worker，例如 `registry.moortneli4.top`。

`registry` 分支更新后仍会走现有的 `registry-mirror.yml`，Pages 上的只读副本稍后同步；实时读写以 Worker 为准。

## 本机替代

若已有 Node 主机，可设 `GITHUB_TOKEN` 并 `REGISTRY_BACKEND=github` 跑 `server.js`，同样在 `id/config.js` 里填 API 根地址。
