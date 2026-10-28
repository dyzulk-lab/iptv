/** TV sidebar — unified scrollable rail for playlists, category indexing & sorting */

import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, Tv, ArrowDownAZ, Hash, Layers } from "lucide-react";
import type { ChannelGroup, CategorySortMode } from "@/types/iptv";
import type { PlaylistOption } from "@/hooks/use-m3u-loader";

interface TvSidebarProps {
  playlists?: PlaylistOption[];
  activePlaylist?: string;
  onSelectPlaylist?: (name: string) => void;
  groups: ChannelGroup[];
  activeGroup: string | null;
  onSelectGroup: (name: string | null) => void;
  sortMode?: CategorySortMode;
  onSelectSortMode?: (mode: CategorySortMode) => void;
  focusedIndex?: number;
}

export function TvSidebar({
  playlists = [],
  activePlaylist,
  onSelectPlaylist,
  groups,
  activeGroup,
  onSelectGroup,
  sortMode = "index",
  onSelectSortMode,
  focusedIndex,
}: TvSidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar select-none h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="py-2">
          {/* 1. Playlists section */}
          {playlists.length > 0 && (
            <div className="pb-1">
              <div className="flex items-center justify-between px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                        "flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors text-left outline-none cursor-pointer",
                        "text-sidebar-foreground",
                        isPlActive
                          ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold"
                          : "hover:bg-sidebar-accent"
                      )}
                    >
                      <Tv className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate flex-1">{pl.name}</span>
                      {pl.isCatalog && (
                        <span className="text-[9px] uppercase font-bold text-primary bg-primary/15 px-1 py-0.2 rounded">
                          Catalog
                        </span>
                      )}
                      {pl.isDefault && (
                        <span className="text-[9px] uppercase font-semibold text-muted-foreground bg-muted px-1 py-0.2 rounded">
                          Demo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {playlists.length > 0 && <div className="mx-4 my-2 border-t border-border" />}

          {/* 2. Categories & Sort Options */}
          <div>
            <div className="px-4 pt-1 pb-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                <span>Categories</span>
                <span className="text-[10px] tabular-nums font-mono opacity-70">
                  ({groups.length})
                </span>
              </div>

              {/* Sorting mode toggle bar */}
              {onSelectSortMode && (
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/50 text-[10px]">
                  <button
                    onClick={() => onSelectSortMode("index")}
                    title="Smart Index Sort"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded transition-colors cursor-pointer",
                      sortMode === "index"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Layers className="h-3 w-3" />
                    <span>Index</span>
                  </button>
                  <button
                    onClick={() => onSelectSortMode("az")}
                    title="Alphabetical A-Z"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded transition-colors cursor-pointer",
                      sortMode === "az"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArrowDownAZ className="h-3 w-3" />
                    <span>A–Z</span>
                  </button>
                  <button
                    onClick={() => onSelectSortMode("count")}
                    title="Channel Count Sort"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded transition-colors cursor-pointer",
                      sortMode === "count"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Hash className="h-3 w-3" />
                    <span>Count</span>
                  </button>
                </div>
              )}
            </div>

            {/* All Channels option */}
            <button
              onClick={() => onSelectGroup(null)}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors text-left outline-none cursor-pointer",
                "text-sidebar-foreground",
                activeGroup === null
                  ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Radio className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">All Channels</span>
            </button>

            {/* Category list items */}
            <div className="py-0.5">
              {groups.map((group, i) => {
                const isUndefinedGroup = group.name.toLowerCase() === "undefined";
                const isGroupActive = activeGroup === group.name;

                return (
                  <button
                    key={group.name}
                    onClick={() => onSelectGroup(group.name)}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2 text-xs transition-colors text-left outline-none cursor-pointer",
                      "text-sidebar-foreground",
                      isGroupActive
                        ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold"
                        : "hover:bg-sidebar-accent",
                      focusedIndex === i &&
                        "outline-2 outline-offset-[-2px] outline-tv-focus bg-sidebar-accent"
                    )}
                  >
                    <span className={cn("min-w-0 flex-1 truncate", isUndefinedGroup && "italic opacity-80")}>
                      {group.name}
                    </span>
                    <span className="shrink-0 tabular-nums ml-2 font-mono text-[11px] text-muted-foreground">
                      {group.channels.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
