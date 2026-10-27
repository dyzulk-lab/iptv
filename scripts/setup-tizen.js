import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import https from "node:https";

/**
 * Cross-platform Tizen Studio CLI Installer & Setup
 * Automatically detects:
 * - Operating System: Linux (Ubuntu, Debian, Fedora, Arch), Windows, macOS
 * - CPU Architecture: x86_64, arm64
 * Single command: npm run setup:tizen
 */

const TIZEN_VERSION = "6.1";
const BASE_URL = `https://download.tizen.org/sdk/Installer/tizen-studio_${TIZEN_VERSION}`;

function detectSystem() {
  const platform = process.platform;
  const arch = process.arch;
  const homeDir = os.homedir();

  console.log("==> [1/6] Detecting System Environment...");
  console.log(`    OS Platform: ${platform}`);
  console.log(`    CPU Arch   : ${arch}`);

  if (arch !== "x64") {
    console.warn(`\n⚠️  WARNING: Detected CPU architecture '${arch}'.`);
    console.warn("   Samsung Tizen Studio officially provides pre-compiled binaries only for x86_64 (x64).");
    console.warn("   On ARM64, this requires an x86 translation layer (e.g. Rosetta 2, Box64, or Docker x86 emulation).\n");
  }

  let distro = "generic";
  if (platform === "linux") {
    try {
      const osRelease = fs.readFileSync("/etc/os-release", "utf-8");
      const match = osRelease.match(/^ID=([^\n]+)/m);
      if (match) distro = match[1].replace(/["']/g, "").trim().toLowerCase();
    } catch {
      distro = "linux";
    }
    console.log(`    Linux Distro: ${distro}`);

    const installerName = `web-cli_Tizen_Studio_${TIZEN_VERSION}_ubuntu-64.bin`;
    return {
      platform: "linux",
      arch,
      distro,
      installDir: path.join(homeDir, "tizen-studio"),
      installerName,
      downloadUrl: `${BASE_URL}/${installerName}`,
    };
  }

  if (platform === "win32") {
    const installerName = `web-cli_Tizen_Studio_${TIZEN_VERSION}_windows-64.exe`;
    return {
      platform: "win32",
      arch,
      distro: "windows",
      installDir: path.join(homeDir, "tizen-studio"),
      installerName,
      downloadUrl: `${BASE_URL}/${installerName}`,
    };
  }

  if (platform === "darwin") {
    const installerName = `web-cli_Tizen_Studio_${TIZEN_VERSION}_macos-64.bin`;
    return {
      platform: "darwin",
      arch,
      distro: "macos",
      installDir: path.join(homeDir, "tizen-studio"),
      installerName,
      downloadUrl: `${BASE_URL}/${installerName}`,
    };
  }

  throw new Error(`Unsupported OS platform: ${platform}`);
}

function checkPrerequisites(sys) {
  console.log("\n==> [2/6] Checking Prerequisites (Java & Tools)...");

  // Check Java
  try {
    const javaOutput = execSync("java -version 2>&1", { encoding: "utf-8" });
    const firstLine = javaOutput.split("\n")[0];
    console.log(`    ✔ Java is installed: ${firstLine}`);
  } catch {
    console.warn("    ⚠️ Java was not found in PATH.");
    if (sys.platform === "linux") {
      console.log(`    Attempting to install Java via package manager for ${sys.distro}...`);
      try {
        if (["ubuntu", "debian", "linuxmint", "pop"].includes(sys.distro || "")) {
          execSync("sudo apt-get update && sudo apt-get install -y default-jre pciutils zip unzip", {
            stdio: "inherit",
          });
        } else if (["fedora", "rhel", "centos"].includes(sys.distro || "")) {
          execSync("sudo dnf install -y java-11-openjdk pciutils zip unzip", { stdio: "inherit" });
        } else if (["arch", "manjaro"].includes(sys.distro || "")) {
          execSync("sudo pacman -S --noconfirm jre11-openjdk pciutils zip unzip", { stdio: "inherit" });
        }
      } catch (err) {
        console.error("    Could not auto-install Java. Please install Java 8/11/17+ manually.", err);
      }
    } else if (sys.platform === "win32") {
      console.log("    On Windows, please ensure Java 8/11/17+ is installed (e.g. via 'winget install Oracle.JavaRuntimeEnvironment').");
    }
  }
}

async function downloadFile(url, destPath) {
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
          reject(new Error("Redirect header missing"));
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

      totalBytes = parseInt(response.headers["content-length"] || "0", 10);

      response.on("data", (chunk) => {
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

      file.on("finish", () => {
        file.close(() => {
          console.log(`\n    ✔ Download complete! (${Math.round(downloadedBytes / 1024 / 1024)} MB)`);
          resolve();
        });
      });
    });

    request.on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function installTizenStudio(sys, installerPath) {
  console.log(`\n==> [4/6] Installing Tizen Studio to: ${sys.installDir}...`);

  if (fs.existsSync(sys.installDir)) {
    console.log(`    Tizen Studio directory already exists at ${sys.installDir}. Skipping clean install.`);
    return;
  }

  if (sys.platform === "linux" || sys.platform === "darwin") {
    fs.chmodSync(installerPath, "755");

    console.log("    Executing Tizen CLI installer with license acceptance...");
    execSync(`"${installerPath}" --accept-license "${sys.installDir}"`, {
      stdio: "inherit",
    });
  } else if (sys.platform === "win32") {
    console.log("    Executing Windows installer...");
    execSync(`"${installerPath}" /S /D=${sys.installDir}`, {
      stdio: "inherit",
    });
  }

  console.log("    ✔ Tizen Studio base CLI installed successfully!");
}

function installTvExtensions(sys) {
  console.log("\n==> [5/6] Installing Samsung Smart TV Extensions...");

  const pkgManager =
    sys.platform === "win32"
      ? path.join(sys.installDir, "package-manager", "package-manager-cli.exe")
      : path.join(sys.installDir, "package-manager", "package-manager-cli.bin");

  if (!fs.existsSync(pkgManager)) {
    console.warn(`    ⚠️ Package manager CLI not found at ${pkgManager}`);
    return;
  }

  try {
    console.log("    Querying available packages...");
    const pkgsToInstall = [
      "TV-Extension-6.5",
      "TV-Extension-tools",
      "Samsung-Certificate-Extension",
    ];

    for (const pkg of pkgsToInstall) {
      console.log(`    Installing package: ${pkg}...`);
      try {
        execSync(`"${pkgManager}" install ${pkg} --accept-license`, {
          stdio: "inherit",
        });
      } catch (err) {
        console.warn(`    Note: Package ${pkg} install completed or not available in this mirror.`);
      }
    }
  } catch (err) {
    console.warn("    Could not auto-install TV extensions:", err);
  }
}

function configurePath(sys) {
  console.log("\n==> [6/6] Configuring Environment PATH...");

  const toolsBin = path.join(sys.installDir, "tools", "ide", "bin");
  const tools = path.join(sys.installDir, "tools");

  if (sys.platform === "linux" || sys.platform === "darwin") {
    const bashrc = path.join(os.homedir(), ".bashrc");
    const exportLine = `export PATH="$PATH:${toolsBin}:${tools}"`;

    if (fs.existsSync(bashrc)) {
      const content = fs.readFileSync(bashrc, "utf-8");
      if (!content.includes(toolsBin)) {
        fs.appendFileSync(bashrc, `\n# Samsung Tizen Studio CLI\n${exportLine}\n`);
        console.log(`    ✔ Added Tizen tools to ~/.bashrc`);
        console.log(`    Run 'source ~/.bashrc' or restart your terminal to activate.`);
      } else {
        console.log(`    ✔ PATH already configured in ~/.bashrc`);
      }
    }
  } else if (sys.platform === "win32") {
    console.log(`    On Windows, add the following to your PATH:`);
    console.log(`    ${toolsBin};${tools}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 Tizen Development Setup Complete!");
  console.log("   Tools installed:");
  console.log(`   - tizen : ${path.join(toolsBin, "tizen")}`);
  console.log(`   - sdb   : ${path.join(tools, "sdb")}`);
  console.log("=======================================================\n");
}

async function main() {
  try {
    const sys = detectSystem();
    checkPrerequisites(sys);

    const tempDir = path.join(os.tmpdir(), "tizen-setup");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const installerPath = path.join(tempDir, sys.installerName);
    console.log("\n==> [3/6] Fetching Tizen CLI Installer...");
    await downloadFile(sys.downloadUrl, installerPath);

    installTizenStudio(sys, installerPath);
    installTvExtensions(sys);
    configurePath(sys);
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

main();
