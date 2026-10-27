import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const wgtOutput = path.resolve(rootDir, "dyzulk-iptv.wgt");

console.log("==> Packaging Dyzulk IPTV for Samsung Tizen...");

if (!fs.existsSync(distDir)) {
  console.error("Error: dist/ directory not found. Run 'npm run build' first.");
  process.exit(1);
}

// 1. Copy config.xml into dist/
fs.copyFileSync(path.resolve(rootDir, "config.xml"), path.resolve(distDir, "config.xml"));
console.log("✔ Copied config.xml to dist/");

// 2. Create placeholder icon.png if it does not exist
const iconPath = path.resolve(rootDir, "icon.png");
if (!fs.existsSync(iconPath)) {
  // 1x1 transparent or default png buffer
  const blankPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.writeFileSync(iconPath, blankPng);
}
fs.copyFileSync(iconPath, path.resolve(distDir, "icon.png"));
console.log("✔ Copied icon.png to dist/");

// 3. Compress dist directory into .wgt file
if (fs.existsSync(wgtOutput)) {
  fs.unlinkSync(wgtOutput);
}

try {
  // Use Linux zip utility
  execSync(`cd "${distDir}" && zip -9 -r "${wgtOutput}" .`, { stdio: "inherit" });
  console.log(`\n🎉 Success! Tizen package created: ${wgtOutput}`);
  console.log("To install on rooted TV:");
  console.log("  sdb connect <TV_IP>:26101");
  console.log("  sdb install dyzulk-iptv.wgt\n");
} catch (err) {
  console.error("Failed to create .wgt archive:", err);
  process.exit(1);
}
