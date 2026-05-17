import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ThemeName } from '../types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
  { id: 'royal', label: 'Royal', swatch: '#3b82f6' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'crimson', label: 'Crimson', swatch: '#dc2626' },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const stored = localStorage.getItem('theme') as ThemeName | null;
    return stored && THEMES.some(t => t.id === stored) ? stored : 'amber';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
