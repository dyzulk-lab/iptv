import { TvHeader } from "@/components/layout/tv-header";
import { TvMainStage } from "@/components/layout/tv-main-stage";

export function App() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <TvHeader />
      <TvMainStage />
    </div>
  );
}

export default App;
