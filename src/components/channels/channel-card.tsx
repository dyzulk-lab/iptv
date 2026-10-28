/** Channel card — TV-optimized tile with clear focus/active/playing states */

import { useRef, useEffect, useState, useMemo } from "react";
import { cn } from "cn";
import type { Channel } from "@/types/iptv";
import { getChannelLogoUrl, getFallbackChannelLogoUrl } from "@/lib/image-proxy";

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFocused: boolean;
  onSelect: (channel: Channel) => void;
}

export function ChannelCard({ channel, isActive, isFocused, onSelect }: ChannelCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const primaryLogo = useMemo(() => getChannelLogoUrl(channel.logo), [channel.logo]);
  const fallbackLogo = useMemo(() => getFallbackChannelLogoUrl(channel.logo), [channel.logo]);
  const [currentLogo, setCurrentLogo] = useState<string | undefined>(primaryLogo);
  const [hasFailed, setHasFailed] = useState(false);

  // Sync state if channel.logo prop changes
  useEffect(() => {
    setCurrentLogo(primaryLogo);
    setHasFailed(false);
  }, [primaryLogo]);

  const handleImageError = () => {
    // If Coolify primary fails and we have a wsrv.nl fallback, try fallback once
    if (fallbackLogo && currentLogo !== fallbackLogo) {
      setCurrentLogo(fallbackLogo);
    } else {
      // If fallback also fails or unavailable, show monogram
      setHasFailed(true);
    }
  };

  // Auto-scroll focused card into view for keyboard/remote navigation
  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isFocused]);

  const showImage = Boolean(currentLogo && !hasFailed);

  return (
    <button
      ref={ref}
      onClick={() => onSelect(channel)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(channel)}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-colors outline-none select-none",
        "bg-card text-card-foreground",
        /* Focused state: high-visibility TV outline */
        isFocused && "outline-2 outline-offset-2 outline-tv-focus bg-tv-surface-elevated",
        /* Active/playing state: subtle primary accent */
        isActive && "bg-primary/10 ring-1 ring-primary/30",
        /* Default hover for mouse fallback */
        !isFocused && !isActive && "hover:bg-tv-surface-elevated"
      )}
    >
      {/* Channel logo */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {showImage ? (
          <img
            src={currentLogo}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
            onError={handleImageError}
          />
        ) : null}
        <span
          className={cn(
            "text-xs font-semibold text-muted-foreground",
            showImage && "hidden"
          )}
        >
          {channel.name.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Channel info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {channel.number && (
            <span className="shrink-0 font-mono text-[10px] font-semibold text-primary/90 bg-primary/10 px-1 py-0.5 rounded leading-none">
              #{String(channel.number).padStart(3, '0')}
            </span>
          )}
          <p className="truncate text-sm font-medium leading-snug">{channel.name}</p>
        </div>
        <p className="truncate text-xs text-muted-foreground mt-0.5">{channel.group || "Undefined"}</p>
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
