/** TV sidebar — displays channel group categories */

import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Radio, Newspaper, FlaskConical, TestTube } from "lucide-react";
import type { ChannelGroup } from "@/types/iptv";

interface TvSidebarProps {
  groups: ChannelGroup[];
  activeGroup: string | null;
  onSelectGroup: (name: string | null) => void;
  focusedIndex?: number;
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "News": <Newspaper className="h-4 w-4" />,
  "Science & Space": <FlaskConical className="h-4 w-4" />,
  "Test Streams": <TestTube className="h-4 w-4" />,
};

export function TvSidebar({ groups, activeGroup, onSelectGroup, focusedIndex }: TvSidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-sm">
      {/* All Channels button */}
      <button
        onClick={() => onSelectGroup(null)}
        className={cn(
          "flex items-center gap-2.5 px-5 py-3.5 text-sm font-medium transition-all text-left",
          "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:scale-[1.02] outline-none",
          activeGroup === null && "bg-primary/10 text-primary border-r-2 border-primary"
        )}
      >
        <Radio className="h-4 w-4" />
        All Channels
      </button>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="py-1">
          {groups.map((group, i) => (
            <button
              key={group.name}
              onClick={() => onSelectGroup(group.name)}
              className={cn(
                "flex w-full items-center gap-2.5 px-5 py-3 text-sm transition-all text-left outline-none",
                "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:scale-[1.02]",
                activeGroup === group.name && "bg-primary/10 text-primary border-r-2 border-primary",
                focusedIndex === i && "ring-2 ring-primary scale-[1.02]"
              )}
            >
              {GROUP_ICONS[group.name] || <Radio className="h-4 w-4" />}
              <span className="truncate">{group.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {group.channels.length}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
