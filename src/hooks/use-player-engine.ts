/** Hook for dual-engine video player (avplay on Tizen TV, hls.js in browser) */

import { useState, useCallback, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { isTizenTV } from '@/lib/tizen/key-codes';
import { avplayOpen, avplayPause, avplayResume, avplayStop } from '@/lib/tizen/avplay-engine';
import type { PlayerStatus } from '@/types/player';

interface UsePlayerEngineResult {
  status: PlayerStatus;
  play: (url: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function usePlayerEngine(): UsePlayerEngineResult {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Cleanup hls.js instance on unmount
  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
      avplayStop();
    };
  }, []);

  const play = useCallback((url: string) => {
    setStatus('loading');

    // Path 1: Samsung Tizen TV hardware decoder
    if (isTizenTV()) {
      const ok = avplayOpen(url, {
        onBufferingStart: () => setStatus('buffering'),
        onBufferingComplete: () => setStatus('playing'),
        onPlaybackComplete: () => setStatus('idle'),
        onError: (err) => {
          console.error('[tv-ku] AVPlay error:', err);
          setStatus('error');
        },
      });
      if (ok) return;
    }

    // Path 2: Browser fallback with hls.js
    const video = videoRef.current;
    if (!video) {
      setStatus('error');
      return;
    }

    hlsRef.current?.destroy();

    if (url.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30 });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setStatus('playing');
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setStatus('error');
      });
    } else {
      // Direct MP4 or native HLS (Safari)
      video.src = url;
      video.play().catch(() => {});
      video.onplaying = () => setStatus('playing');
      video.onerror = () => setStatus('error');
    }
  }, []);

  const pause = useCallback(() => {
    if (isTizenTV()) {
      avplayPause();
    } else {
      videoRef.current?.pause();
    }
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (isTizenTV()) {
      avplayResume();
    } else {
      videoRef.current?.play().catch(() => {});
    }
    setStatus('playing');
  }, []);

  const stop = useCallback(() => {
    if (isTizenTV()) {
      avplayStop();
    } else {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    }
    setStatus('idle');
  }, []);

  return { status, play, pause, resume, stop, videoRef };
}
