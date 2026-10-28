/** Hook to load channels from channels-catalog.json or playlists.json with sorting & indexing */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Channel, ChannelGroup, CategorySortMode, ChannelsCatalog } from '@/types/iptv';
import { ADULT_BLACKLIST } from '@/types/iptv';
import { parseM3U } from '@/lib/iptv/m3u-parser';
import { buildIndexedCatalog, sortChannelGroups } from '@/lib/iptv/category-indexer';

export interface PlaylistOption {
  name: string;
  url?: string;
  enabled: boolean;
  isDefault?: boolean;
  isCatalog?: boolean;
}

interface UseM3uLoaderResult {
  channels: Channel[];
  groups: ChannelGroup[];
  isLoading: boolean;
  error: string | null;
  playlistName: string;
  playlists: PlaylistOption[];
  sortMode: CategorySortMode;
  setSortMode: (mode: CategorySortMode) => void;
  selectPlaylist: (name: string) => Promise<void>;
  reload: () => Promise<void>;
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
  const [playlistName, setPlaylistName] = useState<string>('Catalog Index');
  const [playlists, setPlaylists] = useState<PlaylistOption[]>([]);
  const [sortMode, setSortModeState] = useState<CategorySortMode>('index');
  const playlistsRef = useRef<PlaylistOption[]>([]);
  const rawChannelsRef = useRef<Channel[]>([]);

  // Update sorted groups when sortMode changes
  const setSortMode = useCallback((newMode: CategorySortMode) => {
    setSortModeState(newMode);
    setGroups((prevGroups) => sortChannelGroups(prevGroups, newMode));
  }, []);

  /** Load pre-indexed catalog from public/channels-catalog.json */
  const loadCatalog = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('./channels-catalog.json');
      if (!res.ok) return false;
      const data: ChannelsCatalog = await res.json();
      if (!data || !Array.isArray(data.categories) || data.categories.length === 0) {
        return false;
      }

      // Flatten channels from categories or construct flat list
      const allChannels: Channel[] = [];
      for (const cat of data.categories) {
        if (Array.isArray(cat.channels)) {
          allChannels.push(...cat.channels);
        }
      }

      const safe = filterSafe(allChannels);
      rawChannelsRef.current = safe;
      setChannels(safe);
      setGroups(sortChannelGroups(data.categories, sortMode));
      setPlaylistName('Catalog Index');
      return true;
    } catch (err) {
      console.warn('[tv-ku] Could not load channels-catalog.json:', err);
      return false;
    }
  }, [sortMode]);

  /** Load default test channels from public/default-channels.json */
  const loadDefaultChannels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('./default-channels.json');
      const data = await res.json();
      const safe = filterSafe(data.channels as Channel[]);
      const indexed = buildIndexedCatalog(safe, sortMode);
      rawChannelsRef.current = indexed.channels;
      setChannels(indexed.channels);
      setGroups(indexed.groups);
      setPlaylistName('Test Streams');
    } catch (err) {
      console.error('[tv-ku] Failed to load default channels:', err);
      setError('Failed to load default channels');
      toast.error('Failed to load default test channels');
    } finally {
      setIsLoading(false);
    }
  }, [sortMode]);

  /** Load M3U channels from a given URL */
  const loadM3uUrl = useCallback(
    async (name: string, url: string) => {
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
        const indexed = buildIndexedCatalog(safe, sortMode);

        rawChannelsRef.current = indexed.channels;
        setChannels(indexed.channels);
        setGroups(indexed.groups);

        console.log(`[tv-ku] Loaded ${indexed.channels.length} safe channels for "${name}".`);
        toast.success(`Playlist "${name}" loaded`, {
          description: `${indexed.channels.length} channels indexed`,
        });
      } catch (err) {
        console.error(`[tv-ku] Error loading playlist "${name}":`, err);
        setError(`Failed to load playlist: ${String(err)}`);
        toast.error(`Failed to load playlist "${name}"`, {
          description: 'Loaded default channels as fallback.',
        });
        await loadDefaultChannels();
      } finally {
        setIsLoading(false);
      }
    },
    [loadDefaultChannels, sortMode]
  );

  /** Switch active playlist */
  const selectPlaylist = useCallback(
    async (name: string) => {
      setIsLoading(true);
      if (name === 'Catalog Index') {
        const ok = await loadCatalog();
        if (ok) {
          setIsLoading(false);
          return;
        }
      }

      const target = playlistsRef.current.find((p) => p.name === name);
      if (!target || target.isDefault || !target.url) {
        await loadDefaultChannels();
        return;
      }
      await loadM3uUrl(target.name, target.url);
    },
    [loadCatalog, loadDefaultChannels, loadM3uUrl]
  );

  // Initial load
  const init = useCallback(async () => {
    setIsLoading(true);
    let available: PlaylistOption[] = [];
    const catalogOption: PlaylistOption = {
      name: 'Catalog Index',
      enabled: true,
      isCatalog: true,
    };
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

    const fullList = [catalogOption, ...available, defaultOption];
    playlistsRef.current = fullList;
    setPlaylists(fullList);

    // Try loading pre-built channels-catalog.json first
    const catalogLoaded = await loadCatalog();
    if (!catalogLoaded) {
      // Fallback to first active playlist or default channels
      const firstActive = available.find((p) => p.enabled);
      if (firstActive && firstActive.url) {
        await loadM3uUrl(firstActive.name, firstActive.url);
      } else {
        await loadDefaultChannels();
      }
    }
    setIsLoading(false);
  }, [loadCatalog, loadDefaultChannels, loadM3uUrl]);

  useEffect(() => {
    init();
  }, [init]);

  return {
    channels,
    groups,
    isLoading,
    error,
    playlistName,
    playlists,
    sortMode,
    setSortMode,
    selectPlaylist,
    reload: init,
  };
}
