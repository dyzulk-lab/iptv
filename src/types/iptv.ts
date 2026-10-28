/** IPTV channel and playlist type definitions */

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  tvgId?: string;
  tvgName?: string;
}

export interface ChannelGroup {
  name: string;
  channels: Channel[];
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
