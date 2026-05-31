# Mermaid Live Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single offline HTML file that provides a split-pane Mermaid diagram editor with real-time preview and multiple export options.

**Architecture:** One HTML source file (`mermaid-editor.src.html`) with a `{{MERMAID_JS}}` placeholder. A `build.py` script downloads `mermaid.min.js` and inlines it, producing the final self-contained `mermaid-editor.html` (~3MB). No other dependencies — no npm, no bundler.

**Tech Stack:** Vanilla HTML/CSS/JS, Mermaid 11.x (inlined), no frameworks.

---

## File Map

```
mermaid-editor/
├── mermaid-editor.src.html   # Source HTML with {{MERMAID_JS}} placeholder
├── build.py                   # Python script: download mermaid + inline → final HTML
├── mermaid-editor.html        # OUTPUT: self-contained final file (gitignored)
└── docs/superpowers/
    ├── specs/2026-05-31-mermaid-editor-design.md
    └── plans/2026-05-31-mermaid-editor-plan.md
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/build.py`
- Create: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/.gitignore`

- [ ] **Step 1: Create .gitignore**

```bash
echo "mermaid-editor.html" > "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/.gitignore"
echo "mermaid.min.js" >> "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/.gitignore"
```

- [ ] **Step 2: Write build.py**

```python
#!/usr/bin/env python3
"""Build the self-contained mermaid-editor.html by inlining mermaid.min.js."""
import urllib.request
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
MERMAID_FILE = os.path.join(SCRIPT_DIR, "mermaid.min.js")
SRC_FILE = os.path.join(SCRIPT_DIR, "mermaid-editor.src.html")
OUT_FILE = os.path.join(SCRIPT_DIR, "mermaid-editor.html")

def download_mermaid():
    if os.path.exists(MERMAID_FILE):
        print(f"[skip] {MERMAID_FILE} already exists")
        return
    print(f"Downloading mermaid.min.js from {MERMAID_URL} ...")
    urllib.request.urlretrieve(MERMAID_URL, MERMAID_FILE)
    size_mb = os.path.getsize(MERMAID_FILE) / (1024 * 1024)
    print(f"Downloaded: {size_mb:.1f} MB")

def build():
    with open(SRC_FILE, "r", encoding="utf-8") as f:
        html = f.read()
    with open(MERMAID_FILE, "r", encoding="utf-8") as f:
        mermaid_js = f.read()
    html = html.replace("{{MERMAID_JS}}", mermaid_js)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(html)
    size_mb = os.path.getsize(OUT_FILE) / (1024 * 1024)
    print(f"Built: {OUT_FILE} ({size_mb:.1f} MB)")

if __name__ == "__main__":
    download_mermaid()
    build()
```

- [ ] **Step 3: Run build.py to download mermaid**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Expected: downloads mermaid.min.js (should fail at build step because src.html doesn't exist yet — that's fine, we'll fix in next task)

---

### Task 2: HTML structure and CSS layout

**Files:**
- Create: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Write the HTML skeleton with CSS**

Write the complete `mermaid-editor.src.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mermaid Live Editor</title>
<style>
:root {
  --bg: #ffffff;
  --bg-panel: #fafafa;
  --text: #1a1a2e;
  --text-secondary: #666;
  --border: #e0e0e0;
  --toolbar-bg: #f5f5f5;
  --editor-bg: #fafafa;
  --accent: #4f46e5;
  --accent-hover: #4338ca;
  --error-bg: #fef2f2;
  --error-text: #dc2626;
  --error-border: #fecaca;
  --success-text: #16a34a;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --radius: 6px;
}

:root.dark {
  --bg: #1e1e2e;
  --bg-panel: #252536;
  --text: #cdd6f4;
  --text-secondary: #a6adc8;
  --border: #45475a;
  --toolbar-bg: #181825;
  --editor-bg: #1e1e2e;
  --accent: #89b4fa;
  --accent-hover: #74c7ec;
  --error-bg: #3b1e1e;
  --error-text: #f38ba8;
  --error-border: #6c3840;
  --success-text: #a6e3a1;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.2s, color 0.2s;
}

/* Toolbar */
#toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  flex-wrap: wrap;
  min-height: 44px;
}

