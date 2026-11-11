# Netlify 部署说明（棉棉 ID 登记 API）

本版本使用 Netlify Functions 提供公开登记 API，GitHub 仓库继续保存共享登记数据。GitHub Pages 前端仍可继续使用；Netlify 同时会托管一份项目静态文件，但你可以继续让正式域名指向 GitHub Pages。

## 1. 部署项目

1. 将本 ZIP 解压。
2. 打开 https://app.netlify.com/ 并注册 / 登录 Netlify。
3. **请使用下方 Netlify CLI 或连接 Git 仓库的方式部署。不要只把文件夹拖入手动部署区**，因为单纯的静态拖拽部署不会自动打包 Functions。
4. 确认 Netlify 项目设置中的 Base directory 为空，Publish directory 为 `netlify-public`，Functions directory 为 `netlify/functions`。项目根目录应能看到 `netlify.toml`、`netlify/functions/`、`lib/` 和 `id/`。

### 推荐的 CLI 部署方式（支持 Functions）

在项目根目录打开 PowerShell，执行：

```powershell
npm.cmd install -g netlify-cli
netlify.cmd login
netlify.cmd init
netlify.cmd deploy --prod
```

`netlify init` 中选择创建并配置新站点；Build command 留空，Publish directory 填 `netlify-public`。如果 CLI 提示 Functions directory，填写 `netlify/functions`。

## 2. 设置环境变量

Netlify 控制台 → Site configuration → Environment variables，添加：

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | 你的 GitHub Fine-grained Token |
| `GITHUB_REPO` | `moortneli4-ops/moortneli4-site` |
| `GITHUB_REGISTRY_BRANCH` | `registry` |
| `GITHUB_REGISTRY_PATH` | `id-registry.json` |

Token 只需要目标仓库的 `Contents: Read and write` 权限。不要把 Token 写入任何前端文件或提交到 GitHub。变量添加后，重新部署一次：

```powershell
netlify.cmd deploy --prod
```

## 3. 修改 GitHub Pages 前端 API 地址

部署成功后，Netlify 会分配类似 `https://your-site-name.netlify.app` 的域名。打开 `id/config.js`，将 `YOUR-NETLIFY-SITE` 替换为实际站点名：

```js
window.REGISTRY_API_BASE = "https://your-site-name.netlify.app";
```

然后只把修改后的前端配置同步到 GitHub Pages 使用的分支，不要把前端改动误推到 `registry` 数据分支。

## 4. 验证

浏览器打开 `https://你的站点.netlify.app/api/ids`，应返回登记数据 JSON。再打开正式 GitHub Pages 网站，新增一条测试登记，并检查 GitHub 仓库 `registry` 分支中的 `id-registry.json` 是否产生新提交。

## 5. 公开写入与限制

- 访客无需登录即可读取、登记、批量导入和编辑预留信息。
- `/api/ids/replace` 整表覆盖接口被禁用，避免匿名用户覆盖或回档整份登记数据。
- 写请求有请求体大小限制和每个函数实例每分钟 8 次的基础限流。Netlify Functions 是无状态 / 多实例环境，内存限流不是全局强防刷。
- GitHub 文件 SHA 冲突会重新读取并重试；极端并发下仍可能需要用户刷新重试。
- 如公开接口遭到恶意刷写，建议进一步接入 Turnstile 等人机验证及共享存储限流。

## 6. 本地开发

在项目根目录执行：

```powershell
npm.cmd install -g netlify-cli
netlify.cmd dev
```

Netlify CLI 会在本地模拟 Functions 和重写规则。
