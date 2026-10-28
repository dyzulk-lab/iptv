/** Channel card — TV-optimized tile with auto-scroll on focus */

import { useRef, useEffect } from "react";
import { cn } from "cn";
import type { Channel } from "@/types/iptv";

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFocused: boolean;
  onSelect: (channel: Channel) => void;
}

export function ChannelCard({ channel, isActive, isFocused, onSelect }: ChannelCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Auto-scroll focused card into view for keyboard/remote navigation
  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isFocused]);

  return (
    <button
      ref={ref}
      onClick={() => onSelect(channel)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(channel)}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-colors outline-none select-none",
        "bg-card text-card-foreground",
        isFocused && "outline-2 outline-offset-2 outline-tv-focus bg-tv-surface-elevated",
        isActive && "bg-primary/10 ring-1 ring-primary/30",
        !isFocused && !isActive && "hover:bg-tv-surface-elevated"
      )}
    >
      {/* Channel logo */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const next = (e.target as HTMLImageElement).nextElementSibling;
              if (next) (next as HTMLElement).classList.remove("hidden");
            }}
          />
        ) : null}
        <span
          className={cn(
            "text-xs font-semibold text-muted-foreground",
            channel.logo && "hidden"
          )}
        >
          {channel.name.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Channel info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{channel.name}</p>
        <p className="truncate text-xs text-muted-foreground">{channel.group}</p>
      </div>

      {/* Playing indicator */}
      {isActive && (
        <span className="shrink-0 rounded-sm bg-tv-live/15 px-1.5 py-0.5 text-[11px] font-semibold text-tv-live">
          LIVE
        </span>
      )}
    </button>
  );
}