#toolbar .group { display: flex; align-items: center; gap: 4px; }
#toolbar .sep { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }

#toolbar button, #toolbar select {
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
#toolbar button:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
#toolbar select { cursor: pointer; }
#toolbar select:hover { border-color: var(--accent); }
#toolbar button.icon-btn { padding: 5px 8px; font-size: 14px; }

/* Main split */
#main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

#editor-pane, #preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#editor-pane {
  border-right: 1px solid var(--border);
}

.pane-header {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Divider */
#divider {
  width: 4px;
  cursor: col-resize;
  background: var(--border);
  flex-shrink: 0;
  transition: background 0.15s;
}
#divider:hover, #divider.dragging { background: var(--accent); }

/* Editor */
#editor-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#editor {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", monospace;
  font-size: 14px;
  line-height: 1.6;
  color: transparent;
  caret-color: var(--text);
  background: transparent;
  z-index: 2;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  tab-size: 2;
}

#editor-highlight {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  padding: 16px;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: var(--text);
  background: var(--editor-bg);
  z-index: 1;
  pointer-events: none;
  overflow: auto;
  tab-size: 2;
}

#editor-highlight .kw { color: #7c3aed; font-weight: 600; }
#editor-highlight .str { color: #059669; }
#editor-highlight .node { color: #2563eb; }
#editor-highlight .arrow { color: #dc2626; font-weight: 600; }
#editor-highlight .comment { color: #9ca3af; font-style: italic; }
#editor-highlight .attr { color: #d97706; }
#editor-highlight .error-line { background: var(--error-bg); }

:root.dark #editor-highlight .kw { color: #c4a7ff; }
:root.dark #editor-highlight .str { color: #a6e3a1; }
:root.dark #editor-highlight .node { color: #89b4fa; }
:root.dark #editor-highlight .arrow { color: #f38ba8; }
:root.dark #editor-highlight .comment { color: #6c7086; }
:root.dark #editor-highlight .attr { color: #f9e2af; }

/* Preview */
#preview-wrap {
  flex: 1;
  overflow: auto;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

#preview-wrap svg { max-width: 100%; height: auto; }

#preview-error {
  padding: 16px 20px;
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  border-radius: var(--radius);
  font-size: 13px;
  font-family: monospace;
  white-space: pre-wrap;
  max-width: 500px;
}

/* Status bar */
#statusbar {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--toolbar-bg);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 26px;
}
#statusbar .ok { color: var(--success-text); }
#statusbar .err { color: var(--error-text); }

