/** Hook for dual-engine video player (AVPlay on Samsung Tizen TV, hls.js in browser) */

import { useState, useCallback, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { toast } from 'sonner';
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
  const currentUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      avplayStop();
    };
  }, []);

  const playInBrowser = useCallback((url: string, video: HTMLVideoElement) => {
    console.log('[tv-ku] Starting browser playback for:', url);

    // Destroy existing hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reset video element
    video.pause();
    video.removeAttribute('src');
    video.load();

    const isHlsUrl = url.includes('.m3u8') || url.includes('/hls/') || url.includes('playlist');

    if (Hls.isSupported() && isHlsUrl) {
      console.log('[tv-ku] Initializing hls.js player engine');
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[tv-ku] HLS manifest parsed successfully. Attempting playback...');
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[tv-ku] Playback started');
              setStatus('playing');
            })
            .catch((err) => {
              console.warn('[tv-ku] Autoplay with sound blocked by browser, muting and retrying:', err);
              video.muted = true;
              video.play()
                .then(() => {
                  setStatus('playing');
                  toast.info('Audio muted due to browser autoplay policy, click video to unmute');
                })
                .catch((e) => {
                  console.error('[tv-ku] Autoplay failed even when muted:', e);
                  setStatus('error');
                });
            });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn('[tv-ku] HLS Event Error:', data.type, data.details, data);
        if (data.fatal) {
          console.error('[tv-ku] Fatal HLS error encountered:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error(
                '[tv-ku] Network error loading stream chunks. Reason:',
                data.details,
                '- Note: Desktop browser testing enforces CORS. On Samsung TV AVPlay this restriction is bypassed.'
              );
              toast.error('Stream failed to load (Network/CORS)', {
                description: 'The stream server may be offline or blocking browser CORS requests.',
              });
              setStatus('error');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[tv-ku] Recovering from fatal media error...');
              hls.recoverMediaError();
              break;
            default:
              toast.error('Playback failed', { description: data.details });
              setStatus('error');
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Native video support (Safari iOS/macOS or direct MP4/stream)
      console.log('[tv-ku] Loading via native HTML5 video element');
      video.src = url;
      video.load();

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setStatus('playing'))
          .catch((err) => {
            console.warn('[tv-ku] Native video autoplay blocked, muting:', err);
            video.muted = true;
            video.play()
              .then(() => setStatus('playing'))
              .catch(() => setStatus('error'));
          });
      }

      video.onplaying = () => {
        console.log('[tv-ku] Native video playing');
        setStatus('playing');
      };

      video.onerror = () => {
        const err = video.error;
        console.error('[tv-ku] Native video element error:', err);
        toast.error('Playback failed', {
          description: err ? `Error code ${err.code}: ${err.message}` : 'Unsupported stream format',
        });
        setStatus('error');
      };
    }
  }, []);

  const play = useCallback((url: string) => {
    currentUrlRef.current = url;
    setStatus('loading');
    console.log('[tv-ku] play() called with:', url);

    // Path 1: Samsung Tizen TV hardware decoder
    if (isTizenTV()) {
      console.log('[tv-ku] Running on Tizen TV, using AVPlay engine');
      const ok = avplayOpen(url, {
        onBufferingStart: () => setStatus('buffering'),
        onBufferingComplete: () => setStatus('playing'),
        onPlaybackComplete: () => setStatus('idle'),
        onError: (err) => {
          console.error('[tv-ku] AVPlay error:', err);
          toast.error('Stream unavailable', { description: String(err) });
          setStatus('error');
        },
      });
      if (ok) return;
    }

    // Path 2: Browser fallback with hls.js / HTML5 Video
    const video = videoRef.current;
    if (video) {
      playInBrowser(url, video);
    } else {
      // Wait for DOM to attach videoRef if not ready yet
      console.warn('[tv-ku] videoRef was null, waiting for next animation frame...');
      requestAnimationFrame(() => {
        const retryVideo = videoRef.current;
        if (retryVideo) {
          playInBrowser(url, retryVideo);
        } else {
          console.error('[tv-ku] Video element could not be found in DOM');
          setStatus('error');
          toast.error('Video player element not found');
        }
      });
    }
  }, [playInBrowser]);

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
    console.log('[tv-ku] stop() called');
    currentUrlRef.current = null;
    if (isTizenTV()) {
      avplayStop();
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    }
    setStatus('idle');
  }, []);

  return { status, play, pause, resume, stop, videoRef };
}
