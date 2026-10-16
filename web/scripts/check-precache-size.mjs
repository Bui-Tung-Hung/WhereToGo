// Fails (exit 1) when any file the service worker precaches is larger than Workbox's limit, so the
// app keeps opening offline (P27 docs/PLAN-UI-1.md). Run from web/ after `npm run build`.
import { readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const DIST_DIR = 'dist';
const MAX_BYTES = 2 * 1024 * 1024;
const PRECACHED_EXTENSIONS = new Set(['.js', '.css', '.html', '.svg', '.png', '.ico', '.woff2']);
const TOP_COUNT = 5;

/** Every file under `dir`, recursively. */
function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const files = listFiles(DIST_DIR)
  .filter((path) => PRECACHED_EXTENSIONS.has(extname(path)))
  .map((path) => ({ path: relative(DIST_DIR, path), bytes: statSync(path).size }))
  .sort((a, b) => b.bytes - a.bytes);

console.log(`Largest precached files (limit ${MAX_BYTES} bytes):`);
for (const file of files.slice(0, TOP_COUNT)) {
  console.log(`  ${file.bytes.toString().padStart(9)}  ${file.path}`);
}

const tooLarge = files.filter((file) => file.bytes > MAX_BYTES);
if (tooLarge.length > 0) {
  for (const file of tooLarge) {
    console.error(`Too large for precache: ${file.path} (${file.bytes} bytes)`);
  }
  process.exit(1);
}
console.log(`OK: all ${files.length} precached files are within the limit.`);
