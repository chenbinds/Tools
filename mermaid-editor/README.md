# Mermaid Live Editor

本地离线 Mermaid 图表编辑器，单 HTML 文件即可运行，无需网络、无需安装。

## 快速开始

1. 确保项目根目录有 `mermaid-editor.html`（如果没有，运行 `node build.js` 生成）
2. 用浏览器打开 `mermaid-editor.html`
3. 左侧编写 Mermaid 代码，右侧实时预览

## 构建

```bash
node build.js
```

## 功能

- **实时编辑预览**：输入代码，500ms 后自动渲染
- **模板库**：内置流程图、时序图、类图、状态图、ER图、甘特图、饼图、思维导图
- **图表缩放拖拽**：Ctrl+滚轮缩放，Alt+拖拽平移
- **自动保存**：代码保存到 localStorage，刷新不丢失
- **暗色主题**：跟随系统，可手动切换

### 导出方式

| 导出 | 用途 |
|------|------|
| 复制 SVG / 下载 SVG | 矢量图，可二次编辑 |
| 下载 PNG | 2x 位图，适合嵌入文档 |
| 复制图片 | 图片入剪贴板，直接粘贴到飞书/Word |
| 复制 Base64 | 用于 `<img>` 标签内联 |
| 复制 Markdown | 粘贴到 GitHub/Notion 等 Markdown 渲染器 |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 下载 SVG |
| `Ctrl+Shift+C` | 复制 SVG |
| `Ctrl+Shift+P` | 下载 PNG |
| `Tab` | 插入缩进 |

## 依赖

- [Mermaid 11.x](https://mermaid.js.org/)（内联到 HTML 中，运行时无外部依赖）

## 技术栈

纯 HTML/CSS/JS，零框架。源码文件 `mermaid-editor.src.html` 约 22KB，构建后 `mermaid-editor.html` 约 3.2MB（含 Mermaid 库）。
