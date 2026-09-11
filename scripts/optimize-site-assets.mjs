import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = path.join(root, 'src');
const files = (await readdir(sourceRoot, { recursive: true }))
  .filter((file) => /\.(jsx?|css)$/.test(file));
const sources = await Promise.all(files.map(async (file) => ({ file, text: await readFile(path.join(sourceRoot, file), 'utf8') })));
const references = new Set(sources.flatMap(({ text }) => [...text.matchAll(/\/assets\/[\w/.-]+\.(?:jpg|jpeg|png)/g)].map(([url]) => url)));
const replacements = new Map();
let originalBytes = 0;
let optimizedBytes = 0;

for (const url of references) {
  const original = path.join(root, 'public', url);
  const targetUrl = url.replace(/\.(jpg|jpeg|png)$/, '-optimized.webp');
  const target = path.join(root, 'public', targetUrl);
  const size = (await stat(original)).size;
  const buffer = await sharp(original).rotate().webp({ quality: 85, effort: 6 }).toBuffer();
  if (buffer.length >= size * 0.9) continue;
  await writeFile(target, buffer);
  replacements.set(url, targetUrl);
  originalBytes += size;
  optimizedBytes += buffer.length;
}

for (const { file, text } of sources) {
  const updated = text.replace(/\/assets\/[\w/.-]+\.(?:jpg|jpeg|png)/g, (url) => replacements.get(url) || url);
  if (updated !== text) await writeFile(path.join(sourceRoot, file), updated);
}

console.log(`${replacements.size} imágenes: ${(originalBytes / 1048576).toFixed(2)} MB → ${(optimizedBytes / 1048576).toFixed(2)} MB. Originales conservados.`);
