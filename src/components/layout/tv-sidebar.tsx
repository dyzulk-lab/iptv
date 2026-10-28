/** TV sidebar — unified scrollable rail for playlists and categories with TV remote focus support */

import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, Tv } from "lucide-react";
import type { ChannelGroup } from "@/types/iptv";
import type { PlaylistOption } from "@/hooks/use-m3u-loader";

interface TvSidebarProps {
  playlists?: PlaylistOption[];
  activePlaylist?: string;
  onSelectPlaylist?: (name: string) => void;
  groups: ChannelGroup[];
  activeGroup: string | null;
  onSelectGroup: (name: string | null) => void;
  focusedIndex?: number;
}

export function TvSidebar({
  playlists = [],
  activePlaylist,
  onSelectPlaylist,
  groups,
  activeGroup,
  onSelectGroup,
  focusedIndex,
}: TvSidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar select-none h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="py-2">
          {/* 1. Playlists section */}
          {playlists.length > 0 && (
            <div className="pb-1">
              <div className="flex items-center justify-between px-5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Playlists</span>
                <span className="text-[10px] tabular-nums font-mono opacity-70">
                  ({playlists.length})
                </span>
              </div>
              <div className="flex flex-col py-0.5">
                {playlists.map((pl) => {
                  const isPlActive = activePlaylist === pl.name;
                  return (
                    <button
                      key={pl.name}
                      onClick={() => onSelectPlaylist?.(pl.name)}
                      className={cn(
                        "flex w-full items-center gap-3 px-5 py-2 text-sm font-medium transition-colors text-left outline-none cursor-pointer",
                        "text-sidebar-foreground",
                        isPlActive
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "hover:bg-sidebar-accent"
                      )}
                    >
                      <Tv className="h-4 w-4 shrink-0 opacity-60" />
                      <span className="truncate flex-1">{pl.name}</span>
                      {pl.isDefault && (
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1 py-0.5 rounded">
                          Demo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {playlists.length > 0 && <div className="mx-5 my-2 border-t border-border" />}

          {/* 2. Categories section */}
          <div>
            <div className="flex items-center justify-between px-5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Categories</span>
              <span className="text-[10px] tabular-nums font-mono opacity-70">
                ({groups.length})
              </span>
            </div>

            {/* All Channels option */}
            <button
              onClick={() => onSelectGroup(null)}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors text-left outline-none cursor-pointer",
                "text-sidebar-foreground",
                activeGroup === null
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Radio className="h-4 w-4 shrink-0" />
              <span className="flex-1">All Channels</span>
            </button>

            {/* Category list items */}
            <div className="py-0.5">
              {groups.map((group, i) => (
                <button
                  key={group.name}
                  onClick={() => onSelectGroup(group.name)}
                  className={cn(
                    "flex w-full items-center justify-between px-5 py-2 text-sm transition-colors text-left outline-none cursor-pointer",
                    "text-sidebar-foreground",
                    activeGroup === group.name
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "hover:bg-sidebar-accent",
                    focusedIndex === i && "outline-2 outline-offset-[-2px] outline-tv-focus bg-sidebar-accent"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                    <Radio className="h-4 w-4 shrink-0 opacity-60" />
                    <span className="truncate">{group.name}</span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                    {group.channels.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
