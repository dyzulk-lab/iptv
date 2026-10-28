/** TV remote control and spatial navigation type definitions */

export type FocusDirection = 'up' | 'down' | 'left' | 'right';

export type NavSection = 'header' | 'sidebar' | 'channel-grid' | 'player' | 'settings';

export interface FocusPosition {
  section: NavSection;
  row: number;
  col: number;
}

export interface TvKeyEvent {
  keyCode: number;
  keyName: string;
  handled: boolean;
}
