import { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function TvHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-8 backdrop-blur-md select-none">
      {/* Brand & Official Logo Asset */}
      <div className="flex items-center gap-3">
        <img
          src="./logo.svg"
          alt="tv-ku Logo"
          className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(52,208,148,0.4)]"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            tv-ku <span className="text-sm font-normal text-primary">IPTV</span>
          </h1>
          <p className="text-xs text-muted-foreground">Samsung Smart TV (Tizen 5.5)</p>
        </div>
      </div>

      {/* Center Shortcut Hint (English) */}
      <div className="hidden items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-3 py-1 text-xs text-muted-foreground md:flex">
        <span>Press</span>
        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-xs">
          D
        </kbd>
        <span>to toggle Sun / Moon theme</span>
      </div>

      {/* Right Controls: Online Status, Clock, ThemeToggle */}
      <div className="flex items-center gap-4">
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
        >
          <Wifi className="h-3 w-3 animate-pulse" />
          <span>Online</span>
        </Badge>

        <div className="font-mono text-base font-semibold tracking-wider text-foreground">
          {time || '00:00:00'}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
