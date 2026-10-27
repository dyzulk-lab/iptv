/** Individual channel card with D-Pad focus ring and logo */

import { cn } from "cn";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Channel } from "@/types/iptv";

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFocused: boolean;
  onSelect: (channel: Channel) => void;
}

export function ChannelCard({ channel, isActive, isFocused, onSelect }: ChannelCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(channel)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(channel)}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-all outline-none select-none",
        "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:scale-[1.03]",
        isActive && "bg-primary/15 border-primary/40 shadow-md shadow-primary/10",
        isFocused && "ring-2 ring-primary scale-[1.03]"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-lg">
        <AvatarImage src={channel.logo} alt={channel.name} />
        <AvatarFallback className="rounded-lg bg-muted text-xs font-bold">
          {channel.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{channel.name}</p>
        <p className="truncate text-xs text-muted-foreground">{channel.group}</p>
      </div>

      {isActive && (
        <Badge className="shrink-0 bg-primary/20 text-primary text-[10px] px-1.5">
          LIVE
        </Badge>
      )}
    </Card>
  );
}