/* Dropdown */
.dropdown { position: relative; display: inline-block; }
.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  min-width: 180px;
  padding: 4px;
}
.dropdown-menu.show { display: block; }
.dropdown-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
}
.dropdown-menu button:hover { background: var(--accent); color: #fff; }

/* Toast */
#toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: #1a1a2e;
  color: #fff;
  border-radius: var(--radius);
  font-size: 13px;
  z-index: 999;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
:root.dark #toast { background: #45475a; }
#toast.show { opacity: 1; }

/* Responsive: stack on small screens */
@media (max-width: 768px) {
  #main { flex-direction: column; }
  #editor-pane { border-right: none; border-bottom: 1px solid var(--border); }
  #divider { width: 100%; height: 4px; cursor: row-resize; }
}
</style>
</head>
<body>

<div id="toolbar">
  <div class="group">
    <button id="btn-theme" title="切换UI主题" class="icon-btn">🌓</button>
  </div>
  <div class="sep"></div>
  <div class="group">
    <label style="font-size:12px;color:var(--text-secondary)">图表:</label>
    <select id="mermaid-theme">
      <option value="default">Default</option>
      <option value="forest">Forest</option>
      <option value="dark">Dark</option>
      <option value="neutral">Neutral</option>
    </select>
  </div>
  <div class="sep"></div>
  <div class="group">
    <div class="dropdown">
      <button id="btn-template">模板 ▼</button>
      <div class="dropdown-menu" id="menu-template"></div>
    </div>
  </div>
  <div class="sep"></div>
  <div class="group">
    <div class="dropdown">
      <button id="btn-export">导出 ▼</button>
      <div class="dropdown-menu" id="menu-export">
        <button data-action="copy-svg">📋 复制 SVG 代码</button>
        <button data-action="download-svg">💾 下载 SVG 文件</button>
        <button data-action="download-png">🖼️ 下载 PNG 文件</button>
        <button data-action="copy-base64">📋 复制 Base64</button>
        <button data-action="copy-markdown">📝 复制 Markdown 链接</button>
      </div>
    </div>
  </div>
</div>

<div id="main">
  <div id="editor-pane">
    <div class="pane-header"><span>Mermaid 代码</span><span id="editor-lang">mermaid</span></div>
    <div id="editor-wrap">
      <pre id="editor-highlight"></pre>
      <textarea id="editor" placeholder="在此输入 Mermaid 代码..." spellcheck="false"></textarea>
    </div>
  </div>
  <div id="divider"></div>
  <div id="preview-pane">
    <div class="pane-header"><span>预览</span><span id="preview-zoom">100%</span></div>
    <div id="preview-wrap">
      <div style="color:var(--text-secondary);font-size:14px;">输入 Mermaid 代码以生成图表</div>
    </div>
  </div>
</div>

<div id="statusbar">
  <span id="status-icon">●</span>
  <span id="status-text">就绪</span>
</div>

<div id="toast"></div>

{{MERMAID_JS}}

<script>
// Application logic — filled in subsequent tasks
</script>

</body>
</html>
```

- [ ] **Step 2: Run build.py**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Expected: produces `mermaid-editor.html` (~3MB)

- [ ] **Step 3: Verify basic structure**

Open `mermaid-editor.html` in browser. Expected: toolbar with buttons, left/right panes, status bar visible. No functionality yet.

---

### Task 3: Editor with syntax highlighting and auto-save

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add syntax highlighting logic**

Replace the empty `<script>` block at the bottom of the src.html with:

```javascript
const editor = document.getElementById('editor');
const highlight = document.getElementById('editor-highlight');
const previewWrap = document.getElementById('preview-wrap');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const mermaidThemeSelect = document.getElementById('mermaid-theme');
const toast = document.getElementById('toast');

// Mermaid keywords
const KEYWORDS = /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|gitGraph|timeline|journey|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|sankey-beta|xychart-beta|block-beta|packet-beta|kanban|zenuml)\b/gi;
const DIRECTIONS = /\b(TD|TB|BT|RL|LR)\b/g;
const ARROWS = /(-->|---|==>|===|-->|-->|-.->|-\|-|\.\.->|===>|--o|--x|o--o|x--x|<-->/g);
const NODE_SHAPES = /[\[\(\{\(\/\>\]\)\}\]\)]/g;

function highlightCode(code) {
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  html = html.replace(/(%%.*)/g, '<span class="comment">$1</span>');

  // Strings
  html = html.replace(/(["`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="str">$&</span>');

  // Keywords
  html = html.replace(KEYWORDS, '<span class="kw">$&</span>');

  // Directions
  html = html.replace(DIRECTIONS, '<span class="kw">$&</span>');

  // Arrows/edges
  html = html.replace(ARROWS, '<span class="arrow">$&</span>');

  // Attributes in brackets
  html = html.replace(/\{([^}]+)\}/g, (m, inner) => '{<span class="attr">' + inner + '</span>}');

  return html;
}

function updateHighlight() {
  const code = editor.value;
  highlight.innerHTML = highlightCode(code) + '\n';
  highlight.scrollTop = editor.scrollTop;
  highlight.scrollLeft = editor.scrollLeft;
}

editor.addEventListener('input', () => {
  updateHighlight();
  scheduleRender();
  saveToStorage();
});

editor.addEventListener('scroll', () => {
  highlight.scrollTop = editor.scrollTop;
  highlight.scrollLeft = editor.scrollLeft;
});

editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
    updateHighlight();
    scheduleRender();
  }
});

// localStorage auto-save
const STORAGE_KEY = 'mermaid-editor-code';

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, editor.value);
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    editor.value = saved;
    updateHighlight();
    renderDiagram();
  } else {
    // Load default template
    editor.value = DEFAULT_TEMPLATE;
    updateHighlight();
    renderDiagram();
  }
}

// Toast notification
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}
```

- [ ] **Step 2: Run build and test**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Open in browser, type Mermaid code. Expected: syntax highlighted, auto-saved to localStorage on refresh.

---

### Task 4: Rendering engine

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add rendering logic**

Insert the following JavaScript after the editor logic (before `</script>`):

```javascript
// Mermaid initialization
let currentTheme = 'default';

