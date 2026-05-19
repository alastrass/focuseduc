import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppSpace = 'educ' | 'jay';
export type ThemeId = 'space' | 'analytics' | 'zen' | 'cyber' | 'glass' | 'brutal' | 'clay' | 'jay-rose' | 'jay-night' | 'jay-forest';

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  space: 'both' | 'educ' | 'jay';
  preview: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
  };
};

export const THEMES: Theme[] = [
  {
    id: 'space',
    name: 'Dark Space',
    description: 'Sombre & Lumineux',
    space: 'both',
    preview: { bg: '#0a0814', surface: '#111028', primary: '#7c3aed', accent: '#06b6d4' },
  },
  {
    id: 'analytics',
    name: 'Analytics Dark',
    description: 'Dashboard Data-Dense',
    space: 'both',
    preview: { bg: '#0d0d0f', surface: '#17171c', primary: '#00e5be', accent: '#ff4db3' },
  },
  {
    id: 'zen',
    name: 'Zen Garden',
    description: 'Minimalisme Japonais',
    space: 'both',
    preview: { bg: '#f7f5f0', surface: '#ffffff', primary: '#5c7a4e', accent: '#8fa882' },
  },
  {
    id: 'cyber',
    name: 'Cyber Night',
    description: 'Énergie Synthwave',
    space: 'both',
    preview: { bg: '#0a0e17', surface: '#111827', primary: '#00d4ff', accent: '#ff2d78' },
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    description: 'Moderne & Aérien',
    space: 'both',
    preview: { bg: '#dbeafe', surface: 'rgba(255,255,255,0.55)', primary: '#3b82f6', accent: '#8b5cf6' },
  },
  {
    id: 'brutal',
    name: 'Neo-Brutalisme',
    description: 'Graphique & Bold',
    space: 'educ',
    preview: { bg: '#fffef0', surface: '#ffffff', primary: '#ffd600', accent: '#ff3b30' },
  },
  {
    id: 'clay',
    name: 'Soft Clay',
    description: 'Tactile & Neumorphique',
    space: 'both',
    preview: { bg: '#e8e0f0', surface: '#ede6f5', primary: '#7c6fa0', accent: '#a06fa0' },
  },
  {
    id: 'jay-rose',
    name: 'Jay Rose',
    description: 'Chaleur & Passion',
    space: 'jay',
    preview: { bg: '#1a0a12', surface: '#1f0e18', primary: '#ec4899', accent: '#f97316' },
  },
  {
    id: 'jay-night',
    name: 'Jay Night',
    description: 'Sombre & Élégant',
    space: 'jay',
    preview: { bg: '#0a0812', surface: '#0f0c1a', primary: '#a78bfa', accent: '#f472b6' },
  },
  {
    id: 'jay-forest',
    name: 'Jay Forest',
    description: 'Nature & Sérénité',
    space: 'jay',
    preview: { bg: '#060e0a', surface: '#0c1710', primary: '#10b981', accent: '#34d399' },
  },
];

type ThemeContextValue = {
  themeId: ThemeId;
  jayThemeId: ThemeId;
  isDark: boolean;
  jayIsDark: boolean;
  activeSpace: AppSpace;
  setTheme: (id: ThemeId) => void;
  setJayTheme: (id: ThemeId) => void;
  toggleDark: () => void;
  toggleJayDark: () => void;
  setActiveSpace: (space: AppSpace) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'space',
  jayThemeId: 'jay-rose',
  isDark: false,
  jayIsDark: false,
  activeSpace: 'educ',
  setTheme: () => {},
  setJayTheme: () => {},
  toggleDark: () => {},
  toggleJayDark: () => {},
  setActiveSpace: () => {},
});

function applyCSSVars(themeId: ThemeId, isDark: boolean) {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('fe-theme') as ThemeId) || 'space';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('fe-dark') === 'true';
  });
  const [jayThemeId, setJayThemeIdState] = useState<ThemeId>(() => {
    return (localStorage.getItem('jay-theme') as ThemeId) || 'jay-rose';
  });
  const [jayIsDark, setJayIsDark] = useState<boolean>(() => {
    return localStorage.getItem('jay-dark') === 'true';
  });
  const [activeSpace, setActiveSpaceState] = useState<AppSpace>('educ');

  useEffect(() => {
    if (activeSpace === 'jay') {
      applyCSSVars(jayThemeId, jayIsDark);
    } else {
      applyCSSVars(themeId, isDark);
    }
  }, [themeId, isDark, jayThemeId, jayIsDark, activeSpace]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem('fe-theme', id);
  };

  const setJayTheme = (id: ThemeId) => {
    setJayThemeIdState(id);
    localStorage.setItem('jay-theme', id);
  };

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('fe-dark', String(next));
      return next;
    });
  };

  const toggleJayDark = () => {
    setJayIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('jay-dark', String(next));
      return next;
    });
  };

  const setActiveSpace = (space: AppSpace) => {
    setActiveSpaceState(space);
  };

  return (
    <ThemeContext.Provider value={{
      themeId, jayThemeId, isDark, jayIsDark, activeSpace,
      setTheme, setJayTheme, toggleDark, toggleJayDark, setActiveSpace,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
