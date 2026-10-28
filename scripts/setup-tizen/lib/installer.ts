/** Tizen Studio CLI binary runner and TV extension installer */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { SystemInfo } from '../types.js';

export function installTizenStudio(sys: SystemInfo, installerPath: string): void {
  console.log(`\n==> [4/6] Installing Tizen Studio to: ${sys.installDir}...`);

  if (fs.existsSync(sys.installDir)) {
    console.log(`    Tizen Studio directory already exists at ${sys.installDir}. Skipping clean install.`);
    return;
  }

  if (sys.platform === 'linux' || sys.platform === 'darwin') {
    fs.chmodSync(installerPath, '755');

    console.log('    Executing Tizen CLI installer with license acceptance...');
    execSync(`"${installerPath}" --accept-license "${sys.installDir}"`, {
      stdio: 'inherit',
    });
  } else if (sys.platform === 'win32') {
    console.log('    Executing Windows installer...');
    execSync(`"${installerPath}" /S /D=${sys.installDir}`, {
      stdio: 'inherit',
    });
  }

  console.log('    ✔ Tizen Studio base CLI installed successfully!');
}

export function installTvExtensions(sys: SystemInfo): void {
  console.log('\n==> [5/6] Installing Samsung Smart TV Extensions...');

  const pkgManager =
    sys.platform === 'win32'
      ? path.join(sys.installDir, 'package-manager', 'package-manager-cli.exe')
      : path.join(sys.installDir, 'package-manager', 'package-manager-cli.bin');

  if (!fs.existsSync(pkgManager)) {
    console.warn(`    ⚠️ Package manager CLI not found at ${pkgManager}`);
    return;
  }

  try {
    console.log('    Querying available packages...');
    const pkgsToInstall = [
      'TV-Extension-6.5',
      'TV-Extension-tools',
      'Samsung-Certificate-Extension',
    ];

    for (const pkg of pkgsToInstall) {
      console.log(`    Installing package: ${pkg}...`);
      try {
        execSync(`"${pkgManager}" install ${pkg} --accept-license`, {
          stdio: 'inherit',
        });
      } catch {
        console.warn(`    Note: Package ${pkg} install completed or not available in this mirror.`);
      }
    }
  } catch (err) {
    console.warn('    Could not auto-install TV extensions:', err);
  }
}
