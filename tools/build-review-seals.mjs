/* Extract the five licensed seal-script glyphs to static SVG outlines.
   No font tooling or browser-time dependency is needed. This intentionally
   handles the simple TrueType outlines in the checked-in five-glyph subset. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const fontURL = new URL('../site/fonts/QuanZiKuShuoWenJieZi-5glyph.ttf', import.meta.url);
const outputURL = new URL('../site/images/review/', import.meta.url);
const font = await readFile(fontURL);
const tables = new Map();
for (let n = 0; n < font.readUInt16BE(4); n++) {
  const at = 12 + 16 * n;
  tables.set(font.toString('ascii', at, at + 4), font.readUInt32BE(at + 8));
}
const head = tables.get('head');
const loca = tables.get('loca');
const glyf = tables.get('glyf');
const longLoca = font.readInt16BE(head + 50) === 1;
const cmap = tables.get('cmap');
let mapAt;
for (let n = 0; n < font.readUInt16BE(cmap + 2); n++) {
  const at = cmap + 4 + n * 8;
  const offset = cmap + font.readUInt32BE(at + 4);
  if (font.readUInt16BE(offset) === 4) mapAt = offset;
}
if (!mapAt) throw new Error('A BMP format-4 character map is required.');
function glyphId(character) {
  const code = character.codePointAt(0);
  const count = font.readUInt16BE(mapAt + 6) / 2;
  const ends = mapAt + 14;
  const starts = ends + count * 2 + 2;
  const deltas = starts + count * 2;
  const ranges = deltas + count * 2;
  for (let n = 0; n < count; n++) {
    if (code > font.readUInt16BE(ends + n * 2) || code < font.readUInt16BE(starts + n * 2)) continue;
    const delta = font.readInt16BE(deltas + n * 2);
    const range = font.readUInt16BE(ranges + n * 2);
    if (!range) return (code + delta) & 65535;
    const id = font.readUInt16BE(ranges + n * 2 + range + 2 * (code - font.readUInt16BE(starts + n * 2)));
    return id ? (id + delta) & 65535 : 0;
  }
  throw new Error(`Missing glyph: ${character}`);
}
function outline(character) {
  const id = glyphId(character);
  if (!id) throw new Error(`Missing outline: ${character}`);
  const offset = longLoca ? font.readUInt32BE(loca + id * 4) : font.readUInt16BE(loca + id * 2) * 2;
  let at = glyf + offset;
  const contours = font.readInt16BE(at);
  if (contours <= 0) throw new Error(`Expected a simple outline for ${character}`);
  const bounds = [2, 4, 6, 8].map(n => font.readInt16BE(at + n));
  at += 10;
  const ends = Array.from({ length: contours }, () => { const v = font.readUInt16BE(at); at += 2; return v; });
  const count = ends.at(-1) + 1;
  const instructions = font.readUInt16BE(at);
  at += 2 + instructions;
  const flags = [];
  while (flags.length < count) {
    const flag = font[at++];
    flags.push(flag);
    if (flag & 8) { let repeat = font[at++]; while (repeat--) flags.push(flag); }
  }
  function coordinates(shortBit, sameBit) {
    let value = 0;
    return flags.map(flag => {
      if (flag & shortBit) value += (flag & sameBit ? 1 : -1) * font[at++];
      else if (!(flag & sameBit)) { value += font.readInt16BE(at); at += 2; }
      return value;
    });
  }
  const xs = coordinates(2, 16);
  const ys = coordinates(4, 32);
  let start = 0;
  let path = '';
  for (const end of ends) {
    const points = [];
    for (let n = start; n <= end; n++) points.push({ x: xs[n], y: ys[n], on: !!(flags[n] & 1) });
    const expanded = [];
    points.forEach((p, n) => {
      expanded.push(p);
      const q = points[(n + 1) % points.length];
      if (!p.on && !q.on) expanded.push({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, on: true });
    });
    const first = expanded.findIndex(p => p.on);
    const ordered = [...expanded.slice(first), ...expanded.slice(0, first)];
    path += `M${ordered[0].x} ${ordered[0].y}`;
    for (let n = 1; n < ordered.length; n++) {
      const p = ordered[n];
      if (p.on) path += `L${p.x} ${p.y}`;
      else {
        const q = ordered[(n + 1) % ordered.length];
        path += `Q${p.x} ${p.y} ${q.x} ${q.y}`;
        n++;
      }
    }
    path += 'Z';
    start = end + 1;
  }
  return { path, bounds };
}
const glyphs = Object.fromEntries([...new Set('紫薇暗香集')].map(c => [c, outline(c)]));
function fitted(character, x, y, width, height) {
  const { path, bounds: [minX, minY, maxX, maxY] } = glyphs[character];
  const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
  const tx = x + (width - (maxX - minX) * scale) / 2 - minX * scale;
  const ty = y + (height - (maxY - minY) * scale) / 2 + maxY * scale;
  return `<path transform="matrix(${scale} 0 0 ${-scale} ${tx} ${ty})" d="${path}"/>`;
}
await mkdir(outputURL, { recursive: true });
for (const [name, text, width, height] of [['ziwei', '紫薇', 44, 56], ['anxiangji', '暗香集', 38, 68]]) {
  const gap = 3;
  const padding = 6;
  const glyphHeight = (height - padding * 2 - (text.length - 1) * gap) / text.length;
  const paths = [...text].map((c, n) => fitted(c, padding, padding + n * (glyphHeight + gap), width - padding * 2, glyphHeight)).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${text}小篆印</title><desc id="desc">朱印白文，字形來自全字庫說文解字。</desc><metadata>Glyph source: 全字庫說文解字. See ../../fonts/NOTICE-QuanZiKuShuoWenJieZi.txt for attribution and license. Extracted from the repository's five-glyph subset.</metadata><path fill="#b44d3b" d="M.9 1.1L${width - 1.3} .7 ${width - .5} ${height - 1.3} 1.1 ${height - .6}Z"/><path d="M2 2H${width - 2}V${height - 2}H2Z" fill="none" stroke="#f7f3e8" stroke-opacity=".38" stroke-width=".5"/><g fill="#f7f3e8">${paths}</g></svg>`;
  await writeFile(new URL(`seal-${name}.svg`, outputURL), svg);
  process.stdout.write(`${name}: ${Buffer.byteLength(svg)} bytes\n`);
}
