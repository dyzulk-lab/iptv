import { Film, ListVideo, Radio, Settings, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function TvMainStage() {
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-hidden p-8">
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <Tabs defaultValue="live" className="w-auto">
          <TabsList className="rounded-xl border border-border/40 bg-muted/50 p-1">
            <TabsTrigger value="live" className="gap-2 px-5 py-2 text-sm">
              <Radio className="h-4 w-4" /> Live TV
            </TabsTrigger>
            <TabsTrigger value="movies" className="gap-2 px-5 py-2 text-sm">
              <Film className="h-4 w-4" /> Movies (VOD)
            </TabsTrigger>
            <TabsTrigger value="series" className="gap-2 px-5 py-2 text-sm">
              <ListVideo className="h-4 w-4" /> Series
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2 px-5 py-2 text-sm">
              <Star className="h-4 w-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 px-5 py-2 text-sm">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Badge variant="secondary" className="font-mono text-xs">
          Tizen Kant-S2 • 1080p Canvas
        </Badge>
      </div>

      {/* Main Preview Card */}
      <Card className="flex flex-1 items-center justify-center overflow-hidden border-border/50 bg-card/60 p-8 backdrop-blur-xs">
        <CardContent className="flex max-w-lg flex-col items-center justify-center gap-5 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-lg shadow-primary/10">
            <img src="./logo.svg" alt="tv-ku Icon" className="h-12 w-12 object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ready to Stream IPTV</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              TV interface and dual-theme engine are configured. Press{' '}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                D
              </kbd>{' '}
              on your keyboard or TV remote to toggle Sun / Moon theme.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
