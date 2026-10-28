/** IPTV channel and playlist type definitions */

export interface Channel {
  id: string;
  number?: number;
  name: string;
  url: string;
  logo?: string;
  group: string;
  /** All atomic categories this channel belongs to (many-to-many) */
  categories?: string[];
  tvgId?: string;
  tvgName?: string;
}

export type CategorySortMode = 'index' | 'az' | 'count';

export interface ChannelGroup {
  name: string;
  count?: number;
  channels: Channel[];
}

export interface ChannelsCatalog {
  updatedAt: string;
  totalChannels: number;
  categories: ChannelGroup[];
}

export interface Playlist {
  name: string;
  source: 'builtin' | 'url' | 'xtream';
  channels: Channel[];
  groups: ChannelGroup[];
  lastUpdated: number;
}

export type StreamFormat = 'hls' | 'mpegts' | 'mp4' | 'unknown';

/** Adult content blacklist keywords for safe filtering */
export const ADULT_BLACKLIST: string[] = [
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
