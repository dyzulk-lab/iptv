/** Type definitions for IPTV Catalog Seeder */

export interface RawChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
}

export interface ChannelItem extends RawChannel {
  number: number;
  group: string;
  /** All atomic categories this channel belongs to (many-to-many) */
  categories: string[];
}

export interface ChannelGroup {
  name: string;
  count: number;
  channels: ChannelItem[];
}

export interface CatalogOutput {
  updatedAt: string;
  totalChannels: number;
  categories: ChannelGroup[];
}

export interface PlaylistConfigItem {
  name: string;
  url?: string;
  enabled?: boolean;
}
