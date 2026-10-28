/** TV sidebar — channel group category rail with TV remote focus support */

import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio } from "lucide-react";
import type { ChannelGroup } from "@/types/iptv";

interface TvSidebarProps {
  groups: ChannelGroup[];
  activeGroup: string | null;
  onSelectGroup: (name: string | null) => void;
  focusedIndex?: number;
}

export function TvSidebar({ groups, activeGroup, onSelectGroup, focusedIndex }: TvSidebarProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* All Channels */}
      <button
        onClick={() => onSelectGroup(null)}
        className={cn(
          "flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left outline-none",
          "text-sidebar-foreground",
          activeGroup === null
            ? "bg-primary/10 text-primary border-r-2 border-primary"
            : "hover:bg-sidebar-accent"
        )}
      >
        <Radio className="h-4 w-4 shrink-0" />
        <span>All Channels</span>
      </button>

      <div className="mx-5 border-t border-border" />

      <ScrollArea className="flex-1">
        <div className="py-1">
          {groups.map((group, i) => (
            <button
              key={group.name}
              onClick={() => onSelectGroup(group.name)}
              className={cn(
                "flex w-full items-center gap-3 px-5 py-3 text-sm transition-colors text-left outline-none",
                "text-sidebar-foreground",
                activeGroup === group.name
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "hover:bg-sidebar-accent",
                focusedIndex === i && "outline-2 outline-offset-[-2px] outline-tv-focus bg-sidebar-accent"
              )}
            >
              <Radio className="h-4 w-4 shrink-0 opacity-60" />
              <span className="truncate flex-1">{group.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {group.channels.length}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
