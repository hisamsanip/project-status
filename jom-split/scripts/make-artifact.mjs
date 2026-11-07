// Menukar dist/index.html (satu fail) kepada bentuk yang diterima Artifact:
// tanpa <!doctype>, <html>, <head>, <body>; <title> dan <style> di atas.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const pick = (re) => [...html.matchAll(re)].map((m) => m[0]);

const title = '<title>Jom Split</title>';
const links = pick(/<link[^>]+fonts\.(googleapis|gstatic)[^>]*>/g).join('\n');
const styles = pick(/<style[\s\S]*?<\/style>/g).join('\n');
const scripts = pick(/<script type="module"[\s\S]*?<\/script>/g).join('\n');

const out = [title, links, styles, '<div id="root"></div>', scripts].join('\n');
writeFileSync('dist/artifact.html', out);
console.log('artifact.html', (out.length / 1024).toFixed(0) + ' KB');
