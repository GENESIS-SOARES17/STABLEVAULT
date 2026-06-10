import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  cyberpunk: {
    id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃',
    bg: 'linear-gradient(135deg, #050810 0%, #0a0e1a 50%, #0d1117 100%)',
    gridColor: 'rgba(0, 243, 255, 0.1)', accent: '#00f3ff', text: '#ffffff',
    card: 'rgba(10, 14, 26, 0.7)', border: 'rgba(0, 243, 255, 0.2)',
  },
  neon: {
    id: 'neon', name: 'Neon', icon: '⚡',
    bg: 'linear-gradient(135deg, #1a0033 0%, #0a0014 50%, #2d004d 100%)',
    gridColor: 'rgba(255, 0, 255, 0.1)', accent: '#ff00ff', text: '#ffffff',
    card: 'rgba(26, 0, 51, 0.7)', border: 'rgba(255, 0, 255, 0.2)',
  },
  minimal: {
    id: 'minimal', name: 'Minimal', icon: '◽',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
    gridColor: 'rgba(255, 255, 255, 0.03)', accent: '#ffffff', text: '#ffffff',
    card: 'rgba(26, 26, 26, 0.7)', border: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    id: 'light', name: 'Light', icon: '☀️',
    bg: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #e2e8f0 100%)',
    gridColor: 'rgba(0, 0, 0, 0.05)', accent: '#0066cc', text: '#1a1a1a',
    card: 'rgba(255, 255, 255, 0.8)', border: 'rgba(0, 0, 0, 0.1)',
  },
};

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');

  useEffect(() => {
    const saved = localStorage.getItem('lit-vault-theme');
    if (saved && THEMES[saved]) {
      setCurrentTheme(saved);
    }
    setMounted(true);
  }, []);

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    if (typeof window !== 'undefined') localStorage.setItem('lit-vault-theme', themeId);
  };

  // The key is here: if not mounted, render children without the provider.
  // This prevents components from accessing the theme before it's ready.
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
