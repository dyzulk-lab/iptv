/** M3U / M3U8 playlist parser with built-in adult content filter */

import type { Channel } from "@/types/iptv";
import { ADULT_BLACKLIST } from "@/types/iptv";

/** Check if a channel name or group contains blacklisted keywords */
function isAdultContent(name: string, group: string): boolean {
  const combined = `${name} ${group}`.toLowerCase();
  return ADULT_BLACKLIST.some((keyword) => combined.includes(keyword));
}

/** Parse raw M3U text content into a filtered array of safe channels */
export function parseM3U(raw: string): Channel[] {
  const lines = raw.split("\n").map((l) => l.trim());
  const channels: Channel[] = [];
  let currentMeta: Partial<Channel> | null = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      currentMeta = extractMeta(line);
    } else if (line && !line.startsWith("#") && currentMeta) {
      const channel: Channel = {
        id: currentMeta.tvgId || `ch-${channels.length}`,
        name: currentMeta.name || `Channel ${channels.length + 1}`,
        url: line,
        logo: currentMeta.logo || "",
        group: currentMeta.group || "Uncategorized",
        tvgId: currentMeta.tvgId || "",
        tvgName: currentMeta.tvgName || "",
      };

      // Safe content filter: drop adult channels
      if (!isAdultContent(channel.name, channel.group)) {
        channels.push(channel);
      }

      currentMeta = null;
    }
  }

  return channels;
}

/** Extract metadata from an #EXTINF line */
function extractMeta(line: string): Partial<Channel> {
  const tvgId = extractAttr(line, "tvg-id");
  const tvgName = extractAttr(line, "tvg-name");
  const tvgLogo = extractAttr(line, "tvg-logo");
  const groupTitle = extractAttr(line, "group-title");

  // Channel display name is after the last comma
  const commaIdx = line.lastIndexOf(",");
  const name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : "";

  return {
    tvgId: tvgId || "",
    tvgName: tvgName || name,
    logo: tvgLogo || "",
    group: groupTitle || "Uncategorized",
    name,
  };
}

/** Extract a quoted attribute value from an EXTINF tag */
function extractAttr(line: string, attr: string): string {
  const regex = new RegExp(`${attr}="([^"]*)"`, "i");
  const match = line.match(regex);
  return match ? match[1] : "";
}
