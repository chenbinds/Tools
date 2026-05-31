#!/usr/bin/env node
/** Build the self-contained mermaid-editor.html by splitting source at marker. */
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const MERMAID_FILE = path.join(SCRIPT_DIR, 'mermaid.min.js');
const SRC_FILE = path.join(SCRIPT_DIR, 'mermaid-editor.src.html');
const OUT_FILE = path.join(SCRIPT_DIR, 'mermaid-editor.html');

if (!fs.existsSync(MERMAID_FILE)) {
    console.error('Error: mermaid.min.js not found. Download it first:');
    console.error('  curl -L -o mermaid.min.js https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js');
    process.exit(1);
}

const src = fs.readFileSync(SRC_FILE, 'utf-8');
const mermaidJs = fs.readFileSync(MERMAID_FILE, 'utf-8');

// Split source at the marker comment
const marker = '<!-- INLINE_MERMAID_HERE -->';
const parts = src.split(marker);

if (parts.length !== 2) {
    console.error('Error: source must contain exactly one ' + marker + ' marker');
    process.exit(1);
}

// Escape </script> to prevent premature tag closure
const escapedJs = mermaidJs.replace(/<\/script>/gi, '<\\/script>');

const result = parts[0] + '<script>' + escapedJs + '</script>' + parts[1];
fs.writeFileSync(OUT_FILE, result, 'utf-8');

const sizeMb = (fs.statSync(OUT_FILE).size / (1024 * 1024)).toFixed(1);
console.log('Built: ' + OUT_FILE + ' (' + sizeMb + ' MB)');
