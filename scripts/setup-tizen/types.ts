/** System and setup type definitions for Tizen CLI installer */

export interface SystemInfo {
  platform: 'linux' | 'win32' | 'darwin';
  arch: string;
  distro: string;
  installDir: string;
  installerName: string;
  downloadUrl: string;
}
