/** Category normalizer, sanitizer, and sorting engine for IPTV */

import type { Channel, ChannelGroup, CategorySortMode } from '@/types/iptv';

/** Standard priority order for smart indexing */
const SMART_INDEX_PRIORITY: string[] = [
  'indonesia',
  'national',
  'news',
  'berita',
  'entertainment',
  'hiburan',
  'movies',
  'cinema',
  'film',
  'sports',
  'olahraga',
  'kids',
  'animasi',
  'anak',
  'documentary',
  'knowledge',
  'music',
  'musik',
  'religious',
  'religi',
  'islamic',
];

/** Clean and sanitize raw category string */
export function sanitizeCategory(rawGroup?: string | null): string {
  if (!rawGroup || typeof rawGroup !== 'string') {
    return 'Undefined';
  }

  let cleaned = rawGroup.trim();

  // Replace semicolons with ' & '
  cleaned = cleaned.replace(/;+/g, ' & ');

  // Remove common tag brackets like [ID], (FHD), [4K], [HEVC], etc.
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\([^\)]*\)/g, ' ');

  // Remove common prefix noise like "ID | ", "ID: ", "US - ", "---", "***"
  cleaned = cleaned.replace(/^[a-zA-Z0-9]{2,4}\s*[:|\-•/]\s*/i, '');
  cleaned = cleaned.replace(/^[\W_]+/g, '');
  cleaned = cleaned.replace(/[\W_]+$/g, '');

  // Collapse multiple whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // If empty or known generic placeholders, set to 'Undefined'
  if (
    !cleaned ||
    cleaned.toLowerCase() === 'uncategorized' ||
    cleaned.toLowerCase() === 'undefined' ||
    cleaned.toLowerCase() === 'none' ||
    cleaned.toLowerCase() === 'unknown'
  ) {
    return 'Undefined';
  }

  // Normalize to Title Case
  return cleaned
    .split(' ')
    .map((word) => {
      if (word === '&') return '&';
      if (word.length <= 1) return word.toUpperCase();
      // Keep acronyms like HBO, BBC, CNN, TVRI in uppercase
      if (word === word.toUpperCase() && word.length <= 4) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/** Get smart sort weight for category priority */
function getSmartIndexWeight(categoryName: string): number {
  const lower = categoryName.toLowerCase();
  if (lower === 'undefined') return 9999; // Always at the very end

  const idx = SMART_INDEX_PRIORITY.findIndex((priority) => lower.includes(priority));
  return idx !== -1 ? idx : 500;
}

/** Sort channel groups according to mode */
export function sortChannelGroups(
  groups: ChannelGroup[],
  mode: CategorySortMode = 'index'
): ChannelGroup[] {
  return [...groups].sort((a, b) => {
    const isAUndefined = a.name.toLowerCase() === 'undefined';
    const isBUndefined = b.name.toLowerCase() === 'undefined';

    // 'Undefined' always stays at the very bottom regardless of mode
    if (isAUndefined && !isBUndefined) return 1;
    if (!isAUndefined && isBUndefined) return -1;
    if (isAUndefined && isBUndefined) return 0;

    switch (mode) {
      case 'count':
        // Most channels first, then alphabetical fallback
        return b.channels.length - a.channels.length || a.name.localeCompare(b.name);

      case 'az':
        // Alphabetical A-Z
        return a.name.localeCompare(b.name);

      case 'index':
      default: {
        const weightA = getSmartIndexWeight(a.name);
        const weightB = getSmartIndexWeight(b.name);
        if (weightA !== weightB) {
          return weightA - weightB;
        }
        return a.name.localeCompare(b.name);
      }
    }
  });
}

/** Build organized, numbered, and sorted channel catalog */
export function buildIndexedCatalog(
  rawChannels: Channel[],
  sortMode: CategorySortMode = 'index'
): { channels: Channel[]; groups: ChannelGroup[] } {
  const map = new Map<string, Channel[]>();

  // 1. Sanitize groups and number channels sequentially
  const indexedChannels: Channel[] = rawChannels.map((ch, idx) => {
    const cleanGroup = sanitizeCategory(ch.group);
    const numberedChannel: Channel = {
      ...ch,
      number: ch.number || idx + 1,
      group: cleanGroup,
    };

    const list = map.get(cleanGroup) || [];
    list.push(numberedChannel);
    map.set(cleanGroup, list);

    return numberedChannel;
  });

  // 2. Form groups
  const rawGroups: ChannelGroup[] = Array.from(map, ([name, channels]) => ({
    name,
    channels,
  }));

  // 3. Sort groups based on sortMode
  const sortedGroups = sortChannelGroups(rawGroups, sortMode);

  return {
    channels: indexedChannels,
    groups: sortedGroups,
  };
}
