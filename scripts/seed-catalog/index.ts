/**
 * IPTV Catalog Seeder CLI
 * Single responsibility: orchestrate multi-source fetching, sanitization,
 * indexing, deduplication, and writing public/channels-catalog.json.
 * 
 * Run with: npm run seed:catalog
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeCategory } from './lib/sanitizer.js';
import { fetchPlaylistChannels } from './lib/fetcher.js';
import { isAdultContent } from './lib/parser.js';
import type {
  RawChannel,
  ChannelItem,
  ChannelGroup,
  CatalogOutput,
  PlaylistConfigItem,
} from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const publicDir = path.resolve(rootDir, 'public');
const playlistsConfigPath = path.resolve(publicDir, 'playlists.json');
const defaultChannelsPath = path.resolve(publicDir, 'default-channels.json');
const catalogOutputPath = path.resolve(publicDir, 'channels-catalog.json');

const SMART_PRIORITY = [
  'indonesia',
  'national',
  'news',
  'berita',
  'entertainment',
  'hiburan',
  'movies',
  'cinema',
  'sports',
  'olahraga',
  'kids',
  'music',
  'religious',
  'religi',
];

async function main() {
  console.log('🚀 [IPTV Seeder] Starting catalog seeder tool...');

  const collected: RawChannel[] = [];
  const seenUrls = new Set<string>();

  // 1. Load default channels (Test Streams)
  if (fs.existsSync(defaultChannelsPath)) {
    try {
      const defaultData = JSON.parse(fs.readFileSync(defaultChannelsPath, 'utf-8'));
      const list: RawChannel[] = defaultData.channels || [];
      for (const ch of list) {
        if (!seenUrls.has(ch.url) && !isAdultContent(`${ch.name} ${ch.group}`)) {
          seenUrls.add(ch.url);
          collected.push(ch);
        }
      }
      console.log(`✔ Loaded ${list.length} channels from default-channels.json`);
    } catch (err) {
      console.warn('⚠️  Could not read default-channels.json:', err);
    }
  }

  // 2. Fetch remote playlists
  if (fs.existsSync(playlistsConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(playlistsConfigPath, 'utf-8'));
      const playlists: PlaylistConfigItem[] = config.playlists || [];

      for (const pl of playlists) {
        if (!pl.enabled) {
          console.log(`⏩ Skipping disabled playlist: "${pl.name}"`);
          continue;
        }

        const channels = await fetchPlaylistChannels(pl);
        let addedCount = 0;
        for (const ch of channels) {
          if (!seenUrls.has(ch.url)) {
            seenUrls.add(ch.url);
            collected.push(ch);
            addedCount++;
          }
        }
        console.log(`   + Added ${addedCount} unique channels from "${pl.name}".`);
      }
    } catch (err) {
      console.error('Failed to read playlists.json:', err);
    }
  }

  console.log(`\n📊 Total raw unique channels gathered: ${collected.length}`);

  // 3. Normalize categories and assign index numbers
  const groupMap = new Map<string, ChannelItem[]>();

  const numberedChannels: ChannelItem[] = collected.map((ch, idx) => {
    const cleanGroup = sanitizeCategory(ch.group);
    const item: ChannelItem = {
      ...ch,
      number: idx + 1,
      group: cleanGroup,
    };

    const list = groupMap.get(cleanGroup) || [];
    list.push(item);
    groupMap.set(cleanGroup, list);

    return item;
  });

  // 4. Form sorted groups (Smart priority with 'Undefined' at the bottom)
  const sortedGroups: ChannelGroup[] = Array.from(groupMap, ([name, channels]) => ({
    name,
    count: channels.length,
    channels,
  })).sort((a, b) => {
    const aUndef = a.name.toLowerCase() === 'undefined';
    const bUndef = b.name.toLowerCase() === 'undefined';
    if (aUndef && !bUndef) return 1;
    if (!aUndef && bUndef) return -1;
    if (aUndef && bUndef) return 0;

    const idxA = SMART_PRIORITY.findIndex((k) => a.name.toLowerCase().includes(k));
    const idxB = SMART_PRIORITY.findIndex((k) => b.name.toLowerCase().includes(k));
    const weightA = idxA !== -1 ? idxA : 500;
    const weightB = idxB !== -1 ? idxB : 500;

    if (weightA !== weightB) return weightA - weightB;
    return a.name.localeCompare(b.name);
  });

  const catalog: CatalogOutput = {
    updatedAt: new Date().toISOString(),
    totalChannels: numberedChannels.length,
    categories: sortedGroups,
  };

  // 5. Output JSON document
  fs.writeFileSync(catalogOutputPath, JSON.stringify(catalog, null, 2), 'utf-8');

  console.log(`\n🎉 Success! Catalog document created at:`);
  console.log(`   ${catalogOutputPath}`);
  console.log(`   Total Channels: ${catalog.totalChannels}`);
  console.log(`   Total Categories: ${catalog.categories.length}`);
  console.log('\nTop categories:');
  for (const cat of catalog.categories.slice(0, 10)) {
    console.log(`   - ${cat.name} (${cat.count} channels)`);
  }
}

main().catch((err) => {
  console.error('Fatal error in seed-catalog:', err);
  process.exit(1);
});
