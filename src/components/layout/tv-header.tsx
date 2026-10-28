/** TV header bar — brand, playlist info, clock, and theme toggle */

import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface TvHeaderProps {
  playlistName?: string | null;
  channelCount?: number;
}

export function TvHeader({ playlistName, channelCount }: TvHeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-border bg-background px-8 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <img
          src="./logo.svg"
          alt="tv-ku"
          className="h-8 w-8 object-contain"
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            tv-ku
          </h1>
        </div>
      </div>

      {/* Center: active playlist info */}
      {playlistName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{playlistName}</span>
          {channelCount != null && channelCount > 0 && (
            <span className="tabular-nums">· {channelCount} channels</span>
          )}
        </div>
      )}

      {/* Right: status, clock, theme */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-tv-live">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Online</span>
        </div>

        <div className="font-heading text-xl font-semibold tabular-nums text-foreground tracking-wide">
          {time || "00:00"}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
