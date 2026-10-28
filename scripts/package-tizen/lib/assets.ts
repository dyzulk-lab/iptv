/** Asset synchronizer for Tizen packaging */

import fs from 'node:fs';
import path from 'node:path';

export function syncTizenAssets(rootDir: string, distDir: string): void {
  // 1. Copy config.xml
  const configSrc = path.resolve(rootDir, 'config.xml');
  const configDest = path.resolve(distDir, 'config.xml');
  if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, configDest);
    console.log('✔ Copied config.xml to dist/');
  } else {
    console.warn('⚠️  config.xml not found at project root');
  }

  // 2. Prepare icon.png
  const iconPath = path.resolve(rootDir, 'icon.png');
  if (!fs.existsSync(iconPath)) {
    // 1x1 transparent placeholder png buffer
    const blankPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(iconPath, blankPng);
  }
  fs.copyFileSync(iconPath, path.resolve(distDir, 'icon.png'));
  console.log('✔ Copied icon.png to dist/');
}
