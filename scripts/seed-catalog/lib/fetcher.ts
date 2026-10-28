/** Multi-source playlist fetcher for IPTV Seeder */

import { parseM3U } from './parser.js';
import type { RawChannel, PlaylistConfigItem } from '../types.js';

export async function fetchPlaylistChannels(
  playlist: PlaylistConfigItem,
  timeoutMs = 15000
): Promise<RawChannel[]> {
  if (!playlist.enabled || !playlist.url) {
    return [];
  }

  console.log(`🌐 Fetching playlist "${playlist.name}" from ${playlist.url}...`);
  try {
    const res = await fetch(playlist.url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      console.warn(`   HTTP ${res.status} when fetching "${playlist.name}"`);
      return [];
    }
    const text = await res.text();
    const channels = parseM3U(text, playlist.name);
    console.log(`✔ Found ${channels.length} channels in "${playlist.name}".`);
    return channels;
  } catch (err) {
    console.warn(`⚠️  Failed to fetch "${playlist.name}":`, (err as Error).message);
    return [];
  }
}
