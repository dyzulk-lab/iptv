/** Zip archiver for Tizen .wgt package */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

export function createTizenPackage(distDir: string, wgtOutput: string): void {
  if (fs.existsSync(wgtOutput)) {
    fs.unlinkSync(wgtOutput);
  }

  // Use system zip utility with standard compression
  execSync(`cd "${distDir}" && zip -9 -r "${wgtOutput}" .`, { stdio: 'inherit' });
}
