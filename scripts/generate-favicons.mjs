// Generates raster favicon/app-icon assets from the square emblem SVG.
// Run with: npm run favicons
//
// Input:  public/favicon.svg (square emblem on anthracite background)
// Output: public/favicon-16.png, favicon-32.png, favicon-48.png,
//         apple-touch-icon.png (180), icon-192.png, icon-512.png,
//         and a multi-size favicon.ico (16/32/48).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');
const src = join(publicDir, 'favicon.svg');

const svg = await readFile(src);

// Density boost so librsvg rasterizes the vector crisply before resizing.
const render = (size) =>
  sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png();

const pngTargets = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

for (const [name, size] of pngTargets) {
  await render(size).toFile(join(publicDir, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

// Build a multi-resolution .ico (16/32/48) manually per the ICO spec.
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map((s) => render(s).toBuffer())
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(icoPngs.length, 4); // image count

const entries = [];
let offset = 6 + 16 * icoPngs.length;
icoPngs.forEach((png, i) => {
  const entry = Buffer.alloc(16);
  const dim = icoSizes[i] >= 256 ? 0 : icoSizes[i];
  entry.writeUInt8(dim, 0); // width
  entry.writeUInt8(dim, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // data size
  entry.writeUInt32LE(offset, 12); // data offset
  offset += png.length;
  entries.push(entry);
});

const ico = Buffer.concat([header, ...entries, ...icoPngs]);
await writeFile(join(publicDir, 'favicon.ico'), ico);
console.log(`  ✓ favicon.ico (16/32/48)`);

console.log('Favicon assets generated in /public.');
