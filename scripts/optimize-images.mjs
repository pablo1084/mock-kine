import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const images = [
  { file: 'hero-centro.png', width: 1024, quality: 84 },
  { file: 'experiencias/moreno.jpg', width: 800, quality: 82 },
  { file: 'experiencias/tapia.jpg', width: 800, quality: 82 },
  { file: 'experiencias/llanos.jpg', width: 800, quality: 82 },
  { file: 'experiencias/aguero.jpg', width: 800, quality: 82 },
  { file: 'readaptacion-entrenamiento.jpg', width: 1000, quality: 80 },
  { file: 'ivolution-lab/ivolution-logo.jpg', lossless: true },
  { file: 'centro/gimnasio2.jpeg', width: 1600, quality: 82 },
  { file: 'ondas-tratamiento.jpg', width: 1080, quality: 82 },
];

let before = 0;
let after = 0;
for (const { file, width, quality, lossless } of images) {
  const source = path.join(root, 'assets-source', file);
  const target = path.join(root, 'public/assets', file.replace(/\.(png|jpe?g)$/i, '.webp'));
  await mkdir(path.dirname(target), { recursive: true });
  const result = await sharp(source).rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, lossless, effort: 6 }).toFile(target);
  const originalSize = (await stat(source)).size;
  before += originalSize;
  after += result.size;
  console.log(`${file}: ${Math.round(originalSize / 1024)} → ${Math.round(result.size / 1024)} KB (${result.width} × ${result.height})`);
}

// JPEG preview for social networks; the actual hero uses WebP.
const social = await sharp(path.join(root, 'assets-source/hero-centro.png'))
  .rotate().resize({ width: 1024, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(root, 'public/assets/hero-centro-social.jpg'));
console.log(`Imágenes en la web: ${(before / 1048576).toFixed(2)} → ${(after / 1048576).toFixed(2)} MB; ahorro ${(100 * (1 - after / before)).toFixed(1)}%.`);
console.log(`Vista previa social: ${Math.round(social.size / 1024)} KB adicionales.`);
