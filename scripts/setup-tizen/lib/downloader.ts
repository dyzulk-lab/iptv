/** HTTPS stream downloader with progress and redirect handling */

import fs from 'node:fs';
import https from 'node:https';

export async function downloadFile(url: string, destPath: string): Promise<void> {
  if (fs.existsSync(destPath)) {
    console.log(`    ✔ Found cached installer: ${destPath}`);
    return;
  }

  console.log(`    Downloading: ${url}`);
  console.log(`    Destination: ${destPath}`);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    let downloadedBytes = 0;
    let totalBytes = 0;
    let lastPercent = 0;

    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect header missing'));
          return;
        }
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with HTTP ${response.statusCode}`));
        return;
      }

      totalBytes = parseInt(response.headers['content-length'] || '0', 10);

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const percent = Math.floor((downloadedBytes / totalBytes) * 100);
          if (percent >= lastPercent + 10 || percent === 100) {
            process.stdout.write(`    Progress: ${percent}% (${Math.round(downloadedBytes / 1024 / 1024)} MB)\r`);
            lastPercent = percent;
          }
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close(() => {
          console.log(`\n    ✔ Download complete! (${Math.round(downloadedBytes / 1024 / 1024)} MB)`);
          resolve();
        });
      });
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}
