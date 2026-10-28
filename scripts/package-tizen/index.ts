/**
 * Samsung Tizen Packaging CLI
 * Single responsibility: orchestrate packaging dist/ into tv-ku.wgt
 * 
 * Run with: npm run package:tizen
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncTizenAssets } from './lib/assets.js';
import { createTizenPackage } from './lib/archiver.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const distDir = path.resolve(rootDir, 'dist');
const wgtOutput = path.resolve(rootDir, 'tv-ku.wgt');

console.log('==> Packaging tv-ku IPTV for Samsung Tizen...');

if (!fs.existsSync(distDir)) {
  console.error("Error: dist/ directory not found. Run 'npm run build' first.");
  process.exit(1);
}

try {
  // 1. Prepare assets
  syncTizenAssets(rootDir, distDir);

  // 2. Compress into .wgt
  createTizenPackage(distDir, wgtOutput);

  console.log(`\n🎉 Success! Tizen package created: ${wgtOutput}`);
  console.log('To install on rooted TV:');
  console.log('  sdb connect <TV_IP>:26101');
  console.log('  sdb install dyzulk-iptv.wgt\n');
} catch (err) {
  console.error('Failed to create .wgt archive:', err);
  process.exit(1);
}
