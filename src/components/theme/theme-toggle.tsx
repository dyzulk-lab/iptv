import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="relative h-10 w-10 rounded-lg border-border/60 bg-background/50 backdrop-blur-sm transition-all focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
      title="Toggle Theme (Shortcut: D)"
      aria-label="Toggle Theme"
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 text-blue-400 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
