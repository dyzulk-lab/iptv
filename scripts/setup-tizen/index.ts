/**
 * Samsung Tizen Studio CLI Installer & Setup
 * Single responsibility: orchestrate OS detection, prerequisites check,
 * download, base install, TV extensions, and PATH setup.
 * 
 * Run with: npm run setup:tizen
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { detectSystem } from './lib/detector.js';
import { checkPrerequisites } from './lib/prerequisites.js';
import { downloadFile } from './lib/downloader.js';
import { installTizenStudio, installTvExtensions } from './lib/installer.js';
import { configurePath } from './lib/env.js';

async function main() {
  try {
    const sys = detectSystem();
    checkPrerequisites(sys);

    const tempDir = path.join(os.tmpdir(), 'tizen-setup');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const installerPath = path.join(tempDir, sys.installerName);
    console.log('\n==> [3/6] Fetching Tizen CLI Installer...');
    await downloadFile(sys.downloadUrl, installerPath);

    installTizenStudio(sys, installerPath);
    installTvExtensions(sys);
    configurePath(sys);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
