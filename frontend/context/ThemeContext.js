import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  orkut: {
    id: 'orkut',
    name: 'Orkut',
    icon: '💙',
    description: 'Azul claro – nostalgia Orkut',
    bg: 'linear-gradient(135deg, #e6f0fa 0%, #cfe3f5 50%, #b0d4e8 100%)',
    gridColor: 'rgba(0, 0, 0, 0.05)',
    accent: '#005c9e',        // azul forte para botões e destaques
    text: '#1a2a3a',         // texto escuro (quase preto azulado)
    textLight: '#2c3e50',
    card: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(0, 92, 158, 0.3)',
    gradient: 'linear-gradient(135deg, #005c9e, #00a8e8)'
  },
  cyberpunk: {
    id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', description: 'Dark with cyan grid',
    bg: 'linear-gradient(135deg, #050810 0%, #0a0e1a 50%, #0d1117 100%)',
    gridColor: 'rgba(0, 243, 255, 0.1)', accent: '#00f3ff', text: '#e0e0e0',
    textLight: '#ffffff', card: 'rgba(10, 14, 26, 0.7)', border: 'rgba(0, 243, 255, 0.2)'
  },
  neon: {
    id: 'neon', name: 'Neon', icon: '⚡', description: 'Dark with pink/purple',
    bg: 'linear-gradient(135deg, #1a0033 0%, #0a0014 50%, #2d004d 100%)',
    gridColor: 'rgba(255, 0, 255, 0.1)', accent: '#ff00ff', text: '#f0e6ff',
    textLight: '#ffffff', card: 'rgba(26, 0, 51, 0.7)', border: 'rgba(255, 0, 255, 0.2)'
  },
  minimal: {
    id: 'minimal', name: 'Minimal', icon: '◽', description: 'Clean dark',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
    gridColor: 'rgba(255, 255, 255, 0.03)', accent: '#ffffff', text: '#cccccc',
    textLight: '#ffffff', card: 'rgba(26, 26, 26, 0.7)', border: 'rgba(255, 255, 255, 0.1)'
  },
  light: {
    id: 'light', name: 'Light', icon: '☀️', description: 'Bright and clean',
    bg: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #e2e8f0 100%)',
    gridColor: 'rgba(0, 0, 0, 0.05)', accent: '#0066cc', text: '#1a2a3a',
    textLight: '#2c3e50', card: 'rgba(255, 255, 255, 0.8)', border: 'rgba(0, 0, 0, 0.1)'
  },
  highcontrast: {
    id: 'highcontrast', name: 'High Contrast', icon: '🔆', description: 'Light background, dark text',
    bg: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
    gridColor: 'rgba(0, 0, 0, 0.15)', accent: '#000000', text: '#212529',
    textLight: '#000000', card: 'rgba(255, 255, 255, 0.95)', border: 'rgba(0, 0, 0, 0.25)'
  }
};

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('orkut');
  useEffect(() => {
    const saved = localStorage.getItem('lit-vault-theme');
    if (saved && THEMES[saved]) setCurrentTheme(saved);
    setMounted(true);
  }, []);
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('lit-vault-theme', themeId);
  };
  if (!mounted) return <>{children}</>;
  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) return { currentTheme: 'orkut', changeTheme: () => {}, themes: THEMES };
  return context;
}
