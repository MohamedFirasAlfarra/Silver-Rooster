import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from './ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="bg-transparent text-foreground hover:bg-primary/10 hover:text-primary transition-theme rounded-lg"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" strokeWidth={2} />
      ) : (
        <SunIcon className="w-5 h-5" strokeWidth={2} />
      )}
    </Button>
  );
};
