/** M3U parser and adult content filter for IPTV Seeder */

import type { RawChannel } from '../types.js';

const ADULT_BLACKLIST = [
  'xxx',
  'adult',
  '18+',
  'porn',
  'erotic',
  'nsfw',
  'red-light',
  'playboy',
  'hustler',
  'penthouse',
  'brazzers',
  'bangbros',
];

export function isAdultContent(text: string): boolean {
  const lower = text.toLowerCase();
  return ADULT_BLACKLIST.some((kw) => lower.includes(kw));
}

function extractAttr(line: string, attr: string): string {
  const match = line.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
  return match ? match[1].trim() : '';
}

/**
 * Parse raw M3U playlist string into RawChannel array with adult filtering
 */
export function parseM3U(rawText: string, defaultGroup = 'Undefined'): RawChannel[] {
  const lines = rawText.split('\n').map((l) => l.trim());
  const channels: RawChannel[] = [];
  let currentMeta: Partial<RawChannel> | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const tvgId = extractAttr(line, 'tvg-id');
      const tvgName = extractAttr(line, 'tvg-name');
      const tvgLogo = extractAttr(line, 'tvg-logo');
      const groupTitle = extractAttr(line, 'group-title');

      const commaIdx = line.lastIndexOf(',');
      const name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : '';

      currentMeta = {
        tvgId,
        tvgName: tvgName || name,
        logo: tvgLogo,
        group: groupTitle || defaultGroup,
        name,
      };
    } else if (line && !line.startsWith('#') && currentMeta) {
      const name = currentMeta.name || `Channel ${channels.length + 1}`;
      const group = currentMeta.group || defaultGroup;

      if (!isAdultContent(`${name} ${group}`)) {
        channels.push({
          id: currentMeta.tvgId || `ch-${channels.length + 1}`,
          name,
          url: line,
          logo: currentMeta.logo || '',
          group,
          tvgId: currentMeta.tvgId || '',
          tvgName: currentMeta.tvgName || '',
        });
      }
      currentMeta = null;
    }
  }

  return channels;
}
