/** Full-screen video canvas — uses avplay on Tizen TV, hls.js <video> in browser */

import { Loader2, PlayCircle } from "lucide-react";
import type { PlayerStatus } from "@/types/player";

interface VideoStageProps {
  status: PlayerStatus;
  channelName: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function VideoStage({ status, channelName, videoRef }: VideoStageProps) {
  const isIdle = status === "idle";
  const isLoading = status === "loading" || status === "buffering";

  return (
    <div className="relative h-full w-full bg-black rounded-xl overflow-hidden">
      {/* HTML5 video element (used by hls.js in browser mode) */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        autoPlay
        playsInline
        muted={false}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading {channelName || "stream"}...
          </p>
        </div>
      )}

      {/* Idle state — no stream selected */}
      {isIdle && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <PlayCircle className="h-14 w-14 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Select a channel to start watching
          </p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <p className="text-sm text-destructive font-medium">
            Playback error — try another channel
          </p>
        </div>
      )}
    </div>
  );
}
