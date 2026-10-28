/** Prerequisites and Java environment checker for Tizen Studio */

import { execSync } from 'node:child_process';
import type { SystemInfo } from '../types.js';

export function checkPrerequisites(sys: SystemInfo): void {
  console.log('\n==> [2/6] Checking Prerequisites (Java & Tools)...');

  // Check Java availability
  try {
    const javaOutput = execSync('java -version 2>&1', { encoding: 'utf-8' });
    const firstLine = javaOutput.split('\n')[0];
    console.log(`    ✔ Java is installed: ${firstLine}`);
  } catch {
    console.warn('    ⚠️ Java was not found in PATH.');
    if (sys.platform === 'linux') {
      console.log(`    Attempting to install Java via package manager for ${sys.distro}...`);
      try {
        if (['ubuntu', 'debian', 'linuxmint', 'pop'].includes(sys.distro || '')) {
          execSync('sudo apt-get update && sudo apt-get install -y default-jre pciutils zip unzip', {
            stdio: 'inherit',
          });
        } else if (['fedora', 'rhel', 'centos'].includes(sys.distro || '')) {
          execSync('sudo dnf install -y java-11-openjdk pciutils zip unzip', { stdio: 'inherit' });
        } else if (['arch', 'manjaro'].includes(sys.distro || '')) {
          execSync('sudo pacman -S --noconfirm jre11-openjdk pciutils zip unzip', { stdio: 'inherit' });
        }
      } catch (err) {
        console.error('    Could not auto-install Java. Please install Java 8/11/17+ manually.', err);
      }
    } else if (sys.platform === 'win32') {
      console.log(
        "    On Windows, please ensure Java 8/11/17+ is installed (e.g. via 'winget install Oracle.JavaRuntimeEnvironment')."
      );
    }
  }
}
