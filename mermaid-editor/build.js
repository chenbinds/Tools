#!/usr/bin/env node
/** Build the self-contained mermaid-editor.html by splitting source at marker. */
const fs = require('fs');
const path = require('path');
const https = require('https');

const SCRIPT_DIR = __dirname;
const MERMAID_FILE = path.join(SCRIPT_DIR, 'mermaid.min.js');
const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
const SRC_FILE = path.join(SCRIPT_DIR, 'mermaid-editor.src.html');
const OUT_FILE = path.join(SCRIPT_DIR, 'mermaid-editor.html');

function downloadMermaid(callback) {
    console.log('Downloading mermaid.min.js from CDN...');
    const file = fs.createWriteStream(MERMAID_FILE);
    https.get(MERMAID_URL, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
            https.get(res.headers.location, (r) => r.pipe(file));
            return;
        }
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Downloaded mermaid.min.js');
            callback();
        });
    }).on('error', (err) => {
        fs.unlink(MERMAID_FILE, () => {});
        console.error('Download failed:', err.message);
        console.error('Manual: curl -L -o mermaid.min.js ' + MERMAID_URL);
        process.exit(1);
    });
}

if (!fs.existsSync(MERMAID_FILE)) {
    downloadMermaid(build);
} else {
    build();
}

function build() {
    const src = fs.readFileSync(SRC_FILE, 'utf-8');
    const mermaidJs = fs.readFileSync(MERMAID_FILE, 'utf-8');

    const marker = '<!-- INLINE_MERMAID_HERE -->';
    const parts = src.split(marker);

    if (parts.length !== 2) {
        console.error('Error: source must contain exactly one ' + marker + ' marker');
        process.exit(1);
    }

    const escapedJs = mermaidJs.replace(/<\/script>/gi, '<\\/script>');
    const result = parts[0] + '<script>' + escapedJs + '</script>' + parts[1];
    fs.writeFileSync(OUT_FILE, result, 'utf-8');

    const sizeMb = (fs.statSync(OUT_FILE).size / (1024 * 1024)).toFixed(1);
    console.log('Built: ' + OUT_FILE + ' (' + sizeMb + ' MB)');
}
