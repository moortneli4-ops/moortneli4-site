# 动态网页素材管理规范（moortneli4-site）

本规范用于统一网站素材目录、命名、体积与上线流程，避免仓库臃肿和页面卡顿。

---

## 1. 目录约定

```text
assets/
  _raw/                    # 原始素材，不直接在页面引用
  images/
    logo/
    backgrounds/
    ui/
  media/
    loops/
    transitions/
    characters/
  icons/
  data/
  manifest.json
```

说明：

- 页面只允许引用“处理后”的 `images/` 和 `media/` 目录。
- `assets/_raw/` 仅作为素材中转区，不可直接用于线上页面。

---

## 2. 格式优先级

1. 图标/线稿：`svg`
2. 位图：`webp`（必要时 `png/jpg`）
3. 动态内容：`webm/mp4` 优先，尽量避免大 `gif`

---

## 3. 体积阈值

- 图标：建议 `< 50KB`
- 普通图片：建议 `< 300KB`
- 首屏关键资源总量：建议 `< 1.5MB`
- 单个动态素材：建议 `< 2MB`
- 超过 `2MB` 的 GIF 必须转码为 `webm/mp4`

---

## 4. 命名规范

统一格式：

`模块-用途-状态-尺寸-版本.扩展名`

示例：

- `menu-dashboard-active-320x640-v1.webp`
- `character-mtnli-idle-loop-v2.webm`
- `scene-links-transition-in-v1.webm`
- `logo-main-dark-v1.svg`

---

## 5. manifest 登记要求

每新增一个可上线素材，都要在 `assets/manifest.json` 增加一条记录，字段至少包含：

- `id`: 全局唯一 ID
- `path`: 相对路径
- `type`: `image` / `video` / `animation`
- `format`: 文件格式
- `usage`: 用途（brand、menu、scene-transition 等）
- `sizeKB`: 文件大小（KB）
- `owner`: 负责人
- `updatedAt`: 更新时间
- `status`: `active` / `deprecated` / `placeholder`

---

## 6. 上线流程（最小闭环）

1. 原素材进入 `assets/_raw/`
2. 压缩/转码后输出到 `assets/images` 或 `assets/media`
3. 更新 `assets/manifest.json`
4. 页面引用处理后素材
5. 发布前检查体积阈值

---

## 7. 当前项目执行规则

- 新增动态视觉时，优先用 `webm`，避免大体积 `gif`。
- 角色动画建议按“菜单状态”拆分文件（进入、循环、切出）。
- 搜索框变形等高频交互，优先 CSS/SVG；只在必要时补短视频素材。
