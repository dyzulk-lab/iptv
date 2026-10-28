/** Full-screen video stage — uses AVPlay on Tizen TV, hls.js <video> in browser */

import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type { PlayerStatus } from "@/types/player";

interface VideoStageProps {
  status: PlayerStatus;
  channelName: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function VideoStage({ status, channelName, videoRef }: VideoStageProps) {
  const isLoading = status === "loading" || status === "buffering";

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      {/* HTML5 video element (used by hls.js in browser mode) */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        autoPlay
        playsInline
        muted={false}
      />

      {/* OSD: Channel info bar — visible during playback */}
      {status === "playing" && channelName && (
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-6 py-4">
          <h2 className="font-heading text-xl font-semibold text-white">{channelName}</h2>
          <span className="rounded-sm bg-tv-live/20 px-1.5 py-0.5 text-xs font-semibold text-tv-live">
            LIVE
          </span>
        </div>
      )}

      {/* Return hint */}
      {(status === "playing" || status === "paused") && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-6 py-4 text-white/60">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Press Back to return to channels</span>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-white/60">
            Loading {channelName || "stream"}…
          </p>
        </div>
      )}

      {/* Idle state */}
      {status === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black">
          <p className="text-base text-white/40">Select a channel to start watching</p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Playback failed
          </p>
          <p className="text-xs text-white/40">Press Back and try another channel</p>
        </div>
      )}
    </div>
  );
}
