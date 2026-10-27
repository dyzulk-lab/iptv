/** Video player state and quality type definitions */

export type PlayerStatus =
  | "idle"
  | "loading"
  | "buffering"
  | "playing"
  | "paused"
  | "error";

export interface PlayerState {
  status: PlayerStatus;
  currentUrl: string | null;
  channelName: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  errorMessage: string | null;
}

export interface VideoQuality {
  label: string;
  width: number;
  height: number;
  bitrate?: number;
}

export interface AudioTrack {
  index: number;
  label: string;
  language: string;
}
