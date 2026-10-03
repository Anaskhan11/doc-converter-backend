import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('docconvert-theme');
    if (saved) return saved;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // `color-scheme: dark` was hardcoded in index.html, so native scrollbars and
    // form controls stayed dark even in the light appearance.
    const paint = theme === 'dark' ? '#090d16' : '#f8fafc';
    const scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.content = theme;
    const tab = document.querySelector('meta[name="theme-color"]');
    if (tab) tab.content = paint;
    localStorage.setItem('docconvert-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
