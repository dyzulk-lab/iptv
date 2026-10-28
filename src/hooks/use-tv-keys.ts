import { useEffect, useCallback } from 'react';
import { TV_KEYS, registerTizenKeys } from '@/lib/tizen/key-codes';

type KeyHandler = (keyCode: number) => void;

interface UseTvKeysOptions {
  onUp?: KeyHandler;
  onDown?: KeyHandler;
  onLeft?: KeyHandler;
  onRight?: KeyHandler;
  onEnter?: KeyHandler;
  onReturn?: KeyHandler;
  onPlay?: KeyHandler;
  onPause?: KeyHandler;
  onChannelUp?: KeyHandler;
  onChannelDown?: KeyHandler;
}

/** Hook to listen for Samsung TV remote D-Pad, media keys, and browser fallback keys */
export function useTvKeys(handlers: UseTvKeysOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const code = e.keyCode;
      let handled = false;

      switch (code) {
        case TV_KEYS.UP:
          handlers.onUp?.(code);
          handled = true;
          break;
        case TV_KEYS.DOWN:
          handlers.onDown?.(code);
          handled = true;
          break;
        case TV_KEYS.LEFT:
          handlers.onLeft?.(code);
          handled = true;
          break;
        case TV_KEYS.RIGHT:
          handlers.onRight?.(code);
          handled = true;
          break;
        case TV_KEYS.ENTER:
          handlers.onEnter?.(code);
          handled = true;
          break;
        case TV_KEYS.RETURN:
        case 27: // Escape key in browser
        case 8:  // Backspace key in browser
          handlers.onReturn?.(code);
          handled = true;
          break;
        case TV_KEYS.PLAY:
        case TV_KEYS.PLAY_PAUSE:
          handlers.onPlay?.(code);
          handled = true;
          break;
        case TV_KEYS.PAUSE:
          handlers.onPause?.(code);
          handled = true;
          break;
        case TV_KEYS.CHANNEL_UP:
          handlers.onChannelUp?.(code);
          handled = true;
          break;
        case TV_KEYS.CHANNEL_DOWN:
          handlers.onChannelDown?.(code);
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [handlers],
  );

  useEffect(() => {
    registerTizenKeys();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
