/** Hook to load channels from default JSON or external M3U URL */

import { useState, useEffect, useCallback } from 'react';
import type { Channel, ChannelGroup } from '@/types/iptv';
import { ADULT_BLACKLIST } from '@/types/iptv';
import { parseM3U } from '@/lib/iptv/m3u-parser';

interface UseM3uLoaderResult {
  channels: Channel[];
  groups: ChannelGroup[];
  isLoading: boolean;
  error: string | null;
  loadFromUrl: (url: string) => Promise<void>;
}

/** Filter and group channels by their group field */
function groupChannels(channels: Channel[]): ChannelGroup[] {
  const map = new Map<string, Channel[]>();
  for (const ch of channels) {
    const list = map.get(ch.group) || [];
    list.push(ch);
    map.set(ch.group, list);
  }
  return Array.from(map, ([name, chs]) => ({ name, channels: chs }));
}

/** Ensure safe content on JSON-loaded channels too */
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

  // Load default curated channels on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('./default-channels.json');
        const data = await res.json();
        const safe = filterSafe(data.channels as Channel[]);
        setChannels(safe);
        setGroups(groupChannels(safe));
      } catch (err) {
        setError('Failed to load default channels');
        console.error('[tv-ku] Default channels load error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Load channels from an external M3U URL
  const loadFromUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const text = await res.text();
      const parsed = parseM3U(text); // Already filtered for adult content
      setChannels(parsed);
      setGroups(groupChannels(parsed));
    } catch (err) {
      setError('Failed to load playlist from URL');
      console.error('[tv-ku] M3U load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { channels, groups, isLoading, error, loadFromUrl };
}
