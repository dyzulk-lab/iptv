/** Hook to load channels from playlists.json config with multi-playlist switcher support */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Channel, ChannelGroup } from '@/types/iptv';
import { ADULT_BLACKLIST } from '@/types/iptv';
import { parseM3U } from '@/lib/iptv/m3u-parser';

export interface PlaylistOption {
  name: string;
  url?: string;
  enabled: boolean;
  isDefault?: boolean;
}

interface UseM3uLoaderResult {
  channels: Channel[];
  groups: ChannelGroup[];
  isLoading: boolean;
  error: string | null;
  playlistName: string;
  playlists: PlaylistOption[];
  selectPlaylist: (name: string) => Promise<void>;
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
  const [playlistName, setPlaylistName] = useState<string>('Test Streams');
  const [playlists, setPlaylists] = useState<PlaylistOption[]>([]);
  const playlistsRef = useRef<PlaylistOption[]>([]);

  /** Load default test channels from public/default-channels.json */
  const loadDefaultChannels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('./default-channels.json');
      const data = await res.json();
      const safe = filterSafe(data.channels as Channel[]);
      setChannels(safe);
      setGroups(groupChannels(safe));
      setPlaylistName('Test Streams');
    } catch (err) {
      console.error('[tv-ku] Failed to load default channels:', err);
      setError('Failed to load default channels');
      toast.error('Failed to load default test channels');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Load M3U channels from a given URL */
  const loadM3uUrl = useCallback(async (name: string, url: string) => {
    setIsLoading(true);
    setError(null);
    setPlaylistName(name);
    try {
      console.log(`[tv-ku] Loading playlist "${name}" from ${url}...`);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      const parsed = parseM3U(text);
      const safe = filterSafe(parsed);
      setChannels(safe);
      setGroups(groupChannels(safe));
      console.log(`[tv-ku] Loaded ${safe.length} safe channels for "${name}".`);
      toast.success(`Playlist "${name}" loaded`, {
        description: `${safe.length} channels found`,
      });
    } catch (err) {
      console.error(`[tv-ku] Error loading playlist "${name}":`, err);
      setError(`Failed to load playlist: ${String(err)}`);
      toast.error(`Failed to load playlist "${name}"`, {
        description: 'Check connection or CORS policy. Loaded Test Streams.',
      });
      // Fallback to default
      await loadDefaultChannels();
    } finally {
      setIsLoading(false);
    }
  }, [loadDefaultChannels]);

  /** Switch active playlist */
  const selectPlaylist = useCallback(async (name: string) => {
    const target = playlistsRef.current.find((p) => p.name === name);
    if (!target || target.isDefault || !target.url) {
      await loadDefaultChannels();
      return;
    }
    await loadM3uUrl(target.name, target.url);
  }, [loadDefaultChannels, loadM3uUrl]);

  // Initial load
  useEffect(() => {
    (async () => {
      let available: PlaylistOption[] = [];
      const defaultOption: PlaylistOption = {
        name: 'Test Streams',
        enabled: true,
        isDefault: true,
      };

      try {
        const configRes = await fetch('./playlists.json');
        if (configRes.ok) {
          const config = await configRes.json();
          const list: PlaylistOption[] = (config.playlists || []).map((p: any) => ({
            name: p.name,
            url: p.url,
            enabled: Boolean(p.enabled),
          }));
          available = list;
        }
      } catch (err) {
        console.warn('[tv-ku] Could not read playlists.json:', err);
      }

      // Always append Test Streams as fallback option
      const fullList = [...available, defaultOption];
      playlistsRef.current = fullList;
      setPlaylists(fullList);

      // Determine starting playlist
      const firstActive = available.find((p) => p.enabled);
      if (firstActive && firstActive.url) {
        await loadM3uUrl(firstActive.name, firstActive.url);
      } else {
        await loadDefaultChannels();
      }
    })();
  }, [loadDefaultChannels, loadM3uUrl]);

  return {
    channels,
    groups,
    isLoading,
    error,
    playlistName,
    playlists,
    selectPlaylist,
  };
}
