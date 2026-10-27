import { Film, ListVideo, Radio, Settings, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function TvMainStage() {
  return (
    <main className="flex flex-1 flex-col p-8 gap-6 overflow-hidden">
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <Tabs defaultValue="live" className="w-auto">
          <TabsList className="bg-muted/50 p-1 rounded-xl border border-border/40">
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
              <Star className="h-4 w-4" /> Favorit
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 px-5 py-2 text-sm">
              <Settings className="h-4 w-4" /> Pengaturan
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Badge variant="secondary" className="font-mono text-xs">
          Tizen Kant-S2 • 1080p Canvas
        </Badge>
      </div>

      {/* Main Preview Card */}
      <Card className="flex-1 overflow-hidden border-border/50 bg-card/60 backdrop-blur-xs flex items-center justify-center p-8">
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 max-w-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Radio className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Siap Memuat Playlist M3U</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Frontend UI dan tema dinamis telah terkonfigurasi. Coba tekan tombol <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-xs">D</kbd> pada keyboard untuk mengganti tema Sun / Moon seketika.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
