/** Scrollable channel grid filtered by active group */

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelCard } from "@/components/channels/channel-card";
import type { Channel } from "@/types/iptv";

interface ChannelGridProps {
  channels: Channel[];
  activeChannel: Channel | null;
  focusIndex: number;
  isLoading: boolean;
  onSelectChannel: (channel: Channel) => void;
}

export function ChannelGrid({
  channels,
  activeChannel,
  focusIndex,
  isLoading,
  onSelectChannel,
}: ChannelGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 p-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-base text-muted-foreground">No channels found</p>
        <p className="text-sm text-muted-foreground/60">Try selecting a different category</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="grid grid-cols-3 gap-2 p-5">
        {channels.map((ch, i) => (
          <ChannelCard
            key={ch.id}
            channel={ch}
            isActive={activeChannel?.id === ch.id}
            isFocused={focusIndex === i}
            onSelect={onSelectChannel}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
