/** Environment PATH and shell RC configurator */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { SystemInfo } from '../types.js';

export function configurePath(sys: SystemInfo): void {
  console.log('\n==> [6/6] Configuring Environment PATH...');

  const toolsBin = path.join(sys.installDir, 'tools', 'ide', 'bin');
  const tools = path.join(sys.installDir, 'tools');

  if (sys.platform === 'linux' || sys.platform === 'darwin') {
    const bashrc = path.join(os.homedir(), '.bashrc');
    const exportLine = `export PATH="$PATH:${toolsBin}:${tools}"`;

    if (fs.existsSync(bashrc)) {
      const content = fs.readFileSync(bashrc, 'utf-8');
      if (!content.includes(toolsBin)) {
        fs.appendFileSync(bashrc, `\n# Samsung Tizen Studio CLI\n${exportLine}\n`);
        console.log('    ✔ Added Tizen tools to ~/.bashrc');
        console.log("    Run 'source ~/.bashrc' or restart your terminal to activate.");
      } else {
        console.log('    ✔ PATH already configured in ~/.bashrc');
      }
    }
  } else if (sys.platform === 'win32') {
    console.log('    On Windows, add the following to your PATH:');
    console.log(`    ${toolsBin};${tools}`);
  }

  console.log('\n=======================================================');
  console.log('🎉 Tizen Development Setup Complete!');
  console.log('   Tools installed:');
  console.log(`   - tizen : ${path.join(toolsBin, 'tizen')}`);
  console.log(`   - sdb   : ${path.join(tools, 'sdb')}`);
  console.log('=======================================================\n');
}
