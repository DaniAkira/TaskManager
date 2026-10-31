import { useCallback, useMemo, useState } from 'react';
import { ThemeContext } from './contexts';

const STORAGE_KEY = 'mural:theme';

export function ThemeProvider({ children }) {
  // public/theme-init.js já aplicou a classe antes do primeiro paint.
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem armazenamento, o tema vale só para esta sessão.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
