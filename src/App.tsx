/** Root application — assembles TV layout with sidebar, channel grid, and player */

import { useState, useMemo, useCallback } from 'react';
import { cn } from 'cn';
import { TvHeader } from '@/components/layout/tv-header';
import { TvSidebar } from '@/components/layout/tv-sidebar';
import { ChannelGrid } from '@/components/channels/channel-grid';
import { VideoStage } from '@/components/player/video-stage';
import { useM3uLoader } from '@/hooks/use-m3u-loader';
import { usePlayerEngine } from '@/hooks/use-player-engine';
import { useTvKeys } from '@/hooks/use-tv-keys';
import { useSpatialFocus } from '@/hooks/use-spatial-focus';
import type { Channel } from '@/types/iptv';

export function App() {
  const {
    channels,
    groups,
    isLoading,
    playlistName,
    playlists,
    selectPlaylist,
    sortMode,
    setSortMode,
  } = useM3uLoader();
  const { status, play, stop, videoRef } = usePlayerEngine();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Filter channels by selected group
  const filtered = useMemo(() => {
    if (!activeGroup) return channels;
    return channels.filter((ch) => ch.group === activeGroup);
  }, [channels, activeGroup]);

  const { focusIndex, moveFocus } = useSpatialFocus({
    gridColumns: 3,
    totalItems: filtered.length,
  });

  const handleSelectPlaylist = useCallback(
    (name: string) => {
      setActiveGroup(null);
      selectPlaylist(name);
    },
    [selectPlaylist],
  );

  // Select and play a channel
  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setActiveChannel(channel);
      setShowPlayer(true);
      play(channel.url);
    },
    [play],
  );

  const handleBackFromPlayer = useCallback(() => {
    setShowPlayer(false);
    stop();
  }, [stop]);

  // TV remote & keyboard key bindings
  useTvKeys({
    onUp: () => {
      if (!showPlayer) moveFocus('up');
    },
    onDown: () => {
      if (!showPlayer) moveFocus('down');
    },
    onLeft: () => {
      if (!showPlayer) moveFocus('left');
    },
    onRight: () => {
      if (!showPlayer) moveFocus('right');
    },
    onEnter: () => {
      if (!showPlayer && filtered[focusIndex]) {
        handleSelectChannel(filtered[focusIndex]);
      }
    },
    onReturn: () => {
      if (showPlayer) handleBackFromPlayer();
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <TvHeader playlistName={playlistName} channelCount={channels.length} />

      <div className="flex flex-1 overflow-hidden">
        <TvSidebar
          playlists={playlists}
          activePlaylist={playlistName}
          onSelectPlaylist={handleSelectPlaylist}
          groups={groups}
          activeGroup={activeGroup}
          onSelectGroup={setActiveGroup}
          sortMode={sortMode}
          onSelectSortMode={setSortMode}
        />

        <div className="flex flex-1 flex-col overflow-hidden relative">
          <ChannelGrid
            channels={filtered}
            activeChannel={activeChannel}
            focusIndex={focusIndex}
            isLoading={isLoading}
            onSelectChannel={handleSelectChannel}
          />

          <div
            className={cn(
              "absolute inset-0 z-30 transition-opacity duration-150",
              showPlayer
                ? "opacity-100 pointer-events-auto visible"
                : "opacity-0 pointer-events-none invisible"
            )}
          >
            <VideoStage
              status={status}
              channelName={activeChannel?.name ?? null}
              videoRef={videoRef}
              onBack={handleBackFromPlayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
