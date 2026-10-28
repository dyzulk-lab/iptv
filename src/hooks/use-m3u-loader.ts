/** Hook to load channels from playlists.json config or fallback to default-channels.json */

import { useState, useEffect, useCallback } from 'react';
import type { Channel, ChannelGroup } from '@/types/iptv';
import { ADULT_BLACKLIST } from '@/types/iptv';
import { parseM3U } from '@/lib/iptv/m3u-parser';

interface PlaylistEntry {
  name: string;
  url: string;
  enabled: boolean;
}

interface UseM3uLoaderResult {
  channels: Channel[];
  groups: ChannelGroup[];
  isLoading: boolean;
  error: string | null;
  playlistName: string | null;
  loadFromUrl: (url: string) => Promise<void>;
}

function groupChannels(channels: Channel[]): ChannelGroup[] {
  const map = new Map<string, Channel[]>();
  for (const ch of channels) {
    const list = map.get(ch.group) || [];
    list.push(ch);
    map.set(ch.group, list);
  }
  return Array.from(map, ([name, chs]) => ({ name, channels: chs }));
}

function filterSafe(channels: Channel[]): Channel[] {
  return channels.filter((ch) => {
    const combined = `${ch.name} ${ch.group}`.toLowerCase();
    return !ADULT_BLACKLIST.some((kw) => combined.includes(kw));
  });
}

export function useM3uLoader(): UseM3uLoaderResult {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<ChannelGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState<string | null>(null);

  /** Load and apply a list of channels */
  const applyChannels = useCallback((chs: Channel[], name: string | null) => {
    const safe = filterSafe(chs);
    setChannels(safe);
    setGroups(groupChannels(safe));
    setPlaylistName(name);
  }, []);

  /** Load channels from an external M3U URL */
  const loadFromUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const text = await res.text();
      const parsed = parseM3U(text);
      applyChannels(parsed, url);
    } catch (err) {
      setError('Failed to load playlist from URL');
      console.error('[tv-ku] M3U load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applyChannels]);

  // On mount: read playlists.json config, load first enabled playlist
  useEffect(() => {
    (async () => {
      try {
        // Try loading playlist config
        const configRes = await fetch('./playlists.json');
        if (configRes.ok) {
          const config = await configRes.json();
          const entries: PlaylistEntry[] = config.playlists || [];
          const active = entries.find((p) => p.enabled);

          if (active) {
            const res = await fetch(active.url);
            const text = await res.text();
            const parsed = parseM3U(text);
            applyChannels(parsed, active.name);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[tv-ku] playlists.json not found or invalid, using default channels:', err);
      }

      // Fallback: load default-channels.json
      try {
        const res = await fetch('./default-channels.json');
        const data = await res.json();
        applyChannels(data.channels as Channel[], 'Default');
      } catch (err) {
        setError('Failed to load channels');
        console.error('[tv-ku] Default channels load error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [applyChannels]);

  return { channels, groups, isLoading, error, playlistName, loadFromUrl };
}
