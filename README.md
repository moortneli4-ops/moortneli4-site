# 莫特奈利斯个人站 v2

新站点目录，不覆盖 `moortneli4-site`。

主风格是**扁平矢量**：纯色几何、弹性缓动、五色板。  
手绘只借 **line boil + 纸纹**；剪贴只借 **白描边、胶带、半调、轻微旋转**。  
右侧小人偶仍读取旧站 `人物素材/`，其余 UI 全部换成 SVG。

## 栏目

- 欢迎光临
- 自制谱工具集成站（原自制谱 / 小工具下载 / 私密内容合并后的下载枢纽）
- 其他工具网站收集
- 与睦头尬聊
- 关于我

## 本地启动

```powershell
cd C:\Users\Sujun\Desktop\sjtu-agent-main\moortneli4-site-v2
Copy-Item .env.example .env
# 把 DEEPSEEK_API_KEY 填进 .env；也可沿用旧站 .env
node server.js
```

浏览器打开：http://127.0.0.1:8788

`/legacy/` 会映射到旁边的旧站目录，用来读小人偶、音效、谱包和工具 zip。

运营维护（官谱表、登记占用同步、API 备份）和架构说明见 **[运营与开发手册.md](./运营与开发手册.md)**。
