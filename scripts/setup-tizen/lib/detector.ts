/** OS platform and CPU architecture detector for Tizen Studio */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { SystemInfo } from '../types.js';

const TIZEN_VERSION = '6.1';
const BASE_URL = `https://download.tizen.org/sdk/Installer/tizen-studio_${TIZEN_VERSION}`;

export function detectSystem(): SystemInfo {
  const platform = process.platform;
  const arch = process.arch;
  const homeDir = os.homedir();

  console.log('==> [1/6] Detecting System Environment...');
  console.log(`    OS Platform: ${platform}`);
  console.log(`    CPU Arch   : ${arch}`);

  if (arch !== 'x64') {
    console.warn(`\n⚠️  WARNING: Detected CPU architecture '${arch}'.`);
    console.warn('   Samsung Tizen Studio officially provides pre-compiled binaries only for x86_64 (x64).');
    console.warn('   On ARM64, this requires an x86 translation layer (e.g. Rosetta 2, Box64, or Docker x86 emulation).\n');
  }

  let distro = 'generic';
  if (platform === 'linux') {
    try {
      const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
      const match = osRelease.match(/^ID=([^\n]+)/m);
      if (match) distro = match[1].replace(/["']/g, '').trim().toLowerCase();
    } catch {
      distro = 'linux';
    }
    console.log(`    Linux Distro: ${distro}`);

    const installerName = `web-cli_Tizen_Studio_${TIZEN_VERSION}_ubuntu-64.bin`;
    return {
      platform: 'linux',
      arch,
      distro,
      installDir: path.join(homeDir, 'tizen-studio'),
      installerName,
      downloadUrl: `${BASE_URL}/${installerName}`,
    };
  }

  if (platform === 'win32') {
    const installerName = `web-cli_Tizen_Studio_${TIZEN_VERSION}_windows-64.exe`;
    return {
      platform: 'win32',
      arch,
      distro: 'windows',
      installDir: path.join(homeDir, 'tizen-studio'),
      installerName,
      downloadUrl: `${BASE_URL}/${installerName}`,
    };
  }

  if (platform === 'darwin') {
    const installerName = `web-cli_Tizen_Studio_${TIZEN_VERSION}_macos-64.bin`;
    return {
      platform: 'darwin',
      arch,
      distro: 'macos',
      installDir: path.join(homeDir, 'tizen-studio'),
      installerName,
      downloadUrl: `${BASE_URL}/${installerName}`,
    };
  }

  throw new Error(`Unsupported OS platform: ${platform}`);
}