function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: currentTheme,
    securityLevel: 'loose',
  });
}

initMermaid();

// Debounced render
let renderTimeout;

function scheduleRender() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(renderDiagram, 500);
}

async function renderDiagram() {
  const code = editor.value.trim();
  if (!code) {
    previewWrap.innerHTML = '<div style="color:var(--text-secondary);font-size:14px;">输入 Mermaid 代码以生成图表</div>';
    setStatus('ok', '就绪');
    return;
  }

  const id = 'mermaid-svg-' + Date.now();

  try {
    const { svg } = await mermaid.render(id, code);
    previewWrap.innerHTML = svg;
    setStatus('ok', '渲染成功');
    clearEditorError();
  } catch (err) {
    const msg = err.message || String(err);
    previewWrap.innerHTML = '<div id="preview-error">' + escapeHtml(msg) + '</div>';
    setStatus('err', '语法错误');
    highlightErrorLine(err);
  }
}

function setStatus(type, text) {
  statusIcon.className = type;
  statusIcon.textContent = type === 'ok' ? '●' : '●';
  statusText.textContent = text;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function highlightErrorLine(err) {
  const msg = err.message || '';
  const lineMatch = msg.match(/line\s+(\d+)/i);
  if (lineMatch) {
    const line = parseInt(lineMatch[1]) - 1;
    const lines = highlight.innerHTML.split('\n');
    if (lines[line] !== undefined) {
      lines[line] = '<span class="error-line">' + lines[line] + '</span>';
      highlight.innerHTML = lines.join('\n');
    }
  }
}

function clearEditorError() {
  updateHighlight();
}

// Theme change → re-init mermaid and re-render
mermaidThemeSelect.addEventListener('change', () => {
  currentTheme = mermaidThemeSelect.value;
  initMermaid();
  renderDiagram();
});
```

- [ ] **Step 1b: Add preview zoom and pan**

After the `mermaidThemeSelect` change handler, insert:

```javascript
// Preview zoom and pan
let previewZoom = 1;
let panX = 0, panY = 0;
let isPanning = false;
let panStartX, panStartY;

previewWrap.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    previewZoom = Math.max(0.2, Math.min(3, previewZoom + delta));
    applyPreviewTransform();
    document.getElementById('preview-zoom').textContent = Math.round(previewZoom * 100) + '%';
  }
}, { passive: false });

previewWrap.addEventListener('mousedown', (e) => {
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    e.preventDefault();
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    previewWrap.style.cursor = 'grabbing';
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  panX = e.clientX - panStartX;
  panY = e.clientY - panStartY;
  applyPreviewTransform();
});

document.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;
    previewWrap.style.cursor = '';
  }
});

