# Mermaid Live Editor — 本地离线图表工具

## 概述

一个单 HTML 文件即可运行的 Mermaid 图表编辑器，左侧编写 Mermaid 代码，右侧实时渲染图表。完全离线可用，无需安装任何依赖。

## 目标用户

- 需要在方案/报告中嵌入 Mermaid 图表的非技术人员
- 需要快速验证 Mermaid 语法的开发人员

## 核心功能

### 1. 编辑器

- **纯文本编辑**：使用原生 `<textarea>`，支持 Tab 缩进
- **实时渲染**：输入后 500ms debounce 自动渲染
- **错误处理**：语法错误时右侧显示错误信息
- **模板库**：内置流程图、时序图、类图、状态图、ER 图、甘特图、饼图、思维导图的示例模板
- **自动保存**：代码内容自动保存到 localStorage，刷新/关闭后恢复

### 2. 渲染

- 使用 `mermaid@11.x` 内联到 HTML 文件中，实现完全离线
- 支持 Mermaid 所有标准图表类型
- 图表支持缩放（Ctrl+滚轮）和拖拽平移（Alt+拖拽）

### 3. 导出

| 方式 | 说明 |
|------|------|
| 复制 SVG 代码 | 矢量源码，可粘贴到其他工具 |
| 下载 SVG 文件 | 矢量文件，无限缩放 |
| 下载 PNG 文件 | 2x 分辨率位图，适合微信/网页 |
| 复制图片 | 将图表作为 PNG 图片复制到剪贴板，可直接粘贴到飞书/Word |
| 复制 Base64 | 内联图片数据，用于 `<img src="data:...">` |
| 复制 Markdown 链接 | 含 base64 data URI，贴入 Markdown 渲染器直接显示 |

### 4. 主题

- **UI 主题**：跟随系统，手动可切换暗/亮
- **Mermaid 图表主题**：default / forest / dark / neutral 四种

### 5. 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 下载 SVG |
| `Ctrl+Shift+C` | 复制 SVG 代码 |
| `Ctrl+Shift+P` | 下载 PNG |

## 技术方案

### 架构

单 HTML 文件，所有依赖内联：

```
mermaid-editor.src.html  (~22KB 源码)
    │  node build.js
    ▼
mermaid-editor.html      (~3.2MB 最终文件)
├── <style>              CSS（内联）
├── <script>             Mermaid 核心库（内联，~2.8MB）
└── <script>             应用逻辑（内联）
```

### 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| 图表引擎 | mermaid.min.js 11.x | 官方单文件包，离线可用 |
| 代码编辑器 | 原生 `<textarea>` | 零依赖，兼容性好 |
| UI 框架 | 原生 HTML/CSS/JS | 零依赖，减少文件体积 |

### PNG 导出链路

```
SVG DOM 元素
    → XMLSerializer 序列化
    → 从 viewBox 解析尺寸，赋予显式 width/height
    → Base64 编码 → data URI
    → new Image() 加载
    → Canvas drawImage
    → toBlob (兜底: toDataURL → 手动构造 Blob)
    → 下载 / 写入剪贴板
```

### 布局

```
┌──────────────────────────────────────────────────┐
│  工具栏: UI主题 | Mermaid主题 | 模板 | 导出       │
├──────────────────┬───────────────────────────────┤
│                  │                               │
│  代码编辑器      │    图表预览                    │
│  (textarea)      │    (SVG)                       │
│                  │                               │
├──────────────────┴───────────────────────────────┤
│  状态栏: 渲染成功 / 错误提示                       │
└──────────────────────────────────────────────────┘
```

- 左右分栏，中间拖拽调整宽度
- 默认 50:50，支持响应式（小屏切换上下布局）

## 边界说明

- 不支持 Mermaid Chart 的付费功能（如 AI 生成、协作编辑）
- 不包含历史版本管理，仅保留最新一份 localStorage 数据
- PNG 导出通过 Canvas 转换 SVG 实现，已在 file:// 协议下验证可用

## 文件结构

```
mermaid-editor/
├── mermaid-editor.src.html  # 编辑器源码
├── mermaid-editor.html      # 构建产物（gitignored）
├── build.js                 # 构建脚本
├── README.md
└── docs/superpowers/specs/  # 本设计文档
```
