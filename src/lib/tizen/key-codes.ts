/** Samsung Tizen TV remote control key code mappings */

export const TV_KEYS = {
  // D-Pad Navigation
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13,

  // Tizen-specific
  RETURN: 10009, // Back button on Samsung remote

  // Media Controls
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  FAST_FORWARD: 417,
  REWIND: 412,
  PLAY_PAUSE: 10252,

  // Channel Controls
  CHANNEL_UP: 427,
  CHANNEL_DOWN: 428,

  // Color Keys (Samsung OneRemote)
  COLOR_RED: 403,
  COLOR_GREEN: 404,
  COLOR_YELLOW: 405,
  COLOR_BLUE: 406,

  // Volume (usually handled by TV OS, but available)
  VOLUME_UP: 447,
  VOLUME_DOWN: 448,
  VOLUME_MUTE: 449,

  // Number Keys (0-9)
  NUM_0: 48,
  NUM_1: 49,
  NUM_2: 50,
  NUM_3: 51,
  NUM_4: 52,
  NUM_5: 53,
  NUM_6: 54,
  NUM_7: 55,
  NUM_8: 56,
  NUM_9: 57,
} as const;

/** Keys that must be registered via tizen.tvinputdevice.registerKey() */
export const TIZEN_REGISTER_KEYS: string[] = [
  'MediaPlay',
  'MediaPause',
  'MediaStop',
  'MediaFastForward',
  'MediaRewind',
  'MediaPlayPause',
  'ChannelUp',
  'ChannelDown',
  'ColorF0Red',
  'ColorF1Green',
  'ColorF2Yellow',
  'ColorF3Blue',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

/** Check if the current runtime is Samsung Tizen TV */
export function isTizenTV(): boolean {
  return typeof window !== 'undefined' && 'tizen' in window;
}

/** Register TV-specific keys so Tizen OS doesn't capture them */
export function registerTizenKeys(): void {
  if (!isTizenTV()) return;

  try {
    const inputDevice = (window as any).tizen?.tvinputdevice;
    if (!inputDevice) return;

    for (const key of TIZEN_REGISTER_KEYS) {
      try {
        inputDevice.registerKey(key);
      } catch {
        // Key may already be registered or unsupported
      }
    }
  } catch {
    console.warn('[tv-ku] Failed to register Tizen TV keys');
  }
}