function applyPreviewTransform() {
  const svg = previewWrap.querySelector('svg');
  if (svg) {
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${previewZoom})`;
    svg.style.transformOrigin = 'center center';
    svg.style.transition = 'transform 0.1s ease';
  }
}

// Reset pan on new render by resetting in renderDiagram
function resetPreviewTransform() {
  previewZoom = 1;
  panX = 0;
  panY = 0;
  document.getElementById('preview-zoom').textContent = '100%';
}
```

And add `resetPreviewTransform();` call at the beginning of `renderDiagram()` function, right before the code check:

```javascript
async function renderDiagram() {
  resetPreviewTransform();
  const code = editor.value.trim();
  // ... rest of function
```

- [ ] **Step 2: Rebuild and test rendering**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Open in browser. Expected: typing valid Mermaid code renders diagram after 500ms pause. Invalid code shows error message in preview pane with error line highlighted.

---

### Task 5: Divider drag-to-resize

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add divider drag logic**

Insert after the rendering code:

```javascript
// Resizable divider
const divider = document.getElementById('divider');
const editorPane = document.getElementById('editor-pane');
const previewPaneEl = document.getElementById('preview-pane');
let isDragging = false;

divider.addEventListener('mousedown', (e) => {
  isDragging = true;
  divider.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const main = document.getElementById('main');
  const rect = main.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = (x / rect.width) * 100;
  if (pct > 20 && pct < 80) {
    editorPane.style.flex = '0 0 ' + pct + '%';
    previewPaneEl.style.flex = '0 0 ' + (100 - pct) + '%';
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});
```

- [ ] **Step 2: Rebuild and test**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Expected: divider draggable, panes resize smoothly, 20%-80% limits enforced.

---

### Task 6: Theme system (UI dark/light)

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add UI theme logic**

Insert after divider code:

```javascript
// UI Theme
const btnTheme = document.getElementById('btn-theme');
const html = document.documentElement;

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    html.classList.add('dark');
    btnTheme.textContent = '☀️';
    localStorage.setItem('mermaid-editor-ui-theme', 'dark');
  } else {
    html.classList.remove('dark');
    btnTheme.textContent = '🌙';
    localStorage.setItem('mermaid-editor-ui-theme', 'light');
  }
}

function toggleTheme() {
  const current = html.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(current);
}

btnTheme.addEventListener('click', toggleTheme);

// Init theme: prefer saved, then system
const savedTheme = localStorage.getItem('mermaid-editor-ui-theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme(getSystemTheme());
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('mermaid-editor-ui-theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});
```

- [ ] **Step 2: Rebuild and test**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Expected: theme button toggles dark/light, persists across refresh, follows system preference by default.

---

### Task 7: Template library

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add templates and dropdown logic**

Insert after theme code:

```javascript
// Templates
const DEFAULT_TEMPLATE = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[另作处理]
    C --> E[结束]
    D --> E`;

const TEMPLATES = {
  '流程图': `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[另作处理]
    C --> E[结束]
    D --> E`,

  '时序图': `sequenceDiagram
    participant U as 用户
    participant S as 系统
    participant D as 数据库
    U->>S: 发送请求
    S->>D: 查询数据
    D-->>S: 返回结果
    S-->>U: 响应`,

  '类图': `classDiagram
    class 动物 {
        +String 名称
        +int 年龄
        +发出声音()
    }
    class 狗 {
        +String 品种
        +摇尾巴()
    }
    class 猫 {
        +String 毛色
        +抓老鼠()
    }
    动物 <|-- 狗
    动物 <|-- 猫`,

  '状态图': `stateDiagram-v2
    [*] --> 待审核
    待审核 --> 审核中: 提交
    审核中 --> 已通过: 通过
    审核中 --> 已驳回: 驳回
    已驳回 --> 待审核: 重新提交
    已通过 --> [*]`,

  'ER图': `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date orderDate
    }
    LINE-ITEM {
        string productCode
        int quantity
        float price
    }`,

  '甘特图': `gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 阶段一
    需求分析    :a1, 2025-01-01, 7d
    方案设计    :a2, after a1, 5d
    section 阶段二
    开发        :a3, after a2, 14d
    测试        :a4, after a3, 7d
    上线        :a5, after a4, 2d`,

  '饼图': `pie title 预算分配
    "研发" : 40
    "市场" : 25
    "运营" : 20
    "其他" : 15`,

  '思维导图': `mindmap
  root((核心主题))
    分支一
      子项A
      子项B
    分支二
      子项C
      子项D
        细节1
        细节2`,
};

// Build template menu
const menuTemplate = document.getElementById('menu-template');
for (const [name, code] of Object.entries(TEMPLATES)) {
  const btn = document.createElement('button');
  btn.textContent = name;
  btn.addEventListener('click', () => {
    editor.value = code;
    updateHighlight();
    renderDiagram();
    saveToStorage();
    menuTemplate.classList.remove('show');
  });
  menuTemplate.appendChild(btn);
}

// Dropdown toggle logic
document.querySelectorAll('.dropdown').forEach(drop => {
  const trigger = drop.querySelector('button');
  const menu = drop.querySelector('.dropdown-menu');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close others
    document.querySelectorAll('.dropdown-menu.show').forEach(m => {
      if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
});
```

- [ ] **Step 2: Rebuild and test**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Expected: click template dropdown → see 8 templates → click one → editor fills with template code and renders diagram.

---

### Task 8: Export functions

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add export logic**

Insert after template code:

```javascript
// Export functions
function getSVGElement() {
  return previewWrap.querySelector('svg');
}

function getSVGString() {
  const svg = getSVGElement();
  if (!svg) return null;
  return new XMLSerializer().serializeToString(svg);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast('已复制到剪贴板'),
    () => showToast('复制失败，请重试')
  );
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Export actions
const exportActions = {
  'copy-svg': () => {
    const svgStr = getSVGString();
    if (!svgStr) { showToast('没有可导出的图表'); return; }
    copyToClipboard(svgStr);
  },

  'download-svg': () => {
    const svgStr = getSVGString();
    if (!svgStr) { showToast('没有可导出的图表'); return; }
    downloadFile(svgStr, 'diagram.svg', 'image/svg+xml');
    showToast('SVG 已下载');
  },

  'download-png': () => {
    const svg = getSVGElement();
    if (!svg) { showToast('没有可导出的图表'); return; }
    const svgStr = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const bbox = svg.getBoundingClientRect();
      const scale = 2;
      canvas.width = bbox.width * scale;
      canvas.height = bbox.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
        showToast('PNG 已下载');
      }, 'image/png');
    };
    img.src = url;
  },

  'copy-base64': () => {
    const svgStr = getSVGString();
    if (!svgStr) { showToast('没有可导出的图表'); return; }
    const b64 = btoa(unescape(encodeURIComponent(svgStr)));
    const dataUri = 'data:image/svg+xml;base64,' + b64;
    copyToClipboard(dataUri);
  },

  'copy-markdown': () => {
    const svgStr = getSVGString();
    if (!svgStr) { showToast('没有可导出的图表'); return; }
    const b64 = btoa(unescape(encodeURIComponent(svgStr)));
    const dataUri = 'data:image/svg+xml;base64,' + b64;
    copyToClipboard('![](' + dataUri + ')');
  },
};

