import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const ssr = new URL('../dist-ssr/', import.meta.url);
const { buildSite } = await import(new URL('entry-server.js', ssr).href);

const manifestUrl = new URL('.vite/manifest.json', dist);
const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'));
const files = await buildSite(readFileSync(new URL('index.html', dist), 'utf8'), manifest);
for (const { file, contents } of files) {
  const target = new URL(file, dist);
  mkdirSync(dirname(target.pathname), { recursive: true });
  writeFileSync(target, contents);
}
rmSync(ssr, { recursive: true, force: true });
rmSync(new URL('.vite/', dist), { recursive: true, force: true });
console.log(`Prerendered ${files.length} files.`);
