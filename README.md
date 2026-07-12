# moortneli4-site

个人网站首版模板（作品集风），用于 GitHub Pages 临时上线。

## 当前结构

- `index.html` 入口页（自动跳转到 `prototype-left-menu.html`）
- `styles.css` 页面样式
- `script.js` 页脚年份脚本
- `prototype-left-menu.html/.css/.js` 当前主交互页面
- `server.js` 本地/服务器一体化静态服务 + DeepSeek 代理 API（隐藏 key）

## 本地启动（含聊天后端）

1. 复制环境变量模板：
   - Windows PowerShell:
     - `Copy-Item .env.example .env`
2. 编辑 `.env`，填入真实 `DEEPSEEK_API_KEY`
3. 启动服务：
   - `node server.js`
4. 浏览器打开：
   - `http://127.0.0.1:8787`

> 聊天前端会请求 `/api/chat`，由 `server.js` 代为访问 DeepSeek，前端不再暴露 key。

## GitHub Pages 入口说明

- Pages 默认访问根路径时会打开 `index.html`。
- 当前 `index.html` 已自动跳转到 `prototype-left-menu.html`，可直接作为线上入口。
- 若仅使用静态 Pages（无后端），聊天功能不会访问私有 API，建议搭配独立后端代理。

## 下一步

1. 替换各区块占位文案为真实内容
2. 新增 `assets/` 放图片与附件
3. 通过 GitHub Pages 分支发布上线
