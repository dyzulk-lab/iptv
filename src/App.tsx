/** Root application — assembles TV layout with sidebar, channel grid, and player */

import { useState, useMemo, useCallback } from 'react';
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
  const { channels, groups, isLoading } = useM3uLoader();
  const { status, play, videoRef } = usePlayerEngine();
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

  // Select and play a channel
  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setActiveChannel(channel);
      setShowPlayer(true);
      play(channel.url);
    },
    [play],
  );

  // TV remote key bindings
  useTvKeys({
    onUp: () => moveFocus('up'),
    onDown: () => moveFocus('down'),
    onLeft: () => moveFocus('left'),
    onRight: () => moveFocus('right'),
    onEnter: () => {
      if (filtered[focusIndex]) {
        handleSelectChannel(filtered[focusIndex]);
      }
    },
    onReturn: () => {
      if (showPlayer) setShowPlayer(false);
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <TvHeader />

      <div className="flex flex-1 overflow-hidden">
        <TvSidebar groups={groups} activeGroup={activeGroup} onSelectGroup={setActiveGroup} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {showPlayer ? (
            <VideoStage
              status={status}
              channelName={activeChannel?.name ?? null}
              videoRef={videoRef}
            />
          ) : (
            <ChannelGrid
              channels={filtered}
              activeChannel={activeChannel}
              focusIndex={focusIndex}
              isLoading={isLoading}
              onSelectChannel={handleSelectChannel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
