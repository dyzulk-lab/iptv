/** Samsung Tizen webapis.avplay hardware-accelerated video engine wrapper */

import { isTizenTV } from '@/lib/tizen/key-codes';

export interface AvplayCallbacks {
  onBufferingStart?: () => void;
  onBufferingComplete?: () => void;
  onPlaybackComplete?: () => void;
  onError?: (error: string) => void;
  onCurrentPlayTime?: (timeMs: number) => void;
}

/** Open, prepare, and play a stream URL using Samsung hardware decoder */
export function avplayOpen(url: string, callbacks: AvplayCallbacks): boolean {
  if (!isTizenTV()) return false;

  const avplay = (window as any).webapis?.avplay;
  if (!avplay) return false;

  try {
    avplay.close();
  } catch {
    /* ignore if nothing was open */
  }

  try {
    avplay.open(url);
    avplay.setDisplayRect(0, 0, 1920, 1080);
    avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN');

    avplay.setListener({
      onbufferingstart: () => callbacks.onBufferingStart?.(),
      onbufferingcomplete: () => callbacks.onBufferingComplete?.(),
      oncurrentplaytime: (ms: number) => callbacks.onCurrentPlayTime?.(ms),
      onplaybackcomplete: () => callbacks.onPlaybackComplete?.(),
      onerror: (err: string) => callbacks.onError?.(err),
      onevent: () => {},
      onstreamcompleted: () => callbacks.onPlaybackComplete?.(),
      ondrmevent: () => {},
    });

    avplay.prepareAsync(
      () => avplay.play(),
      (err: string) => callbacks.onError?.(err),
    );

    return true;
  } catch (err) {
    callbacks.onError?.(String(err));
    return false;
  }
}

/** Pause the current avplay stream */
export function avplayPause(): void {
  if (!isTizenTV()) return;
  try {
    (window as any).webapis?.avplay?.pause();
  } catch {
    /* ignore */
  }
}

/** Resume the current avplay stream */
export function avplayResume(): void {
  if (!isTizenTV()) return;
  try {
    (window as any).webapis?.avplay?.play();
  } catch {
    /* ignore */
  }
}

/** Stop and close the current avplay stream */
export function avplayStop(): void {
  if (!isTizenTV()) return;
  try {
    const avplay = (window as any).webapis?.avplay;
    avplay?.stop();
    avplay?.close();
  } catch {
    /* ignore */
  }
}