document.getElementById('menu-export').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  if (exportActions[action]) {
    exportActions[action]();
    document.getElementById('menu-export').classList.remove('show');
  }
});
```

- [ ] **Step 2: Rebuild and test**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Test each export option with a rendered diagram visible.

---

### Task 9: Keyboard shortcuts

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add keyboard shortcut handler**

Insert after export code:

```javascript
// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.shiftKey && e.key === 'c') {
    e.preventDefault();
    exportActions['copy-svg']();
  } else if (mod && e.shiftKey && e.key === 'p') {
    e.preventDefault();
    exportActions['download-png']();
  } else if (mod && !e.shiftKey && e.key === 's') {
    e.preventDefault();
    exportActions['download-svg']();
  }
});
```

- [ ] **Step 2: Rebuild and test shortcuts**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

Test: Ctrl+S → downloads SVG, Ctrl+Shift+C → copies SVG, Ctrl+Shift+P → downloads PNG.

---

### Task 10: Initialize on page load + final integration test

**Files:**
- Modify: `D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor/mermaid-editor.src.html`

- [ ] **Step 1: Add init call at end of script**

Insert at end of `<script>` block (before `</script>`):

```javascript
// Startup
loadFromStorage();
```

- [ ] **Step 2: Final build**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor" && python build.py
```

- [ ] **Step 3: End-to-end test checklist**

Open `mermaid-editor.html` and verify:
1. ✅ Page loads with default template rendered
2. ✅ Type code → diagram updates after ~500ms
3. ✅ Syntax error shows error message + highlights error line
4. ✅ Divider drag resizes panes
5. ✅ Theme toggle (light/dark) works
6. ✅ Mermaid theme dropdown changes diagram style
7. ✅ Template dropdown inserts all 8 templates
8. ✅ Export: Copy SVG → paste into document works
9. ✅ Export: Download SVG/PNG produces valid files
10. ✅ Export: Copy Base64 / Markdown copies correct data URI
11. ✅ Ctrl+S downloads SVG
12. ✅ Ctrl+Shift+C copies SVG code
13. ✅ Close and reopen → code restored from localStorage
14. ✅ Disconnect internet → page still works fully offline
15. ✅ Ctrl+滚轮缩放图表, Alt+拖拽平移, 中键拖拽平移

- [ ] **Step 4: Commit**

```bash
cd "D:/00_AIT_Work/Projects/99_MyTools/mermaid-editor"
git add .gitignore build.py mermaid-editor.src.html docs/
git commit -m "feat: add Mermaid Live Editor with offline rendering and export"
```
